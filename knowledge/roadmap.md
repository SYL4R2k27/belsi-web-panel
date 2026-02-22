# Roadmap — BELSI.Work

## Обзор фаз

```
Phase 0: Discovery & Baseline     ← ЗАВЕРШЕНА (документация)
Phase 1: Backend Foundation        ← ТЕКУЩАЯ ЦЕЛЬ
Phase 2: Core Operations API
Phase 3: Web Admin MVP
Phase 4: Hardening & Scale
Phase 5: Advanced Features
```

## Phase 0: Discovery & Baseline

**Статус:** Завершена

**Цели:**
- Подтверждение требований от мобильного приложения
- Финализация доменного глоссария и event definitions
- Фиксация архитектурного baseline

**Deliverables:**
- Knowledge base (19 файлов документации)
- Схема базы данных (23 таблицы)
- API контракт (45+ endpoints)
- Архитектурные решения зафиксированы

## Phase 1: Backend Foundation

**Статус:** Планируется

**Цели:**
- Инициализация FastAPI проекта
- JWT аутентификация + RBAC
- Базовые CRUD endpoints для users
- PostgreSQL schema + Alembic migrations
- Docker-based dev environment
- CI pipeline (lint + test + build)

**Deliverables:**
- Запускаемый API skeleton
- Работающая аутентификация (login, refresh, logout, me)
- Users CRUD с фильтрацией и пагинацией
- Database migrations applied
- Docker Compose для локальной разработки

**Exit Criteria (M1):**
- Auth + schema + RBAC complete
- `POST /auth/login` → JWT tokens
- `GET /users` с пагинацией и фильтрами
- Все тесты проходят
- Docker Compose поднимается одной командой

## Phase 2: Core Operations API

**Статус:** Планируется

**Цели:**
- Shifts lifecycle endpoints (start/pause/resume/finish + admin views)
- Photo upload metadata + moderation endpoints
- Tasks module (CRUD + assign + status transitions)
- Chat/support persistence and APIs
- Teams and invites management
- Finance/payment read endpoints

**Deliverables:**
- Полный операционный API для web admin MVP
- Event-driven audit logging для всех curator actions
- Background workers для уведомлений и агрегатов

**Exit Criteria (M2):**
- Все shift/photo/task/chat APIs стабильны
- Модерация фото работает (approve/reject + audit)
- Задачи: create/assign/status transitions
- Все integration tests проходят

## Phase 3: Web Admin MVP

**Статус:** Планируется

**Цели:**
- Frontend scaffolding (Vite + React + TypeScript + shadcn/ui)
- Аутентификация (login page, JWT handling)
- Layout shell (sidebar, header, routing)
- Dashboard overview (KPI cards, charts)
- Photo moderation queue
- Shifts management
- Users management
- Teams management
- Tasks management
- Support chat
- Finance views
- System logs / audit
- Settings

**Deliverables:**
- Deployable web admin для curator операций
- Все 12 модулей dashboard функциональны
- Real-time обновления через polling

**Exit Criteria (M3):**
- Куратор может выполнять все операционные задачи через web panel
- Модерация фото: approve/reject с комментариями
- Просмотр смен с таймлайном
- Создание и назначение задач
- Чат с монтажниками
- Просмотр финансовых данных
- Аудит-лог доступен

## Phase 4: Hardening & Scale

**Статус:** Планируется

**Цели:**
- Performance optimization (индексы, кэширование, query optimization)
- Load testing и bottleneck elimination
- WebSocket для real-time (chat, notifications)
- Advanced analytics и отчёты
- Экспорт в Excel/PDF
- Security hardening (MFA, rate limiting fine-tuning)
- Audit completeness validation
- Dark/light theme
- Responsive improvements (tablet)

**Deliverables:**
- Production-ready v1 с operational playbooks
- Monitoring dashboards
- Backup и DR validated

**Exit Criteria (M4):**
- P95 latency < 300ms (reads), < 600ms (writes)
- 99.9% availability за неделю тестирования
- MFA для curator login
- Все monitoring alerts настроены
- Backup/restore протестирован

## Phase 5: Advanced Features

**Статус:** Будущее

**Возможные направления:**
- Foreman web access (read-only dashboard)
- Automated photo pre-check (ML-based quality assessment)
- Mobile push notifications
- Advanced reporting engine
- Integration с external payment systems
- Multi-tenant support activation
- API для third-party integrations
- Offline mobile support improvements

## Dependencies

| Зависимость | Влияет на | Статус |
|------------|----------|--------|
| Payment calculation formula | Phase 2 (finance) | TODO |
| Storage provider selection | Phase 1 (file upload) | TODO |
| Realtime strategy (WebSocket vs polling) | Phase 3-4 (chat) | Polling for MVP, WebSocket for Phase 4 |
| UX sign-off for admin workflows | Phase 3 (UI) | TODO |
| Hosting platform selection | Phase 1 (deployment) | TODO |
| CI/CD platform | Phase 1 | TODO |
| SMS/OTP provider | Phase 1 (mobile auth) | TODO |

## Приоритеты

### Must Have (Phase 1-3)
- Аутентификация и RBAC
- Модерация фото
- Управление сменами
- Задачи
- Чат поддержки
- Финансовые данные (read)
- Аудит-лог

### Should Have (Phase 4)
- WebSocket для real-time
- MFA для curator
- Экспорт отчётов
- Dark theme
- Performance optimization

### Nice to Have (Phase 5)
- ML photo assessment
- Foreman web access
- Third-party API
- Advanced analytics
