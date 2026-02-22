# Environments — BELSI.Work

## Окружения

| Окружение | Назначение | Доступ |
|-----------|-----------|--------|
| `local` | Разработка на машине разработчика | Только разработчик |
| `staging` | Production-like валидация перед релизом | Команда разработки |
| `production` | Живой трафик, реальные пользователи | Все пользователи |

Каждое окружение изолировано: отдельная база данных, кэш, storage, секреты.

## Local (Development)

### Запуск
```bash
docker-compose up -d          # PostgreSQL + Redis
cd backend && uvicorn app.main:app --reload --port 8000
cd frontend && npm run dev    # Vite dev server, port 5173
```

### Характеристики
- PostgreSQL: Docker container, port 5432
- Redis: Docker container, port 6379
- API: uvicorn с hot reload, port 8000
- Frontend: Vite dev server с HMR, port 5173
- MSW (Mock Service Worker): опционально для frontend-only разработки
- Seed data: скрипт для заполнения тестовыми данными

### Переменные окружения

```bash
# .env (backend)
ENVIRONMENT=local
DATABASE_URL=postgresql+asyncpg://belsi:belsi@localhost:5432/belsi
REDIS_URL=redis://localhost:6379
JWT_PRIVATE_KEY=<dev-only-key>
JWT_PUBLIC_KEY=<dev-only-key>
JWT_ACCESS_TOKEN_EXPIRE_MINUTES=60
JWT_REFRESH_TOKEN_EXPIRE_DAYS=30
S3_ENDPOINT=http://localhost:9000
S3_BUCKET=belsi-dev
S3_ACCESS_KEY=minioadmin
S3_SECRET_KEY=minioadmin
CORS_ORIGINS=http://localhost:5173
LOG_LEVEL=DEBUG

# .env (frontend)
VITE_API_BASE_URL=http://localhost:8000
VITE_ENABLE_MOCKS=false
```

## Staging

### Характеристики
- Идентичная production конфигурация
- Отдельная PostgreSQL instance
- Отдельный Redis instance
- Отдельный S3 bucket
- Реальный SSL сертификат (staging subdomain)
- Доступ через VPN или IP whitelist

### Назначение
- Интеграционное тестирование перед production deploy
- Тестирование миграций на production-like данных
- QA и UAT testing
- Load testing (периодически)

### Переменные окружения

```bash
ENVIRONMENT=staging
DATABASE_URL=postgresql+asyncpg://belsi:${DB_PASSWORD}@staging-db:5432/belsi
REDIS_URL=redis://staging-redis:6379
JWT_PRIVATE_KEY=${JWT_PRIVATE_KEY_STAGING}
JWT_PUBLIC_KEY=${JWT_PUBLIC_KEY_STAGING}
JWT_ACCESS_TOKEN_EXPIRE_MINUTES=15
JWT_REFRESH_TOKEN_EXPIRE_DAYS=7
S3_ENDPOINT=https://s3.staging.belsi.work
S3_BUCKET=belsi-staging
CORS_ORIGINS=https://admin.staging.belsi.work
LOG_LEVEL=INFO
```

## Production

### Характеристики
- PostgreSQL: managed instance с daily backups + PITR
- Redis: managed instance с persistence
- Multiple API instances за load balancer
- CDN для static assets (frontend + media)
- SSL: Let's Encrypt auto-renewal
- Monitoring: Prometheus + Grafana + Sentry
- Log aggregation

### Переменные окружения

```bash
ENVIRONMENT=production
DATABASE_URL=postgresql+asyncpg://belsi:${DB_PASSWORD}@prod-db:5432/belsi
REDIS_URL=redis://prod-redis:6379
JWT_PRIVATE_KEY=${JWT_PRIVATE_KEY_PROD}
JWT_PUBLIC_KEY=${JWT_PUBLIC_KEY_PROD}
JWT_ACCESS_TOKEN_EXPIRE_MINUTES=15
JWT_REFRESH_TOKEN_EXPIRE_DAYS=7
S3_ENDPOINT=https://s3.belsi.work
S3_BUCKET=belsi-production
CORS_ORIGINS=https://admin.belsi.work
LOG_LEVEL=INFO
SENTRY_DSN=${SENTRY_DSN}
```

## Переменные окружения (полный список)

### Backend

| Переменная | Описание | Required | Default |
|-----------|----------|----------|---------|
| `ENVIRONMENT` | Окружение (local/staging/production) | Yes | local |
| `DATABASE_URL` | PostgreSQL connection string | Yes | - |
| `REDIS_URL` | Redis connection string | Yes | - |
| `JWT_PRIVATE_KEY` | RSA private key для подписи JWT | Yes | - |
| `JWT_PUBLIC_KEY` | RSA public key для валидации JWT | Yes | - |
| `JWT_ACCESS_TOKEN_EXPIRE_MINUTES` | TTL access token | No | 15 |
| `JWT_REFRESH_TOKEN_EXPIRE_DAYS` | TTL refresh token | No | 7 |
| `S3_ENDPOINT` | Object storage endpoint | Yes | - |
| `S3_BUCKET` | Bucket name | Yes | - |
| `S3_ACCESS_KEY` | S3 access key | Yes | - |
| `S3_SECRET_KEY` | S3 secret key | Yes | - |
| `CORS_ORIGINS` | Allowed origins (comma-separated) | Yes | - |
| `LOG_LEVEL` | Logging level | No | INFO |
| `SENTRY_DSN` | Sentry error tracking DSN | No | - |
| `RATE_LIMIT_ENABLED` | Enable rate limiting | No | true |

### Frontend

| Переменная | Описание | Required | Default |
|-----------|----------|----------|---------|
| `VITE_API_BASE_URL` | Backend API URL | Yes | - |
| `VITE_ENABLE_MOCKS` | Включить MSW моки | No | false |
| `VITE_SENTRY_DSN` | Sentry DSN для frontend | No | - |

## Секреты

### Правила
- Никогда не хранятся в git
- `.env` файлы в `.gitignore`
- Production секреты через secrets manager (Vault, AWS Secrets Manager, etc.)
- Ротация ключей по расписанию
- Разные ключи для каждого окружения

### Шаблон
- `.env.example` в git — шаблон без реальных значений
- Документирует все необходимые переменные
- Не содержит ни одного реального секрета
