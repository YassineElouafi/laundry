import { ServiceItem } from '../../../../domain/service-item';
import { ServiceCategoryMapper } from '../../../../../service-categories/infrastructure/persistence/relational/mappers/service-category.mapper';

import { ServiceItemEntity } from '../entities/service-item.entity';

export class ServiceItemMapper {
  static toDomain(raw: ServiceItemEntity): ServiceItem {
    const domainEntity = new ServiceItem();
    if (raw.category) {
      domainEntity.category = ServiceCategoryMapper.toDomain(raw.category);
    }

    domainEntity.active = raw.active;

    domainEntity.unitPrice = raw.unitPrice;

    domainEntity.priceType = raw.priceType;

    domainEntity.name = raw.name;

    domainEntity.id = raw.id;
    domainEntity.createdAt = raw.createdAt;
    domainEntity.updatedAt = raw.updatedAt;

    return domainEntity;
  }

  static toPersistence(domainEntity: ServiceItem): ServiceItemEntity {
    const persistenceEntity = new ServiceItemEntity();
    if (domainEntity.category) {
      persistenceEntity.category = ServiceCategoryMapper.toPersistence(
        domainEntity.category,
      );
    }

    persistenceEntity.active = domainEntity.active;

    persistenceEntity.unitPrice = domainEntity.unitPrice;

    persistenceEntity.priceType = domainEntity.priceType;

    persistenceEntity.name = domainEntity.name;

    if (domainEntity.id) {
      persistenceEntity.id = domainEntity.id;
    }
    persistenceEntity.createdAt = domainEntity.createdAt;
    persistenceEntity.updatedAt = domainEntity.updatedAt;

    return persistenceEntity;
  }
}
