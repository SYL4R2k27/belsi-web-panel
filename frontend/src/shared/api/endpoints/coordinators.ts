import apiClient from '@/shared/api/client'

// --- Response types ---

export interface CoordinatorDashboard {
  total_team_members: number
  active_today: number
  pending_photos: number
  total_tasks: number
  completed_tasks: number
  site_name: string | null
}

export interface CoordinatorTeamMember {
  id: string
  phone: string
  full_name: string | null
  role: string
  is_active_today: boolean
  last_activity_at: string | null
}

export interface CoordinatorPhoto {
  id: string
  user_id: string
  user_name: string | null
  photo_url: string
  shift_id: string
  timestamp: string
  status: string
  comment: string | null
}

export interface CoordinatorReport {
  id: string
  title: string
  content: string
  created_at: string
  updated_at: string
}

export interface CoordinatorSite {
  id: string
  name: string
  address: string | null
  latitude: number | null
  longitude: number | null
}

export interface CoordinatorTask {
  id: string
  title: string
  description: string | null
  status: string
  assigned_to: string | null
  created_at: string
  updated_at: string
}

// --- Request types ---

export interface CoordinatorPhotosFilters {
  limit?: number
  offset?: number
}

export interface CoordinatorTasksFilters {
  limit?: number
  offset?: number
  status?: string
}

export interface CreateReportData {
  title: string
  content: string
}

export interface UpdateReportData {
  title?: string
  content?: string
}

export interface UpdateSiteData {
  name?: string
  address?: string | null
  latitude?: number | null
  longitude?: number | null
}

export interface CreateTaskData {
  title: string
  description?: string
  assigned_to?: string
}

// --- API ---

export const coordinatorsApi = {
  /** GET /coordinator/dashboard — coordinator dashboard stats */
  dashboard() {
    return apiClient.get<CoordinatorDashboard>('/coordinator/dashboard')
  },

  /** GET /coordinator/photos — coordinator photos list */
  photos(params?: CoordinatorPhotosFilters) {
    return apiClient.get<CoordinatorPhoto[]>('/coordinator/photos', { params })
  },

  /** POST /coordinator/photos/{photo_id}/approve — approve photo */
  approvePhoto(photoId: string) {
    return apiClient.post(`/coordinator/photos/${photoId}/approve`)
  },

  /** POST /coordinator/photos/{photo_id}/reject — reject photo */
  rejectPhoto(photoId: string) {
    return apiClient.post(`/coordinator/photos/${photoId}/reject`)
  },

  /** GET /coordinator/reports — coordinator reports list */
  reports() {
    return apiClient.get<CoordinatorReport[]>('/coordinator/reports')
  },

  /** POST /coordinator/reports — create report */
  createReport(data: CreateReportData) {
    return apiClient.post<CoordinatorReport>('/coordinator/reports', data)
  },

  /** PUT /coordinator/reports/{report_id} — update report */
  updateReport(reportId: string, data: UpdateReportData) {
    return apiClient.put<CoordinatorReport>(`/coordinator/reports/${reportId}`, data)
  },

  /** GET /coordinator/site — coordinator site info */
  site() {
    return apiClient.get<CoordinatorSite>('/coordinator/site')
  },

  /** PUT /coordinator/site — update coordinator site */
  updateSite(data: UpdateSiteData) {
    return apiClient.put<CoordinatorSite>('/coordinator/site', data)
  },

  /** GET /coordinator/tasks — coordinator tasks list */
  tasks(params?: CoordinatorTasksFilters) {
    return apiClient.get<CoordinatorTask[]>('/coordinator/tasks', { params })
  },

  /** POST /coordinator/tasks — create task */
  createTask(data: CreateTaskData) {
    return apiClient.post<CoordinatorTask>('/coordinator/tasks', data)
  },

  /** GET /coordinator/team — coordinator team members */
  team() {
    return apiClient.get<CoordinatorTeamMember[]>('/coordinator/team')
  },
}
