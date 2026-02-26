import apiClient from '@/shared/api/client'

// --- Types ---

export interface ProfileOut {
  id: string
  phone: string
  role: string
  first_name: string | null
  last_name: string | null
  full_name: string | null
  email: string | null
  city: string | null
  telegram: string | null
  about: string | null
  avatar_url: string | null
  created_at: string
}

export interface UpdateProfileData {
  first_name?: string
  last_name?: string
  email?: string
  city?: string
  telegram?: string
  about?: string
}

export interface UpdateNameData {
  first_name: string
  last_name: string
}

export interface ChangePasswordData {
  current_password: string
  new_password: string
}

export interface SetPasswordData {
  user_id: string
  new_password: string
}

export interface PasswordResponse {
  success: boolean
  message: string
}

// --- API ---

export const profileApi = {
  /** GET /profile/me — get current user profile */
  me() {
    return apiClient.get<ProfileOut>('/profile/me')
  },

  /** PUT /profile/me — update current user profile */
  update(data: UpdateProfileData) {
    return apiClient.put<ProfileOut>('/profile/me', data)
  },

  /** PUT /user/me/name — update name */
  updateName(data: UpdateNameData) {
    return apiClient.put('/user/me/name', data)
  },

  /** POST /auth/change-password — change own password */
  changePassword(data: ChangePasswordData) {
    return apiClient.post<PasswordResponse>('/auth/change-password', data)
  },

  /** POST /curator/set-password — curator sets password for any user */
  setPassword(data: SetPasswordData) {
    return apiClient.post<PasswordResponse>('/curator/set-password', data)
  },
}
