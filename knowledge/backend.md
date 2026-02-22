# Backend — BELSI.Work

## Framework

FastAPI (Python 3.12+) с Pydantic v2 для валидации и SQLAlchemy 2.0 для доступа к данным.

## Структура проекта

```
backend/
├── app/
│   ├── main.py                 # FastAPI application factory
│   ├── config.py               # Settings из env variables (Pydantic BaseSettings)
│   ├── database.py             # SQLAlchemy engine, session factory
│   ├── dependencies.py         # Shared FastAPI dependencies (get_db, get_current_user)
│   │
│   ├── models/                 # SQLAlchemy ORM models (1 файл на таблицу)
│   │   ├── __init__.py
│   │   ├── user.py
│   │   ├── team.py
│   │   ├── shift.py
│   │   ├── photo.py
│   │   ├── task.py
│   │   ├── wallet.py
│   │   ├── payout.py
│   │   ├── support.py
│   │   ├── chat.py
│   │   ├── notification.py
│   │   ├── invite.py
│   │   ├── file_storage.py
│   │   ├── session.py
│   │   └── audit_log.py
│   │
│   ├── schemas/                # Pydantic request/response schemas
│   │   ├── __init__.py
│   │   ├── auth.py
│   │   ├── user.py
│   │   ├── team.py
│   │   ├── shift.py
│   │   ├── photo.py
│   │   ├── task.py
│   │   ├── wallet.py
│   │   ├── support.py
│   │   ├── chat.py
│   │   ├── dashboard.py
│   │   ├── settings.py
│   │   └── common.py           # PaginatedResponse, ApiError, enums
│   │
│   ├── api/
│   │   └── v1/
│   │       ├── router.py       # Aggregated v1 router
│   │       └── endpoints/      # 1 файл на domain
│   │           ├── auth.py
│   │           ├── users.py
│   │           ├── teams.py
│   │           ├── shifts.py
│   │           ├── photos.py
│   │           ├── tasks.py
│   │           ├── chat.py
│   │           ├── finance.py
│   │           ├── dashboard.py
│   │           ├── logs.py
│   │           └── settings.py
│   │
│   ├── services/               # Business logic layer
│   │   ├── auth_service.py
│   │   ├── user_service.py
│   │   ├── team_service.py
│   │   ├── shift_service.py
│   │   ├── photo_service.py
│   │   ├── moderation_service.py
│   │   ├── task_service.py
│   │   ├── chat_service.py
│   │   ├── finance_service.py
│   │   ├── audit_service.py
│   │   └── settings_service.py
│   │
│   ├── repositories/           # Data access layer
│   │   ├── base.py             # BaseRepository with common CRUD
│   │   ├── user_repo.py
│   │   ├── team_repo.py
│   │   ├── shift_repo.py
│   │   ├── photo_repo.py
│   │   ├── task_repo.py
│   │   ├── chat_repo.py
│   │   ├── finance_repo.py
│   │   ├── audit_repo.py
│   │   └── settings_repo.py
│   │
│   ├── middleware/
│   │   ├── auth.py             # JWT validation middleware
│   │   ├── cors.py             # CORS configuration
│   │   ├── logging.py          # Request/response logging
│   │   └── rate_limit.py       # Rate limiting
│   │
│   ├── core/
│   │   ├── exceptions.py       # Domain-specific exceptions
│   │   ├── security.py         # JWT creation, password hashing
│   │   └── permissions.py      # RBAC permission checks
│   │
│   └── workers/                # Background job handlers
│       ├── notification_worker.py
│       ├── report_worker.py
│       └── aggregate_worker.py
│
├── migrations/                 # Alembic migrations
│   ├── alembic.ini
│   ├── env.py
│   └── versions/
│
├── tests/
│   ├── conftest.py
│   ├── unit/
│   ├── integration/
│   └── factories/              # Test data factories
│
├── Dockerfile
├── docker-compose.yml
├── requirements.txt
├── pyproject.toml
└── .env.example
```

## Layers и их ответственности

### Router Layer (`api/v1/endpoints/`)
- Принимает HTTP-запрос
- Парсит и валидирует входные данные через Pydantic schemas
- Вызывает соответствующий сервис
- Формирует HTTP-ответ
- Не содержит бизнес-логику
- Не обращается к БД напрямую

### Service Layer (`services/`)
- Содержит всю бизнес-логику
- Управляет транзакциями (unit of work)
- Вызывает repositories для доступа к данным
- Вызывает audit_service для записи аудита
- Кидает доменные исключения при нарушении бизнес-правил
- Не знает о HTTP (нет Request/Response объектов)

### Repository Layer (`repositories/`)
- Абстрагирует доступ к данным
- Выполняет SQL-запросы через SQLAlchemy
- Возвращает ORM-модели или raw data
- Не содержит бизнес-логику
- Реализует пагинацию и фильтрацию

### Model Layer (`models/`)
- SQLAlchemy ORM модели
- Один файл на таблицу
- Определяют связи, constraints, indexes
- Не содержат бизнес-логику

### Schema Layer (`schemas/`)
- Pydantic модели для API request/response
- Строгая типизация всех полей
- Валидация входных данных
- Сериализация выходных данных
- Разделение: `CreateSchema`, `UpdateSchema`, `ResponseSchema`

## Принципы

### Разделение ответственности
```
Router → вход/выход HTTP
Service → бизнес-правила
Repository → доступ к данным
Model → структура данных
Schema → валидация и сериализация
```

### Направление зависимостей
```
Router → Service → Repository → Model
   ↓         ↓
Schema    AuditService
```

Router зависит от Service. Service зависит от Repository. Repository зависит от Model. Обратных зависимостей нет.

### Обработка ошибок
- Domain exceptions определяются в `core/exceptions.py`
- Service кидает доменные исключения: `ShiftAlreadyActiveError`, `PhotoModerationDeniedError`
- Router ловит исключения и маппит в HTTP-коды через exception handlers
- Все ошибки возвращаются в стандартном формате `ApiError`

### Транзакции
- Границы транзакций определяются в Service Layer
- Одна бизнес-операция = одна транзакция
- Аудит-запись создаётся внутри той же транзакции
- Фоновые задачи запускаются после коммита транзакции

### Аудит
- Каждое write-действие куратора записывается в audit_log
- audit_service вызывается из service layer внутри транзакции
- Запись: actor, action, entity_type, entity_id, old_data, new_data, ip_address

## Configuration

Все настройки загружаются из переменных окружения через `Pydantic BaseSettings`:
- `DATABASE_URL` — PostgreSQL connection string
- `REDIS_URL` — Redis connection string
- `JWT_PRIVATE_KEY` / `JWT_PUBLIC_KEY` — RSA ключи для JWT
- `JWT_ACCESS_TOKEN_EXPIRE_MINUTES` — TTL access token
- `JWT_REFRESH_TOKEN_EXPIRE_DAYS` — TTL refresh token
- `S3_BUCKET` / `S3_ENDPOINT` / `S3_ACCESS_KEY` / `S3_SECRET_KEY` — Object storage
- `CORS_ORIGINS` — Список разрешённых origins
- `LOG_LEVEL` — Уровень логирования
- `ENVIRONMENT` — dev / staging / production

## Startup

```python
# main.py
app = FastAPI(title="BELSI.Work API", version="1.0.0")
app.include_router(v1_router, prefix="/api/v1")
# middleware: CORS, logging, auth, rate limiting
# exception handlers: domain errors → HTTP responses
# lifespan: database pool init/cleanup
```
