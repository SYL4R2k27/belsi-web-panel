# Monitoring — BELSI.Work

## Observability Stack

| Компонент | Инструмент | Назначение |
|-----------|-----------|-----------|
| Логи | Structured JSON → stdout | Machine-readable, searchable |
| Метрики | Prometheus + Grafana | Request latency, error rates, queue lag |
| Error tracking | Sentry | Real-time errors, stack traces, alerting |
| Traces | Request ID propagation | Корреляция запросов через систему |

## Логирование

### Формат
Structured JSON на stdout. Сбор через log aggregator (Loki, ELK, CloudWatch).

```json
{
  "timestamp": "2026-02-18T14:30:00Z",
  "level": "INFO",
  "message": "Photo moderated",
  "request_id": "uuid-...",
  "user_id": "uuid-...",
  "role": "curator",
  "action": "photo.approved",
  "entity_type": "shift_photo",
  "entity_id": "uuid-...",
  "duration_ms": 45,
  "ip_address": "192.168.1.1"
}
```

### Обязательные поля

| Поле | Описание | Когда |
|------|----------|-------|
| `timestamp` | ISO-8601 UTC | Всегда |
| `level` | DEBUG/INFO/WARNING/ERROR/CRITICAL | Всегда |
| `message` | Человекочитаемое описание | Всегда |
| `request_id` | UUID запроса | HTTP requests |
| `user_id` | ID текущего пользователя | Authenticated requests |
| `role` | Роль пользователя | Authenticated requests |
| `action` | Тип действия | Write operations |
| `entity_type` | Тип сущности | CRUD operations |
| `entity_id` | ID сущности | CRUD operations |
| `duration_ms` | Время выполнения | Все запросы |
| `status_code` | HTTP status code | Response logging |

### Уровни логирования

| Уровень | Использование | Пример |
|---------|-------------|--------|
| DEBUG | Детальная отладка (только dev) | SQL запросы, cache hits/misses |
| INFO | Штатные операции | Shift started, Photo approved, User logged in |
| WARNING | Аномалии, не ошибки | Rate limit approached, Slow query > 1s |
| ERROR | Ошибки, требующие внимания | DB connection failed, External API error |
| CRITICAL | Критические сбои системы | Database down, OOM, Cert expired |

### Запрещено логировать
- JWT токены и refresh tokens
- Пароли и OTP коды
- PII сверх необходимого (полные телефоны, адреса)
- Полные тела больших запросов (фото binary)

## Метрики

### Application Metrics (Prometheus)

| Метрика | Тип | Labels | Описание |
|---------|-----|--------|----------|
| `http_requests_total` | Counter | method, path, status | Total HTTP requests |
| `http_request_duration_seconds` | Histogram | method, path | Request latency |
| `http_requests_in_progress` | Gauge | - | Active requests |
| `db_query_duration_seconds` | Histogram | query_type | DB query latency |
| `db_connections_active` | Gauge | - | Active DB connections |
| `redis_operations_total` | Counter | operation | Redis operations |
| `worker_jobs_total` | Counter | job_type, status | Background job count |
| `worker_job_duration_seconds` | Histogram | job_type | Job execution time |
| `worker_queue_size` | Gauge | queue | Pending jobs in queue |

### Business Metrics

| Метрика | Тип | Описание |
|---------|-----|----------|
| `shifts_active_total` | Gauge | Currently active shifts |
| `photos_pending_moderation` | Gauge | Photos awaiting moderation |
| `photos_moderation_duration_seconds` | Histogram | Time from upload to moderation |
| `tasks_overdue_total` | Gauge | Currently overdue tasks |
| `support_tickets_open_total` | Gauge | Open support tickets |
| `auth_login_attempts_total` | Counter (by result) | Login attempts success/fail |

## Grafana Dashboards

### 1. System Overview
- Request rate (req/sec)
- Error rate (4xx, 5xx)
- P50/P95/P99 latency
- Active DB connections
- Redis memory usage
- Worker queue lag

### 2. Business Operations
- Active shifts count
- Photos pending moderation (gauge + trend)
- Moderation throughput (photos/hour)
- Task overdue count
- Support ticket queue
- Payment pipeline status

### 3. Authentication
- Login attempts per minute
- Failed login rate
- Active sessions count
- Token refresh rate

## Alerting

### Critical (PagerDuty / immediate)

| Alert | Condition | Action |
|-------|----------|--------|
| API Down | Health check fails 3x consecutively | On-call response |
| Database Down | DB connection errors > 50% | On-call response |
| Error Rate Spike | 5xx rate > 5% for 5 minutes | Investigate + potential rollback |
| Disk Space | > 90% usage | Cleanup / expand |

### Warning (Slack / team channel)

| Alert | Condition | Action |
|-------|----------|--------|
| High Latency | P95 > 1s for 10 minutes | Investigation |
| Worker Queue Lag | Queue size > 1000 for 5 minutes | Scale workers |
| Photo Moderation Backlog | Pending photos > 100 for 1 hour | Curator notification |
| High Error Rate | 4xx rate > 20% for 15 minutes | Investigation |
| Certificate Expiry | < 14 days to expiry | Renew |
| Failed Logins | > 50 failed attempts from single IP | Rate limit review |

### Info (Dashboard only)

| Alert | Condition |
|-------|----------|
| Deployment completed | New version deployed |
| Migration applied | DB migration executed |
| Backup completed | Daily backup finished |

## Health Checks

### API Health Endpoint
```
GET /health

Response 200:
{
  "status": "ok",
  "components": {
    "database": "ok",
    "redis": "ok",
    "storage": "ok"
  },
  "version": "1.2.3",
  "uptime_seconds": 86400
}

Response 503:
{
  "status": "degraded",
  "components": {
    "database": "ok",
    "redis": "error",
    "storage": "ok"
  }
}
```

### Проверки
- Database: SELECT 1 query
- Redis: PING command
- Object storage: HEAD request to test bucket
- Периодичность: каждые 10 секунд

## Error Tracking (Sentry)

### Backend
- Все unhandled exceptions
- Все 5xx responses
- Context: user_id, role, request_id, endpoint
- Stack traces с source maps

### Frontend
- Unhandled promise rejections
- React error boundaries
- Network errors (API failures)
- Context: user_id, route, browser info

### Правила
- Production only (не dev)
- PII scrubbing enabled
- Sensitive headers filtered
- Rate sampling для high-volume events

## On-Call

- Определён owner per service/module
- Runbook для каждого critical alert
- Severity levels: S1 (system down), S2 (degraded), S3 (minor issue)
- Escalation path defined
- Post-incident review для S1 и S2
