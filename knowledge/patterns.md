# Architectural Patterns — BELSI.Work

## Repository Pattern

### Назначение
Абстрагирует доступ к данным от бизнес-логики. Service layer не знает о SQL, ORM-деталях или структуре запросов.

### Реализация

```
Service → Repository Interface → SQLAlchemy Implementation
```

### Правила
- Один repository на aggregate root (User, Shift, Task, etc.)
- Repository возвращает доменные объекты или ORM-модели
- Пагинация и фильтрация реализуются в repository
- Сложные JOIN-запросы допустимы внутри repository
- Repository НИКОГДА не содержит бизнес-логику

### Базовый Repository

```python
class BaseRepository:
    def get_by_id(id: UUID) -> Model | None
    def get_list(filters, page, per_page) -> tuple[list[Model], int]
    def create(data: dict) -> Model
    def update(id: UUID, data: dict) -> Model
    def soft_delete(id: UUID) -> None
```

### Расширенные методы (domain-specific)

```python
class ShiftRepository(BaseRepository):
    def get_active_shift(user_id: UUID) -> Shift | None
    def get_shifts_with_photos(shift_id: UUID) -> Shift
    def count_shifts_today() -> int
```

## Service Layer Pattern

### Назначение
Содержит всю бизнес-логику. Единственное место, где принимаются бизнес-решения.

### Правила
- Service orchestrates — координирует вызовы к repositories, другим services, audit
- Service validates — проверяет бизнес-инварианты
- Service transacts — управляет границами транзакций
- Service НЕ знает о HTTP (нет Request/Response)
- Service НЕ обращается к БД напрямую (только через repository)

### Пример

```python
class ShiftService:
    def __init__(self, shift_repo, user_repo, audit_service):
        self.shift_repo = shift_repo
        self.user_repo = user_repo
        self.audit_service = audit_service

    async def start_shift(self, user_id: UUID, data: ShiftStartData) -> Shift:
        # 1. Validate: no active shift exists
        active = await self.shift_repo.get_active_shift(user_id)
        if active:
            raise ShiftAlreadyActiveError()

        # 2. Validate: user is active installer
        user = await self.user_repo.get_by_id(user_id)
        if not user or user.role != 'installer' or not user.is_active:
            raise PermissionDeniedError()

        # 3. Create shift within transaction
        shift = await self.shift_repo.create({...})

        # 4. Audit (same transaction)
        await self.audit_service.log(actor=user_id, action='shift.started', ...)

        return shift
```

## Dependency Injection

### Назначение
Компоненты получают зависимости извне, а не создают их сами. Упрощает тестирование и замену реализаций.

### Реализация в FastAPI

```python
# dependencies.py
async def get_db() -> AsyncGenerator[AsyncSession]:
    async with session_factory() as session:
        yield session

def get_shift_repo(db: AsyncSession = Depends(get_db)) -> ShiftRepository:
    return ShiftRepository(db)

def get_shift_service(
    shift_repo: ShiftRepository = Depends(get_shift_repo),
    audit_service: AuditService = Depends(get_audit_service),
) -> ShiftService:
    return ShiftService(shift_repo, audit_service)

# endpoint
@router.post("/shifts/start")
async def start_shift(
    data: ShiftStartRequest,
    service: ShiftService = Depends(get_shift_service),
    current_user: User = Depends(get_current_user),
):
    shift = await service.start_shift(current_user.id, data)
    return ShiftResponse.from_orm(shift)
```

### Правила
- Зависимости инжектируются через FastAPI Depends
- Каждый dependency — функция или generator
- DB session создаётся per-request
- Services создаются per-request с инжектированными repositories

## DTO Mapping (Schema Mapping)

### Назначение
Чёткое разделение между:
- ORM Model (internal data representation)
- Request Schema (what client sends)
- Response Schema (what client receives)

