import apiClient from '@/shared/api/client'
import type { RealCuratorForemanOut } from '@/shared/types'

// --- Filters ---

export interface TeamsFilters {
  limit?: number
  offset?: number
}

// --- Response types ---

export interface InviteOut {
  id: string
  code: string
  foreman_id: string
  status: string
  created_at: string
  expires_at: string | null
}

// --- Request types ---

export interface CreateInviteData {
  [key: string]: unknown
}

export interface CancelInviteData {
  invite_id?: string
  [key: string]: unknown
}

// --- API ---

export const teamsApi = {
  /** GET /curator/foremen — list foremen with nested installers (this IS the teams endpoint) */
  list(params?: TeamsFilters) {
    return apiClient.get<RealCuratorForemanOut[]>('/curator/foremen', { params })
  },

  /** GET /foreman/invites — list invites */
  invites() {
    return apiClient.get<InviteOut[]>('/foreman/invites')
  },

  /** POST /foreman/invites — create invite */
  createInvite(data?: CreateInviteData) {
    return apiClient.post('/foreman/invites', data)
  },

  /** POST /foreman/invites/cancel — cancel invite */
  cancelInvite(data?: CancelInviteData) {
    return apiClient.post('/foreman/invites/cancel', data)
  },
}
