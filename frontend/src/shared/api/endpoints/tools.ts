import apiClient from '@/shared/api/client'
import type { RealToolOut } from '@/shared/types'

// --- Filters ---

export interface ToolsFilters {
  status?: string
}

export interface ToolTransactionsFilters {
  status?: string
  installer_id?: string
  page?: number
  limit?: number
}

// --- Response types ---

export interface ToolsListResponse {
  items: RealToolOut[]
}

// --- Request types ---

export interface CreateToolData {
  name: string
  description?: string
  serial_number?: string
  photo_url?: string
  foreman_id: string
}

export interface IssueToolData {
  tool_id: string
  installer_id: string
}

// --- API ---

export const toolsApi = {
  /** GET /tools — list tools */
  list(params?: ToolsFilters) {
    return apiClient.get<ToolsListResponse>('/tools', { params })
  },

  /** POST /tools — create tool */
  create(data: CreateToolData) {
    return apiClient.post('/tools', data)
  },

  /** POST /curator/tools/issue — issue tool to installer (curator) */
  issue(data: IssueToolData) {
    return apiClient.post('/curator/tools/issue', data)
  },

  /** GET /curator/tools/transactions — tool transactions (curator) */
  transactions(params?: ToolTransactionsFilters) {
    return apiClient.get('/curator/tools/transactions', { params })
  },
}
