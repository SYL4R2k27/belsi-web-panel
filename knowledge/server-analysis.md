# Server Analysis — Production Infrastructure

## Дата анализа: 2026-02-20

## Сервер

| Параметр | Значение |
|----------|---------|
| IP (публичный) | 94.228.123.95 |
| IP (приватный) | 192.168.56.6 |
| ОС | Ubuntu 22.04.5 LTS |
| CPU | 2 ядра |
| RAM | 3.8 GB total, ~2.5 GB available |
| Диск | 39 GB total, 33 GB свободно (17% занято) |
| Uptime | 95 дней, load average 0.09 |

## Установленное ПО

| Компонент | Версия | Статус |
|-----------|--------|--------|
| Nginx | 1.18.0 | Работает, обслуживает api.belsi.ru |
| Docker | 28.2.2 | Установлен, контейнеров нет |
| Python | 3.10.12 | Используется для backend API |
| Node.js | Не установлен | Нужен для сборки frontend |
| Virtualmin | Активен | Управление на порту 10000 |
| Let's Encrypt | Настроен | SSL для api.belsi.ru |
| Zabbix Agent | Активен | Мониторинг |
| ProFTPD | Активен | FTP на 21 и 2222 |
| Dovecot | Активен | Почта (IMAP/POP3) |

## Текущий Backend (BELSI API)

### Расположение
```
/opt/belsi-api/
├── app/              # FastAPI application (~38 Python файлов)
├── alembic/          # Миграции БД (1 версия)
├── venv/             # Python virtual environment
├── uploads/          # Загруженные файлы (voice, chat)
├── config/
├── backups/
├── .env              # Переменные окружения
└── alembic.ini
```

### Systemd Service
- Unit: `belsi-api.service`
- User: `belsi`
- Group: `www-data`
- Процесс: `uvicorn app.main:app --host 127.0.0.1 --port 8000`
- EnvironmentFile: `/etc/belsi-api.env`
- Restart: always

### Существующие API Роутеры
```
profile_router          — профили пользователей
tools_router            — инструменты и оборудование
user_router             — пользователи
tasks_router            — задачи
foreman_team_router     — команды бригадиров
push_router             — push-уведомления
foreman_router          — функции бригадира
yandex_auth_router      — авторизация через Яндекс
sber_auth_router        — авторизация через Сбер
support_chat_router     — чат поддержки
support_router          — тикеты поддержки
shifts_photos_router    — фото смен
photos_feed_router      — лента фото
photo_review_router     — модерация фото
curator_router          — функции куратора
coordinator_router      — координатор
reports_router          — отчёты
shift_pauses_router     — паузы смен
messenger_router        — мессенджер
ws_messenger_router     — WebSocket мессенджер
```

### Прямые Endpoints в main.py
```
POST /auth/phone          — запрос OTP
POST /auth/verify         — верификация OTP
POST /shifts/start        — начало смены
POST /shifts/finish       — завершение смены
GET  /shifts              — список смен
GET  /shifts/{shift_id}   — детали смены
POST /foreman/invites     — создание инвайта
GET  /foreman/invites     — список инвайтов
POST /foreman/invites/redeem   — активация инвайта
POST /foreman/invites/cancel   — отмена инвайта
POST /shift/hour/photo    — загрузка фото за час
GET  /health              — health check
```

## Nginx Configuration (api.belsi.ru)

### Текущие Location Blocks
```nginx
# Статика голосовых сообщений
location /uploads/voice/ → /opt/belsi-api/uploads/voice/

# Статика чат-файлов
location /uploads/chat/ → /opt/belsi-api/uploads/chat/

# WebSocket
location /ws/ → proxy_pass http://127.0.0.1:8000 (с upgrade headers)

# Всё остальное — API
location / → proxy_pass http://127.0.0.1:8000
```

### SSL
- Сертификат: Let's Encrypt (`/etc/letsencrypt/live/api.belsi.ru/`)
- Слушает: 94.228.123.95:443 + IPv6

### Лимиты
- `client_max_body_size 50m`
- `proxy_read_timeout 300s`
- `proxy_send_timeout 300s`

## Внешние сервисы

### PostgreSQL
| Параметр | Значение |
|----------|---------|
| IP | 192.168.56.5 (приватный) |
| Port | 5432 |
| Database | default_db |
| User | gen_user |
| Размер БД | 11 MB |
| Таблиц | 22 |

