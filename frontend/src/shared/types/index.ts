// ==========================================
// Enums
// ==========================================

export enum UserRole {
  INSTALLER = 'installer',
  FOREMAN = 'foreman',
  COORDINATOR = 'coordinator',
  CURATOR = 'curator',
}

export enum ShiftStatus {
  ACTIVE = 'active',
  PAUSED = 'paused',
  FINISHED = 'finished',
  CANCELLED = 'cancelled',
}

export enum PhotoStatus {
  PENDING = 'pending',
  APPROVED = 'approved',
  REJECTED = 'rejected',
}

export enum TaskStatus {
  NEW = 'new',
  IN_PROGRESS = 'in_progress',
  DONE = 'done',
  CANCELLED = 'cancelled',
}

export enum TaskPriority {
  LOW = 'low',
  MEDIUM = 'medium',
  HIGH = 'high',
  URGENT = 'urgent',
}

export enum TicketStatus {
  OPEN = 'open',
  IN_PROGRESS = 'in_progress',
  RESOLVED = 'resolved',
  CLOSED = 'closed',
}

export enum TicketCategory {
  TECHNICAL = 'technical',
  PAYMENT = 'payment',
  SCHEDULE = 'schedule',
  OTHER = 'other',
}

export enum TicketPriority {
  LOW = 'low',
  MEDIUM = 'medium',
  HIGH = 'high',
}

export enum PaymentStatus {
  PENDING = 'pending',
  APPROVED = 'approved',
  PAID = 'paid',
  CANCELLED = 'cancelled',
}

export enum TransactionType {
  SHIFT_PAYMENT = 'shift_payment',
  BONUS = 'bonus',
  PENALTY = 'penalty',
  ADJUSTMENT = 'adjustment',
  PAYOUT = 'payout',
}

export enum InviteStatus {
  NEW = 'new',
  ACCEPTED = 'accepted',
  EXPIRED = 'expired',
  CANCELLED = 'cancelled',
}

export enum ToolCondition {
  NEW = 'new',
  GOOD = 'good',
  WORN = 'worn',
  DAMAGED = 'damaged',
  LOST = 'lost',
}

export enum AuditAction {
  PHOTO_APPROVED = 'photo.approved',
  PHOTO_REJECTED = 'photo.rejected',
  SHIFT_CANCELLED = 'shift.cancelled',
  TASK_CREATED = 'task.created',
  TASK_ASSIGNED = 'task.assigned',
  TASK_STATUS_CHANGED = 'task.status_changed',
  USER_BLOCKED = 'user.blocked',
  USER_UNBLOCKED = 'user.unblocked',
  PAYMENT_APPROVED = 'payment.approved',
  PAYMENT_CANCELLED = 'payment.cancelled',
  SETTINGS_UPDATED = 'settings.updated',
  TOOL_ASSIGNED = 'tool.assigned',
  TOOL_RETURNED = 'tool.returned',
}

// ==========================================
// API Response Types
// ==========================================

export interface ApiResponse<T> {
  data: T
  meta?: PaginationMeta
}

export interface PaginationMeta {
  total: number
  page: number
  per_page: number
  total_pages: number
}

export interface ApiError {
  error: {
    code: string
    message: string
    details?: Record<string, string[]>
  }
}

export interface PaginationParams {
  page?: number
  per_page?: number
  sort_by?: string
  sort_order?: 'asc' | 'desc'
}

// ==========================================
// Domain Models
// ==========================================

export interface User {
  id: string
  phone: string
  email: string | null
  first_name: string
  last_name: string
  patronymic: string | null
  role: UserRole
  is_active: boolean
  avatar_url: string | null
  hourly_rate: string | null
  created_at: string
  updated_at: string
  last_active_at: string | null
}

export interface UserProfile extends User {
  total_hours: number
  total_shifts: number
  approved_photos: number
  rejected_photos: number
  current_shift: Shift | null
  team: Team | null
  foreman: User | null
}

export interface Team {
  id: string
  name: string
  foreman_id: string
  foreman: User | null
  member_count: number
  created_at: string
}

export interface TeamMember {
  id: string
  user_id: string
  team_id: string
  user: User
  joined_at: string
}

export interface Invite {
  id: string
  code: string
  foreman_id: string
  foreman: User | null
  team_id: string
  status: InviteStatus
  max_uses: number
  used_count: number
  expires_at: string
  created_at: string
}

export interface Shift {
  id: string
  user_id: string
  user: User | null
  status: ShiftStatus
  started_at: string
  finished_at: string | null
  total_duration_minutes: number | null
  pause_duration_minutes: number
  photo_count: number
  approved_photo_count: number
  hourly_rate: string
  total_payment: string | null
  site_object_id: string | null
  site_object: SiteObject | null
  notes: string | null
  created_at: string
}

