import { OrderItem } from '../../../../domain/order-item';

import { ServiceItemMapper } from '../../../../../service-items/infrastructure/persistence/relational/mappers/service-item.mapper';

import { OrderItemEntity } from '../entities/order-item.entity';

export class OrderItemMapper {
  static toDomain(raw: OrderItemEntity): OrderItem {
    const domainEntity = new OrderItem();
    domainEntity.lineTotal = raw.lineTotal;

    domainEntity.unitPrice = raw.unitPrice;

    domainEntity.quantity = raw.quantity;

    if (raw.serviceItem) {
      domainEntity.serviceItem = ServiceItemMapper.toDomain(raw.serviceItem);
    }

    domainEntity.id = raw.id;
    domainEntity.createdAt = raw.createdAt;
    domainEntity.updatedAt = raw.updatedAt;

    return domainEntity;
  }

  static toPersistence(domainEntity: OrderItem): OrderItemEntity {
    const persistenceEntity = new OrderItemEntity();
    persistenceEntity.lineTotal = domainEntity.lineTotal;

    persistenceEntity.unitPrice = domainEntity.unitPrice;

    persistenceEntity.quantity = domainEntity.quantity;

    if (domainEntity.serviceItem) {
      persistenceEntity.serviceItem = ServiceItemMapper.toPersistence(
        domainEntity.serviceItem,
      );
    }

    if (domainEntity.id) {
      persistenceEntity.id = domainEntity.id;
    }
    persistenceEntity.createdAt = domainEntity.createdAt;
    persistenceEntity.updatedAt = domainEntity.updatedAt;

    return persistenceEntity;
  }
}
