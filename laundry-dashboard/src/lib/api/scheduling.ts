import { api } from './client'
import type { InfinityPaginated, SlotType, TimeSlotDto } from './types'

export async function listTimeSlots(): Promise<TimeSlotDto[]> {
  const { data } = await api.get<InfinityPaginated<TimeSlotDto>>('/time-slots', {
    params: { limit: 50 },
  })
  return data.data
}

export interface TimeSlotInput {
  date: string // YYYY-MM-DD
  windowStart: string // HH:mm
  windowEnd: string // HH:mm
  capacity: number
  slotType: SlotType
  active?: boolean
}

export async function createTimeSlot(
  input: TimeSlotInput
): Promise<TimeSlotDto> {
  const { data } = await api.post<TimeSlotDto>('/time-slots', input)
  return data
}

export async function deleteTimeSlot(id: string): Promise<void> {
  await api.delete(`/time-slots/${id}`)
}
