import apiClient from '@/shared/api/client'
import type {
  PhoneAuthRequest,
  OtpVerifyRequest,
  VerifyResponse,
  RealUserResponse,
} from '@/shared/types'

export const authApi = {
  /** Step 1: Send OTP to phone number */
  sendOtp(data: PhoneAuthRequest) {
    return apiClient.post<{ status: string }>('/auth/phone', data)
  },

  /** Step 2: Verify OTP code — returns JWT token */
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
