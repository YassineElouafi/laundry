import {
  Injectable,
  NotFoundException,
  UnprocessableEntityException,
  HttpStatus,
} from '@nestjs/common';
import { CreateTimeSlotDto } from './dto/create-time-slot.dto';
import { UpdateTimeSlotDto } from './dto/update-time-slot.dto';
import { TimeSlotRepository } from './infrastructure/persistence/time-slot.repository';
import { IPaginationOptions } from '../utils/types/pagination-options';
import { TimeSlot } from './domain/time-slot';
import { SlotTypeEnum } from './slot-type.enum';

@Injectable()
export class TimeSlotsService {
  constructor(private readonly timeSlotRepository: TimeSlotRepository) {}

  async create(createTimeSlotDto: CreateTimeSlotDto) {
    return this.timeSlotRepository.create({
      active: createTimeSlotDto.active ?? true,
      slotType: createTimeSlotDto.slotType,
      booked: 0,
      capacity: createTimeSlotDto.capacity,
      windowEnd: createTimeSlotDto.windowEnd,
      windowStart: createTimeSlotDto.windowStart,
      date: createTimeSlotDto.date,
    });
  }

  findAllWithPagination({
    paginationOptions,
  }: {
    paginationOptions: IPaginationOptions;
  }) {
    return this.timeSlotRepository.findAllWithPagination({
      paginationOptions: {
        page: paginationOptions.page,
        limit: paginationOptions.limit,
      },
    });
  }

  findAvailable(params: { date?: string; slotType?: SlotTypeEnum }) {
    return this.timeSlotRepository.findAvailable(params);
  }

  findById(id: TimeSlot['id']) {
    return this.timeSlotRepository.findById(id);
  }

  findByIds(ids: TimeSlot['id'][]) {
    return this.timeSlotRepository.findByIds(ids);
  }

  /**
   * Capacity-aware booking. Throws 404 if the slot is missing and 422 if it
   * is inactive or already at capacity.
   */
  async book(id: TimeSlot['id']): Promise<TimeSlot> {
    const exists = await this.timeSlotRepository.findById(id);
    if (!exists) {
      throw new NotFoundException('timeSlotNotFound');
    }

    const booked = await this.timeSlotRepository.book(id);
    if (!booked) {
      throw new UnprocessableEntityException({
        status: HttpStatus.UNPROCESSABLE_ENTITY,
        errors: { slot: 'slotFullOrInactive' },
      });
    }
    return booked;
  }

  async release(id: TimeSlot['id']): Promise<TimeSlot> {
    const released = await this.timeSlotRepository.release(id);
    if (!released) {
      throw new NotFoundException('timeSlotNotFound');
    }
    return released;
  }

  async update(id: TimeSlot['id'], updateTimeSlotDto: UpdateTimeSlotDto) {
    return this.timeSlotRepository.update(id, {
      active: updateTimeSlotDto.active,
      slotType: updateTimeSlotDto.slotType,
      capacity: updateTimeSlotDto.capacity,
      windowEnd: updateTimeSlotDto.windowEnd,
      windowStart: updateTimeSlotDto.windowStart,
      date: updateTimeSlotDto.date,
    });
  }

  remove(id: TimeSlot['id']) {
    return this.timeSlotRepository.remove(id);
  }
}
