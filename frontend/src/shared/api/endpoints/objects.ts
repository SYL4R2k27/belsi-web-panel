import apiClient from '@/shared/api/client'
import type { RealSiteObject, SiteObjectActivity } from '@/shared/types'

// --- API ---

export const objectsApi = {
  /** GET /curator/objects — list all site objects */
  list(params?: { status?: string }) {
    return apiClient.get<{ objects: RealSiteObject[] }>('/curator/objects', { params })
  },

  /** GET /curator/objects/:id — get site object detail */
  get(id: string) {
    return apiClient.get<RealSiteObject>(`/curator/objects/${id}`)
  },

  /** POST /curator/objects — create new site object */
  create(data: { name: string; address?: string; coordinator_id?: string }) {
    return apiClient.post<{ success: boolean; object: RealSiteObject }>('/curator/objects', data)
  },

  /** PATCH /curator/objects/:id — update site object */
  update(id: string, data: { name?: string; address?: string | null; status?: string; comments?: string | null }) {
    return apiClient.patch<{ success: boolean }>(`/curator/objects/${id}`, data)
  },

  /** POST /curator/objects/:id/assign-coordinator */
  assignCoordinator(id: string, coordinatorId: string | null) {
    return apiClient.post<{ success: boolean }>(`/curator/objects/${id}/assign-coordinator`, {
      coordinator_id: coordinatorId,
    })
  },

  /** GET /curator/objects/:id/activity — recent activity */
  activity(id: string, limit?: number) {
    return apiClient.get<{ activities: SiteObjectActivity[] }>(`/curator/objects/${id}/activity`, {
      params: { limit },
    })
  },

  /** GET /coordinator/site — get coordinator's site info (legacy) */
  getCoordinatorSite() {
    return apiClient.get('/coordinator/site')
  },
}