### Существующие таблицы
```
users                  — пользователи
user_profiles          — профили
shifts                 — смены
shift_photos           — фото смен
shift_pauses           — паузы смен
tasks                  — задачи
tools                  — инструменты
tool_transactions      — операции с инструментами
foreman_invites        — инвайт-коды
foreman_installers     — связь бригадир-монтажник
foreman_memberships    — членство в бригадах
team_memberships       — членство в командах
support_tickets        — тикеты поддержки
support_messages       — сообщения поддержки
support_chat_reads     — прочитанные чаты
support_ticket_reads   — прочитанные тикеты
chat_threads           — чат-треды
chat_participants      — участники чатов
chat_messages_v2       — сообщения чатов
coordinator_reports    — отчёты координатора
site_objects           — объекты на местности
alembic_version        — версия миграций
```

### Redis
| Параметр | Значение |
|----------|---------|
| IP | 192.168.56.4 (приватный) |
| Port | 6379 |
| User | default |

### S3 Object Storage
| Параметр | Значение |
|----------|---------|
| Endpoint | https://s3.twcstorage.ru |
| Bucket URL | https://bucket.api.belsi.ru |
| Bucket Name | 46a58074-ea583b63-7b06-4d9e-ac2b-4a519ee3477b |

## Анализ: размещение веб-панели куратора

### Вердикт: РЕАЛЬНО, без нового сервера

### Обоснование

1. **Ресурсов достаточно** — 2.5 GB свободной RAM, 33 GB диска, load 0.09 из 2.0
2. **Nginx уже работает** — нужен только дополнительный server block
3. **SSL инфраструктура на месте** — Certbot + Let's Encrypt
4. **Backend API существует** — curator_router, photo_review, shifts, tasks, tools, support уже реализованы
5. **WebSocket настроен** — real-time уже работает
6. **БД и Redis доступны** — та же приватная сеть

### Рекомендуемая архитектура

```
admin.belsi.ru (новый поддомен)
    │
    ▼
Nginx (тот же, порт 443)
    │
    ├── /           → /opt/belsi-admin/dist/  (React SPA статика)
    ├── /api/       → proxy_pass http://127.0.0.1:8000  (существующий backend)
    └── /ws/        → proxy_pass http://127.0.0.1:8000  (WebSocket, существующий)
```

### Что нужно сделать

| # | Действие | Сложность |
|---|---------|-----------|
| 1 | Создать DNS A-запись `admin.belsi.ru` → 94.228.123.95 | Низкая |
| 2 | Установить Node.js на сервер (`apt install nodejs npm`) | Низкая |
| 3 | Создать папку `/opt/belsi-admin/` | Тривиальная |
| 4 | Собрать React SPA и положить в `/opt/belsi-admin/dist/` | Средняя |
| 5 | Создать Nginx server block для `admin.belsi.ru` | Низкая |
| 6 | Получить SSL через `certbot --nginx -d admin.belsi.ru` | Тривиальная |
| 7 | Reload Nginx | Тривиальная |

### Примерный Nginx Config для admin.belsi.ru

```nginx
server {
    server_name admin.belsi.ru;
    listen 94.228.123.95:443 ssl;

    ssl_certificate /etc/letsencrypt/live/admin.belsi.ru/fullchain.pem;
    ssl_certificate_key /etc/letsencrypt/live/admin.belsi.ru/privkey.pem;

    # React SPA
    root /opt/belsi-admin/dist;
    index index.html;

    location / {
        try_files $uri $uri/ /index.html;
    }

    # API proxy к существующему backend
    location /api/ {
        proxy_pass http://127.0.0.1:8000/;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }

    # WebSocket proxy
    location /ws/ {
        proxy_pass http://127.0.0.1:8000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection "upgrade";
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_read_timeout 3600s;
    }
}

server {
    listen 80;
    server_name admin.belsi.ru;
    return 301 https://$host$request_uri;
}
```

### Потребление ресурсов веб-панелью

| Ресурс | Потребление | Комментарий |
|--------|-----------|-------------|
| Диск | ~10 MB | Собранный React SPA |
| RAM | ~0 MB | Nginx уже работает, статика не потребляет |
| CPU | Минимальное | 1-3 curator пользователя |
| Bandwidth | Минимальный | Внутренний инструмент |

### Ключевое преимущество

**Backend API для куратора уже существует** (`curator_router`, `photo_review_router`, `reports_router`, `coordinator_router`). Веб-панель — это frontend-оболочка над существующим API. Не нужно писать backend с нуля.

### Риски

| Риск | Вероятность | Impact | Mitigation |
|------|------------|--------|-----------|
| Нехватка ресурсов | Низкая | Средний | Мониторинг через Zabbix |
| Конфликт с мобильным API | Низкая | Высокий | Отдельный домен, отдельный Nginx block |
| Нужны новые API endpoints | Средняя | Средний | Дописать в существующий backend |
| SSL проблемы | Низкая | Низкий | Certbot автоматический |
