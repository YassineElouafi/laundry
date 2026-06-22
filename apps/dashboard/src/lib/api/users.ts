import { api } from './client'
import type { InfinityPaginated, UserDto } from './types'

export async function listUsers(): Promise<UserDto[]> {
  const { data } = await api.get<InfinityPaginated<UserDto>>('/users', {
    params: { limit: 50 },
  })
  return data.data
}

export function hasRole(u: UserDto, role: string): boolean {
  return (u.role?.name ?? '').toLowerCase() === role
}

export async function listDrivers(): Promise<UserDto[]> {
  return (await listUsers()).filter((u) => hasRole(u, 'driver'))
}
