import { http, HttpResponse, delay } from 'msw'
import {
  allUsers,
  curatorUser,
  mockAccounts,
  mockAuditLogs,
  mockForemen,
  mockInstallers,
  mockInvites,
  mockPayouts,
  mockPhotos,
  mockSettings,
  mockShifts,
  mockSystemLogs,
  mockTasks,
  mockTeamMembers,
  mockTeams,
  mockTicketMessages,
  mockTickets,
  mockToolTransactions,
  mockTools,
  mockTransactions,
} from './data'
import { PhotoStatus, type User } from '@/shared/types'

// Хранилище текущего залогиненного пользователя (для мока)
let currentLoggedInUser: User = curatorUser

const MOCK_API = '/api/v1'

function paginate<T>(items: T[], page = 1, perPage = 20): { data: T[]; meta: { total: number; page: number; per_page: number; total_pages: number } } {
  const start = (page - 1) * perPage
  return {
    data: items.slice(start, start + perPage),
    meta: {
      total: items.length,
      page,
      per_page: perPage,
      total_pages: Math.ceil(items.length / perPage),
    },
  }
}

function sliceByOffset<T>(items: T[], limit = 50, offset = 0): T[] {
  return items.slice(offset, offset + limit)
}

function sp(request: Request) {
  return new URL(request.url).searchParams
}

// Transform User → AllUserOut format (real API shape)
function toAllUserOut(u: typeof curatorUser) {
  const foreman = mockForemen.find((f) => {
    const team = mockTeams.find((t) => t.foreman_id === f.id)
    return team && mockTeamMembers.some((m) => m.team_id === team.id && m.user_id === u.id)
  })
  return {
    id: u.id,
    phone: u.phone,
    full_name: `${u.first_name} ${u.last_name}`,
    first_name: u.first_name,
    last_name: u.last_name,
    role: u.role,
    foreman_id: foreman?.id || null,
    foreman_name: foreman ? `${foreman.first_name} ${foreman.last_name}` : null,
    last_activity_at: u.last_active_at,
    is_active_today: Math.random() > 0.3,
    pending_photos_count: mockPhotos.filter((p) => p.user_id === u.id && p.status === PhotoStatus.PENDING).length,
    total_shifts: mockShifts.filter((s) => s.user_id === u.id).length,
    total_hours: Math.floor(Math.random() * 2000),
    created_at: u.created_at,
  }
}

// Transform User → UserDetailOut format
function toUserDetailOut(u: typeof curatorUser) {
  const userShifts = mockShifts.filter((s) => s.user_id === u.id)
  const activeShift = userShifts.find((s) => s.status === 'active')
  const userPhotos = mockPhotos.filter((p) => p.user_id === u.id)
  const userTasks = mockTasks.filter((t) => t.assignee_id === u.id)
  const teamMembership = mockTeamMembers.find((m) => m.user_id === u.id)
  const team = teamMembership ? mockTeams.find((t) => t.id === teamMembership.team_id) : null
  const foreman = team ? mockForemen.find((f) => f.id === team.foreman_id) : null
  const members = team ? mockTeamMembers.filter((m) => m.team_id === team.id).map((m) => ({
    id: m.user.id,
    phone: m.user.phone,
    full_name: `${m.user.first_name} ${m.user.last_name}`,
  })) : []

  return {
    id: u.id,
    phone: u.phone,
    full_name: `${u.first_name} ${u.last_name}`,
    first_name: u.first_name,
    last_name: u.last_name,
    role: u.role,
    foreman_id: foreman?.id || null,
    foreman_name: foreman ? `${foreman.first_name} ${foreman.last_name}` : null,
    team_members: members,
    total_shifts: userShifts.length,
    total_hours: Math.floor(Math.random() * 2000),
    pending_photos_count: userPhotos.filter((p) => p.status === PhotoStatus.PENDING).length,
    approved_photos_count: userPhotos.filter((p) => p.status === PhotoStatus.APPROVED).length,
    rejected_photos_count: userPhotos.filter((p) => p.status === PhotoStatus.REJECTED).length,
    active_tasks_count: userTasks.filter((t) => t.status === 'in_progress' || t.status === 'new').length,
    completed_tasks_count: userTasks.filter((t) => t.status === 'done').length,
    last_activity_at: u.last_active_at,
    current_shift_id: activeShift?.id || null,
    is_on_shift: !!activeShift,
    current_shift_start_at: activeShift?.started_at || null,
    current_shift_photos_count: activeShift ? mockPhotos.filter((p) => p.shift_id === activeShift.id).length : 0,
    current_shift_elapsed_hours: activeShift ? Math.floor((Date.now() - new Date(activeShift.started_at).getTime()) / 3600000) : 0,
    total_photos: userPhotos.length,
    shift_ended_at: null,
    is_paused: false,
    is_idle: false,
    shift_status: activeShift?.status || 'none',
    city: null,
    email: u.email,
    telegram: null,
    about: null,
    created_at: u.created_at,
    current_pause_reason: null,
    current_pause_started_at: null,
    current_shift_pause_seconds: 0,
    current_shift_idle_seconds: 0,
    total_pause_duration: null,
    total_idle_duration: null,
    today_tasks: [],
  }
}

