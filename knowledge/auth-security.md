# Auth & Security — BELSI.Work

## Цели безопасности

- Защита identity, payroll и операционных данных
- Предотвращение несанкционированной эскалации ролей
- Сохранение forensic-grade истории действий

## Аутентификация

### Mobile Users (installer, foreman)
- OTP-based login через SMS
- Запрос: `POST /auth/otp/request` → отправка кода на телефон
- Верификация: `POST /auth/otp/verify` → получение JWT tokens

### Curator (web panel)
- Email + password login
- Обязательная strong password policy
- MFA планируется как обязательный (Phase 4)
- Endpoint: `POST /auth/login`

### Токены

| Параметр | Access Token | Refresh Token |
|----------|-------------|---------------|
| Формат | JWT (signed) | Opaque UUID |
| TTL | 15 минут | 7 дней |
| Хранение (client) | In-memory (JS variable) | localStorage (httpOnly cookie preferred) |
| Хранение (server) | Не хранится (stateless) | SHA256 hash в user_sessions |
| Подпись | RSA asymmetric (private/public key) | - |
| Ротация | При каждом refresh | Rotation + revocation |

### Token Flow

```
1. Login → получение access_token + refresh_token
2. API запрос → Authorization: Bearer <access_token>
3. 401 → frontend автоматически вызывает /auth/refresh
4. Refresh → новая пара access + refresh tokens
5. Refresh failed → logout, redirect на /login
```

### Key Rotation
- Asymmetric ключи с overlap window
- Старые публичные ключи валидны в течение overlap period
- Ротация не прерывает активные сессии

## Авторизация (RBAC)

### Роли

| Роль | Уровень доступа |
|------|----------------|
| `installer` | Только свои данные: смены, фото, задачи, профиль |
| `foreman` | Свои данные + данные своей команды |
| `curator` | Полный доступ ко всем данным и операциям через web panel |

### Матрица разрешений

| Ресурс | installer | foreman | curator |
|--------|-----------|---------|---------|
| Свой профиль | read/update | read/update | read/update |
| Другие профили | - | read (team) | read/update/block |
| Смены (свои) | read/start/pause/finish | - | - |
| Смены (все) | - | read (team) | read/verify |
| Фото (свои) | upload/read | - | - |
| Фото (все) | - | - | read/moderate |
| Задачи (свои) | read/status change | - | - |
| Задачи (все) | - | - | CRUD/assign |
| Команды | - | read/invite | read/manage |
| Финансы | read (свои) | - | read/adjust |
| Поддержка | create/read (свои) | create/read (свои) | full access |
| Аудит-лог | - | - | read |
| Настройки | - | - | read/update |

### Enforcement
- Проверка ролей на уровне API middleware (FastAPI dependencies)
- Resource-level checks в service layer (проверка принадлежности данных)
- Серверная авторизация НИКОГДА не делегируется клиенту
- Default deny: если permission не определён явно — access denied

## Session Management

### Хранение сессий
- Таблица `user_sessions`: user_id, refresh_token_hash, device_info, ip_address, expires_at, revoked_at
- Один пользователь может иметь несколько активных сессий (разные устройства)
- Отзыв сессии: установка `revoked_at` на запись

### Revocation Triggers
- Явный logout пользователем
- Блокировка пользователя куратором (revoke ALL sessions)
- Credential reset / password change
- Anomaly detection (опционально)

## Password Policy (Curator)

| Параметр | Значение |
|----------|---------|
| Минимальная длина | 12 символов |
| Требования | Uppercase + lowercase + digit + special char |
| Hashing | Argon2id |
| Хранение | Только hash, никогда plaintext |
| Rate limiting | 10 попыток/мин per IP |

## Data Protection

### В транзите
- TLS 1.2+ обязателен для всех соединений
- HSTS headers
- Certificate pinning для мобильных клиентов (рекомендуется)

### At rest
- AES-256 encryption для базы данных
- AES-256 encryption для object storage
- Sensitive fields минимизированы и access-scoped

### Secrets
- Никогда не хранятся в source control
- Environment variables через `.env` файлы
- Production secrets через secrets manager

## API Protection

### Input Validation
- Pydantic schemas на каждый endpoint
- Strict type checking
- Length limits на все строковые поля
- Parameterized queries only (нет raw SQL interpolation)

### Rate Limiting
- Auth endpoints: 10 req/min per IP
- Upload endpoints: 30 req/min per user
- Chat messages: 60 req/min per user
- General: 300 req/min per user

### CORS
- Restricted to approved origins
- Web admin domain only в production
- Credentials: include

### CSRF
- Protection для cookie-bound sessions
- SameSite=Strict для cookies

## File Upload Security
- Валидация MIME type (whitelist)
- Ограничение размера файла (сервер-сайд)
- Сканирование на вирусы (рекомендуется в production)
- Signed URL access (не прямой доступ к storage)

## Аудит

### Что аудируется
Каждое write-действие куратора:
- Модерация фото (approve/reject)
- Блокировка/разблокировка пользователей
- Изменение ролей
- Создание/изменение задач
- Финансовые корректировки
- Изменение настроек
- Все delete-операции

### Формат аудит-записи
- `actor_user_id` — кто выполнил действие
- `action` — тип действия (photo.approved, user.blocked, etc.)
- `entity_type` — тип сущности
- `entity_id` — ID сущности
- `old_data` — состояние до изменения (JSON)
- `new_data` — состояние после изменения (JSON)
- `ip_address` — IP адрес актора
- `created_at` — timestamp

### Хранение
- Immutable: записи не обновляются и не удаляются
- Минимум 24 месяца online
- Tamper-resistant storage
- Архивирование с forensic-доступом

## Operational Security

- Least-privilege IAM per service account
- Segregated environments и credentials
- Vulnerability scanning в CI для dependencies и images
- Regular patching cadence
- Emergency patch path определён

## Incident Response

- Alerting на auth anomalies, error spikes, suspicious role changes
- On-call runbook с severity classification
- Workflow: containment → eradication → recovery → post-incident review
