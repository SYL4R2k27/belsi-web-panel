# Database — BELSI.Work

## СУБД

PostgreSQL 15+ — primary и единственная база данных. Все операционные данные хранятся здесь.

## Нотация

- PK: UUID v4, генерируемый на уровне приложения
- FK: внешние ключи с `ON DELETE RESTRICT`
- Timestamps: `timestamptz` (UTC)
- Money: `numeric(14,2)` — ни в коем случае не float
- Soft delete: `deleted_at timestamptz null` где применимо

## Схема таблиц (23 таблицы)

### Домен: Identity & Access

#### users
| Колонка | Тип | Constraints |
|---------|-----|-------------|
| id | UUID PK | |
| phone | varchar(32) | UNIQUE NOT NULL, E.164 формат |
| role | enum(installer, foreman, curator) | NOT NULL |
| first_name | varchar(120) | NOT NULL |
| last_name | varchar(120) | NOT NULL |
| full_name | varchar(260) | NOT NULL |
| foreman_id | UUID FK → users.id | NULL, только для installer |
| hourly_rate | numeric(14,2) | NOT NULL DEFAULT 0 |
| is_active | boolean | NOT NULL DEFAULT true |
| created_at | timestamptz | NOT NULL |
| updated_at | timestamptz | NOT NULL |
| deleted_at | timestamptz | NULL |

Инварианты:
- `foreman_id` допустим только для роли `installer`
- Self-reference (`foreman_id = id`) запрещён
- `foreman_id` должен ссылаться на активного foreman

#### user_sessions
| Колонка | Тип | Constraints |
|---------|-----|-------------|
| id | UUID PK | |
| user_id | UUID FK → users.id | NOT NULL |
| refresh_token_hash | char(64) | NOT NULL |
| device_info | text | NOT NULL |
| ip_address | inet | NOT NULL |
| expires_at | timestamptz | NOT NULL |
| revoked_at | timestamptz | NULL |
| created_at | timestamptz | NOT NULL |

#### audit_log
| Колонка | Тип | Constraints |
|---------|-----|-------------|
| id | UUID PK | |
| actor_user_id | UUID FK → users.id | NULL |
| action | varchar(120) | NOT NULL |
| entity_type | varchar(64) | NOT NULL |
| entity_id | UUID | NOT NULL |
| old_data | jsonb | NOT NULL DEFAULT '{}' |
| new_data | jsonb | NOT NULL DEFAULT '{}' |
| ip_address | inet | NULL |
| created_at | timestamptz | NOT NULL |

Инвариант: append-only, записи не обновляются и не удаляются.

### Домен: Teams & Invites

#### teams
| Колонка | Тип | Constraints |
|---------|-----|-------------|
| id | UUID PK | |
| name | varchar(180) | NOT NULL |
| foreman_id | UUID FK → users.id | NOT NULL, только foreman |
| created_at | timestamptz | NOT NULL |
| updated_at | timestamptz | NOT NULL |
| deleted_at | timestamptz | NULL |

#### team_members
| Колонка | Тип | Constraints |
|---------|-----|-------------|
| id | UUID PK | |
| team_id | UUID FK → teams.id | NOT NULL |
| user_id | UUID FK → users.id | NOT NULL |
| role | enum(member, supervisor) | NOT NULL DEFAULT member |
| joined_at | timestamptz | NOT NULL |
| left_at | timestamptz | NULL |
| created_at | timestamptz | NOT NULL |

Инвариант: один активный membership на пару (team_id, user_id) при left_at IS NULL.

#### invites
| Колонка | Тип | Constraints |
|---------|-----|-------------|
| id | UUID PK | |
| code | varchar(64) | UNIQUE NOT NULL |
| foreman_user_id | UUID FK → users.id | NOT NULL |
| installer_user_id | UUID FK → users.id | NULL |
| status | enum(new, accepted, expired, cancelled) | NOT NULL DEFAULT new |
| expires_at | timestamptz | NOT NULL |
| created_at | timestamptz | NOT NULL |
| used_at | timestamptz | NULL |

### Домен: Production

