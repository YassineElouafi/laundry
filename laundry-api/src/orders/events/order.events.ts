import { Order } from '../domain/order';
import { OrderStatusEnum } from '../order-status.enum';

export const ORDER_CREATED_EVENT = 'order.created';
export const ORDER_STATUS_CHANGED_EVENT = 'order.status_changed';

export class OrderStatusChangedEvent {
  constructor(
    public readonly order: Order,
    public readonly previousStatus: OrderStatusEnum | undefined,
    public readonly newStatus: OrderStatusEnum,
    public readonly note?: string,
  ) {}
}

export class OrderCreatedEvent {
  constructor(public readonly order: Order) {}
}
