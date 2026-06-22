import { api } from './client'
import type { InfinityPaginated, OrderDto, OrderStatus } from './types'

export async function listOrders(params: {
  page?: number
  limit?: number
}): Promise<InfinityPaginated<OrderDto>> {
  const { data } = await api.get<InfinityPaginated<OrderDto>>(
    '/orders/admin/all',
    { params: { page: params.page ?? 1, limit: params.limit ?? 50 } }
  )
  return data
}

export async function getOrder(id: string): Promise<OrderDto> {
  // Admin-scoped detail (the plain GET /orders/:id is restricted to the owner).
  const { data } = await api.get<OrderDto>(`/orders/admin/${id}`)
  return data
}

export async function advanceOrderStatus(
  id: string,
  status: OrderStatus,
  note?: string
): Promise<OrderDto> {
  const { data } = await api.patch<OrderDto>(`/orders/${id}/status`, {
    status,
    note,
  })
  return data
}

export async function assignDriver(
  id: string,
  driverId: number | string
): Promise<OrderDto> {
  const { data } = await api.patch<OrderDto>(
    `/orders/admin/${id}/assign-driver`,
    { driverId }
  )
  return data
}
