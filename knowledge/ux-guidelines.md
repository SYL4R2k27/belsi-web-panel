# UX Guidelines — BELSI.Work Web Admin

## Философия дизайна

Enterprise dashboard для профессионального использования. Куратор работает с системой ежедневно, часами. Интерфейс оптимизирован для:
- Высокой плотности данных
- Быстрого сканирования таблиц
- Минимального количества кликов для основных операций
- Профессиональный, чистый вид без декоративных элементов

## Layout

### Общая структура
```
┌──────────┬──────────────────────────────────────┐
│          │        Header (64px)                  │
│ Sidebar  ├──────────────────────────────────────┤
│ (240px)  │                                      │
│ fixed    │        Main Content                  │
│          │        (scrollable, padded)           │
│          │                                      │
└──────────┴──────────────────────────────────────┘
```

### Sidebar
- Фиксированный, 240px ширина
- Навигация по модулям с иконками
- Active route highlighting
- Collapsible на планшетах (< 1024px)
- Badges для pending counts (фото, тикеты)

### Header
- Высота 64px
- Левая часть: логотип / название системы
- Правая часть: уведомления (bell icon + badge), user avatar + dropdown menu

### Content Area
- Scrollable
- Padding: 24px (desktop), 16px (tablet)
- Max-width: none (full width utilization)

## Компонентная система

### Правило №1: Только shadcn/ui

Запрещено создавать кастомные UI-примитивы. Используются ТОЛЬКО shadcn/ui компоненты:

| Компонент | Использование |
|-----------|-------------|
| Button | Действия, submit |
| Input | Текстовый ввод |
| Select | Выбор из списка |
| Dialog | Модальные окна |
| AlertDialog | Подтверждение деструктивных действий |
| Tabs | Переключение видов на странице |
| Table | Данные в таблицах |
| Badge | Статусы, метки |
| Card | Контейнер для KPI, профилей |
| Skeleton | Loading states |
| DropdownMenu | Контекстные меню |
| Avatar | Аватары пользователей |
| Sheet | Боковые панели |
| ScrollArea | Scrollable containers |
| Tooltip | Подсказки |
| Alert | Уведомления inline |
| Calendar | Выбор дат |
| Popover | Всплывающие панели |
| Textarea | Многострочный ввод |
| Separator | Разделители |

### Composed Components (shared)

Строятся поверх shadcn/ui:

| Компонент | Из чего состоит | Назначение |
|-----------|----------------|-----------|
| DataTable | Table + кастомная логика | Главная таблица данных |
| DataTableToolbar | Input + Select + Badge | Фильтры для таблиц |
| StatusBadge | Badge + цветовая карта | Отображение статусов |
| ConfirmDialog | AlertDialog + Button | Подтверждение действий |
| PageHeader | Text + Button | Заголовок страницы |
| StatCard | Card + Text + Icon | KPI-виджет |
| DateRangeFilter | Calendar + Popover | Выбор диапазона дат |
| UserAvatar | Avatar + Text + Badge | Аватар пользователя |
| EmptyState | Card + Text + Button | Пустое состояние |

## Цвета

### Палитра

| Назначение | Цвет |
|-----------|------|
| Background | Neutral light scale (gray-50) |
| Surface | White / near-white cards |
| Text primary | High-contrast neutral dark |
| Text secondary | Neutral-500 |
| Primary action | Blue family |
| Success / Active / Approved | Green |
| Warning / Pending / Paused | Amber |
| Danger / Rejected / Blocked | Red |
| Info / In Progress | Blue |
| Neutral / Cancelled | Gray |

### StatusBadge Color Map

| Статус | Цвет | Контекст |
|--------|------|---------|
| active | green | shifts |
| paused | amber | shifts |
| finished | gray | shifts |
| cancelled | gray | shifts, tasks |
| pending | amber | photos, payments |
| approved | green | photos, payments |
| rejected | red | photos |
| new | blue | tasks |
| in_progress | blue | tasks, tickets |
| done | green | tasks |
| overdue | red | tasks |
| open | blue | tickets |
| resolved | green | tickets |
| closed | gray | tickets |
| online | green | users |
| offline | gray | users |
| blocked | red | users |

