import { api } from './client'
import type { AuthUser } from '@/stores/auth-store'

export interface BackendUser {
  id: number | string
  email: string
  firstName?: string | null
  lastName?: string | null
  phone?: string | null
  locale?: string | null
  role?: { id: number; name: string } | null
}

export interface LoginResponse {
  token: string
  refreshToken: string
  tokenExpires: number
  user: BackendUser
}

export function toAuthUser(user: BackendUser): AuthUser {
  return {
    id: user.id,
    email: user.email,
    role: (user.role?.name ?? '').toLowerCase(),
    firstName: user.firstName,
    lastName: user.lastName,
  }
}

export async function login(
  email: string,
  password: string
): Promise<LoginResponse> {
  const { data } = await api.post<LoginResponse>('/auth/email/login', {
    email,
    password,
  })
  return data
}

export async function fetchMe(): Promise<BackendUser> {
  const { data } = await api.get<BackendUser>('/auth/me')
  return data
}

export async function logout(): Promise<void> {
  await api.post('/auth/logout')
}
