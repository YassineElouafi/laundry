import { api } from './client'
import type { InfinityPaginated, PaymentDto } from './types'

export async function listPayments(params: {
  page?: number
  limit?: number
}): Promise<InfinityPaginated<PaymentDto>> {
  const { data } = await api.get<InfinityPaginated<PaymentDto>>('/payments', {
    params: { page: params.page ?? 1, limit: params.limit ?? 50 },
  })
  return data
}

export async function markCodPaid(id: string): Promise<PaymentDto> {
  const { data } = await api.post<PaymentDto>(`/payments/${id}/cod-paid`)
  return data
}
