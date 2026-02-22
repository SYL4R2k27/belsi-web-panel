# DB DESIGN

## 1. Назначение и границы
Документ фиксирует production-уровень логической модели PostgreSQL для BELSI.Work: сущности, связи, ограничения целостности, правила хранения, индексацию, масштабирование и безопасность данных.  
Область: операционные данные workforce-платформы для ролей `installer`, `foreman`, `curator` и web admin панели куратора.

## 2. ER-домен (объяснение модели)

### 2.1 Идентификация и доступ
- `users` хранит учетные записи, роли и статус активности.
- `user_sessions` хранит refresh-сессии и контекст устройства.
- `audit_log` фиксирует критические действия пользователей и системных операторов.

### 2.2 Команды и приглашения
- `teams` описывает производственные команды.
- `team_members` реализует M:N между пользователями и командами с историей вступления.
- `invites` управляет инвайтами foreman -> installer.

### 2.3 Производственный цикл
- `shifts` хранит жизненный цикл смен.
- `shift_photos` хранит почасовые фото-отчеты по смене и модерацию.
- `tasks` хранит задачи.
- `task_assignments` хранит назначения задач (история назначений).
- `task_comments` хранит комментарии к задачам.

### 2.4 Финансы
- `wallets` хранит баланс пользователя.
- `wallet_transactions` хранит движения средств.
- `payouts` хранит факты выплат.
- `payout_items` хранит детализацию выплат по источникам начисления.
- `acts` хранит финансово-операционные акты.

### 2.5 Поддержка и коммуникации
- `support_tickets` хранит тикеты поддержки.
- `support_messages` хранит сообщения внутри тикетов.
- `chat_threads`, `chat_participants`, `chat_messages` — оперативный чат.
- `notifications` — системные уведомления пользователям.

### 2.6 Файлы
- `file_storage` хранит метаданные файлов (фото, вложения чатов, документы).

## 3. Логическая схема таблиц

Нотация:
- PK: первичный ключ UUID.
- FK: внешний ключ.
- Все даты хранятся в `timestamptz`.
- Денежные поля: `numeric(14,2)`.

### 3.1 users
- `id` UUID PK
- `phone` varchar(32) unique not null
- `role` enum(`installer`,`foreman`,`curator`) not null
- `first_name` varchar(120) not null
- `last_name` varchar(120) not null
- `full_name` varchar(260) not null
- `foreman_id` UUID FK -> users.id null
- `hourly_rate` numeric(14,2) not null default 0
- `is_active` boolean not null default true
- `created_at` timestamptz not null
- `updated_at` timestamptz not null
- `deleted_at` timestamptz null

Ограничения:
- `phone` в E.164-формате.
- `foreman_id` допустим только для пользователей роли `installer`.
- self-reference (`foreman_id = id`) запрещен.

### 3.2 teams
- `id` UUID PK
- `name` varchar(180) not null
- `foreman_id` UUID FK -> users.id not null
- `created_at` timestamptz not null
- `updated_at` timestamptz not null
- `deleted_at` timestamptz null

Ограничения:
- `foreman_id` должен ссылаться на пользователя роли `foreman`.
- уникальность имени команды в пределах активного foreman.

### 3.3 team_members
- `id` UUID PK
- `team_id` UUID FK -> teams.id not null
- `user_id` UUID FK -> users.id not null
- `role` enum(`member`,`supervisor`) not null default `member`
- `joined_at` timestamptz not null
- `left_at` timestamptz null
- `created_at` timestamptz not null

Ограничения:
- один активный membership на пару (`team_id`,`user_id`) при `left_at is null`.
- пользователь может иметь только одну активную команду в момент времени.

### 3.4 shifts
- `id` UUID PK
- `user_id` UUID FK -> users.id not null
- `foreman_id` UUID FK -> users.id null
- `curator_id` UUID FK -> users.id null
- `status` enum(`active`,`paused`,`finished`,`cancelled`) not null
- `started_at` timestamptz not null
- `paused_at` timestamptz null
- `resumed_at` timestamptz null
- `finished_at` timestamptz null
- `planned_hours` numeric(8,2) not null default 0
- `actual_hours` numeric(8,2) not null default 0
- `payable_hours` numeric(8,2) not null default 0
- `location_lat` numeric(9,6) null
- `location_lng` numeric(9,6) null
- `created_at` timestamptz not null
- `updated_at` timestamptz not null
- `deleted_at` timestamptz null

Ограничения:
- только одна активная смена на `user_id`.
- `finished_at` обязателен при `status in ('finished','cancelled')`.
- геокоординаты валидируются диапазоном широты/долготы.

