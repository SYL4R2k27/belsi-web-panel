# Frontend — BELSI.Work Web Admin

## Обзор

Single Page Application (SPA) для роли `curator`. React + TypeScript + Vite. Дизайн-система: shadcn/ui + Tailwind CSS.

Это не публичный сайт. Это внутренний enterprise dashboard для операционного управления.

## Структура проекта

```
frontend/
├── src/
│   ├── app/                        # Entry point, providers, router
│   │   ├── App.tsx                 # Root component
│   │   ├── main.tsx                # Vite entry point
│   │   ├── router.tsx              # All route definitions
│   │   └── providers/              # Context providers (обёртки)
│   │       ├── AuthProvider.tsx
│   │       ├── QueryProvider.tsx
│   │       ├── ThemeProvider.tsx
│   │       └── ToastProvider.tsx
│   │
│   ├── shared/                     # Cross-cutting concerns
│   │   ├── api/
│   │   │   ├── client.ts           # Axios instance + JWT interceptors
│   │   │   ├── endpoints/          # API functions по доменам
│   │   │   │   ├── auth.ts
│   │   │   │   ├── users.ts
│   │   │   │   ├── teams.ts
│   │   │   │   ├── shifts.ts
│   │   │   │   ├── photos.ts
│   │   │   │   ├── tasks.ts
│   │   │   │   ├── chat.ts
│   │   │   │   ├── finance.ts
│   │   │   │   ├── dashboard.ts
│   │   │   │   ├── logs.ts
│   │   │   │   └── settings.ts
│   │   │   └── mock/               # MSW handlers (dev only)
│   │   │       ├── browser.ts
│   │   │       └── handlers/
│   │   │
│   │   ├── types/                  # TypeScript types matching DB schema
│   │   │   ├── user.ts
│   │   │   ├── shift.ts
│   │   │   ├── photo.ts
│   │   │   ├── task.ts
│   │   │   ├── team.ts
│   │   │   ├── chat.ts
│   │   │   ├── finance.ts
│   │   │   ├── tools.ts
│   │   │   ├── audit.ts
│   │   │   ├── settings.ts
│   │   │   ├── enums.ts            # All status/role enums
│   │   │   └── api.ts              # ApiResponse<T>, PaginatedResponse<T>
│   │   │
│   │   ├── hooks/                  # Shared React hooks
│   │   │   ├── useAuth.ts
│   │   │   ├── useDebounce.ts
│   │   │   └── useMediaQuery.ts
│   │   │
│   │   ├── lib/                    # Utility functions
│   │   │   ├── utils.ts            # cn() helper, formatters
│   │   │   ├── date.ts             # Date formatting helpers
│   │   │   └── currency.ts         # Money formatting
│   │   │
│   │   ├── ui/                     # shadcn/ui generated components
│   │   │   ├── button.tsx
│   │   │   ├── input.tsx
│   │   │   ├── table.tsx
│   │   │   └── ...
│   │   │
│   │   └── components/             # Shared composed components
│   │       ├── DataTable.tsx
│   │       ├── DataTableToolbar.tsx
│   │       ├── StatusBadge.tsx
│   │       ├── ConfirmDialog.tsx
│   │       ├── PageHeader.tsx
│   │       ├── StatCard.tsx
│   │       ├── DateRangeFilter.tsx
│   │       ├── UserAvatar.tsx
│   │       └── EmptyState.tsx
│   │
│   ├── features/                   # Feature modules (1 per dashboard module)
│   │   ├── auth/
│   │   │   ├── pages/
│   │   │   │   └── LoginPage.tsx
│   │   │   ├── components/
│   │   │   │   └── LoginForm.tsx
│   │   │   └── hooks/
│   │   │       └── useLogin.ts
│   │   │
│   │   ├── dashboard/
│   │   │   ├── pages/
│   │   │   │   └── DashboardPage.tsx
│   │   │   └── components/
│   │   │       ├── KpiCards.tsx
│   │   │       ├── TrendChart.tsx
│   │   │       └── ActivityFeed.tsx
│   │   │
│   │   ├── users/                  # Installers management
│   │   │   ├── pages/
│   │   │   │   ├── UsersListPage.tsx
│   │   │   │   └── UserDetailPage.tsx
│   │   │   └── components/
│   │   │       ├── UsersTable.tsx
│   │   │       └── UserProfile.tsx
│   │   │
│   │   ├── teams/                  # Foremen / Teams management
│   │   │   ├── pages/
│   │   │   │   ├── TeamsListPage.tsx
│   │   │   │   └── TeamDetailPage.tsx
│   │   │   └── components/
│   │   │
│   │   ├── shifts/
│   │   │   ├── pages/
│   │   │   │   ├── ShiftsListPage.tsx
│   │   │   │   └── ShiftDetailPage.tsx
│   │   │   └── components/
│   │   │       └── ShiftTimeline.tsx
│   │   │
│   │   ├── photos/
│   │   │   ├── pages/
│   │   │   │   └── PhotoModerationPage.tsx
│   │   │   └── components/
│   │   │       ├── PhotoQueue.tsx
│   │   │       ├── PhotoCard.tsx
│   │   │       └── ModerationActions.tsx
│   │   │
│   │   ├── tasks/
│   │   │   ├── pages/
│   │   │   │   ├── TasksListPage.tsx
│   │   │   │   └── TaskDetailPage.tsx
│   │   │   └── components/
│   │   │       └── TaskForm.tsx
│   │   │
│   │   ├── support/
│   │   │   ├── pages/
│   │   │   │   └── SupportCenterPage.tsx
│   │   │   └── components/
│   │   │       ├── ConversationList.tsx
│   │   │       ├── MessageThread.tsx
│   │   │       └── ReplyComposer.tsx
│   │   │
│   │   ├── tools/                  # Tools & Equipment
│   │   │   ├── pages/
│   │   │   │   └── ToolsPage.tsx
│   │   │   └── components/
│   │   │       └── ToolsTable.tsx
│   │   │
│   │   ├── finance/
│   │   │   ├── pages/
│   │   │   │   ├── FinancePage.tsx
│   │   │   │   └── PaymentDetailPage.tsx
│   │   │   └── components/
│   │   │
│   │   ├── reports/                # Reports & Analytics
│   │   │   ├── pages/
│   │   │   │   └── ReportsPage.tsx
│   │   │   └── components/
│   │   │
│   │   ├── logs/
│   │   │   ├── pages/
│   │   │   │   ├── SystemLogsPage.tsx
│   │   │   │   └── AuditLogsPage.tsx
│   │   │   └── components/
│   │   │
│   │   └── settings/
│   │       ├── pages/
│   │       │   └── SettingsPage.tsx
│   │       └── components/
│   │
│   └── layouts/
│       ├── DashboardLayout.tsx     # Sidebar + Header + Content
│       ├── AuthLayout.tsx          # Centered card for login
│       └── components/
│           ├── Sidebar.tsx
│           ├── Header.tsx
│           ├── NotificationBell.tsx
│           └── UserMenu.tsx
│
├── public/
├── index.html
├── package.json
├── tsconfig.json
├── vite.config.ts
├── tailwind.config.ts             # Если нужен для v4
├── .env
├── .env.example
└── Dockerfile
```

