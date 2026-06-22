// Canonical order lifecycle definitions, shared by the API and the dashboard.

export enum OrderStatusEnum {
  scheduled = 'scheduled',
  driverAssigned = 'driver_assigned',
  pickedUp = 'picked_up',
  atFacility = 'at_facility',
  inCleaning = 'in_cleaning',
  ready = 'ready',
  outForDelivery = 'out_for_delivery',
  delivered = 'delivered',
  cancelled = 'cancelled',
}

/** String-union of the status values (handy for the frontend). */
export type OrderStatus = `${OrderStatusEnum}`

export const ORDER_STATUSES: OrderStatus[] = Object.values(OrderStatusEnum)

export enum PaymentMethodEnum {
  cod = 'cod',
  cmi = 'cmi',
}
export type PaymentMethod = `${PaymentMethodEnum}`

/**
 * Allowed forward transitions for the order lifecycle:
 * SCHEDULED → DRIVER_ASSIGNED → PICKED_UP → AT_FACILITY →
 * IN_CLEANING → READY → OUT_FOR_DELIVERY → DELIVERED
 * CANCELLED is allowed from any pre-cleaning stage.
 *
 * Keyed by the string-union so both the enum (API) and plain strings
 * (dashboard) can index it.
 */
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