### 3.5 shift_photos
- `id` UUID PK
- `shift_id` UUID FK -> shifts.id not null
- `hour_index` int not null
- `photo_url` text not null
- `status` enum(`pending`,`approved`,`rejected`) not null default `pending`
- `uploaded_at` timestamptz not null
- `reviewed_by` UUID FK -> users.id null
- `reviewed_at` timestamptz null
- `review_comment` text null
- `created_at` timestamptz not null
- `updated_at` timestamptz not null

Ограничения:
- уникальность (`shift_id`,`hour_index`) для исключения дублей.
- `reviewed_by` обязателен, если `status in ('approved','rejected')`.
- `review_comment` обязателен при `status='rejected'`.

### 3.6 tasks
- `id` UUID PK
- `title` varchar(220) not null
- `description` text not null
- `created_by` UUID FK -> users.id not null
- `team_id` UUID FK -> teams.id null
- `priority` enum(`low`,`medium`,`high`,`critical`) not null
- `status` enum(`new`,`in_progress`,`done`,`cancelled`) not null default `new`
- `planned_start` timestamptz null
- `planned_end` timestamptz null
- `actual_start` timestamptz null
- `actual_end` timestamptz null
- `created_at` timestamptz not null
- `updated_at` timestamptz not null
- `deleted_at` timestamptz null

Ограничения:
- `planned_end >= planned_start`, `actual_end >= actual_start`.
- закрытая задача (`done`,`cancelled`) должна иметь `actual_end`.

### 3.7 task_assignments
- `id` UUID PK
- `task_id` UUID FK -> tasks.id not null
- `assigned_to` UUID FK -> users.id not null
- `assigned_by` UUID FK -> users.id not null
- `is_active` boolean not null default true
- `assigned_at` timestamptz not null
- `unassigned_at` timestamptz null
- `created_at` timestamptz not null

Ограничения:
- только одно активное назначение на задачу (`task_id`) при `is_active=true`.
- `unassigned_at` обязателен при деактивации назначения.

### 3.8 task_comments
- `id` UUID PK
- `task_id` UUID FK -> tasks.id not null
- `author_id` UUID FK -> users.id not null
- `message` text not null
- `created_at` timestamptz not null

### 3.9 wallets
- `id` UUID PK
- `user_id` UUID FK -> users.id not null unique
- `balance` numeric(14,2) not null default 0
- `currency` char(3) not null
- `updated_at` timestamptz not null
- `created_at` timestamptz not null

Ограничения:
- один кошелек на пользователя.
- валюта из ISO 4217.

### 3.10 wallet_transactions
- `id` UUID PK
- `wallet_id` UUID FK -> wallets.id not null
- `type` enum(`shift_payment`,`manual_adjustment`,`withdrawal`,`penalty`,`bonus`) not null
- `amount` numeric(14,2) not null
- `status` enum(`pending`,`completed`,`failed`) not null
- `reference_id` UUID null
- `description` text not null
- `created_at` timestamptz not null
- `processed_at` timestamptz null

Ограничения:
- `amount <> 0`.
- `processed_at` обязателен при `status in ('completed','failed')`.
- запись в статусе `completed` неизменяема.

### 3.11 payouts
- `id` UUID PK
- `user_id` UUID FK -> users.id not null
- `wallet_id` UUID FK -> wallets.id not null
- `amount` numeric(14,2) not null
- `status` enum(`pending`,`approved`,`paid`,`cancelled`) not null
- `approved_by` UUID FK -> users.id null
- `paid_at` timestamptz null
- `created_at` timestamptz not null
- `updated_at` timestamptz not null

### 3.12 payout_items
- `id` UUID PK
- `payout_id` UUID FK -> payouts.id not null
- `source_type` enum(`shift`,`bonus`,`penalty`,`adjustment`) not null
- `source_id` UUID null
- `amount` numeric(14,2) not null
- `description` text not null
- `created_at` timestamptz not null

### 3.13 acts
- `id` UUID PK
- `user_id` UUID FK -> users.id not null
- `period_start` date not null
- `period_end` date not null
- `amount_total` numeric(14,2) not null
- `status` enum(`draft`,`approved`,`signed`,`cancelled`) not null
- `file_id` UUID FK -> file_storage.id null
- `created_at` timestamptz not null
- `updated_at` timestamptz not null

Ограничения:
- период акта не пересекается в одном статусе `approved/signed` для одного пользователя.

