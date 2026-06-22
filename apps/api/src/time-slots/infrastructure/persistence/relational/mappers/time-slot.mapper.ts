import { TimeSlot } from '../../../../domain/time-slot';

import { TimeSlotEntity } from '../entities/time-slot.entity';

export class TimeSlotMapper {
  static toDomain(raw: TimeSlotEntity): TimeSlot {
    const domainEntity = new TimeSlot();
    domainEntity.active = raw.active;

    domainEntity.slotType = raw.slotType;

    domainEntity.booked = raw.booked;

    domainEntity.capacity = raw.capacity;

    domainEntity.windowEnd = raw.windowEnd;

    domainEntity.windowStart = raw.windowStart;

    domainEntity.date = raw.date;

    domainEntity.id = raw.id;
    domainEntity.createdAt = raw.createdAt;
    domainEntity.updatedAt = raw.updatedAt;

    return domainEntity;
  }

  static toPersistence(domainEntity: TimeSlot): TimeSlotEntity {
    const persistenceEntity = new TimeSlotEntity();
    persistenceEntity.active = domainEntity.active;

    persistenceEntity.slotType = domainEntity.slotType;

    persistenceEntity.booked = domainEntity.booked;

    persistenceEntity.capacity = domainEntity.capacity;

    persistenceEntity.windowEnd = domainEntity.windowEnd;

    persistenceEntity.windowStart = domainEntity.windowStart;

    persistenceEntity.date = domainEntity.date;

    if (domainEntity.id) {
      persistenceEntity.id = domainEntity.id;
    }
    persistenceEntity.createdAt = domainEntity.createdAt;
    persistenceEntity.updatedAt = domainEntity.updatedAt;

    return persistenceEntity;
  }
}
