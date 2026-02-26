import apiClient from '@/shared/api/client'
import type {
  LoginRequest,
  LoginResponse,
  PhoneAuthRequest,
  OtpVerifyRequest,
  VerifyResponse,
  RealUserResponse,
} from '@/shared/types'

export const authApi = {
  /** Логин по логину+паролю (телефон / email / username) */
  login(data: LoginRequest) {
    return apiClient.post<LoginResponse>('/auth/login', data)
  },

  /** Step 1: Send OTP to phone number (для мобильных) */
  sendOtp(data: PhoneAuthRequest) {
    return apiClient.post<{ status: string }>('/auth/phone', data)
  },

  /** Step 2: Verify OTP code — returns JWT token (для мобильных) */
  verifyOtp(data: OtpVerifyRequest) {
    return apiClient.post<VerifyResponse>('/auth/verify', data)
  },

  /** Get current user info */
  me() {
    return apiClient.get<RealUserResponse>('/user/me')
  },

  logout() {
    localStorage.removeItem('auth_token')
  },
}
