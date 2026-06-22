import { ServiceCategory } from '../../../../domain/service-category';

import { ServiceCategoryEntity } from '../entities/service-category.entity';

export class ServiceCategoryMapper {
  static toDomain(raw: ServiceCategoryEntity): ServiceCategory {
    const domainEntity = new ServiceCategory();
    domainEntity.sortOrder = raw.sortOrder;

    domainEntity.active = raw.active;

    domainEntity.icon = raw.icon;

    domainEntity.name = raw.name;

    domainEntity.id = raw.id;
    domainEntity.createdAt = raw.createdAt;
    domainEntity.updatedAt = raw.updatedAt;

    return domainEntity;
  }

  static toPersistence(domainEntity: ServiceCategory): ServiceCategoryEntity {
    const persistenceEntity = new ServiceCategoryEntity();
    persistenceEntity.sortOrder = domainEntity.sortOrder;

    persistenceEntity.active = domainEntity.active;

    persistenceEntity.icon = domainEntity.icon;

    persistenceEntity.name = domainEntity.name;

    if (domainEntity.id) {
      persistenceEntity.id = domainEntity.id;
    }
    persistenceEntity.createdAt = domainEntity.createdAt;
    persistenceEntity.updatedAt = domainEntity.updatedAt;

    return persistenceEntity;
  }
}