export interface ShiftPause {
  id: string
  shift_id: string
  started_at: string
  ended_at: string | null
  reason: string | null
}

export interface ShiftPhoto {
  id: string
  shift_id: string
  shift: Shift | null
  user_id: string
  user: User | null
  hour_index: number
  photo_url: string
  thumbnail_url: string | null
  status: PhotoStatus
  reviewer_id: string | null
  reviewer: User | null
  review_comment: string | null
  reviewed_at: string | null
  uploaded_at: string
}

export interface Task {
  id: string
  title: string
  description: string | null
  priority: TaskPriority
  status: TaskStatus
  assignee_id: string | null
  assignee: User | null
  creator_id: string
  creator: User | null
  deadline: string | null
  site_object_id: string | null
  site_object: SiteObject | null
  completed_at: string | null
  created_at: string
  updated_at: string
}

export interface TaskComment {
  id: string
  task_id: string
  user_id: string
  user: User | null
  text: string
  created_at: string
}

export interface SupportTicket {
  id: string
  user_id: string
  user: User | null
  subject: string
  category: TicketCategory
  priority: TicketPriority
  status: TicketStatus
  assigned_to_id: string | null
  assigned_to: User | null
  unread_count: number
  created_at: string
  updated_at: string
}

export interface SupportMessage {
  id: string
  ticket_id: string
  user_id: string
  user: User | null
  text: string
  is_internal: boolean
  attachment_url: string | null
  created_at: string
}

export interface Tool {
  id: string
  name: string
  type: string
  serial_number: string | null
  condition: ToolCondition
  assigned_to_id: string | null
  assigned_to: User | null
  assigned_at: string | null
  return_date: string | null
  notes: string | null
  created_at: string
  updated_at: string
}

export interface ToolTransaction {
  id: string
  tool_id: string
  tool: Tool | null
  user_id: string
  user: User | null
  action: 'issued' | 'returned'
  condition_before: ToolCondition
  condition_after: ToolCondition
  notes: string | null
  created_at: string
}

export interface Wallet {
  id: string
  user_id: string
  balance: string
  total_earned: string
  total_paid: string
}

export interface WalletTransaction {
  id: string
  wallet_id: string
  type: TransactionType
  amount: string
  balance_after: string
  description: string | null
  reference_id: string | null
  created_at: string
}

export interface Payout {
  id: string
  user_id: string
  user: User | null
  amount: string
  status: PaymentStatus
  items: PayoutItem[]
  created_at: string
  approved_at: string | null
  paid_at: string | null
}

export interface PayoutItem {
  id: string
  payout_id: string
  source_type: string
  source_id: string
  amount: string
  description: string
}

export interface SiteObject {
  id: string
  name: string
  address: string | null
  latitude: number | null
  longitude: number | null
}

export interface RealSiteObject {
  id: string
  name: string
  address: string | null
  status: string
  coordinator_id: string | null
  coordinator_name: string | null
  measurements: Record<string, unknown>
  comments: string | null
  active_shifts_count: number
  created_at: string | null
  updated_at: string | null
}

export interface SiteObjectActivity {
  id: string
  type: string
  description: string
  user_name: string | null
  timestamp: string | null
}

export interface AuditLogEntry {
  id: string
  actor_id: string
  actor: User | null
  action: string
  entity_type: string
  entity_id: string
  old_data: Record<string, unknown> | null
  new_data: Record<string, unknown> | null
  ip_address: string
  created_at: string
}

export interface SystemLog {
  id: string
  level: 'DEBUG' | 'INFO' | 'WARNING' | 'ERROR' | 'CRITICAL'
  message: string
  service: string
  request_id: string | null
  user_id: string | null
  duration_ms: number | null
  created_at: string
}

export interface Notification {
  id: string
  user_id: string
  title: string
  body: string
  type: string
  is_read: boolean
  entity_type: string | null
  entity_id: string | null
  created_at: string
}

// ==========================================
// Dashboard / Analytics
// ==========================================

export interface DashboardOverview {
  active_shifts: number
  shifts_today: number
  pending_photos: number
  overdue_tasks: number
  open_tickets: number
  total_payouts_this_month: string
  active_shifts_change: number
  shifts_today_change: number
  pending_photos_change: number
  overdue_tasks_change: number
}

export interface ActivityFeedItem {
  id: string
  type: 'shift_started' | 'shift_finished' | 'photo_uploaded' | 'task_completed' | 'message_received' | 'ticket_created'
  user: User
  description: string
  timestamp: string
  entity_id: string | null
}

export interface ChartDataPoint {
  date: string
  value: number
  label?: string
}

// ==========================================
// Auth Types
// ==========================================

export interface LoginCredentials {
  email: string
  password: string
}

/**
 * Универсальный запрос логина: login может быть телефоном, email или username
 */
