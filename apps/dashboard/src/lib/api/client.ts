import axios, {
  AxiosError,
  type AxiosRequestConfig,
  type InternalAxiosRequestConfig,
} from 'axios'
import { useAuthStore } from '@/stores/auth-store'

// Use `||` (not `??`) so an empty build-arg falls back instead of producing an
// empty same-origin baseURL — an empty VITE_API_URL would otherwise send every
// request to the dashboard's own nginx (→ 405 on POST).
export const API_URL =
  import.meta.env.VITE_API_URL || 'http://localhost:3000/api/v1'

export const api = axios.create({
  baseURL: API_URL,
  headers: { 'Content-Type': 'application/json' },
})

// Attach the access token to every request.
api.interceptors.request.use((config: InternalAxiosRequestConfig) => {
  const token = useAuthStore.getState().auth.accessToken
  if (token) {
    config.headers.Authorization = `Bearer ${token}`
  }
  return config
})

// --- Refresh-token handling ----------------------------------------------
// On a 401 we try once to exchange the refresh token for a new access token
// (POST /auth/refresh with the refresh token as the Bearer credential), then
// replay the original request. Concurrent 401s share a single refresh call.
let refreshPromise: Promise<string> | null = null

async function refreshAccessToken(): Promise<string> {
  const { auth } = useAuthStore.getState()
  if (!auth.refreshToken) {
    throw new Error('No refresh token')
  }

  const response = await axios.post(
    `${API_URL}/auth/refresh`,
    {},
    { headers: { Authorization: `Bearer ${auth.refreshToken}` } }
  )

  const { token, refreshToken } = response.data as {
    token: string
    refreshToken: string
  }
  auth.setAccessToken(token)
  auth.setRefreshToken(refreshToken)
  return token
}

api.interceptors.response.use(
  (response) => response,
  async (error: AxiosError) => {
    const original = error.config as
      | (AxiosRequestConfig & { _retry?: boolean })
      | undefined

    const isAuthEndpoint = original?.url?.includes('/auth/')

    if (
      error.response?.status === 401 &&
      original &&
      !original._retry &&
      !isAuthEndpoint
    ) {
      original._retry = true
      try {
        refreshPromise = refreshPromise ?? refreshAccessToken()
        const newToken = await refreshPromise
        refreshPromise = null
        original.headers = {
          ...original.headers,
          Authorization: `Bearer ${newToken}`,
        }
        return api(original)
      } catch (refreshError) {
        refreshPromise = null
        useAuthStore.getState().auth.reset()
        throw refreshError
      }
    }

    throw error
  }
)
