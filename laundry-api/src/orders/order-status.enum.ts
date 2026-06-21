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

/**
 * Allowed forward transitions for the order lifecycle:
 * SCHEDULED → DRIVER_ASSIGNED → PICKED_UP → AT_FACILITY →
 * IN_CLEANING → READY → OUT_FOR_DELIVERY → DELIVERED
 * CANCELLED is allowed from any pre-cleaning stage.
 */
export const ORDER_TRANSITIONS: Record<OrderStatusEnum, OrderStatusEnum[]> = {
  [OrderStatusEnum.scheduled]: [
    OrderStatusEnum.driverAssigned,
    OrderStatusEnum.cancelled,
  ],
  [OrderStatusEnum.driverAssigned]: [
    OrderStatusEnum.pickedUp,
    OrderStatusEnum.cancelled,
  ],
  [OrderStatusEnum.pickedUp]: [
    OrderStatusEnum.atFacility,
    OrderStatusEnum.cancelled,
  ],
  [OrderStatusEnum.atFacility]: [
    OrderStatusEnum.inCleaning,
    OrderStatusEnum.cancelled,
  ],
  // From IN_CLEANING onward the order can no longer be cancelled.
  [OrderStatusEnum.inCleaning]: [OrderStatusEnum.ready],
  [OrderStatusEnum.ready]: [OrderStatusEnum.outForDelivery],
  [OrderStatusEnum.outForDelivery]: [OrderStatusEnum.delivered],
  [OrderStatusEnum.delivered]: [],
  [OrderStatusEnum.cancelled]: [],
};