// Transform photo → CuratorPhotoOut format
function toCuratorPhotoOut(p: typeof mockPhotos[0]) {
  return {
    id: p.id,
    user_id: p.user_id,
    user_phone: p.user?.phone || '',
    user_name: p.user ? `${p.user.first_name} ${p.user.last_name}` : null,
    foreman_id: null,
    foreman_name: null,
    photo_url: p.photo_url,
    shift_id: p.shift_id,
    timestamp: p.uploaded_at,
    status: p.status,
    comment: p.review_comment,
    category: 'shift',
  }
}

// Transform shift → ShiftItem format
function toShiftItem(s: typeof mockShifts[0]) {
  return {
    id: s.id,
    user_id: s.user_id,
    user_name: s.user ? `${s.user.first_name} ${s.user.last_name}` : null,
    start_at: s.started_at,
    finish_at: s.finished_at,
    duration_hours: s.total_duration_minutes ? Math.round(s.total_duration_minutes / 60 * 10) / 10 : null,
    status: s.status,
  }
}

// Transform task → TaskOut format
function toTaskOut(t: typeof mockTasks[0]) {
  return {
    id: t.id,
    created_by: t.creator_id,
    assigned_to: t.assignee_id || '',
    title: t.title,
    description: t.description,
    status: t.status,
    priority: t.priority,
    due_at: t.deadline,
    meta: {},
    created_at: t.created_at,
    updated_at: t.updated_at,
  }
}

// Transform ticket → TicketOut format
function toTicketOut(t: typeof mockTickets[0]) {
  return {
    id: t.id,
    user_id: t.user_id,
    title: t.subject,
    category: t.category,
    status: t.status,
    created_at: t.created_at,
    updated_at: t.updated_at,
  }
}

// Transform message → MessageOut format
function toMessageOut(m: typeof mockTicketMessages[string][0]) {
  return {
    id: m.id,
    ticket_id: m.ticket_id,
    sender_role: m.user_id === curatorUser.id ? 'curator' : 'installer',
    sender_user_id: m.user_id,
    text: m.text,
    is_internal: m.is_internal,
    created_at: m.created_at,
  }
}

// Transform tool → ToolOut format
function toToolOut(t: typeof mockTools[0]) {
  return {
    id: t.id,
    name: t.name,
    description: null,
    serial_number: t.serial_number,
    photo_url: null,
    foreman_id: mockForemen[0]?.id || '',
    foreman: mockForemen[0] ? { id: mockForemen[0].id, phone: mockForemen[0].phone, full_name: `${mockForemen[0].first_name} ${mockForemen[0].last_name}` } : null,
    status: t.condition,
    created_at: t.created_at,
    updated_at: t.updated_at,
  }
}

