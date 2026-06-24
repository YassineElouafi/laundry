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

const DRIVER_ROLE_ID = 3 // RoleEnum.driver
const ACTIVE_STATUS_ID = 1 // StatusEnum.active

export interface CreateDriverInput {
  firstName: string
  lastName: string
  email: string
  phone?: string
  password: string
}

export async function createDriver(input: CreateDriverInput): Promise<UserDto> {
  const { data } = await api.post<UserDto>('/users', {
    ...input,
    role: { id: DRIVER_ROLE_ID },
    status: { id: ACTIVE_STATUS_ID },
  })
  return data
}