### 3.14 support_tickets
- `id` UUID PK
- `user_id` UUID FK -> users.id not null
- `foreman_id` UUID FK -> users.id null
- `curator_id` UUID FK -> users.id null
- `category` enum(`app`,`payment`,`shift`,`other`) not null
- `status` enum(`open`,`in_progress`,`resolved`,`closed`) not null default `open`
- `title` varchar(220) not null
- `description` text not null
- `priority` enum(`low`,`medium`,`high`,`critical`) not null default `medium`
- `created_at` timestamptz not null
- `updated_at` timestamptz not null
- `closed_at` timestamptz null

### 3.15 support_messages
- `id` UUID PK
- `ticket_id` UUID FK -> support_tickets.id not null
- `sender_user_id` UUID FK -> users.id not null
- `sender_role` enum(`user`,`foreman`,`curator`,`system`) not null
- `message` text not null
- `is_internal` boolean not null default false
- `created_at` timestamptz not null

### 3.16 chat_threads
- `id` UUID PK
- `type` enum(`team`,`direct`,`support`,`broadcast`) not null
- `created_by` UUID FK -> users.id not null
- `created_at` timestamptz not null
- `updated_at` timestamptz not null

### 3.17 chat_participants
- `id` UUID PK
- `thread_id` UUID FK -> chat_threads.id not null
- `user_id` UUID FK -> users.id not null
- `joined_at` timestamptz not null
- `left_at` timestamptz null

Ограничения:
- уникальность активного участия (`thread_id`,`user_id`) при `left_at is null`.

### 3.18 chat_messages
- `id` UUID PK
- `thread_id` UUID FK -> chat_threads.id not null
- `sender_id` UUID FK -> users.id not null
- `message` text not null
- `attachments` jsonb not null default '[]'
- `created_at` timestamptz not null

### 3.19 notifications
- `id` UUID PK
- `user_id` UUID FK -> users.id not null
- `type` varchar(80) not null
- `title` varchar(180) not null
- `body` text not null
- `payload` jsonb not null default '{}'
- `is_read` boolean not null default false
- `created_at` timestamptz not null
- `read_at` timestamptz null

### 3.20 invites
- `id` UUID PK
- `code` varchar(64) unique not null
- `foreman_user_id` UUID FK -> users.id not null
- `installer_user_id` UUID FK -> users.id null
- `status` enum(`new`,`accepted`,`expired`,`cancelled`) not null default `new`
- `expires_at` timestamptz not null
- `created_at` timestamptz not null
- `used_at` timestamptz null

Ограничения:
- `used_at` обязателен при `status='accepted'`.
- принятие возможно только до `expires_at`.

### 3.21 file_storage
- `id` UUID PK
- `owner_id` UUID FK -> users.id not null
- `entity_type` varchar(64) not null
- `entity_id` UUID not null
- `file_url` text not null
- `mime_type` varchar(120) not null
- `size_bytes` bigint not null
- `checksum_sha256` char(64) not null
- `created_at` timestamptz not null

Ограничения:
- `size_bytes > 0`.
- checksum обязателен для дедупликации и верификации.

### 3.22 user_sessions
- `id` UUID PK
- `user_id` UUID FK -> users.id not null
- `refresh_token_hash` char(64) not null
- `device_info` text not null
- `ip_address` inet not null
- `expires_at` timestamptz not null
- `revoked_at` timestamptz null
- `created_at` timestamptz not null

### 3.23 audit_log
- `id` UUID PK
- `actor_user_id` UUID FK -> users.id null
- `action` varchar(120) not null
- `entity_type` varchar(64) not null
- `entity_id` UUID not null
- `old_data` jsonb not null default '{}'
- `new_data` jsonb not null default '{}'
- `ip_address` inet null
- `created_at` timestamptz not null

## 4. Ключевые связи
- `users (1) -> shifts (M)` по `shifts.user_id`
- `shifts (1) -> shift_photos (M)`
- `teams (M) <-> users (M)` через `team_members`
- `tasks (1) -> task_assignments (M)`
- `tasks (1) -> task_comments (M)`
- `wallets (1) -> wallet_transactions (M)`
- `payouts (1) -> payout_items (M)`
- `support_tickets (1) -> support_messages (M)`
- `chat_threads (1) -> chat_messages (M)`
- `chat_threads (1) -> chat_participants (M)`
- `users (1) -> notifications (M)`
- `users (1) -> user_sessions (M)`

## 5. Ограничения и инварианты
- Ролевые инварианты:
  - `curator` не может быть назначен в `team_members`.
  - `foreman_id` у installer обязан ссылаться на активного foreman.