#### shifts
| Колонка | Тип | Constraints |
|---------|-----|-------------|
| id | UUID PK | |
| user_id | UUID FK → users.id | NOT NULL |
| foreman_id | UUID FK → users.id | NULL |
| curator_id | UUID FK → users.id | NULL |
| status | enum(active, paused, finished, cancelled) | NOT NULL |
| started_at | timestamptz | NOT NULL |
| paused_at | timestamptz | NULL |
| resumed_at | timestamptz | NULL |
| finished_at | timestamptz | NULL |
| planned_hours | numeric(8,2) | NOT NULL DEFAULT 0 |
| actual_hours | numeric(8,2) | NOT NULL DEFAULT 0 |
| payable_hours | numeric(8,2) | NOT NULL DEFAULT 0 |
| location_lat | numeric(9,6) | NULL |
| location_lng | numeric(9,6) | NULL |
| created_at | timestamptz | NOT NULL |
| updated_at | timestamptz | NOT NULL |
| deleted_at | timestamptz | NULL |

Инварианты:
- Максимум одна смена active/paused на user_id
- `payable_hours <= actual_hours`
- `finished_at` обязателен при finished/cancelled

#### shift_photos
| Колонка | Тип | Constraints |
|---------|-----|-------------|
| id | UUID PK | |
| shift_id | UUID FK → shifts.id | NOT NULL |
| hour_index | int | NOT NULL |
| photo_url | text | NOT NULL |
| status | enum(pending, approved, rejected) | NOT NULL DEFAULT pending |
| uploaded_at | timestamptz | NOT NULL |
| reviewed_by | UUID FK → users.id | NULL |
| reviewed_at | timestamptz | NULL |
| review_comment | text | NULL |
| created_at | timestamptz | NOT NULL |
| updated_at | timestamptz | NOT NULL |

Инварианты:
- UNIQUE (shift_id, hour_index)
- `reviewed_by` обязателен при approved/rejected
- `review_comment` обязателен при rejected

#### tasks
| Колонка | Тип | Constraints |
|---------|-----|-------------|
| id | UUID PK | |
| title | varchar(220) | NOT NULL |
| description | text | NOT NULL |
| created_by | UUID FK → users.id | NOT NULL |
| team_id | UUID FK → teams.id | NULL |
| priority | enum(low, medium, high, critical) | NOT NULL |
| status | enum(new, in_progress, done, cancelled) | NOT NULL DEFAULT new |
| planned_start | timestamptz | NULL |
| planned_end | timestamptz | NULL |
| actual_start | timestamptz | NULL |
| actual_end | timestamptz | NULL |
| created_at | timestamptz | NOT NULL |
| updated_at | timestamptz | NOT NULL |
| deleted_at | timestamptz | NULL |

#### task_assignments
| Колонка | Тип | Constraints |
|---------|-----|-------------|
| id | UUID PK | |
| task_id | UUID FK → tasks.id | NOT NULL |
| assigned_to | UUID FK → users.id | NOT NULL |
| assigned_by | UUID FK → users.id | NOT NULL |
| is_active | boolean | NOT NULL DEFAULT true |
| assigned_at | timestamptz | NOT NULL |
| unassigned_at | timestamptz | NULL |
| created_at | timestamptz | NOT NULL |

Инвариант: одно активное назначение на task_id при is_active=true.

#### task_comments
| Колонка | Тип | Constraints |
|---------|-----|-------------|
| id | UUID PK | |
| task_id | UUID FK → tasks.id | NOT NULL |
| author_id | UUID FK → users.id | NOT NULL |
| message | text | NOT NULL |
| created_at | timestamptz | NOT NULL |

### Домен: Finance

#### wallets
| Колонка | Тип | Constraints |
|---------|-----|-------------|
| id | UUID PK | |
| user_id | UUID FK → users.id | UNIQUE NOT NULL |
| balance | numeric(14,2) | NOT NULL DEFAULT 0 |
| currency | char(3) | NOT NULL, ISO 4217 |
| updated_at | timestamptz | NOT NULL |
| created_at | timestamptz | NOT NULL |

