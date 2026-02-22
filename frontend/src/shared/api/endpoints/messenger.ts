import apiClient from '@/shared/api/client'

// --- Response types ---

export interface ContactOut {
  id: string
  full_name: string
  phone: string
  role: string
}

export interface MessageOut {
  id: string
  thread_id: string
  sender_id: string
  sender_name: string
  sender_role: string
  message_type: string
  text: string | null
  photo_url: string | null
  voice_url: string | null
  voice_duration_seconds: number | null
  reply_to_id: string | null
  created_at: string
}

export interface ThreadOut {
  id: string
  type: string
  name: string | null
  avatar_url: string | null
  created_at: string
  updated_at: string
  last_message: MessageOut | null
  unread_count: number
  participants: ContactOut[]
}

export interface ThreadListResponse {
  threads: ThreadOut[]
}

export interface MessagesResponse {
  messages: MessageOut[]
  has_more: boolean
}

// --- Request types ---

export interface CreateThreadRequest {
  type: string
  name?: string
  participant_ids: string[]
}

export interface UpdateThreadRequest {
  name?: string
}

export interface SendMessageRequest {
  text?: string
  photo_url?: string
  voice_url?: string
  voice_duration_seconds?: number
  message_type?: string
  reply_to_id?: string
}

export interface AddMembersRequest {
  user_ids: string[]
}

// --- API ---

export const messengerApi = {
  /** GET /messenger/contacts — list contacts */
  contacts() {
    return apiClient.get<ContactOut[]>('/messenger/contacts')
  },

  /** GET /messenger/threads — list threads */
  threads() {
    return apiClient.get<ThreadListResponse>('/messenger/threads')
  },

  /** POST /messenger/threads — create thread */
  createThread(data: CreateThreadRequest) {
    return apiClient.post<ThreadOut>('/messenger/threads', data)
  },

  /** PUT /messenger/threads/{thread_id} — update thread */
  updateThread(threadId: string, data: UpdateThreadRequest) {
    return apiClient.put('/messenger/threads/' + threadId, data)
  },

  /** GET /messenger/threads/{thread_id}/messages — thread messages */
  messages(threadId: string) {
    return apiClient.get<MessagesResponse>('/messenger/threads/' + threadId + '/messages')
  },

  /** POST /messenger/threads/{thread_id}/messages — send message */
  sendMessage(threadId: string, data: SendMessageRequest) {
    return apiClient.post<MessageOut>('/messenger/threads/' + threadId + '/messages', data)
  },

  /** POST /messenger/threads/{thread_id}/read — mark thread as read */
  markRead(threadId: string) {
    return apiClient.post('/messenger/threads/' + threadId + '/read')
  },

  /** POST /messenger/threads/{thread_id}/members — add members */
  addMembers(threadId: string, data: AddMembersRequest) {
    return apiClient.post('/messenger/threads/' + threadId + '/members', data)
  },

  /** DELETE /messenger/threads/{thread_id}/members/{user_id} — remove member */
  removeMember(threadId: string, userId: string) {
    return apiClient.delete('/messenger/threads/' + threadId + '/members/' + userId)
  },
}