## State Management

### Серверный стейт: @tanstack/react-query
- Все данные с API хранятся в React Query cache
- Автоматическая инвалидация при мутациях
- Polling для real-time обновлений (`refetchInterval`)
- Optimistic updates для модерации фото

### Клиентский стейт
- React Context для auth state (user, tokens)
- React Context для theme (dark/light)
- URL search params для фильтров и пагинации таблиц
- Локальное состояние компонентов через useState

### Что НЕ используется
- Redux, Zustand, MobX — избыточны, React Query + Context покрывает все потребности
- localStorage для стейта — только для theme preference и refresh token

## Routing

### Структура роутов

```
/login                          → AuthLayout > LoginPage
/                               → DashboardLayout > DashboardPage
/installers                     → DashboardLayout > UsersListPage (filter: installer)
/installers/:id                 → DashboardLayout > UserDetailPage
/foremen                        → DashboardLayout > UsersListPage (filter: foreman)
/foremen/:id                    → DashboardLayout > UserDetailPage
/shifts                         → DashboardLayout > ShiftsListPage
/shifts/:id                     → DashboardLayout > ShiftDetailPage
/photos                         → DashboardLayout > PhotoModerationPage
/tasks                          → DashboardLayout > TasksListPage
/tasks/:id                      → DashboardLayout > TaskDetailPage
/support                        → DashboardLayout > SupportCenterPage
/tools                          → DashboardLayout > ToolsPage
/finance                        → DashboardLayout > FinancePage
/finance/payments/:id           → DashboardLayout > PaymentDetailPage
/reports                        → DashboardLayout > ReportsPage
/logs                           → DashboardLayout > SystemLogsPage
/logs/audit                     → DashboardLayout > AuditLogsPage
/settings                       → DashboardLayout > SettingsPage
```

### Защита роутов
- `RequireAuth` wrapper: проверяет наличие валидного токена
- При отсутствии — редирект на `/login`
- При наличии невалидного — attempt refresh, при неудаче — logout + redirect

## Layout

### DashboardLayout
```
┌──────────┬──────────────────────────────────────┐
│          │        Header (64px)                  │
│ Sidebar  ├──────────────────────────────────────┤
│ (240px)  │                                      │
│          │        Main Content Area             │
│ fixed    │        (scrollable)                  │
│          │                                      │
│          │                                      │
└──────────┴──────────────────────────────────────┘
```

- Sidebar: фиксированный, навигация по модулям, collapsible на планшетах
- Header: логотип, breadcrumbs, уведомления, user menu
- Content: scrollable, padding по гайдлайнам

## API Integration

### API Client (`shared/api/client.ts`)
- Axios instance с `baseURL` из env
- Request interceptor: добавляет `Authorization: Bearer <token>`
- Response interceptor: при 401 — attempt refresh token, при неудаче — logout
- Стандартный envelope parsing: `response.data.data`

### Mock API (development)
- MSW (Mock Service Worker) перехватывает fetch/XHR на сетевом уровне
- Хэндлеры по доменам в `shared/api/mock/handlers/`
- Включается только в dev-режиме через `VITE_ENABLE_MOCKS=true`
- Моковые данные реалистичны и соответствуют DB schema

## UI System

- shadcn/ui для всех базовых компонентов (Button, Input, Select, Dialog, Table, Badge, Card и т.д.)
- Запрещено создавать кастомные примитивы — только compose из shadcn/ui
- Shared components (DataTable, StatusBadge, StatCard) строятся поверх shadcn/ui
- Tailwind CSS для стилизации
- CSS variables для темизации (dark/light)
