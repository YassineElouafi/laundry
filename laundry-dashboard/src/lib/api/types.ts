// Shared API types mirroring the NestJS backend domain.

export type LocalizedString = { fr?: string; ar?: string; en?: string }

export type OrderStatus =
  | 'scheduled'
  | 'driver_assigned'
  | 'picked_up'
  | 'at_facility'
  | 'in_cleaning'
  | 'ready'
  | 'out_for_delivery'
  | 'delivered'
  | 'cancelled'

export type PaymentMethod = 'cod' | 'cmi'
export type PaymentStatus = 'pending' | 'paid' | 'failed' | 'refunded'
export type PriceType = 'per_kilo' | 'per_item'
export type SlotType = 'pickup' | 'delivery'

export const ORDER_STATUSES: OrderStatus[] = [
  'scheduled',
  'driver_assigned',
  'picked_up',
  'at_facility',
  'in_cleaning',
  'ready',
  'out_for_delivery',
  'delivered',
  'cancelled',
]

// Mirrors the backend ORDER_TRANSITIONS graph so the UI only offers valid moves.
export const ORDER_TRANSITIONS: Record<OrderStatus, OrderStatus[]> = {
  scheduled: ['driver_assigned', 'cancelled'],
  driver_assigned: ['picked_up', 'cancelled'],
  picked_up: ['at_facility', 'cancelled'],
  at_facility: ['in_cleaning', 'cancelled'],
  in_cleaning: ['ready'],
  ready: ['out_for_delivery'],
  out_for_delivery: ['delivered'],
  delivered: [],
  cancelled: [],
}

export interface AddressDto {
  id: string
  label: string
  line1: string
  city: string
  lat?: number | null
  lng?: number | null
  notes?: string | null
  isDefault?: boolean
}

export interface UserDto {
  id: number | string
  email: string
  firstName?: string | null
  lastName?: string | null
  phone?: string | null
  locale?: string | null
  role?: { id: number; name: string } | null
  createdAt?: string
}

export interface ServiceCategoryDto {
  id: string
  name: LocalizedString
  icon?: string | null
  active?: boolean
  sortOrder?: number
}

export interface ServiceItemDto {
  id: string
  name: LocalizedString
  priceType: PriceType
  unitPrice: number
  active?: boolean
  category?: ServiceCategoryDto
}

export interface OrderItemDto {
  id: string
  quantity: number
  unitPrice: number
  lineTotal: number
  serviceItem: ServiceItemDto
}

export interface OrderEventDto {
  id: string
  status: OrderStatus
  note?: string | null
  createdAt: string
}

export interface OrderDto {
  id: string
  status: OrderStatus
  paymentMethod: PaymentMethod
  subtotal: number
  total: number
  notes?: string | null
  createdAt: string
  updatedAt: string
  pickupAddress: AddressDto
  deliveryAddress: AddressDto
  items?: OrderItemDto[]
  events?: OrderEventDto[]
  user?: UserDto
}

export interface PaymentDto {
  id: string
  method: PaymentMethod
  status: PaymentStatus
  amount: number
  ref?: string | null
  createdAt: string
  order?: OrderDto
}

export interface TimeSlotDto {
  id: string
  date: string
  windowStart: string
  windowEnd: string
  capacity: number
  booked: number
  slotType: SlotType
  active?: boolean
}

export interface InfinityPaginated<T> {
  data: T[]
  hasNextPage: boolean
}

/** Render a localized name, preferring the active UI language. */
export function localized(name: LocalizedString, lang: string): string {
  if (!name) return ''
  const key = lang.startsWith('ar') ? 'ar' : 'fr'
  return name[key] ?? name.fr ?? name.en ?? name.ar ?? ''
}
