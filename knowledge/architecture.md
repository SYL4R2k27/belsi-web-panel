# Architecture — BELSI.Work

## Архитектурный стиль

Modular monolith — модульный монолит с чётко определёнными доменными границами. Единый бэкенд-процесс, но внутри — изолированные модули со строгими интерфейсами.

Обоснование: система стартует с нуля, микросервисы на старте — overhead без пользы. Модульный монолит позволяет быстро доставлять фичи и при необходимости извлекать модули в сервисы.

## Компоненты системы

```
┌─────────────────────┐    ┌─────────────────────┐
│   Mobile Clients    │    │   Web Admin Panel    │
│  (iOS / Android)    │    │    (React SPA)       │
│  installer, foreman │    │    curator only       │
└─────────┬───────────┘    └─────────┬───────────┘
          │                          │
          │       HTTPS / JWT        │
          └──────────┬───────────────┘
                     │
            ┌────────▼────────┐
            │   Load Balancer │
            │   (Nginx)       │
            └────────┬────────┘
                     │
            ┌────────▼────────┐
            │   API Service   │
            │   (FastAPI)     │
            │   Stateless     │
            │   N instances   │
            └──┬─────┬─────┬──┘
               │     │     │
    ┌──────────▼┐ ┌──▼──┐ ┌▼──────────┐
    │PostgreSQL │ │Redis│ │Object     │
    │  Primary  │ │Cache│ │Storage    │
    │+ Replicas │ │     │ │(S3-like)  │
    └───────────┘ └─────┘ └───────────┘
               │
    ┌──────────▼──────────┐
    │  Message Worker      │
    │  (Background Jobs)   │
    │  Notifications,      │
    │  Reports, Aggregates │
    └─────────────────────┘
```

## Bounded Domains (11 доменов)

| Домен | Ответственность | Ключевые сущности |
|-------|----------------|-------------------|
| `identity` | Аутентификация, токены, сессии | user_sessions, auth tokens |
| `users` | Профили, роли, статусы | users |
| `teams` | Команды, membership | teams, team_members |
| `invites` | Инвайт-коды и их жизненный цикл | invites |
| `shifts` | Жизненный цикл смен, вычисление времени | shifts |
| `photos` | Загрузка фото, метаданные, модерация | shift_photos, file_storage |
| `tasks` | Назначения, статусы, дедлайны | tasks, task_assignments, task_comments |
| `chat` | Тикеты, сообщения, треды | support_tickets, support_messages, chat_threads, chat_messages |
| `finance` | Кошельки, транзакции, выплаты, акты | wallets, wallet_transactions, payouts, payout_items, acts |
| `audit` | Immutable лог действий куратора | audit_log |
| `settings` | Конфигурация политик системы | settings (runtime config) |

## Владение данными

- Каждый домен владеет своей write-моделью
- Кросс-доменные чтения через service-интерфейсы, не через прямой доступ к чужим таблицам
- Аудит-домен — append-only, записи никогда не обновляются

## Потоки данных

### Основной write-path
```
Client → API Gateway (Nginx) → FastAPI Router → Service Layer → Repository → PostgreSQL
                                      │
                                      ├── Audit Log (синхронно для curator actions)
                                      └── Event → Message Worker (асинхронно)
```

### Read-path для дашборда
```
Web Admin → API → Service → PostgreSQL Read Replica / Redis Cache
```

### Media upload path
```
Mobile → API → Validate → Object Storage (signed URL upload)
                    └── Metadata → PostgreSQL (shift_photos)
```

## Модель согласованности

| Операция | Тип согласованности |
|----------|-------------------|
| Переходы состояний смен | Strong consistency |
| Модерация фото | Strong consistency |
| Финансовые операции | Strong consistency |
| Аудит-лог | Strong consistency (в транзакции) |
| Dashboard KPI | Eventual consistency (кэш, агрегаты) |
| Счётчики непрочитанных | Eventual consistency (Redis) |

## Обработка отказов

- Домены изолированы: сбой в chat не ломает shifts
- Асинхронные задачи — через queue с retry и dead-letter
- Для внешних интеграций — circuit breakers
- Идемпотентность: дублирующие запросы не создают дубли (idempotency keys)
- Компенсирующие действия при откате — явные и аудируемые

## Операционная модель

- API — stateless, горизонтально масштабируется за load balancer
- PostgreSQL — connection pooling на уровне инстанса
- Object storage — доступ через signed URLs (не через API)
- Все фоновые задачи — через message worker с контролем lag

## SLO alignment

- Критические транзакционные эндпоинты: приоритет на низкую latency и корректность
- Read-heavy страницы дашборда: индексированные запросы + pre-aggregates
- P95 latency бюджеты определены для каждой категории эндпоинтов

## Почему именно так

| Решение | Обоснование |
|---------|-------------|
| Modular monolith, не микросервисы | Нет команды из 10+ человек, нет необходимости независимого деплоя модулей. Снижает operational overhead |
| PostgreSQL, не NoSQL | Финансовые данные, сложные связи, ACID-транзакции, аудит — всё требует реляционной БД |
| FastAPI, не Django/Flask | Async-ready, встроенная валидация через Pydantic, автогенерация OpenAPI, высокая производительность |
| Redis для кэша, не Memcached | Поддержка структур данных (counters, sets для unread), persistence optional |
| Object storage для медиа | Отделение бинарных данных от БД, CDN-ready, signed URL access |
| JWT, не session cookies | API-first архитектура, мобильные клиенты, stateless backend |
