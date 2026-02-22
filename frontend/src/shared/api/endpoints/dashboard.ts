import apiClient from '@/shared/api/client'
import type { RealDashboardStats } from '@/shared/types'

export const dashboardApi = {
  /** GET /curator/dashboard → CuratorDashboardStats */
  overview() {
    return apiClient.get<RealDashboardStats>('/curator/dashboard')
  },

  /** GET /reports/curator/shifts — shift report */
  shiftReport(params?: { date_from?: string; date_to?: string }) {
    return apiClient.get('/reports/curator/shifts', { params })
  },
}
