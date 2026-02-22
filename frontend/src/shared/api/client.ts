import axios from 'axios'

const useMocks = import.meta.env.VITE_USE_MOCKS === 'true'

// Dev: empty baseURL → requests go to localhost, Vite proxy forwards to api.belsi.ru
// Prod: VITE_API_BASE_URL = https://api.belsi.ru (set in .env.production)
// Mock: MSW intercepts relative URLs on the same origin
const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || ''

const apiClient = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
  timeout: 30000,
})

// Attach auth token to every request
apiClient.interceptors.request.use((config) => {
  const token = localStorage.getItem('auth_token')
  if (token) {
    config.headers.Authorization = `Bearer ${token}`
  }
  return config
})

// Handle 401 — redirect to login
apiClient.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      // Don't redirect if we're already on auth endpoints
      const url = error.config?.url || ''
      if (!url.includes('/auth/')) {
        localStorage.removeItem('auth_token')
        const base = import.meta.env.BASE_URL.replace(/\/$/, '')
        window.location.href = `${base}/login`
      }
    }
    return Promise.reject(error)
  },
)

export default apiClient
export { useMocks }
