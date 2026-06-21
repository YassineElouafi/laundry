import { api } from './client'
import type { InfinityPaginated, UserDto } from './types'

export async function listUsers(): Promise<UserDto[]> {
  const { data } = await api.get<InfinityPaginated<UserDto>>('/users', {
    params: { limit: 50 },
  })
  return data.data
}
