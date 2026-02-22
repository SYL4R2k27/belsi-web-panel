# Coding Standards — BELSI.Work

## Общие принципы

- Ясность важнее краткости
- Функции маленькие и с единственной ответственностью
- Именование отражает бизнес-домен
- Детерминированные пути для переходов состояний
- Не оптимизировать преждевременно — сначала корректность

## Backend (Python / FastAPI)

### Стиль кода
- PEP 8 строго
- Type hints на все публичные интерфейсы
- Максимальная длина строки: 120 символов
- Максимальная длина функции: 30 строк (цель), 50 строк (предел)
- Максимальная вложенность: 3 уровня

### Именование

| Что | Конвенция | Пример |
|-----|-----------|--------|
| Модуль/файл | snake_case | `shift_service.py` |
| Класс | PascalCase | `ShiftService` |
| Функция/метод | snake_case | `start_shift()` |
| Переменная | snake_case | `current_shift` |
| Константа | UPPER_SNAKE | `MAX_SHIFT_HOURS` |
| Enum value | snake_case string | `"in_progress"` |
| API field (JSON) | snake_case | `started_at` |

### Pydantic Schemas
- Отдельные схемы для Create, Update, Response
- Strict validation для всех полей
- Примеры значений в Field descriptions
- Никогда не возвращать ORM-модели напрямую в response

```python
class ShiftCreateRequest(BaseModel):
    planned_hours: Decimal = Field(ge=0, le=24)

class ShiftResponse(BaseModel):
    id: UUID
    status: ShiftStatus
    started_at: datetime
    # ... all fields explicitly
```

### Исключения
- Доменные исключения в `core/exceptions.py`
- Каждое исключение маппится на HTTP status code
- Не используем generic Exception для бизнес-ошибок

```python
class ShiftAlreadyActiveError(DomainError):
    status_code = 409
    code = "shift_already_active"
    message = "User already has an active shift"
```

### Денежные типы
- Только `Decimal` для финансовых значений
- Никогда `float` для денег
- PostgreSQL: `numeric(14,2)`
- Python: `from decimal import Decimal`

### Логирование
- Structured JSON logs
- Обязательные поля: `request_id`, `user_id`, `role`, `action`, `entity`
- Никогда не логировать sensitive data (tokens, passwords, PII)
- Уровни: DEBUG (dev only), INFO (operations), WARNING (anomalies), ERROR (failures), CRITICAL (system)

## Frontend (TypeScript / React)

### Стиль кода
- TypeScript strict mode
- Explicit return types для функций
- No `any` — использовать `unknown` + type guards при необходимости
- Максимальная длина компонента: 150 строк (цель), 250 строк (предел)

### Именование

| Что | Конвенция | Пример |
|-----|-----------|--------|
| Компонент | PascalCase | `ShiftTimeline.tsx` |
| Hook | camelCase с use- | `useShifts.ts` |
| Утилита | camelCase | `formatCurrency.ts` |
| Тип/Interface | PascalCase | `ShiftResponse` |
| Enum | PascalCase + UPPER_SNAKE values | `ShiftStatus.ACTIVE` |
| Константа | UPPER_SNAKE | `MAX_PAGE_SIZE` |
| CSS class (Tailwind) | - | utility classes |
| Файлы компонентов | PascalCase | `UserProfile.tsx` |
| Файлы утилит | camelCase | `dateUtils.ts` |

### Структура компонентов

```typescript
// 1. Imports
// 2. Types (local to this component)
// 3. Component function
// 4. Internal helper functions (if small)
// NO default exports — only named exports

export function UserProfile({ userId }: UserProfileProps) {
  // hooks first
  // derived state
  // handlers
  // early returns (loading, error, empty)
  // render
}
```

### React Query конвенции
- Query keys: массив `['domain', 'action', params]`
- Custom hooks для каждого запроса
- Мутации через `useMutation` с invalidation

```typescript
// hooks/useUsers.ts
export function useUsers(filters: UserFilters) {
  return useQuery({
    queryKey: ['users', 'list', filters],
    queryFn: () => api.users.getList(filters),
  })
}
```

### Формы
- react-hook-form + zod для валидации
- Один schema = один form
- Ошибки показываются inline под полями

## Database Access

### Запросы
- Только parameterized queries (через SQLAlchemy)
- Никогда не интерполировать пользовательский ввод в SQL
- Transaction boundaries в service layer
- Нет бизнес-логики внутри SQL миграций

### Performance
- N+1 prevention через join/prefetch patterns
- Indexes для всех часто фильтруемых колонок
- EXPLAIN ANALYZE для новых complex queries

## Комментарии

### Когда комментировать
- Нетривиальные бизнес-правила
- Workarounds с пояснением причины
- Формулы расчёта (финансы)
- Ссылки на внешнюю документацию

### Когда НЕ комментировать
- Очевидный код
- Тривиальные геттеры/сеттеры
- Код, который нужно переписать вместо комментирования

### Формат
```python
# Business rule: installer can have max 1 active/paused shift at any time
# See: knowledge/project.md → Бизнес-логика → Смены
```

## Testing Style

- Arrange / Act / Assert structure
- Одно поведенческое assertion per test
- Negative path tests для permissions и invalid state transitions
- Имена тестов описывают ожидаемое поведение

```python
def test_start_shift_fails_when_active_shift_exists():
    # Arrange
    ...
    # Act
    ...
    # Assert
    ...
```

## Запрещено

- `float` для денег
- `any` в TypeScript (кроме исключительных случаев с комментарием)
- Raw SQL interpolation
- Логирование токенов, паролей, PII
- Бизнес-логика в router layer
- Прямой доступ к БД из router
- Мутация аудит-записей
- Кастомные UI-примитивы вместо shadcn/ui
- Default exports в frontend
