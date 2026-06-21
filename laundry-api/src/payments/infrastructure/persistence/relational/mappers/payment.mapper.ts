import { Payment } from '../../../../domain/payment';

import { OrderMapper } from '../../../../../orders/infrastructure/persistence/relational/mappers/order.mapper';

import { PaymentEntity } from '../entities/payment.entity';

export class PaymentMapper {
  static toDomain(raw: PaymentEntity): Payment {
    const domainEntity = new Payment();
    domainEntity.ref = raw.ref;

    domainEntity.amount = raw.amount;

    domainEntity.status = raw.status;

    domainEntity.method = raw.method;

    if (raw.order) {
      domainEntity.order = OrderMapper.toDomain(raw.order);
    }

    domainEntity.id = raw.id;
    domainEntity.createdAt = raw.createdAt;
    domainEntity.updatedAt = raw.updatedAt;

    return domainEntity;
  }

  static toPersistence(domainEntity: Payment): PaymentEntity {
    const persistenceEntity = new PaymentEntity();
    persistenceEntity.ref = domainEntity.ref;

    persistenceEntity.amount = domainEntity.amount;

    persistenceEntity.status = domainEntity.status;

    persistenceEntity.method = domainEntity.method;

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