#### wallet_transactions
| Колонка | Тип | Constraints |
|---------|-----|-------------|
| id | UUID PK | |
| wallet_id | UUID FK → wallets.id | NOT NULL |
| type | enum(shift_payment, manual_adjustment, withdrawal, penalty, bonus) | NOT NULL |
| amount | numeric(14,2) | NOT NULL, != 0 |
| status | enum(pending, completed, failed) | NOT NULL |
| reference_id | UUID | NULL |
| description | text | NOT NULL |
| created_at | timestamptz | NOT NULL |
| processed_at | timestamptz | NULL |

Инвариант: completed записи immutable.

#### payouts
| Колонка | Тип | Constraints |
|---------|-----|-------------|
| id | UUID PK | |
| user_id | UUID FK → users.id | NOT NULL |
| wallet_id | UUID FK → wallets.id | NOT NULL |
| amount | numeric(14,2) | NOT NULL |
| status | enum(pending, approved, paid, cancelled) | NOT NULL |
| approved_by | UUID FK → users.id | NULL |
| paid_at | timestamptz | NULL |
| created_at | timestamptz | NOT NULL |
| updated_at | timestamptz | NOT NULL |

#### payout_items
| Колонка | Тип | Constraints |
|---------|-----|-------------|
| id | UUID PK | |
| payout_id | UUID FK → payouts.id | NOT NULL |
| source_type | enum(shift, bonus, penalty, adjustment) | NOT NULL |
| source_id | UUID | NULL |
| amount | numeric(14,2) | NOT NULL |
| description | text | NOT NULL |
| created_at | timestamptz | NOT NULL |

#### acts
| Колонка | Тип | Constraints |
|---------|-----|-------------|
| id | UUID PK | |
| user_id | UUID FK → users.id | NOT NULL |
| period_start | date | NOT NULL |
| period_end | date | NOT NULL |
| amount_total | numeric(14,2) | NOT NULL |
| status | enum(draft, approved, signed, cancelled) | NOT NULL |
| file_id | UUID FK → file_storage.id | NULL |
| created_at | timestamptz | NOT NULL |
| updated_at | timestamptz | NOT NULL |

### Домен: Support & Chat

#### support_tickets
| Колонка | Тип | Constraints |
|---------|-----|-------------|
| id | UUID PK | |
| user_id | UUID FK → users.id | NOT NULL |
| foreman_id | UUID FK → users.id | NULL |
| curator_id | UUID FK → users.id | NULL |
| category | enum(app, payment, shift, other) | NOT NULL |
| status | enum(open, in_progress, resolved, closed) | NOT NULL DEFAULT open |
| title | varchar(220) | NOT NULL |
| description | text | NOT NULL |
| priority | enum(low, medium, high, critical) | NOT NULL DEFAULT medium |
| created_at | timestamptz | NOT NULL |
| updated_at | timestamptz | NOT NULL |
| closed_at | timestamptz | NULL |

#### support_messages
| Колонка | Тип | Constraints |
|---------|-----|-------------|
| id | UUID PK | |
| ticket_id | UUID FK → support_tickets.id | NOT NULL |
| sender_user_id | UUID FK → users.id | NOT NULL |
| sender_role | enum(user, foreman, curator, system) | NOT NULL |
| message | text | NOT NULL |
| is_internal | boolean | NOT NULL DEFAULT false |
| created_at | timestamptz | NOT NULL |

#### chat_threads
| Колонка | Тип | Constraints |
|---------|-----|-------------|
| id | UUID PK | |
| type | enum(team, direct, support, broadcast) | NOT NULL |
| created_by | UUID FK → users.id | NOT NULL |
| created_at | timestamptz | NOT NULL |
| updated_at | timestamptz | NOT NULL |

#### chat_participants
| Колонка | Тип | Constraints |
|---------|-----|-------------|
| id | UUID PK | |
| thread_id | UUID FK → chat_threads.id | NOT NULL |
| user_id | UUID FK → users.id | NOT NULL |
| joined_at | timestamptz | NOT NULL |
| left_at | timestamptz | NULL |

