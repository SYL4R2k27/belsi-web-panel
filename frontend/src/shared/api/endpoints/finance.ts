import apiClient from '@/shared/api/client'
import type { ApiResponse, PaginationParams, Payout, PaymentStatus, WalletTransaction } from '@/shared/types'

// --- Filters ---

export interface PayoutsFilters extends PaginationParams {
  status?: PaymentStatus
  user_id?: string
  date_from?: string
  date_to?: string
}

// --- API (mock-only, no real backend endpoints) ---

export const financeApi = {
  payouts(params?: PayoutsFilters) {
    return apiClient.get<ApiResponse<Payout[]>>('/finance/payouts', { params })
  },

  payout(id: string) {
    return apiClient.get<ApiResponse<Payout>>(`/finance/payouts/${id}`)
  },

  approvePayout(id: string) {
    return apiClient.post<ApiResponse<Payout>>(`/finance/payouts/${id}/approve`)
  },

  transactions(params?: PaginationParams & { user_id?: string }) {
    return apiClient.get<ApiResponse<WalletTransaction[]>>('/finance/transactions', { params })
  },

  summary(params?: { date_from?: string; date_to?: string }) {
    return apiClient.get<ApiResponse<{
      total_payouts: string
      pending_amount: string
      approved_amount: string
      paid_amount: string
      avg_per_installer: string
    }>>('/finance/summary', { params })
  },
}
