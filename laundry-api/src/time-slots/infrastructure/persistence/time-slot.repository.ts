import { DeepPartial } from '../../../utils/types/deep-partial.type';
import { NullableType } from '../../../utils/types/nullable.type';
import { IPaginationOptions } from '../../../utils/types/pagination-options';
import { TimeSlot } from '../../domain/time-slot';
import { SlotTypeEnum } from '../../slot-type.enum';

export abstract class TimeSlotRepository {
  abstract create(
    data: Omit<TimeSlot, 'id' | 'createdAt' | 'updatedAt'>,
  ): Promise<TimeSlot>;

  abstract findAllWithPagination({
    paginationOptions,
  }: {
    paginationOptions: IPaginationOptions;
  }): Promise<TimeSlot[]>;

  abstract findAvailable({
    date,
    slotType,
  }: {
    date?: string;
    slotType?: SlotTypeEnum;
  }): Promise<TimeSlot[]>;

  abstract findById(id: TimeSlot['id']): Promise<NullableType<TimeSlot>>;

  abstract findByIds(ids: TimeSlot['id'][]): Promise<TimeSlot[]>;

  /**
   * Atomically book one unit of capacity. Returns the updated slot, or null
   * if the slot does not exist, is inactive, or is already full.
   */
  abstract book(id: TimeSlot['id']): Promise<NullableType<TimeSlot>>;

  /** Release one unit of capacity (e.g. on cancellation). */
  abstract release(id: TimeSlot['id']): Promise<NullableType<TimeSlot>>;

  abstract update(
    id: TimeSlot['id'],
    payload: DeepPartial<TimeSlot>,
  ): Promise<TimeSlot | null>;

  abstract remove(id: TimeSlot['id']): Promise<void>;
}
