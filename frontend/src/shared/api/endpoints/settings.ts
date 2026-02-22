import apiClient from '@/shared/api/client'
import type { ApiResponse, SystemSettings } from '@/shared/types'

// --- API (mock-only, no real backend endpoints) ---

export const settingsApi = {
  get() {
    return apiClient.get<ApiResponse<SystemSettings>>('/settings')
  },

  update(data: Partial<SystemSettings>) {
    return apiClient.patch<ApiResponse<SystemSettings>>('/settings', data)
  },
}
