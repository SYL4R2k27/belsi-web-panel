# API — BELSI.Work

## Общие принципы

| Параметр | Значение |
|----------|---------|
| Base path | `/api/v1` |
| Content-Type | `application/json` |
| Авторизация | `Authorization: Bearer <jwt>` |
| Формат дат | ISO-8601 UTC |
| Именование полей | snake_case |
| Пагинация | Обязательна для list endpoints |
| Версионирование | Через path prefix `/v1`, `/v2` |

## Формат ответов

### Успешный ответ
```json
{
  "data": { ... },
  "meta": {
    "page": 1,
    "per_page": 20,
    "total": 150,
    "total_pages": 8
  }
}
```

Для одиночных сущностей `meta` может отсутствовать.

### Ответ с ошибкой
```json
{
  "error": {
    "code": "validation_error",
    "message": "Human-readable description",
    "details": {
      "field": ["Error message"]
    }
  }
}
```

## HTTP Status Codes

| Code | Использование |
|------|--------------|
| 200 | Успешное чтение, обновление |
| 201 | Успешное создание |
| 204 | Успешное удаление / действие без тела |
| 400 | Невалидный запрос |
| 401 | Не авторизован (нет токена, expired) |
| 403 | Нет прав (роль не позволяет) |
| 404 | Ресурс не найден |
| 409 | Конфликт (дубликат, невалидный переход состояния) |
| 422 | Ошибка валидации |
| 429 | Rate limit exceeded |
| 500 | Internal server error |

## Endpoints по доменам

### Auth (6 endpoints)

| Method | Path | Описание | Доступ |
|--------|------|----------|--------|
| POST | `/auth/otp/request` | Запрос OTP кода | public |
| POST | `/auth/otp/verify` | Верификация OTP | public |
| POST | `/auth/login` | Login по email+password (curator) | public |
| POST | `/auth/refresh` | Обновление access token | authenticated |
| POST | `/auth/logout` | Выход, revoke refresh token | authenticated |
| GET | `/auth/me` | Текущий пользователь | authenticated |

### Users (6 endpoints)

| Method | Path | Описание | Доступ |
|--------|------|----------|--------|
| GET | `/users` | Список пользователей | curator |
| GET | `/users/{user_id}` | Профиль пользователя | curator |
| PATCH | `/users/{user_id}` | Обновление профиля | curator |
| POST | `/users/{user_id}/block` | Блокировка пользователя | curator |
| POST | `/users/{user_id}/unblock` | Разблокировка | curator |
| GET | `/users/{user_id}/shift_history` | История смен пользователя | curator |

Фильтры для GET /users: `role`, `status`, `foreman_id`, `search`

### Teams & Invites (7 endpoints)

| Method | Path | Описание | Доступ |
|--------|------|----------|--------|
| GET | `/teams` | Список команд | curator |
| GET | `/teams/{team_id}` | Детали команды | curator |
| PATCH | `/teams/{team_id}` | Обновление команды | curator |
| GET | `/invites` | Список инвайтов | curator, foreman |
| POST | `/invites` | Создание инвайт-кода | foreman |
| POST | `/invites/{invite_id}/deactivate` | Деактивация инвайта | curator, foreman |
| POST | `/invites/redeem` | Активация инвайта | installer (mobile) |

### Shifts (8 endpoints)

| Method | Path | Описание | Доступ |
|--------|------|----------|--------|
| POST | `/shifts/start` | Начать смену | installer (mobile) |
| POST | `/shifts/{shift_id}/pause` | Пауза | installer (mobile) |
| POST | `/shifts/{shift_id}/resume` | Возобновление | installer (mobile) |
| POST | `/shifts/{shift_id}/finish` | Завершение | installer (mobile) |
| GET | `/shifts` | Список смен | curator |
| GET | `/shifts/{shift_id}` | Детали смены | curator |
| GET | `/shifts/{shift_id}/photos` | Фото смены | curator |
| GET | `/shifts/{shift_id}/report` | Отчёт по смене | curator |

Фильтры для GET /shifts: `status`, `user_id`, `team_id`, `date_from`, `date_to`

### Photos & Moderation (5 endpoints)

| Method | Path | Описание | Доступ |
|--------|------|----------|--------|
| POST | `/photos/upload` | Загрузка фото | installer (mobile) |
| GET | `/photos` | Список фото | curator |
| GET | `/photos/{photo_id}` | Детали фото | curator |
| POST | `/photos/{photo_id}/approve` | Одобрить фото | curator |
| POST | `/photos/{photo_id}/reject` | Отклонить фото | curator |

При reject обязателен `review_comment`.

### Tasks (6 endpoints)

| Method | Path | Описание | Доступ |
|--------|------|----------|--------|
| GET | `/tasks` | Список задач | curator |
| POST | `/tasks` | Создать задачу | curator |
| GET | `/tasks/{task_id}` | Детали задачи | curator |
| PATCH | `/tasks/{task_id}` | Обновить задачу | curator |
| POST | `/tasks/{task_id}/assign` | Назначить исполнителя | curator |
| POST | `/tasks/{task_id}/status` | Сменить статус | curator, installer |

### Chat (4 endpoints)

| Method | Path | Описание | Доступ |
|--------|------|----------|--------|
| GET | `/chat/conversations` | Список бесед | curator |
| GET | `/chat/conversations/{id}/messages` | Сообщения беседы | curator |
| POST | `/chat/conversations/{id}/messages` | Отправить сообщение | curator |
| POST | `/chat/conversations/{id}/read` | Пометить прочитанным | curator |

### Finance (4 endpoints)

| Method | Path | Описание | Доступ |
|--------|------|----------|--------|
| GET | `/finance/payments` | Список платежей | curator |
| GET | `/finance/payments/{payment_id}` | Детали платежа | curator |
| POST | `/finance/payments/{payment_id}/adjust` | Корректировка | curator |
| GET | `/finance/summary` | Финансовая сводка | curator |

### Dashboard & Analytics (5 endpoints)

| Method | Path | Описание | Доступ |
|--------|------|----------|--------|
| GET | `/dashboard/overview` | KPI обзор | curator |
| GET | `/analytics/shifts` | Аналитика смен | curator |
| GET | `/analytics/photos` | Аналитика фото | curator |
| GET | `/analytics/tasks` | Аналитика задач | curator |
| GET | `/analytics/finance` | Финансовая аналитика | curator |

### Logs & Settings (4 endpoints)

| Method | Path | Описание | Доступ |
|--------|------|----------|--------|
| GET | `/system/logs` | Системные логи | curator |
| GET | `/system/audit_logs` | Аудит-лог | curator |
| GET | `/settings` | Настройки системы | curator |
| PATCH | `/settings` | Обновить настройки | curator |

## Пагинация

### Offset-based (для таблиц)
```
GET /users?page=2&per_page=20
```
Response meta:
```json
{
  "page": 2,
  "per_page": 20,
  "total": 150,
  "total_pages": 8
}
```

### Cursor-based (для append-only streams)
```
GET /chat/conversations/{id}/messages?cursor=uuid&limit=50
```
Используется для сообщений чата и логов.

## Rate Limiting

| Endpoint | Лимит |
|----------|-------|
| `/auth/*` | 10 req/min per IP |
| `/photos/upload` | 30 req/min per user |
| `/chat/*/messages` (POST) | 60 req/min per user |
| Все остальные | 300 req/min per user |

## Правила эволюции API

- Новые поля добавляются без breakage
- Удаление полей — deprecation window минимум 1 релиз
- Breaking changes — только через новую версию `/v2`
- Поля именуются стабильно, доменно-согласованно
