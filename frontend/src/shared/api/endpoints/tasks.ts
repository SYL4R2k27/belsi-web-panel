import apiClient from '@/shared/api/client'
import type { RealTaskOut } from '@/shared/types'

// --- Filters ---

export interface TasksFilters {
  status?: string
  limit?: number
  offset?: number
}

// --- Request types ---

export interface CreateTaskData {
  title: string
  description?: string
  target_user_ids?: string[]
  deadline?: string
  priority: string
}

export interface PatchTaskData {
  title?: string
  description?: string
  status?: string
  priority?: string
  deadline?: string
}

// --- API ---

export const tasksApi = {
  /** GET /tasks/created — list tasks created by current user */
  list(params?: TasksFilters) {
    return apiClient.get<RealTaskOut[]>('/tasks/created', { params })
  },

  /** GET /tasks/{task_id} — task detail */
  get(taskId: string) {
    return apiClient.get<RealTaskOut>(`/tasks/${taskId}`)
  },

  /** POST /curator/tasks — create task (curator) */
  create(data: CreateTaskData) {
    return apiClient.post('/curator/tasks', data)
  },

  /** PATCH /tasks/{task_id} — update task */
  update(taskId: string, data: PatchTaskData) {
    return apiClient.patch(`/tasks/${taskId}`, data)
  },

  /** DELETE /curator/tasks/{task_id} — delete task (curator) */
  delete(taskId: string) {
    return apiClient.delete(`/curator/tasks/${taskId}`)
  },
}
