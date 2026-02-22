# Decision Log — BELSI.Work

## Формат

Каждое архитектурное решение фиксируется по шаблону:

```
### D-XXX: Title
- Date: YYYY-MM-DD
- Status: proposed | accepted | deprecated
- Context: Почему возник вопрос
- Decision: Что решили
- Consequences: Последствия (positive + negative)
- Follow-up: Что нужно сделать дальше
```

---

## Принятые решения

### D-001: Backend stack — FastAPI + PostgreSQL + REST
- Date: 2026-02-16
- Status: accepted
- Context: Нужен backend для workforce management с финансовыми данными, сложными связями и аудитом. Требуется быстрая разработка и строгие API-контракты.
- Decision: FastAPI (Python) + PostgreSQL + REST JSON (snake_case)
- Consequences:
  - (+) Сильная экосистема Python, Pydantic для валидации, автогенерация OpenAPI
  - (+) PostgreSQL: ACID, JSONB, partial indexes, RLS — идеален для финансовых данных
  - (+) REST snake_case совместим с мобильными клиентами
  - (-) Python медленнее Go/Rust для CPU-bound задач (не критично для данного профиля нагрузки)
- Follow-up: Выбрать ORM (SQLAlchemy vs SQLModel vs raw SQL) → решено: SQLAlchemy 2.0

### D-002: Web panel — curator-only в MVP
- Date: 2026-02-16
- Status: accepted
- Context: Ограниченные ресурсы, нужен быстрый MVP.
- Decision: Веб-панель доступна только для роли `curator`.
- Consequences:
  - (+) Уменьшение scope, быстрая доставка
  - (+) Упрощение авторизации (один role check)
  - (-) Foreman не имеет web-доступа в MVP
- Follow-up: Оценить потребность foreman web access после запуска MVP

### D-003: Modular monolith для первого релиза
- Date: 2026-02-16
- Status: accepted
- Context: Система стартует с нуля. Нет отдельных команд для разных сервисов.
- Decision: Модульный монолит с чёткими доменными границами внутри одного процесса.
- Consequences:
  - (+) Низкий operational overhead
  - (+) Простой деплой
  - (+) Путь к extraction при необходимости
  - (-) Все модули в одном процессе — сбой одного может затронуть другие
- Follow-up: Определить критерии для extraction тяжёлых модулей (chat, analytics)

### D-004: Photo moderation — ручная куратором
- Date: 2026-02-16
- Status: accepted
- Context: Контроль качества зависит от человеческой оценки. Автоматическая проверка может быть ненадёжной.
- Decision: Ручная модерация: pending → approved/rejected. Куратор обязан оставить комментарий при reject.
- Consequences:
  - (+) Высокое качество модерации
  - (+) Простая реализация
  - (-) Узкое место при большом объёме фото
  - (-) Зависимость от скорости работы куратора
- Follow-up: В Phase 5 оценить ML-based pre-check pipeline

### D-005: Realtime — polling в MVP, WebSocket позже
- Date: 2026-02-16
- Status: accepted
- Context: Chat и dashboard нуждаются в обновлениях. WebSocket требует дополнительной инфраструктуры.
- Decision: REST polling для MVP. WebSocket upgrade в Phase 4.
- Consequences:
  - (+) Быстрый запуск без additional infrastructure
  - (+) Простая отладка (HTTP requests)
  - (-) Более высокая latency для chat (5-30 sec polling interval)
  - (-) Больше HTTP запросов
- Follow-up: Benchmarking load перед Phase 4 для оценки необходимости WebSocket

### D-006: Frontend stack — Vite + React + TypeScript + shadcn/ui
- Date: 2026-02-18
- Status: accepted
- Context: Нужен frontend framework для curator SPA dashboard. Не нужен SSR/SSG.
- Decision: Vite (bundler) + React 18 + TypeScript + shadcn/ui + Tailwind CSS
- Consequences:
  - (+) Быстрый dev server и HMR
  - (+) Богатая экосистема React
  - (+) shadcn/ui — production-ready компоненты, не library lock-in
  - (+) TypeScript — типобезопасность
  - (-) SPA не подходит для SEO (не нужно для internal dashboard)
