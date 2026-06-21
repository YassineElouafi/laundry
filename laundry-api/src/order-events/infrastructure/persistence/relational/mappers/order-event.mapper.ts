import { OrderEvent } from '../../../../domain/order-event';

import { OrderMapper } from '../../../../../orders/infrastructure/persistence/relational/mappers/order.mapper';

import { OrderEventEntity } from '../entities/order-event.entity';

export class OrderEventMapper {
  static toDomain(raw: OrderEventEntity): OrderEvent {
    const domainEntity = new OrderEvent();
    domainEntity.note = raw.note;

    domainEntity.status = raw.status;

    domainEntity.id = raw.id;
    domainEntity.createdAt = raw.createdAt;
    domainEntity.updatedAt = raw.updatedAt;

    return domainEntity;
  }

  static toPersistence(domainEntity: OrderEvent): OrderEventEntity {
    const persistenceEntity = new OrderEventEntity();
    persistenceEntity.note = domainEntity.note;

    persistenceEntity.status = domainEntity.status;

    if (domainEntity.order) {
      persistenceEntity.order = OrderMapper.toPersistence(domainEntity.order);
    }

    if (domainEntity.id) {
      persistenceEntity.id = domainEntity.id;
    }
    persistenceEntity.createdAt = domainEntity.createdAt;
    persistenceEntity.updatedAt = domainEntity.updatedAt;

    return persistenceEntity;
  }
}