### Правила
- НИКОГДА не возвращать ORM-модель напрямую в HTTP response
- Request → Service принимает validated data (Pydantic schema)
- Service → Response маппинг через Pydantic `model_validate()` или explicit mapping
- Sensitive fields (password hashes, tokens) никогда не попадают в response

### Naming Convention

```
UserCreateRequest    → входные данные для создания
UserUpdateRequest    → входные данные для обновления (partial)
UserResponse         → полный ответ (без sensitive fields)
UserListItem         → сокращённый ответ для списка
```

## Event-Driven Domain Events

### Назначение
Каждое state-changing действие эмитирует доменное событие. События используются для:
- Аудит-лога
- Обновления агрегатов (dashboard counters)
- Отправки уведомлений
- Запуска фоновых задач

### Ключевые события

| Событие | Триггер | Следствие |
|---------|---------|----------|
| `shift.started` | Installer начал смену | Dashboard counter update |
| `shift.finished` | Installer завершил смену | Payment calculation trigger |
| `photo.uploaded` | Installer загрузил фото | Pending counter increment |
| `photo.moderated` | Curator одобрил/отклонил | Quality metrics update |
| `task.created` | Curator создал задачу | Notification to assignee |
| `task.overdue` | Scheduler detected overdue | Alert to curator |
| `chat.message_sent` | Any user sent message | Unread counter update |
| `payment.approved` | Curator approved payout | Settlement pipeline trigger |

### Правила
- События immutable и timestamped (UTC)
- Event handlers idempotent
- Критические events в той же транзакции (audit)
- Некритические events асинхронно через message worker

## Optimistic UI Pattern (Frontend)

### Назначение
Немедленное обновление UI при действии пользователя, до подтверждения сервером. Используется для часто повторяемых операций (модерация фото).

### Реализация
```typescript
// Photo moderation: optimistic approve
const { mutate: approvePhoto } = useMutation({
  mutationFn: (photoId) => api.photos.approve(photoId),
  onMutate: async (photoId) => {
    // Cancel outgoing refetch
    await queryClient.cancelQueries(['photos', 'list'])
    // Snapshot previous
    const previous = queryClient.getQueryData(['photos', 'list'])
    // Optimistically update
    queryClient.setQueryData(['photos', 'list'], (old) =>
      old.map(p => p.id === photoId ? { ...p, status: 'approved' } : p)
    )
    return { previous }
  },
  onError: (err, photoId, context) => {
    // Rollback on error
    queryClient.setQueryData(['photos', 'list'], context.previous)
  },
  onSettled: () => {
    // Refetch to sync
    queryClient.invalidateQueries(['photos', 'list'])
  },
})
```

### Правила
- Используется только для операций с высокой вероятностью успеха
- Rollback при ошибке обязателен
- Refetch после settle обязателен для синхронизации
- Toast-уведомление при ошибке

## URL State Sync Pattern (Frontend)

### Назначение
Фильтры, пагинация и сортировка таблиц синхронизируются с URL search params. Позволяет делиться ссылками и использовать browser back/forward.

### Реализация
```
/shifts?status=active&page=2&per_page=20&sort=started_at&order=desc
```

### Правила
- Все параметры таблицы отражены в URL
- При изменении фильтра — page сбрасывается на 1
- Default values не включаются в URL (clean URLs)
- Парсинг URL params через zod для типобезопасности

## Guard Pattern (Frontend Routing)

### Назначение
Защита роутов от неавторизованного доступа.

### Реализация
```typescript
function RequireAuth({ children }: { children: ReactNode }) {
  const { isAuthenticated, isLoading } = useAuth()

  if (isLoading) return <FullScreenLoader />
  if (!isAuthenticated) return <Navigate to="/login" replace />

  return children
}
```

### Правила
- Все dashboard-роуты обёрнуты в RequireAuth
- При redirect сохраняется return URL
- Loading state показывает skeleton/loader, не пустую страницу