- Инварианты смен:
  - у installer максимум одна смена `active`/`paused`.
  - `payable_hours <= actual_hours`.
- Инварианты денег:
  - финансовые суммы только в `numeric(14,2)`.
  - completed-транзакции не редактируются.
- Инварианты сообщений:
  - сообщения append-only.
  - удаление сообщений — только логическое с сохранением оригинала в аудите.

## 6. Стратегия индексов

Обязательные индексы:
- `users(phone)` unique
- `shifts(user_id, status, started_at desc)`
- `shift_photos(shift_id, hour_index)` unique
- `tasks(status, priority, planned_end)`
- `task_assignments(assigned_to, is_active)`
- `wallet_transactions(wallet_id, created_at desc)`
- `support_messages(ticket_id, created_at)`
- `chat_messages(thread_id, created_at)`
- `notifications(user_id, is_read, created_at desc)`
- `audit_log(entity_type, entity_id, created_at desc)`
- `user_sessions(user_id, expires_at)`

Дополнительные индексы высокой селективности:
- частичный индекс активных смен: `shifts(user_id) where status in ('active','paused')`
- частичный индекс pending фото: `shift_photos(status, uploaded_at) where status='pending'`
- частичный индекс открытых тикетов: `support_tickets(status, priority, updated_at) where status in ('open','in_progress')`

## 7. Масштабирование и эксплуатация данных
- Секционирование по времени для `shift_photos`, `chat_messages`, `support_messages`, `audit_log`, `wallet_transactions`.
- Read replicas для аналитики и тяжелых чтений админ-панели.
- Redis-кэш для агрегатов dashboard и непрочитанных счетчиков.
- Асинхронные воркеры для пересчета KPI, массовых нотификаций и генерации актов.
- Батч-обновления с ограничением размера транзакции для снижения блокировок.

## 8. Политика хранения и ретенции
- `audit_log`: минимум 24 месяца online, затем архив с возможностью forensic-доступа.
- `chat_messages` и `support_messages`: 18 месяцев online, затем холодный архив.
- `shift_photos`:
  - оригиналы: 12 месяцев в горячем/теплом контуре;
  - превью и метаданные: 24 месяца.
- `user_sessions`: хранение до истечения + 30 дней.
- `wallet_transactions`, `payouts`, `acts`: минимум 5 лет.
- Удаление персональных данных выполняется через controlled anonymization без потери финансового и аудиторского следа.

## 9. Миграционная стратегия (без реализации)
- Подход expand/contract:
  1. добавление новых таблиц/колонок без разрушения текущего контракта;
  2. backfill фоновыми джобами;
  3. переключение чтения/записи;
  4. удаление legacy-полей в следующем цикле релиза.
- Каждое изменение схемы сопровождается:
  - оценкой блокировок,
  - планом rollback,
  - проверкой совместимости API.
- Для высоконагруженных таблиц используется online DDL и поэтапное создание индексов.

## 10. Модель безопасности данных
- Принцип least privilege на уровне БД-ролей:
  - `app_rw` (только нужные DML),
  - `app_ro` (read-only),
  - `ops_admin` (ограниченно, только через break-glass процедуру).
- Row-level security для multi-tenant режима и изоляции данных по tenant.
- Шифрование in transit (TLS) и at rest.
- Хеширование refresh-токенов и хранение только hash.
- Полный аудит критических изменений:
  - роли,
  - статусы смен/фото,
  - финансовые операции,
  - доступы и блокировки пользователей.

## 11. Multi-tenant readiness
- Модель готовности: shared database, shared schema, tenant isolation by `tenant_id`.
- `tenant_id` добавляется в все бизнес-таблицы (кроме глобальных справочников).
- Все уникальные ограничения и индексы tenant-scoped:
  - пример: unique (`tenant_id`,`phone`) в users.
- RLS policy: каждый запрос ограничен `tenant_id` текущего контекста.
- Партиционирование и архивирование tenant-aware.
- Онбординг нового tenant не требует изменения схемы, только provisioning конфигурации и политик.

## 12. Карта соответствия доменам
- Users/Access: `users`, `user_sessions`, `audit_log`
- Teams/Invites: `teams`, `team_members`, `invites`
- Production: `shifts`, `shift_photos`, `tasks`, `task_assignments`, `task_comments`
- Finance: `wallets`, `wallet_transactions`, `payouts`, `payout_items`, `acts`
- Support/Chat: `support_tickets`, `support_messages`, `chat_threads`, `chat_participants`, `chat_messages`
- Notifications/Files: `notifications`, `file_storage`
