import apiClient from '@/shared/api/client'
import type {
  RealUserOut,
  RealUserDetailOut,
  RealCuratorForemanOut,
  UserRole,
} from '@/shared/types'

// --- Filters ---

export interface UsersFilters {
  role?: UserRole | string
  limit?: number
  offset?: number
}

export interface ForemenFilters {
  limit?: number
  offset?: number
}

export interface UnassignedInstallersFilters {
  limit?: number
  offset?: number
}

// --- Response types ---

export interface DeleteUserResponse {
  status: string
  message?: string
}

export interface ChangeRoleData {
  role: string
}

// --- API ---

export const usersApi = {
  /** GET /curator/users/all — list all users (curator) */
  list(params?: UsersFilters) {
    return apiClient.get<RealUserOut[]>('/curator/users/all', { params })
  },

  /** GET /curator/users/{user_id} — user detail (curator) */
  get(userId: string) {
    return apiClient.get<RealUserDetailOut>(`/curator/users/${userId}`)
  },

  /** DELETE /curator/users/{user_id} — delete user (curator) */
  delete(userId: string) {
    return apiClient.delete<DeleteUserResponse>(`/curator/users/${userId}`)
  },

  /** POST /curator/users/{user_id}/role — change user role (curator) */
  changeRole(userId: string, data: ChangeRoleData) {
    return apiClient.post(`/curator/users/${userId}/role`, data)
  },

  /** GET /curator/foremen — list foremen with nested installers */
  foremen(params?: ForemenFilters) {
    return apiClient.get<RealCuratorForemanOut[]>('/curator/foremen', { params })
  },

  /** GET /curator/installers/unassigned — unassigned installers */
  unassignedInstallers(params?: UnassignedInstallersFilters) {
    return apiClient.get('/curator/installers/unassigned', { params })
  },
}
