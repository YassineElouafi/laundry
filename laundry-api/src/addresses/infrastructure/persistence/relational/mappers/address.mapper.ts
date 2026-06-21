import { Address } from '../../../../domain/address';
import { UserMapper } from '../../../../../users/infrastructure/persistence/relational/mappers/user.mapper';

import { AddressEntity } from '../entities/address.entity';

export class AddressMapper {
  static toDomain(raw: AddressEntity): Address {
    const domainEntity = new Address();
    if (raw.user) {
      domainEntity.user = UserMapper.toDomain(raw.user);
    }

    domainEntity.isDefault = raw.isDefault;

    domainEntity.notes = raw.notes;

    domainEntity.lng = raw.lng;

    domainEntity.lat = raw.lat;

    domainEntity.city = raw.city;

    domainEntity.line1 = raw.line1;

    domainEntity.label = raw.label;

    domainEntity.id = raw.id;
    domainEntity.createdAt = raw.createdAt;
    domainEntity.updatedAt = raw.updatedAt;

    return domainEntity;
  }

  static toPersistence(domainEntity: Address): AddressEntity {
    const persistenceEntity = new AddressEntity();
    if (domainEntity.user) {
      persistenceEntity.user = UserMapper.toPersistence(domainEntity.user);
    }

    persistenceEntity.isDefault = domainEntity.isDefault;

    persistenceEntity.notes = domainEntity.notes;

    persistenceEntity.lng = domainEntity.lng;

    persistenceEntity.lat = domainEntity.lat;

    persistenceEntity.city = domainEntity.city;

    persistenceEntity.line1 = domainEntity.line1;

    persistenceEntity.label = domainEntity.label;

    if (domainEntity.id) {
      persistenceEntity.id = domainEntity.id;
    }
    persistenceEntity.createdAt = domainEntity.createdAt;
    persistenceEntity.updatedAt = domainEntity.updatedAt;

    return persistenceEntity;
  }
}
