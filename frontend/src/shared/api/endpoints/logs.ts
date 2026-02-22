import apiClient from '@/shared/api/client'
import type { ApiResponse, AuditLogEntry, PaginationParams, SystemLog } from '@/shared/types'

// --- Filters ---

export interface AuditLogFilters extends PaginationParams {
  actor_id?: string
  action?: string
  entity_type?: string
  date_from?: string
  date_to?: string
}

export interface SystemLogFilters extends PaginationParams {
  level?: string
  service?: string
  search?: string
  date_from?: string
  date_to?: string
}

// --- API (mock-only, no real backend endpoints) ---

export const logsApi = {
  audit(params?: AuditLogFilters) {
    return apiClient.get<ApiResponse<AuditLogEntry[]>>('/logs/audit', { params })
  },

  system(params?: SystemLogFilters) {
    return apiClient.get<ApiResponse<SystemLog[]>>('/logs/system', { params })
  },
}
