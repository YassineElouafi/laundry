// API response shapes consumed by the dashboard.
import type { LocalizedString, PriceType, SlotType } from './catalog'
import type { DeliveryType, OrderStatus, PaymentMethod } from './order'
import type { PaymentStatus } from './payment'

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
  deliveryType?: DeliveryType
  deliveryFee?: number
  createdAt: string
  updatedAt: string
  pickupAddress: AddressDto
  deliveryAddress: AddressDto
  pickupSlot?: TimeSlotDto | null
  deliverySlot?: TimeSlotDto | null
  items?: OrderItemDto[]
  events?: OrderEventDto[]
  user?: UserDto
  driver?: UserDto | null
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
