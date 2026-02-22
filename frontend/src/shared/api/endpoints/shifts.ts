import apiClient from '@/shared/api/client'
import type { RealShiftItem } from '@/shared/types'

// --- Filters ---

export interface ShiftsFilters {
  status?: string
  user_id?: string
  date_from?: string
  date_to?: string
}

// --- Response types ---

export interface ShiftsListResponse {
  items: RealShiftItem[]
}

export interface ShiftPhotoOut {
  id: string
  photo_url: string
  timestamp: string
  status: string
  comment: string | null
  category: string
}

// --- API ---

export const shiftsApi = {
  /** GET /shifts — list shifts */
  list(params?: ShiftsFilters) {
    return apiClient.get<ShiftsListResponse>('/shifts', { params })
  },

  /** GET /shifts/{shift_id} — shift detail */
  get(shiftId: string) {
    return apiClient.get(`/shifts/${shiftId}`)
  },

  /** GET /shifts/{shift_id}/photos — shift photos */
  photos(shiftId: string) {
    return apiClient.get<ShiftPhotoOut[]>(`/shifts/${shiftId}/photos`)
  },

  /** DELETE /curator/shifts/{shift_id} — delete shift (curator) */
  delete(shiftId: string) {
    return apiClient.delete(`/curator/shifts/${shiftId}`)
  },
}
