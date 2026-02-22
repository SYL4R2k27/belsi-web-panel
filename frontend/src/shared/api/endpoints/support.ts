import apiClient from '@/shared/api/client'
import type { RealTicketOut, RealMessageOut } from '@/shared/types'

// --- Filters ---

export interface CuratorTicketsFilters {
  status?: string
  limit?: number
}

export interface UserTicketsFilters {
  limit?: number
  offset?: number
}

// --- Response types ---

export interface TicketWithMessagesOut {
  ticket: RealTicketOut
  messages: RealMessageOut[]
}

// --- Request types ---

export interface SendMessageData {
  text: string
  is_internal?: boolean
  photo_url?: string
}

// --- API ---

export const supportApi = {
  /** GET /curator/support — list tickets (curator view) */
  curatorTickets(params?: CuratorTicketsFilters) {
    return apiClient.get('/curator/support', { params })
  },

  /** GET /support/tickets — list own tickets */
  tickets(params?: UserTicketsFilters) {
    return apiClient.get<RealTicketOut[]>('/support/tickets', { params })
  },

  /** GET /support/tickets/{ticket_id} — ticket with messages */
  ticket(ticketId: string) {
    return apiClient.get<TicketWithMessagesOut>(`/support/tickets/${ticketId}`)
  },

  /** GET /support/tickets/{ticket_id}/messages — ticket messages */
  messages(ticketId: string) {
    return apiClient.get<RealMessageOut[]>(`/support/tickets/${ticketId}/messages`)
  },

  /** POST /support/tickets/{ticket_id}/messages — send message */
  sendMessage(ticketId: string, data: SendMessageData) {
    return apiClient.post(`/support/tickets/${ticketId}/messages`, data)
  },
}