export interface LoginRequest {
  login: string
  password: string
}

export interface LoginResponse {
  token: string
  user: RealUserResponse
}

export interface PhoneAuthRequest {
  phone: string
}

export interface OtpVerifyRequest {
  phone: string
  code: string
}

export interface VerifyResponse {
  status: string
  token: string
  phone: string
  is_new: boolean
  role: string
}

export interface AuthTokens {
  access_token: string
  refresh_token: string
  token_type: string
  expires_in: number
}

export interface AuthState {
  user: User | null
  isAuthenticated: boolean
  isLoading: boolean
}

// ==========================================
// Real API Response Types
// ==========================================

export interface RealDashboardStats {
  total_installers: number
  active_installers_today: number
  total_foremen: number
  active_foremen_today: number
  total_coordinators: number
  active_coordinators_today: number
  pending_photos: number
  total_shifts_today: number
  total_tools: number
  tools_issued: number
  open_support_tickets: number
  average_completion_percentage: number
}

export interface RealUserOut {
  id: string
  phone: string
  full_name: string | null
  first_name: string | null
  last_name: string | null
  role: string
  foreman_id: string | null
  foreman_name: string | null
  last_activity_at: string | null
  is_active_today: boolean
  pending_photos_count: number
  total_shifts: number
  total_hours: number
  created_at: string
}

export interface RealUserDetailOut {
  id: string
  phone: string
  full_name: string | null
  first_name: string | null
  last_name: string | null
  role: string
  foreman_id: string | null
  foreman_name: string | null
  team_members: Array<{ id: string; phone: string; full_name: string | null }>
  total_shifts: number
  total_hours: number
  pending_photos_count: number
  approved_photos_count: number
  rejected_photos_count: number
  active_tasks_count: number
  completed_tasks_count: number
  last_activity_at: string | null
  current_shift_id: string | null
  is_on_shift: boolean
  current_shift_start_at: string | null
  current_shift_photos_count: number
  current_shift_elapsed_hours: number
  total_photos: number
  shift_ended_at: string | null
  is_paused: boolean
  is_idle: boolean
  shift_status: string
  city: string | null
  email: string | null
  telegram: string | null
  about: string | null
  created_at: string
}

export interface RealCuratorPhotoOut {
  id: string
  user_id: string
  user_phone: string
  user_name: string | null
  foreman_id: string | null
  foreman_name: string | null
  photo_url: string
  shift_id: string
  timestamp: string
  status: string
  comment: string | null
  category: string
}

export interface RealShiftItem {
  id: string
  user_id: string
  user_name: string | null
  start_at: string
  finish_at: string | null
  duration_hours: number | null
  status: string
}

export interface RealTaskOut {
  id: string
  created_by: string
  assigned_to: string
  title: string
  description: string | null
  status: string
  priority: string
  due_at: string | null
  meta: Record<string, unknown>
  created_at: string
  updated_at: string
}

export interface RealCuratorForemanOut {
  id: string
  phone: string
  full_name: string | null
  first_name: string | null
  last_name: string | null
  team_size: number
  active_installers_count: number
  total_shifts_today: number
  tools_count: number
  active_tools_issued: number
  pending_photos_count: number
  completion_percentage: number
  created_at: string
  installers: Array<{
    id: string
    phone: string
    full_name: string | null
    first_name: string | null
    last_name: string | null
  }>
}

export interface RealTicketOut {
  id: string
  user_id: string
  title: string
  category: string
  status: string
  created_at: string
  updated_at: string
}

export interface RealMessageOut {
  id: string
  ticket_id: string
  sender_role: string
  sender_user_id: string | null
  text: string
  is_internal: boolean
  created_at: string
}

export interface RealToolOut {
  id: string
  name: string
  description: string | null
  serial_number: string | null
  photo_url: string | null
  foreman_id: string
  foreman: { id: string; phone: string; full_name: string | null } | null
  status: string
  created_at: string
  updated_at: string
}

export interface RealUserResponse {
  id: string
  phone: string
  role: string
  first_name: string | null
  last_name: string | null
  full_name: string
  short_id: string | null
  foreman_id: string | null
  created_at: string
}

// ==========================================
// Settings
// ==========================================

export interface SystemSettings {
  moderation_policy: {
    auto_approve_enabled: boolean
    require_comment_on_reject: boolean
    max_pending_hours: number
  }
  shift_limits: {
    max_shift_duration_hours: number
    max_pause_duration_minutes: number
    max_pauses_per_shift: number
    require_photo_every_hours: number
  }
  task_sla: {
    default_deadline_hours: number
    overdue_warning_hours: number
  }
  notification_rules: {
    notify_on_shift_start: boolean
    notify_on_photo_reject: boolean
    notify_on_task_assign: boolean
    notify_on_ticket_reply: boolean
  }
}
