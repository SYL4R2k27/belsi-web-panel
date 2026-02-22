# Deployment — BELSI.Work

## Архитектура деплоя

```
Internet
    │
    ▼
┌─────────────┐
│   Nginx     │  TLS termination, reverse proxy, static files
│   Port 443  │
└──────┬──────┘
       │
       ├──────────────────┐
       ▼                  ▼
┌──────────────┐  ┌──────────────┐
│  FastAPI     │  │  Frontend    │
│  API (8000)  │  │  Static SPA  │
│  N instances │  │  (Nginx)     │
└──────┬───────┘  └──────────────┘
       │
       ├──────────┬──────────┐
       ▼          ▼          ▼
┌──────────┐ ┌────────┐ ┌──────────┐
│PostgreSQL│ │  Redis │ │  Object  │
│  :5432   │ │  :6379 │ │  Storage │
└──────────┘ └────────┘ └──────────┘
       │
       ▼
┌──────────────┐
│   Message    │
│   Worker     │
└──────────────┘
```

## Docker Containers

### Backend API
```dockerfile
# Multi-stage build
FROM python:3.12-slim AS builder
WORKDIR /app
COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

FROM python:3.12-slim
WORKDIR /app
COPY --from=builder /usr/local/lib/python3.12/site-packages /usr/local/lib/python3.12/site-packages
COPY ./app ./app
CMD ["gunicorn", "app.main:app", "-w", "4", "-k", "uvicorn.workers.UvicornWorker", "--bind", "0.0.0.0:8000"]
```

### Frontend
```dockerfile
# Multi-stage build
FROM node:20-alpine AS builder
WORKDIR /app
COPY package*.json ./
RUN npm ci
COPY . .
RUN npm run build

FROM nginx:alpine
COPY --from=builder /app/dist /usr/share/nginx/html
COPY nginx.conf /etc/nginx/conf.d/default.conf
```

### Docker Compose (dev)
```yaml
services:
  api:
    build: ./backend
    ports: ["8000:8000"]
    environment:
      DATABASE_URL: postgresql+asyncpg://...
      REDIS_URL: redis://redis:6379
    depends_on: [db, redis]

  web:
    build: ./frontend
    ports: ["3000:80"]

  db:
    image: postgres:15
    volumes: [pgdata:/var/lib/postgresql/data]
    environment:
      POSTGRES_DB: belsi
      POSTGRES_USER: belsi
      POSTGRES_PASSWORD: ${DB_PASSWORD}

  redis:
    image: redis:7-alpine

  worker:
    build: ./backend
    command: ["python", "-m", "app.workers.main"]
    depends_on: [db, redis]
```

## Nginx Configuration

### Production
```nginx
server {
    listen 443 ssl http2;
    server_name admin.belsi.work;

    ssl_certificate     /etc/letsencrypt/live/admin.belsi.work/fullchain.pem;
    ssl_certificate_key /etc/letsencrypt/live/admin.belsi.work/privkey.pem;
    ssl_protocols TLSv1.2 TLSv1.3;

    # Frontend SPA
    location / {
        root /usr/share/nginx/html;
        try_files $uri $uri/ /index.html;
    }

    # API proxy
    location /api/ {
        proxy_pass http://api:8000;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }

    # Rate limiting
    limit_req_zone $binary_remote_addr zone=api:10m rate=100r/s;
    location /api/ {
        limit_req zone=api burst=20 nodelay;
    }
}

# HTTP → HTTPS redirect
server {
    listen 80;
    return 301 https://$host$request_uri;
}
```

### SSL
- Let's Encrypt через Certbot
- Auto-renewal через cron/systemd timer
- TLS 1.2+ обязателен
- HSTS header включён

## CI/CD Pipeline

### Stages

```
1. Static Checks
   ├── Lint (backend: ruff/flake8, frontend: eslint)
   ├── Formatting (backend: black, frontend: prettier)
   └── Type checks (backend: mypy, frontend: tsc --noEmit)

2. Test
   ├── Unit tests (pytest, vitest)
   ├── Integration tests (pytest + test DB)
   └── Contract tests (API response validation)

3. Build
   ├── Docker image build (backend)
   ├── Docker image build (frontend)
   └── Tag with git SHA + branch

4. Security
   ├── Dependency vulnerability scan
   └── Container image scan

5. Migration
   ├── Apply safe database migrations
   └── Validate forward/backward compatibility

6. Deploy
   ├── Rolling update with health gates
   └── Canary for critical changes

7. Verify
   ├── Smoke tests (auth, shift, photo, payment flows)
   └── SLO checks (latency, error rate)
```

## Deployment Strategy

### Default: Rolling Update
- Новые instances поднимаются с новой версией
- Health check проходит → старые instances останавливаются
- Zero-downtime при корректной health check конфигурации

### Critical Changes: Canary
- 10% трафика на новую версию
- Мониторинг error rate и latency 15 минут
- Автоматический rollback при breach threshold
- При успехе — полный rollout

## Database Deployment

### Миграции
- Backward-compatible минимум на 1 release window
- Additive first: новые таблицы/колонки
- Data backfills — background jobs, не в миграции
- Schema-breaking removals — только после deprecation cycle

### Rollback
- Каждая миграция имеет rollback plan
- Forward-compatible fallback preferred over migration rollback
- Миграция rollback — крайний случай

## Rollback Protocol

1. Trigger: sustained error-rate или latency breach
2. Revert application version (docker image tag)
3. Execute rollback migration только если forward-compatible fallback fails
4. Announce incident в release channel
5. Post-incident review обязателен

## Post-Deployment Verification

Checklist:
- [ ] Auth/login flows работают
- [ ] Shift start/pause/finish работает
- [ ] Photo upload и moderation работает
- [ ] Payment screens доступны
- [ ] Logs и metrics поступают
- [ ] Alert thresholds не нарушены
- [ ] Dashboard KPIs обновляются

## Health Checks

### API
```
GET /health → 200 { "status": "ok", "db": "ok", "redis": "ok" }
```
- Проверяет DB connection
- Проверяет Redis connection
- Используется Nginx, Docker, и orchestrator для routing decisions

### Frontend
- Static file serving health: Nginx default
- SPA index.html availability
