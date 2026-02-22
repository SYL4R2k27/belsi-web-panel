import { createContext, useCallback, useContext, useEffect, useState, type ReactNode } from 'react'
import { authApi } from '@/shared/api/endpoints/auth'
import type { User, UserRole } from '@/shared/types'

interface AuthContextValue {
  user: User | null
  isAuthenticated: boolean
  isLoading: boolean
  sendOtp: (phone: string) => Promise<void>
  verifyOtp: (phone: string, code: string) => Promise<void>
  logout: () => void
}

const AuthContext = createContext<AuthContextValue | null>(null)

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [isLoading, setIsLoading] = useState(true)

  const fetchUser = useCallback(async () => {
    const token = localStorage.getItem('auth_token')
    if (!token) {
      setIsLoading(false)
      return
    }

    try {
      const { data } = await authApi.me()
      // Transform RealUserResponse → User
      setUser({
        id: data.id,
        phone: data.phone,
        email: null,
        first_name: data.first_name || data.full_name || '',
        last_name: data.last_name || '',
        patronymic: null,
        role: data.role as UserRole,
        is_active: true,
        avatar_url: null,
        hourly_rate: null,
        created_at: data.created_at,
        updated_at: data.created_at,
        last_active_at: null,
      })
    } catch {
      localStorage.removeItem('auth_token')
      setUser(null)
    } finally {
      setIsLoading(false)
    }
  }, [])

  useEffect(() => {
    fetchUser()
  }, [fetchUser])

  const sendOtp = useCallback(async (phone: string) => {
    await authApi.sendOtp({ phone })
  }, [])

  const verifyOtp = useCallback(async (phone: string, code: string) => {
    const { data } = await authApi.verifyOtp({ phone, code })
    localStorage.setItem('auth_token', data.token)
    await fetchUser()
  }, [fetchUser])

  const logout = useCallback(() => {
    authApi.logout()
    setUser(null)
  }, [])

  return (
    <AuthContext.Provider value={{ user, isAuthenticated: !!user, isLoading, sendOtp, verifyOtp, logout }}>
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const context = useContext(AuthContext)
  if (!context) {
    throw new Error('useAuth must be used within AuthProvider')
  }
  return context
}