#### chat_messages
| Колонка | Тип | Constraints |
|---------|-----|-------------|
| id | UUID PK | |
| thread_id | UUID FK → chat_threads.id | NOT NULL |
| sender_id | UUID FK → users.id | NOT NULL |
| message | text | NOT NULL |
| attachments | jsonb | NOT NULL DEFAULT '[]' |
| created_at | timestamptz | NOT NULL |

### Домен: Notifications & Files

#### notifications
| Колонка | Тип | Constraints |
|---------|-----|-------------|
| id | UUID PK | |
| user_id | UUID FK → users.id | NOT NULL |
| type | varchar(80) | NOT NULL |
| title | varchar(180) | NOT NULL |
| body | text | NOT NULL |
| payload | jsonb | NOT NULL DEFAULT '{}' |
| is_read | boolean | NOT NULL DEFAULT false |
| created_at | timestamptz | NOT NULL |
| read_at | timestamptz | NULL |

#### file_storage
| Колонка | Тип | Constraints |
|---------|-----|-------------|
| id | UUID PK | |
| owner_id | UUID FK → users.id | NOT NULL |
| entity_type | varchar(64) | NOT NULL |
| entity_id | UUID | NOT NULL |
| file_url | text | NOT NULL |
| mime_type | varchar(120) | NOT NULL |
| size_bytes | bigint | NOT NULL, > 0 |
| checksum_sha256 | char(64) | NOT NULL |
| created_at | timestamptz | NOT NULL |

## Индексы

### Обязательные
- `users(phone)` UNIQUE
- `shifts(user_id, status, started_at DESC)`
- `shift_photos(shift_id, hour_index)` UNIQUE
- `tasks(status, priority, planned_end)`
- `task_assignments(assigned_to, is_active)`
- `wallet_transactions(wallet_id, created_at DESC)`
- `support_messages(ticket_id, created_at)`
- `chat_messages(thread_id, created_at)`
- `notifications(user_id, is_read, created_at DESC)`
- `audit_log(entity_type, entity_id, created_at DESC)`
- `user_sessions(user_id, expires_at)`

### Частичные (высокая селективность)
- `shifts(user_id) WHERE status IN ('active','paused')` — быстрый поиск активных смен
- `shift_photos(status, uploaded_at) WHERE status='pending'` — очередь модерации
- `support_tickets(status, priority, updated_at) WHERE status IN ('open','in_progress')` — открытые тикеты

## Связи (ER)

```
users (1) → shifts (M)
shifts (1) → shift_photos (M)
teams (M) ↔ users (M) через team_members
tasks (1) → task_assignments (M)
tasks (1) → task_comments (M)
wallets (1) → wallet_transactions (M)
payouts (1) → payout_items (M)
support_tickets (1) → support_messages (M)
chat_threads (1) → chat_messages (M)
chat_threads (1) → chat_participants (M)
users (1) → notifications (M)
users (1) → user_sessions (M)
```

## Миграции

Подход: expand/contract
1. Добавление новых таблиц/колонок без разрушения контракта
2. Backfill фоновыми джобами
3. Переключение чтения/записи
4. Удаление legacy-полей в следующем цикле

Каждая миграция: purpose, forward plan, rollback plan, compatibility impact.

## Партиционирование

По времени для высокорастущих таблиц:
- `shift_photos`
- `chat_messages`
- `support_messages`
- `audit_log`
- `wallet_transactions`

## Ретенция

| Данные | Online | Архив |
|--------|--------|-------|
| audit_log | 24 месяца | forensic-доступ |
| chat_messages, support_messages | 18 месяцев | холодный архив |
| shift_photos (оригиналы) | 12 месяцев | - |
| shift_photos (метаданные) | 24 месяца | - |
| user_sessions | до expiration + 30 дней | - |
| wallet_transactions, payouts, acts | 5 лет | требование compliance |

## Безопасность данных

- DB-роли: `app_rw` (DML), `app_ro` (read-only), `ops_admin` (break-glass)
- Row-level security для multi-tenant изоляции
- TLS in transit, AES-256 at rest
- Refresh-токены хранятся только как SHA256 hash
- Полный аудит критических изменений
