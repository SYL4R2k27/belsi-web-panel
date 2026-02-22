import {
  type ActivityFeedItem,
  type AuditLogEntry,
  type ChartDataPoint,
  type DashboardOverview,
  type Invite,
  InviteStatus,
  type Payout,
  type PayoutItem,
  PaymentStatus,
  PhotoStatus,
  type ShiftPhoto,
  ShiftStatus,
  type SupportMessage,
  type SupportTicket,
  type SystemLog,
  type SystemSettings,
  type Task,
  TaskPriority,
  TaskStatus,
  TicketCategory,
  TicketPriority,
  TicketStatus,
  type Tool,
  ToolCondition,
  type ToolTransaction,
  TransactionType,
  type User,
  UserRole,
  type WalletTransaction,
  type Shift,
  type Team,
  type TeamMember,
} from '@/shared/types'

// ==========================================
// Helper
// ==========================================

function uuid(): string {
  return crypto.randomUUID()
}

function randomDate(daysBack: number): string {
  const d = new Date()
  d.setDate(d.getDate() - Math.floor(Math.random() * daysBack))
  d.setHours(Math.floor(Math.random() * 24), Math.floor(Math.random() * 60))
  return d.toISOString()
}

function randomItem<T>(arr: T[]): T {
  return arr[Math.floor(Math.random() * arr.length)]
}

// ==========================================
// Users
// ==========================================

const firstNames = ['Алексей', 'Дмитрий', 'Иван', 'Сергей', 'Андрей', 'Михаил', 'Николай', 'Владимир', 'Павел', 'Александр', 'Олег', 'Виктор', 'Максим', 'Артём', 'Евгений', 'Роман', 'Константин', 'Юрий', 'Денис', 'Григорий']
const lastNames = ['Иванов', 'Петров', 'Сидоров', 'Козлов', 'Новиков', 'Морозов', 'Волков', 'Зайцев', 'Соловьёв', 'Васильев', 'Кузнецов', 'Попов', 'Смирнов', 'Лебедев', 'Фёдоров', 'Орлов', 'Белов', 'Тарасов', 'Ковалёв', 'Данилов']
const patronymics = ['Алексеевич', 'Дмитриевич', 'Иванович', 'Сергеевич', 'Андреевич', 'Михайлович', 'Николаевич', 'Владимирович', 'Павлович', 'Александрович']

function makePhone(): string {
  return `+7${String(Math.floor(9000000000 + Math.random() * 999999999))}`
}

export const curatorUser: User = {
  id: 'curator-001',
  phone: '+79001234567',
  email: 'curator@belsi.work',
  first_name: 'Анна',
  last_name: 'Куратова',
  patronymic: 'Викторовна',
  role: UserRole.CURATOR,
  is_active: true,
  avatar_url: null,
  hourly_rate: null,
  created_at: '2025-01-15T10:00:00Z',
  updated_at: '2026-02-20T08:00:00Z',
  last_active_at: new Date().toISOString(),
}

export const mockForemen: User[] = Array.from({ length: 8 }, (_, i) => ({
  id: `foreman-${String(i + 1).padStart(3, '0')}`,
  phone: makePhone(),
  email: null,
  first_name: firstNames[i],
  last_name: lastNames[i],
  patronymic: patronymics[i],
  role: UserRole.FOREMAN,
  is_active: true,
  avatar_url: null,
  hourly_rate: null,
  created_at: randomDate(180),
  updated_at: randomDate(30),
  last_active_at: randomDate(3),
}))

export const mockInstallers: User[] = Array.from({ length: 50 }, (_, i) => ({
  id: `installer-${String(i + 1).padStart(3, '0')}`,
  phone: makePhone(),
  email: null,
  first_name: firstNames[i % firstNames.length],
  last_name: lastNames[(i + 5) % lastNames.length],
  patronymic: patronymics[i % patronymics.length],
  role: UserRole.INSTALLER,
  is_active: i < 45,
  avatar_url: null,
  hourly_rate: String(350 + Math.floor(Math.random() * 200)),
  created_at: randomDate(365),
  updated_at: randomDate(30),
  last_active_at: i < 40 ? randomDate(7) : randomDate(60),
}))

