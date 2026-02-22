import apiClient from '@/shared/api/client'
import type { RealCuratorPhotoOut } from '@/shared/types'

// --- Filters ---

export interface PhotosFilters {
  limit?: number
  user_id?: string
  shift_id?: string
  status?: string
}

// --- Response types ---

export interface PhotosListResponse {
  photos: RealCuratorPhotoOut[]
}

// --- API ---

export const photosApi = {
  /** GET /curator/photos — list photos (curator) */
  list(params?: PhotosFilters) {
    return apiClient.get<PhotosListResponse>('/curator/photos', { params })
  },

  /** GET /curator/photos/latest — latest photos */
  latest() {
    return apiClient.get<PhotosListResponse>('/curator/photos/latest')
  },

  /** POST /curator/photos/{photo_id}/approve */
  approve(photoId: string, comment?: string) {
    return apiClient.post(`/curator/photos/${photoId}/approve`, { comment })
  },

  /** POST /curator/photos/{photo_id}/reject */
  reject(photoId: string, reason?: string) {
    return apiClient.post(`/curator/photos/${photoId}/reject`, { reason })
  },
}