- Follow-up: Нет

### D-007: State management — React Query + Context (без Redux)
- Date: 2026-02-18
- Status: accepted
- Context: Dashboard data-heavy, нужно управление серверным состоянием.
- Decision: @tanstack/react-query для server state. React Context для auth и theme.
- Consequences:
  - (+) React Query: кэширование, polling, mutations, optimistic updates — всё из коробки
  - (+) Нет boilerplate Redux
  - (+) Server state и client state разделены
  - (-) Не подходит для complex client-side state (не нужно)
- Follow-up: Нет

### D-008: API mocking — MSW для frontend-first разработки
- Date: 2026-02-18
- Status: accepted
- Context: Backend ещё не реализован. Frontend нужно разрабатывать параллельно.
- Decision: Mock Service Worker (MSW) для перехвата API запросов на сетевом уровне. Моки соответствуют API контракту.
- Consequences:
  - (+) Frontend разработка не блокируется backend
  - (+) Реалистичные network-level моки
  - (+) Переключение на real API — смена URL, без изменения кода
  - (-) Моки могут разойтись с реальным API (mitigation: contract tests)
- Follow-up: Удалить MSW после полной интеграции с backend

### D-009: Database PK — UUID v4
- Date: 2026-02-18
- Status: accepted
- Context: Нужен ID формат для всех таблиц. Sequential IDs раскрывают информацию о volume.
- Decision: UUID v4 для всех primary keys, генерируемые на уровне приложения.
- Consequences:
  - (+) Не раскрывают volume/order
  - (+) Безопасны для multi-tenant
  - (+) Генерируемы без DB roundtrip
  - (-) Больший размер индексов vs bigint
  - (-) Potentially worse B-tree locality (mitigation: не критично при текущем масштабе)
- Follow-up: Мониторить index performance при росте данных

### D-010: Financial data — Decimal only, immutable records
- Date: 2026-02-18
- Status: accepted
- Context: Финансовые данные требуют точности и аудируемости.
- Decision: Все денежные поля `numeric(14,2)` в PostgreSQL, `Decimal` в Python. Завершённые финансовые записи immutable. Корректировки — отдельные записи.
- Consequences:
  - (+) Нет ошибок округления float
  - (+) Полный аудит-трейл
  - (+) Соответствие compliance (5 лет хранения)
  - (-) Немного сложнее работа с Decimal vs float в Python
- Follow-up: Нет

---

## Pending Decisions (TODO)

### D-011: Curator authentication mode
- Date: pending
- Status: proposed
- Context: Нужно определить: password + MFA, OTP, или SSO для curator login.
- Options: password+MFA (baseline) | SSO integration | OTP like mobile
- Follow-up: Решить до начала Phase 1

### D-012: Payment calculation formula
- Date: pending
- Status: proposed
- Context: Оплата привязана к shift data + moderation outcomes. Точная формула не зафиксирована.
- Follow-up: Получить бизнес-требования для формулы

### D-013: Object storage vendor
- Date: pending
- Status: proposed
- Context: Нужен S3-compatible storage для фото и файлов.
- Options: AWS S3 | GCS | MinIO (self-hosted) | DigitalOcean Spaces
- Follow-up: Решить до начала Phase 1

### D-014: Hosting platform
- Date: pending
- Status: proposed
- Context: Нужно определить где хостить production.
- Options: AWS | GCP | DigitalOcean | VPS + Docker
- Follow-up: Решить до начала Phase 1

### D-015: CI/CD platform
- Date: pending
- Status: proposed
- Context: Pipeline для lint, test, build, deploy.
- Options: GitHub Actions | GitLab CI | CircleCI
- Follow-up: Решить при инициализации git repository