export const allUsers: User[] = [curatorUser, ...mockForemen, ...mockInstallers]

// ==========================================
// Teams
// ==========================================

export const mockTeams: Team[] = mockForemen.map((f, i) => ({
  id: `team-${String(i + 1).padStart(3, '0')}`,
  name: `Бригада ${f.last_name}`,
  foreman_id: f.id,
  foreman: f,
  member_count: 4 + Math.floor(Math.random() * 5),
  created_at: f.created_at,
}))

export const mockTeamMembers: TeamMember[] = mockInstallers.slice(0, 40).map((installer, i) => ({
  id: uuid(),
  user_id: installer.id,
  team_id: mockTeams[i % mockTeams.length].id,
  user: installer,
  joined_at: randomDate(90),
}))

// ==========================================
// Invites
// ==========================================

export const mockInvites: Invite[] = mockForemen.flatMap((f, fi) =>
  Array.from({ length: 3 }, (_, i) => ({
    id: uuid(),
    code: `INV-${String(fi * 3 + i + 1).padStart(4, '0')}`,
    foreman_id: f.id,
    foreman: f,
    team_id: mockTeams[fi].id,
    status: randomItem([InviteStatus.NEW, InviteStatus.ACCEPTED, InviteStatus.EXPIRED]) as InviteStatus,
    max_uses: 1,
    used_count: i === 1 ? 1 : 0,
    expires_at: new Date(Date.now() + 7 * 86400000).toISOString(),
    created_at: randomDate(30),
  })),
)

// ==========================================
// Shifts
// ==========================================

const shiftStatuses: ShiftStatus[] = [ShiftStatus.ACTIVE, ShiftStatus.FINISHED, ShiftStatus.FINISHED, ShiftStatus.FINISHED, ShiftStatus.PAUSED, ShiftStatus.CANCELLED]

export const mockShifts: Shift[] = Array.from({ length: 120 }, (_, i) => {
  const installer = mockInstallers[i % mockInstallers.length]
  const status = shiftStatuses[i % shiftStatuses.length]
  const startedAt = randomDate(30)
  const duration = 120 + Math.floor(Math.random() * 480)
  const rate = installer.hourly_rate || '400'

  return {
    id: `shift-${String(i + 1).padStart(3, '0')}`,
    user_id: installer.id,
    user: installer,
    status,
    started_at: startedAt,
    finished_at: status === ShiftStatus.FINISHED ? new Date(new Date(startedAt).getTime() + duration * 60000).toISOString() : null,
    total_duration_minutes: status === ShiftStatus.FINISHED ? duration : null,
    pause_duration_minutes: Math.floor(Math.random() * 30),
    photo_count: 1 + Math.floor(Math.random() * 8),
    approved_photo_count: Math.floor(Math.random() * 6),
    hourly_rate: rate,
    total_payment: status === ShiftStatus.FINISHED ? String(Math.round((duration / 60) * Number(rate))) : null,
    site_object_id: null,
    site_object: null,
    notes: null,
    created_at: startedAt,
  }
})

// ==========================================
// Photos
// ==========================================

const photoStatuses: PhotoStatus[] = [PhotoStatus.PENDING, PhotoStatus.PENDING, PhotoStatus.APPROVED, PhotoStatus.APPROVED, PhotoStatus.APPROVED, PhotoStatus.REJECTED]

export const mockPhotos: ShiftPhoto[] = Array.from({ length: 200 }, (_, i) => {
  const shift = mockShifts[i % mockShifts.length]
  const status = photoStatuses[i % photoStatuses.length]

  return {
    id: `photo-${String(i + 1).padStart(3, '0')}`,
    shift_id: shift.id,
    shift,
    user_id: shift.user_id,
    user: shift.user,
    hour_index: (i % 8) + 1,
    photo_url: `https://picsum.photos/seed/${i + 1}/800/600`,
    thumbnail_url: `https://picsum.photos/seed/${i + 1}/200/150`,
    status,
    reviewer_id: status !== PhotoStatus.PENDING ? curatorUser.id : null,
    reviewer: status !== PhotoStatus.PENDING ? curatorUser : null,
    review_comment: status === PhotoStatus.REJECTED ? 'Низкое качество фото, объект не виден' : null,
    reviewed_at: status !== PhotoStatus.PENDING ? randomDate(7) : null,
    uploaded_at: randomDate(14),
  }
})