export const handlers = [
  // ==========================================
  // Auth (real API format)
  // ==========================================

  // Логин по логину + паролю (телефон / email / username)
  http.post('/auth/login', async ({ request }) => {
    await delay(400)
    const body = await request.json() as { login: string; password: string }

    const account = mockAccounts.find(
      (a) => a.login.toLowerCase() === body.login.toLowerCase() && a.password === body.password,
    )

    if (!account) {
      return HttpResponse.json(
        { detail: 'Неверный логин или пароль' },
        { status: 401 },
      )
    }

    // Запомним кто залогинился
    currentLoggedInUser = account.user

    return HttpResponse.json({
      token: `mock-jwt-token-${account.user.role}-${account.user.id}`,
      user: {
        id: account.user.id,
        phone: account.user.phone,
        role: account.user.role,
        first_name: account.user.first_name,
        last_name: account.user.last_name,
        full_name: `${account.user.first_name} ${account.user.last_name}`,
        short_id: null,
        foreman_id: null,
        created_at: account.user.created_at,
      },
    })
  }),

  // Смена своего пароля
  http.post('/auth/change-password', async ({ request }) => {
    await delay(300)
    const body = await request.json() as { current_password: string; new_password: string }
    if (body.new_password.length < 6) {
      return HttpResponse.json({ detail: 'Пароль должен быть не менее 6 символов' }, { status: 400 })
    }
    return HttpResponse.json({ success: true, message: 'Пароль успешно изменён' })
  }),

  // Куратор устанавливает пароль пользователю
  http.post('/curator/set-password', async ({ request }) => {
    await delay(300)
    const body = await request.json() as { user_id: string; new_password: string }
    if (body.new_password.length < 6) {
      return HttpResponse.json({ detail: 'Пароль должен быть не менее 6 символов' }, { status: 400 })
    }
    const user = allUsers.find((u) => u.id === body.user_id)
    if (!user) return HttpResponse.json({ detail: 'Пользователь не найден' }, { status: 404 })
    return HttpResponse.json({ success: true, message: 'Пароль установлен' })
  }),

  // Старые OTP-хэндлеры (для обратной совместимости с мобильными)
  http.post('/auth/phone', async () => {
    await delay(300)
    return HttpResponse.json({ status: 'ok' })
  }),

  http.post('/auth/verify', async () => {
    await delay(300)
    return HttpResponse.json({
      status: 'ok',
      token: 'mock-jwt-token-curator',
      phone: '+79001234567',
      is_new: false,
      role: 'curator',
    })
  }),

  http.get('/user/me', async ({ request }) => {
    await delay(200)

    // Определяем пользователя по токену
    const authHeader = request.headers.get('Authorization')
    const token = authHeader?.replace('Bearer ', '') || ''

    // Попробуем извлечь роль и id из токена (формат: mock-jwt-token-{role}-{id})
    const tokenMatch = token.match(/^mock-jwt-token-(\w+)-(.+)$/)
    let user = currentLoggedInUser

    if (tokenMatch) {
      const [, , userId] = tokenMatch
      const found = allUsers.find((u) => u.id === userId)
      if (found) user = found
    }

    return HttpResponse.json({
      id: user.id,
      phone: user.phone,
      role: user.role,
      first_name: user.first_name,
      last_name: user.last_name,
      full_name: `${user.first_name} ${user.last_name}`,
      short_id: null,
      foreman_id: null,
      created_at: user.created_at,
    })
  }),

  // ==========================================
  // Curator Dashboard (real API format)
  // ==========================================

  http.get('/curator/dashboard', async () => {
    await delay(200)
    return HttpResponse.json({
      total_installers: mockInstallers.length,
      active_installers_today: Math.floor(mockInstallers.length * 0.6),
      total_foremen: mockForemen.length,
      active_foremen_today: Math.floor(mockForemen.length * 0.75),
      total_coordinators: 0,
      active_coordinators_today: 0,
      pending_photos: mockPhotos.filter((p) => p.status === PhotoStatus.PENDING).length,
      total_shifts_today: mockShifts.filter((s) => s.status === 'active').length + 16,
      total_tools: mockTools.length,
      tools_issued: mockTools.filter((t) => t.assigned_to_id).length,
      open_support_tickets: mockTickets.filter((t) => t.status === 'open').length,
      average_completion_percentage: 73.5,
    })
  }),

  http.get('/reports/curator/shifts', async () => {
    await delay(300)
    return HttpResponse.json([])
  }),

  // ==========================================
  // Curator Users (real API format)
  // ==========================================

  http.get('/curator/users/all', async ({ request }) => {
    await delay(300)
    const params = sp(request)
    const role = params.get('role')
    const limit = Number(params.get('limit')) || 200
    const offset = Number(params.get('offset')) || 0

    let filtered = allUsers.filter((u) => u.id !== curatorUser.id)
    if (role) filtered = filtered.filter((u) => u.role === role)

    return HttpResponse.json(sliceByOffset(filtered, limit, offset).map(toAllUserOut))
  }),

  http.get('/curator/users/:id', async ({ params }) => {
    await delay(200)
    const user = allUsers.find((u) => u.id === params.id)
    if (!user) return HttpResponse.json({ detail: 'User not found' }, { status: 404 })
    return HttpResponse.json(toUserDetailOut(user))
  }),

  http.delete('/curator/users/:id', async ({ params }) => {
    await delay(300)
    return HttpResponse.json({
      deleted_user_id: params.id,
      deleted_shifts: 0,
      deleted_photos: 0,
      deleted_tasks: 0,
      deleted_tickets: 0,
      deleted_invites: 0,
    })
  }),

  http.post('/curator/users/:id/role', async ({ params }) => {
    await delay(300)
    return HttpResponse.json({ user_id: params.id, role: 'foreman' })
  }),

  // ==========================================
  // Curator Foremen (real API format)
  // ==========================================

  http.get('/curator/foremen', async ({ request }) => {
    await delay(300)
    const params = sp(request)
    const limit = Number(params.get('limit')) || 50
    const offset = Number(params.get('offset')) || 0

    const foremenData = mockForemen.map((f) => {
      const team = mockTeams.find((t) => t.foreman_id === f.id)
      const members = team ? mockTeamMembers.filter((m) => m.team_id === team.id) : []
      return {
        id: f.id,
        phone: f.phone,
        full_name: `${f.first_name} ${f.last_name}`,
        first_name: f.first_name,
        last_name: f.last_name,
        team_size: members.length,
        active_installers_count: Math.floor(members.length * 0.7),
        total_shifts_today: Math.floor(Math.random() * 5),
        tools_count: Math.floor(Math.random() * 10),
        active_tools_issued: Math.floor(Math.random() * 5),
        pending_photos_count: Math.floor(Math.random() * 8),
        completion_percentage: 50 + Math.floor(Math.random() * 50),
        created_at: f.created_at,
        installers: members.map((m) => ({
          id: m.user.id,
          phone: m.user.phone,
          full_name: `${m.user.first_name} ${m.user.last_name}`,
          first_name: m.user.first_name,
          last_name: m.user.last_name,
        })),
      }
    })

    return HttpResponse.json(sliceByOffset(foremenData, limit, offset))
  }),

  http.get('/curator/installers/unassigned', async ({ request }) => {
    await delay(200)
    const params = sp(request)
    const limit = Number(params.get('limit')) || 100
    const offset = Number(params.get('offset')) || 0

    const assignedIds = new Set(mockTeamMembers.map((m) => m.user_id))
    const unassigned = mockInstallers
      .filter((u) => !assignedIds.has(u.id))
      .map((u) => ({
        id: u.id,
        phone: u.phone,
        full_name: `${u.first_name} ${u.last_name}`,
        first_name: u.first_name,
        last_name: u.last_name,
        last_activity_at: u.last_active_at,
        last_photo_status: 'approved',
        pending_photos_count: 0,
        total_shifts: mockShifts.filter((s) => s.user_id === u.id).length,
        total_hours: Math.floor(Math.random() * 500),
        created_at: u.created_at,
      }))

    return HttpResponse.json(sliceByOffset(unassigned, limit, offset))
  }),

  // ==========================================
  // Curator Photos (real API format)
  // ==========================================

  http.get('/curator/photos', async ({ request }) => {
    await delay(300)
    const params = sp(request)
    const limit = Number(params.get('limit')) || 50
    const status = params.get('status')
    const userId = params.get('user_id')
    const shiftId = params.get('shift_id')

    let filtered = mockPhotos
    if (status) filtered = filtered.filter((p) => p.status === status)
    if (userId) filtered = filtered.filter((p) => p.user_id === userId)
    if (shiftId) filtered = filtered.filter((p) => p.shift_id === shiftId)

    return HttpResponse.json({
      photos: filtered.slice(0, limit).map(toCuratorPhotoOut),
    })
  }),

  http.get('/curator/photos/latest', async () => {
    await delay(200)
    return HttpResponse.json({
      photos: mockPhotos.slice(0, 10).map(toCuratorPhotoOut),
    })
  }),

  http.post('/curator/photos/:id/approve', async ({ params }) => {
    await delay(300)
    const photo = mockPhotos.find((p) => p.id === params.id)
    if (!photo) return HttpResponse.json({ detail: 'Photo not found' }, { status: 404 })
    return HttpResponse.json({ status: 'approved' })
  }),

  http.post('/curator/photos/:id/reject', async ({ params }) => {
    await delay(300)
    const photo = mockPhotos.find((p) => p.id === params.id)
    if (!photo) return HttpResponse.json({ detail: 'Photo not found' }, { status: 404 })
    return HttpResponse.json({ status: 'rejected' })
  }),

  // ==========================================
  // Shifts (real API format)
  // ==========================================

  http.get('/shifts', async () => {
    await delay(300)
    return HttpResponse.json({
      items: mockShifts.map(toShiftItem),
    })
  }),

  http.get('/shifts/:id', async ({ params }) => {
    await delay(200)
    const shift = mockShifts.find((s) => s.id === params.id)
    if (!shift) return HttpResponse.json({ detail: 'Shift not found' }, { status: 404 })
    return HttpResponse.json(toShiftItem(shift))
  }),

  http.get('/shifts/:id/photos', async ({ params }) => {
    await delay(200)
    const photos = mockPhotos.filter((p) => p.shift_id === params.id)
    return HttpResponse.json(photos.map((p) => ({
      id: p.id,
      shift_id: p.shift_id,
      hour_label: `Час ${p.hour_index}`,
      status: p.status,
      comment: p.review_comment,
      photo_url: p.photo_url,
      uploaded_at: p.uploaded_at,
    })))
  }),

  http.delete('/curator/shifts/:id', async () => {
    await delay(300)
    return HttpResponse.json({ status: 'deleted' })
  }),

  // ==========================================
  // Tasks (real API format)
  // ==========================================

  http.get('/tasks/created', async ({ request }) => {
    await delay(300)
    const params = sp(request)
    const status = params.get('status')
    const limit = Number(params.get('limit')) || 50
    const offset = Number(params.get('offset')) || 0

    let filtered = mockTasks
    if (status) filtered = filtered.filter((t) => t.status === status)

    return HttpResponse.json(sliceByOffset(filtered, limit, offset).map(toTaskOut))
  }),

  http.get('/tasks/:id', async ({ params }) => {
    await delay(200)
    const task = mockTasks.find((t) => t.id === params.id)
    if (!task) return HttpResponse.json({ detail: 'Task not found' }, { status: 404 })
    return HttpResponse.json(toTaskOut(task))
  }),

  http.post('/curator/tasks', async ({ request }) => {
    await delay(300)
    const body = await request.json() as { title: string; description: string; target_user_ids?: string[]; deadline?: string; priority: string }
    return HttpResponse.json({
      task_id: crypto.randomUUID(),
      task_ids: body.target_user_ids?.map(() => crypto.randomUUID()) || [crypto.randomUUID()],
      assigned_to_count: body.target_user_ids?.length || 1,
    })
  }),

  http.patch('/tasks/:id', async ({ params, request }) => {
    await delay(300)
    const task = mockTasks.find((t) => t.id === params.id)
    if (!task) return HttpResponse.json({ detail: 'Task not found' }, { status: 404 })
    const body = await request.json() as Record<string, unknown>
    return HttpResponse.json({ ...toTaskOut(task), ...body, updated_at: new Date().toISOString() })
  }),

  http.delete('/curator/tasks/:id', async () => {
    await delay(300)
    return HttpResponse.json({ status: 'deleted' })
  }),

  // ==========================================
  // Support (real API format)
  // ==========================================

  http.get('/curator/support', async ({ request }) => {
    await delay(300)
    const params = sp(request)
    const status = params.get('status')
    const limit = Number(params.get('limit')) || 50

    let filtered = mockTickets
    if (status) filtered = filtered.filter((t) => t.status === status)

    return HttpResponse.json(filtered.slice(0, limit).map(toTicketOut))
  }),

  http.get('/support/tickets', async () => {
    await delay(300)
    return HttpResponse.json(mockTickets.map(toTicketOut))
  }),

  http.get('/support/tickets/:id', async ({ params }) => {
    await delay(200)
    const ticket = mockTickets.find((t) => t.id === params.id)
    if (!ticket) return HttpResponse.json({ detail: 'Ticket not found' }, { status: 404 })
    const messages = (mockTicketMessages[params.id as string] || []).map(toMessageOut)
    return HttpResponse.json({
      ticket: toTicketOut(ticket),
      messages,
    })
  }),

  http.get('/support/tickets/:id/messages', async ({ params }) => {
    await delay(200)
    const messages = mockTicketMessages[params.id as string] || []
    return HttpResponse.json(messages.map(toMessageOut))
  }),

  http.post('/support/tickets/:id/messages', async ({ params, request }) => {
    await delay(300)
    const body = await request.json() as { text: string; is_internal?: boolean }
    return HttpResponse.json({
      id: crypto.randomUUID(),
      ticket_id: params.id,
      sender_role: 'curator',
      sender_user_id: curatorUser.id,
      text: body.text,
      is_internal: body.is_internal ?? false,
      created_at: new Date().toISOString(),
    })
  }),

  // ==========================================
  // Tools (real API format)
  // ==========================================

  http.get('/tools', async ({ request }) => {
    await delay(300)
    const params = sp(request)
    const status = params.get('status')

    let filtered = mockTools
    if (status) filtered = filtered.filter((t) => t.condition === status)

    return HttpResponse.json({
      items: filtered.map(toToolOut),
    })
  }),

  http.post('/tools', async ({ request }) => {
    await delay(300)
    const body = await request.json() as Record<string, unknown>
    return HttpResponse.json({
      id: crypto.randomUUID(),
      ...body,
      status: 'new',
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    })
  }),

  http.post('/curator/tools/issue', async () => {
    await delay(300)
    return HttpResponse.json({ status: 'issued' })
  }),

  http.get('/curator/tools/transactions', async ({ request }) => {
    await delay(300)
    const params = sp(request)
    const limit = Number(params.get('limit')) || 50
    const page = Number(params.get('page')) || 1
    const offset = (page - 1) * limit

    return HttpResponse.json(sliceByOffset(mockToolTransactions, limit, offset).map((t) => ({
      id: t.id,
      tool_id: t.tool_id,
      tool_name: t.tool?.name || '',
      user_id: t.user_id,
      user_name: t.user ? `${t.user.first_name} ${t.user.last_name}` : '',
      action: t.action,
      created_at: t.created_at,
    })))
  }),

  // ==========================================
  // Foreman Invites (real API format)
  // ==========================================

  http.get('/foreman/invites', async () => {
    await delay(200)
    return HttpResponse.json(mockInvites.map((inv) => ({
      id: inv.id,
      code: inv.code,
      foreman_id: inv.foreman_id,
      team_id: inv.team_id,
      status: inv.status,
      max_uses: inv.max_uses,
      used_count: inv.used_count,
      expires_at: inv.expires_at,
      created_at: inv.created_at,
    })))
  }),

  http.post('/foreman/invites', async () => {
    await delay(300)
    return HttpResponse.json({
      id: crypto.randomUUID(),
      code: `INV-${String(Math.floor(Math.random() * 9999)).padStart(4, '0')}`,
      status: 'new',
      created_at: new Date().toISOString(),
    })
  }),

  http.post('/foreman/invites/cancel', async () => {
    await delay(300)
    return HttpResponse.json({ status: 'cancelled' })
  }),

  // ==========================================
  // Mock-only endpoints (keep /api/v1 prefix)
  // ==========================================

  // Finance
  http.get(`${MOCK_API}/finance/payouts`, async ({ request }) => {
    await delay(300)
    const params = sp(request)
    const page = Number(params.get('page')) || 1
    const status = params.get('status')

    let filtered = mockPayouts
    if (status) filtered = filtered.filter((p) => p.status === status)

    return HttpResponse.json(paginate(filtered, page))
  }),

  http.get(`${MOCK_API}/finance/payouts/:id`, async ({ params }) => {
    await delay(200)
    const payout = mockPayouts.find((p) => p.id === params.id)
    if (!payout) return HttpResponse.json({ error: { code: 'NOT_FOUND', message: 'Payout not found' } }, { status: 404 })
    return HttpResponse.json({ data: payout })
  }),

  http.get(`${MOCK_API}/finance/transactions`, async ({ request }) => {
    await delay(300)
    const params = sp(request)
    const page = Number(params.get('page')) || 1
    return HttpResponse.json(paginate(mockTransactions, page))
  }),

  http.get(`${MOCK_API}/finance/summary`, async () => {
    await delay(200)
    return HttpResponse.json({
      data: {
        total_payouts: '2450000.00',
        pending_amount: '185000.00',
        approved_amount: '320000.00',
        paid_amount: '1945000.00',
        avg_per_installer: '48750.00',
      },
    })
  }),

  // Logs
  http.get(`${MOCK_API}/logs/audit`, async ({ request }) => {
    await delay(300)
    const params = sp(request)
    const page = Number(params.get('page')) || 1
    const action = params.get('action')

    let filtered = mockAuditLogs
    if (action) filtered = filtered.filter((l) => l.action === action)

    return HttpResponse.json(paginate(filtered, page))
  }),

  http.get(`${MOCK_API}/logs/system`, async ({ request }) => {
    await delay(300)
    const params = sp(request)
    const page = Number(params.get('page')) || 1
    const level = params.get('level')

    let filtered = mockSystemLogs
    if (level) filtered = filtered.filter((l) => l.level === level)

    return HttpResponse.json(paginate(filtered, page))
  }),

  // Settings
  http.get(`${MOCK_API}/settings`, async () => {
    await delay(200)
    return HttpResponse.json({ data: mockSettings })
  }),

  http.patch(`${MOCK_API}/settings`, async ({ request }) => {
    await delay(300)
    const body = await request.json() as Record<string, unknown>
    return HttpResponse.json({ data: { ...mockSettings, ...body } })
  }),

]
