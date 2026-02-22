# Tech Stack — BELSI.Work

## Backend

| Технология | Версия | Назначение | Обоснование |
|-----------|--------|-----------|-------------|
| Python | 3.12+ | Язык бэкенда | Экосистема, скорость разработки, типизация |
| FastAPI | latest stable | Web framework | Async, Pydantic-native, автогенерация OpenAPI, высокая производительность |
| Pydantic v2 | latest stable | Валидация данных | Строгая типизация request/response, JSON serialization |
| SQLAlchemy 2.0 | latest stable | ORM / Data Access | Mature, async support, strong migration tooling |
| Alembic | latest stable | Database migrations | Standard для SQLAlchemy, expand/contract support |
| Uvicorn | latest stable | ASGI server | Production-grade, async, работает с Gunicorn |
| Gunicorn | latest stable | Process manager | Worker management для production |
| python-jose | latest stable | JWT | Создание/валидация JWT токенов |
| passlib[argon2] | latest stable | Password hashing | Argon2id — gold standard для хеширования паролей |
| httpx | latest stable | HTTP client | Async HTTP клиент для внешних интеграций |

## Frontend (Web Admin)

| Технология | Версия | Назначение | Обоснование |
|-----------|--------|-----------|-------------|
| React | 18+ | UI framework | Компонентная модель, огромная экосистема |
| TypeScript | 5.x | Язык | Типобезопасность, DX, рефакторинг |
| Vite | latest stable | Bundler / Dev server | Быстрый HMR, простая конфигурация, SPA-оптимизирован |
| Tailwind CSS | v4 | Стилизация | Utility-first, темизация через CSS variables |
| shadcn/ui | latest | UI компоненты | Headless components, copy-paste ownership, Tailwind-native |
| @tanstack/react-query | v5 | Server state | Кэширование, polling, мутации, optimistic updates |
| @tanstack/react-table | v8 | Таблицы | Headless, сортировка, пагинация, фильтрация |
| react-router-dom | v6+ | Routing | SPA routing, nested routes, lazy loading |
| react-hook-form | latest | Формы | Производительность, минимальные ре-рендеры |
| zod | latest | Валидация схем | TypeScript-native, интеграция с react-hook-form |
| axios | latest | HTTP client | Interceptors для JWT refresh, request/response transforms |
| recharts | latest | Графики | React-native, composable, лёгкий |
| date-fns | latest | Работа с датами | Tree-shakeable, immutable, без мутаций |
| lucide-react | latest | Иконки | Используется shadcn/ui, consistent icon set |
| sonner | latest | Toast уведомления | Рекомендован shadcn/ui |
| msw | latest | API mocking (dev) | Mock Service Worker, сетевой уровень, реалистичные моки |

## Database

| Технология | Версия | Назначение | Обоснование |
|-----------|--------|-----------|-------------|
| PostgreSQL | 15+ | Primary database | ACID, JSONB, partial indexes, RLS, partitioning |

## Caching

| Технология | Версия | Назначение | Обоснование |
|-----------|--------|-----------|-------------|
| Redis | 7+ | Cache + Counters | Dashboard aggregates, unread counters, session cache |

## Infrastructure

| Технология | Назначение | Обоснование |
|-----------|-----------|-------------|
| Docker | Контейнеризация | Immutable builds, воспроизводимость, CI/CD |
| Docker Compose | Локальная разработка | Оркестрация dev-окружения |
| Nginx | Reverse proxy, TLS termination, static serving | Production-grade, rate limiting, caching |
| Let's Encrypt / Certbot | SSL сертификаты | Бесплатные, автообновление |

## Object Storage

| Технология | Назначение | Обоснование |
|-----------|-----------|-------------|
| S3-compatible (AWS S3 / MinIO) | Хранение фото и файлов | Масштабируемость, CDN-ready, signed URLs |

## Monitoring & Observability

| Технология | Назначение | Обоснование |
|-----------|-----------|-------------|
| Structured JSON logs | Логирование | Machine-readable, searchable |
| Prometheus | Метрики | Industry standard, FastAPI-compatible |
| Grafana | Дашборды | Визуализация метрик и алертов |
| Sentry | Error tracking | Real-time error alerting, stack traces |

## Message Queue

| Технология | Назначение | Обоснование |
|-----------|-----------|-------------|
| Redis Streams / Celery | Background jobs | Notifications, report generation, aggregates |

## Что НЕ используется и почему

| Отвергнуто | Причина |
|-----------|---------|
| Next.js | Не нужен SSR/SSG для внутренней панели за аутентификацией |
| Django | Слишком opinionated, ORM не async-native, не Pydantic-first |
| MongoDB | Финансовые данные и сложные связи требуют ACID и SQL |
| GraphQL | Избыточная сложность для внутренней панели с контролируемым набором запросов |
| Microservices | Overhead без пользы на старте, одна команда |
| Tailwind v3 | v4 стабилен, CSS variables native, лучшая производительность |