// ==========================================
// Tasks
// ==========================================

const taskTitles = [
  'Установка кабельных лотков', 'Монтаж распределительного щита', 'Прокладка силового кабеля',
  'Установка светильников', 'Монтаж розеточных групп', 'Проверка заземления',
  'Установка автоматов защиты', 'Монтаж кабель-каналов', 'Подключение электросчётчика',
  'Ревизия электрощитовой', 'Замена проводки', 'Установка датчиков движения',
  'Монтаж системы освещения', 'Установка УЗО', 'Прокладка оптоволокна',
]

export const mockTasks: Task[] = Array.from({ length: 40 }, (_, i) => ({
  id: `task-${String(i + 1).padStart(3, '0')}`,
  title: taskTitles[i % taskTitles.length],
  description: i % 3 === 0 ? 'Необходимо выполнить работы согласно проектной документации. Обратить внимание на требования пожарной безопасности.' : null,
  priority: randomItem([TaskPriority.LOW, TaskPriority.MEDIUM, TaskPriority.HIGH, TaskPriority.URGENT]),
  status: randomItem([TaskStatus.NEW, TaskStatus.IN_PROGRESS, TaskStatus.DONE, TaskStatus.CANCELLED]),
  assignee_id: mockInstallers[i % mockInstallers.length].id,
  assignee: mockInstallers[i % mockInstallers.length],
  creator_id: curatorUser.id,
  creator: curatorUser,
  deadline: i % 4 !== 0 ? new Date(Date.now() + (Math.random() > 0.3 ? 1 : -1) * Math.floor(Math.random() * 7) * 86400000).toISOString() : null,
  site_object_id: null,
  site_object: null,
  completed_at: null,
  created_at: randomDate(30),
  updated_at: randomDate(7),
}))

// ==========================================
// Support Tickets
// ==========================================

const ticketSubjects = [
  'Не могу загрузить фото', 'Ошибка в расчёте оплаты', 'Приложение зависает',
  'Не приходит OTP код', 'Как подключить новый инструмент?', 'Проблема с таймером смены',
  'Неверное время паузы', 'Не вижу свою команду', 'Задача не отображается',
  'Нужна помощь с отчётом',
]

export const mockTickets: SupportTicket[] = Array.from({ length: 25 }, (_, i) => ({
  id: `ticket-${String(i + 1).padStart(3, '0')}`,
  user_id: mockInstallers[i % mockInstallers.length].id,
  user: mockInstallers[i % mockInstallers.length],
  subject: ticketSubjects[i % ticketSubjects.length],
  category: randomItem([TicketCategory.TECHNICAL, TicketCategory.PAYMENT, TicketCategory.SCHEDULE, TicketCategory.OTHER]),
  priority: randomItem([TicketPriority.LOW, TicketPriority.MEDIUM, TicketPriority.HIGH]),
  status: randomItem([TicketStatus.OPEN, TicketStatus.IN_PROGRESS, TicketStatus.RESOLVED, TicketStatus.CLOSED]),
  assigned_to_id: i % 3 === 0 ? curatorUser.id : null,
  assigned_to: i % 3 === 0 ? curatorUser : null,
  unread_count: Math.floor(Math.random() * 5),
  created_at: randomDate(30),
  updated_at: randomDate(7),
}))

export const mockTicketMessages: Record<string, SupportMessage[]> = Object.fromEntries(
  mockTickets.map((ticket) => [
    ticket.id,
    Array.from({ length: 2 + Math.floor(Math.random() * 5) }, (_, i) => ({
      id: uuid(),
      ticket_id: ticket.id,
      user_id: i % 2 === 0 ? ticket.user_id : curatorUser.id,
      user: i % 2 === 0 ? ticket.user : curatorUser,
      text: i % 2 === 0
        ? 'Здравствуйте, у меня возникла проблема. Прошу помочь разобраться.'
        : 'Добрый день! Мы изучим вашу проблему и вернёмся с ответом.',
      is_internal: false,
      attachment_url: null,
      created_at: new Date(new Date(ticket.created_at).getTime() + i * 3600000).toISOString(),
    })),
  ]),
)

