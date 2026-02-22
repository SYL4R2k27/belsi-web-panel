import apiClient from '@/shared/api/client'

// --- Types ---

export interface SiteObjectOut {
  id: string
  name: string
  address: string | null
  latitude: number | null
  longitude: number | null
  coordinator_id?: string | null
  coordinator_name?: string | null
}

export interface UpdateSiteData {
  name?: string
  address?: string | null
  latitude?: number | null
  longitude?: number | null
}

// --- API ---

export const objectsApi = {
  /** GET /coordinator/site — get coordinator's site info */
  getCoordinatorSite() {
    return apiClient.get<SiteObjectOut>('/coordinator/site')
  },

  /** PUT /coordinator/site — update coordinator's site */
  updateCoordinatorSite(data: UpdateSiteData) {
    return apiClient.put<SiteObjectOut>('/coordinator/site', data)
  },
}