## Типографика

- Sans-serif UI font (Inter или system font stack)
- Иерархия: page title (24px, bold), section title (18px, semibold), table header (14px, medium), body text (14px, normal), caption (12px, normal)
- Numeric alignment для финансовых и временных значений (tabular-nums)
- Monospace для кодов, ID, timestamps

## Spacing

- Grid: 8px base
- Card padding: 16px (compact), 24px (spacious)
- Table row height: 48px
- Section gap: 24px
- Filter bar gap: 12px

## Правила отображения данных

### Таблицы
- Используются для: модерации, смен, пользователей, платежей, логов, задач, оборудования
- Обязательно: фильтры + сортировка для операционных списков
- Пагинация внизу: page selector + per_page selector (10, 20, 50)
- Sticky header при скролле
- Row click → navigation или detail panel

### Статусы
- Всегда через StatusBadge
- Цвет + текст (цвет не единственный индикатор — accessibility)
- Tooltip при необходимости для дополнительного контекста

### Пустые состояния
- Каждая таблица/список имеет empty state
- Текст + подсказка + primary action button
- Пример: "Нет смен за выбранный период. Попробуйте изменить фильтры."

### Числовые значения
- Деньги: `1 234.56 ₽` (с разделителями)
- Часы: `8ч 30м` или `08:30`
- Даты: `18 фев 2026, 14:30` (относительные для < 24h: "2 часа назад")
- Проценты: `87.5%`
- Counters: `42` (без форматирования для малых чисел)

## Правила состояний интерфейса

### Loading
- Skeleton placeholders для таблиц и detail-страниц
- Skeleton повторяет форму реального контента
- Никогда не показывать пустую страницу при загрузке

### Error
- Inline Alert + retry button
- Toast для transient errors (network timeout)
- Full-page error state только при критических failures

### Success
- Toast confirmation для write actions
- Duration: 3 секунды, dismissable
- "Фото одобрено", "Задача создана", "Настройки сохранены"

### Destructive Actions
- Confirmation modal (AlertDialog) обязателен
- Кнопка подтверждения — красная (destructive variant)
- Текст описывает последствия действия
- Пример: "Вы уверены, что хотите заблокировать пользователя Иванов И.И.? Все активные сессии будут завершены."

## Responsive Behavior

| Breakpoint | Устройство | Поведение |
|-----------|-----------|----------|
| ≥ 1440px | Desktop wide | Полный layout |
| 1024–1439px | Desktop | Полный layout |
| 768–1023px | Tablet | Sidebar collapsed, hamburger menu |
| < 768px | Mobile | Read-only fallback, минимальные edit-операции |

Desktop-first. Основной рабочий сценарий — 1920x1080 монитор.

## Accessibility

- Keyboard-navigable controls (Tab, Enter, Escape)
- Visible focus states (focus ring)
- Цвет не единственный индикатор состояния (текст + цвет)
- ARIA labels для icon-only buttons
- Minimum contrast ratio: 4.5:1 для текста
- Screen reader support для критических workflows

## Навигация модулей (Sidebar)

| # | Модуль | Иконка | Badge |
|---|--------|--------|-------|
| 1 | Dashboard | LayoutDashboard | - |
| 2 | Installers | Users | - |
| 3 | Foremen | Building | - |
| 4 | Shifts | Clock | - |
| 5 | Photos | Camera | pending count |
| 6 | Tasks | CheckSquare | overdue count |
| 7 | Support | MessageCircle | unread count |
| 8 | Tools | Wrench | - |
| 9 | Finance | Wallet | - |
| 10 | Reports | BarChart3 | - |
| 11 | Logs | FileText | - |
| 12 | Settings | Settings | - |

## Запрещено

- Кастомные UI-примитивы (только shadcn/ui)
- Декоративные элементы без функции
- Анимации ради анимаций (только functional transitions)
- Infinite scroll для операционных таблиц (только pagination)
- Модальные окна для отображения больших объёмов данных (используй pages)
- Auto-save без подтверждения для деструктивных настроек