// ==========================================
// Tools
// ==========================================

const toolTypes = ['Перфоратор', 'Шуруповёрт', 'Мультиметр', 'Штроборез', 'Болгарка', 'Лазерный уровень', 'Паяльная станция', 'Кримпер']
const toolNames = ['Bosch GBH 2-26', 'Makita DF333D', 'Fluke 117', 'Hilti DC-SE 20', 'DeWalt DWE4257', 'Bosch GLL 3-80', 'Weller WE1010', 'Knipex 97 53 09']

export const mockTools: Tool[] = Array.from({ length: 30 }, (_, i) => ({
  id: `tool-${String(i + 1).padStart(3, '0')}`,
  name: toolNames[i % toolNames.length],
  type: toolTypes[i % toolTypes.length],
  serial_number: `SN-${String(10000 + i)}`,
  condition: randomItem([ToolCondition.NEW, ToolCondition.GOOD, ToolCondition.GOOD, ToolCondition.WORN, ToolCondition.DAMAGED]),
  assigned_to_id: i < 20 ? mockInstallers[i % mockInstallers.length].id : null,
  assigned_to: i < 20 ? mockInstallers[i % mockInstallers.length] : null,
  assigned_at: i < 20 ? randomDate(60) : null,
  return_date: null,
  notes: null,
  created_at: randomDate(180),
  updated_at: randomDate(30),
}))

export const mockToolTransactions: ToolTransaction[] = mockTools.slice(0, 20).map((tool, i) => ({
  id: uuid(),
  tool_id: tool.id,
  tool,
  user_id: tool.assigned_to_id!,
  user: tool.assigned_to,
  action: 'issued' as const,
  condition_before: ToolCondition.GOOD,
  condition_after: tool.condition,
  notes: null,
  created_at: tool.assigned_at || randomDate(30),
}))

// ==========================================
// Finance
// ==========================================

export const mockPayouts: Payout[] = Array.from({ length: 35 }, (_, i) => {
  const installer = mockInstallers[i % mockInstallers.length]
  const amount = String(5000 + Math.floor(Math.random() * 25000))
  const status = randomItem([PaymentStatus.PENDING, PaymentStatus.APPROVED, PaymentStatus.PAID, PaymentStatus.PAID])

  return {
    id: `payout-${String(i + 1).padStart(3, '0')}`,
    user_id: installer.id,
    user: installer,
    amount,
    status,
    items: [
      {
        id: uuid(),
        payout_id: `payout-${String(i + 1).padStart(3, '0')}`,
        source_type: 'shift',
        source_id: mockShifts[i % mockShifts.length].id,
        amount: String(Math.floor(Number(amount) * 0.8)),
        description: 'Оплата за смену',
      },
      {
        id: uuid(),
        payout_id: `payout-${String(i + 1).padStart(3, '0')}`,
        source_type: 'bonus',
        source_id: '',
        amount: String(Math.floor(Number(amount) * 0.2)),
        description: 'Бонус за качество',
      },
    ] as PayoutItem[],
    created_at: randomDate(60),
    approved_at: status !== PaymentStatus.PENDING ? randomDate(30) : null,
    paid_at: status === PaymentStatus.PAID ? randomDate(14) : null,
  }
})

export const mockTransactions: WalletTransaction[] = Array.from({ length: 80 }, (_, i) => ({
  id: uuid(),
  wallet_id: `wallet-${mockInstallers[i % mockInstallers.length].id}`,
  type: randomItem([TransactionType.SHIFT_PAYMENT, TransactionType.BONUS, TransactionType.PENALTY, TransactionType.PAYOUT]),
  amount: String((Math.random() > 0.2 ? 1 : -1) * (500 + Math.floor(Math.random() * 10000))),
  balance_after: String(5000 + Math.floor(Math.random() * 30000)),
  description: 'Начисление за смену',
  reference_id: null,
  created_at: randomDate(60),
}))

// ==========================================
// Dashboard
// ==========================================

