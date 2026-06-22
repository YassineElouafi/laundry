import { Order } from '../../../../domain/order';

import { AddressMapper } from '../../../../../addresses/infrastructure/persistence/relational/mappers/address.mapper';

import { UserMapper } from '../../../../../users/infrastructure/persistence/relational/mappers/user.mapper';
import { OrderItemMapper } from '../../../../../order-items/infrastructure/persistence/relational/mappers/order-item.mapper';
import { OrderEventMapper } from '../../../../../order-events/infrastructure/persistence/relational/mappers/order-event.mapper';

import { OrderEntity } from '../entities/order.entity';

export class OrderMapper {
  static toDomain(raw: OrderEntity): Order {
    const domainEntity = new Order();
    domainEntity.notes = raw.notes;

    domainEntity.total = raw.total;

    domainEntity.subtotal = raw.subtotal;

    domainEntity.paymentMethod = raw.paymentMethod;

    domainEntity.status = raw.status;

    if (raw.deliveryAddress) {
      domainEntity.deliveryAddress = AddressMapper.toDomain(
        raw.deliveryAddress,
      );
    }

    if (raw.pickupAddress) {
      domainEntity.pickupAddress = AddressMapper.toDomain(raw.pickupAddress);
    }

    if (raw.items) {
      domainEntity.items = raw.items.map((item) =>
        OrderItemMapper.toDomain(item),
      );
    }

    if (raw.events) {
      domainEntity.events = raw.events
        .map((event) => OrderEventMapper.toDomain(event))
        .sort((a, b) => a.createdAt.getTime() - b.createdAt.getTime());
    }

    if (raw.user) {
      domainEntity.user = UserMapper.toDomain(raw.user);
    }

    domainEntity.id = raw.id;
    domainEntity.createdAt = raw.createdAt;
    domainEntity.updatedAt = raw.updatedAt;

    return domainEntity;
  }

  static toPersistence(domainEntity: Order): OrderEntity {
    const persistenceEntity = new OrderEntity();
    persistenceEntity.notes = domainEntity.notes;

    persistenceEntity.total = domainEntity.total;

    persistenceEntity.subtotal = domainEntity.subtotal;

    persistenceEntity.paymentMethod = domainEntity.paymentMethod;

    persistenceEntity.status = domainEntity.status;

    if (domainEntity.deliveryAddress) {
      persistenceEntity.deliveryAddress = AddressMapper.toPersistence(
        domainEntity.deliveryAddress,
      );
    }

    if (domainEntity.pickupAddress) {
      persistenceEntity.pickupAddress = AddressMapper.toPersistence(
        domainEntity.pickupAddress,
      );
    }

    // Order items are persisted via cascade when the order is saved.
    if (domainEntity.items) {
      persistenceEntity.items = domainEntity.items.map((item) =>
        OrderItemMapper.toPersistence(item),
      );
    }

    if (domainEntity.user) {
      persistenceEntity.user = UserMapper.toPersistence(domainEntity.user);
    }

    if (domainEntity.id) {
      persistenceEntity.id = domainEntity.id;
    }
    persistenceEntity.createdAt = domainEntity.createdAt;
    persistenceEntity.updatedAt = domainEntity.updatedAt;

    return persistenceEntity;
  }
}