export const mockDashboardOverview: DashboardOverview = {
  active_shifts: 12,
  shifts_today: 28,
  pending_photos: mockPhotos.filter((p) => p.status === PhotoStatus.PENDING).length,
  overdue_tasks: 5,
  open_tickets: mockTickets.filter((t) => t.status === TicketStatus.OPEN).length,
  total_payouts_this_month: '847500.00',
  active_shifts_change: 15,
  shifts_today_change: -5,
  pending_photos_change: 23,
  overdue_tasks_change: -10,
}

export const mockActivityFeed: ActivityFeedItem[] = Array.from({ length: 20 }, (_, i) => ({
  id: uuid(),
  type: randomItem(['shift_started', 'shift_finished', 'photo_uploaded', 'task_completed', 'message_received', 'ticket_created'] as const),
  user: mockInstallers[i % mockInstallers.length],
  description: randomItem([
    'начал смену на объекте «ЖК Солнечный»',
    'завершил смену (8ч 15мин)',
    'загрузил фотоотчёт (час #3)',
    'выполнил задачу «Монтаж щита»',
    'отправил сообщение в поддержку',
    'создал тикет «Проблема с оплатой»',
  ]),
  timestamp: randomDate(2),
  entity_id: null,
})).sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime())

function generateChartData(days: number): ChartDataPoint[] {
  return Array.from({ length: days }, (_, i) => {
    const d = new Date()
    d.setDate(d.getDate() - (days - 1 - i))
    return {
      date: d.toISOString().split('T')[0],
      value: 5 + Math.floor(Math.random() * 30),
    }
  })
}

export const mockShiftAnalytics: ChartDataPoint[] = generateChartData(30)
export const mockPhotoAnalytics: ChartDataPoint[] = generateChartData(30)
export const mockTaskAnalytics: ChartDataPoint[] = generateChartData(30)

// ==========================================
// Audit Logs
// ==========================================

export const mockAuditLogs: AuditLogEntry[] = Array.from({ length: 60 }, (_, i) => ({
  id: uuid(),
  actor_id: curatorUser.id,
  actor: curatorUser,
  action: randomItem(['photo.approved', 'photo.rejected', 'task.created', 'task.assigned', 'user.blocked', 'payment.approved', 'settings.updated']),
  entity_type: randomItem(['shift_photo', 'task', 'user', 'payout', 'settings']),
  entity_id: uuid(),
  old_data: i % 3 === 0 ? { status: 'pending' } : null,
  new_data: i % 3 === 0 ? { status: 'approved' } : null,
  ip_address: '94.228.123.95',
  created_at: randomDate(30),
})).sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime())

export const mockSystemLogs: SystemLog[] = Array.from({ length: 100 }, (_, i) => ({
  id: uuid(),
  level: randomItem(['INFO', 'INFO', 'INFO', 'WARNING', 'ERROR'] as const),
  message: randomItem([
    'Request processed successfully',
    'Photo uploaded to S3',
    'Shift started for user',
    'Rate limit approached for IP',
    'Database connection pool exhausted',
    'JWT token refreshed',
    'OTP sent via SMS',
    'Slow query detected (1.2s)',
  ]),
  service: randomItem(['api', 'auth', 'worker', 'storage']),
  request_id: uuid(),
  user_id: i % 5 === 0 ? mockInstallers[i % mockInstallers.length].id : null,
  duration_ms: 10 + Math.floor(Math.random() * 500),
  created_at: randomDate(7),
})).sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime())

// ==========================================
// Settings
// ==========================================

export const mockSettings: SystemSettings = {
  moderation_policy: {
    auto_approve_enabled: false,
    require_comment_on_reject: true,
    max_pending_hours: 24,
  },
  shift_limits: {
    max_shift_duration_hours: 12,
    max_pause_duration_minutes: 60,
    max_pauses_per_shift: 3,
    require_photo_every_hours: 1,
  },
  task_sla: {
    default_deadline_hours: 72,
    overdue_warning_hours: 12,
  },
  notification_rules: {
    notify_on_shift_start: true,
    notify_on_photo_reject: true,
    notify_on_task_assign: true,
    notify_on_ticket_reply: true,
  },
}
