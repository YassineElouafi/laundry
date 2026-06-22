import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, In } from 'typeorm';
import { TimeSlotEntity } from '../entities/time-slot.entity';
import { NullableType } from '../../../../../utils/types/nullable.type';
import { TimeSlot } from '../../../../domain/time-slot';
import { TimeSlotRepository } from '../../time-slot.repository';
import { TimeSlotMapper } from '../mappers/time-slot.mapper';
import { IPaginationOptions } from '../../../../../utils/types/pagination-options';
import { SlotTypeEnum } from '../../../../slot-type.enum';

@Injectable()
export class TimeSlotRelationalRepository implements TimeSlotRepository {
  constructor(
    @InjectRepository(TimeSlotEntity)
    private readonly timeSlotRepository: Repository<TimeSlotEntity>,
  ) {}

  async create(data: TimeSlot): Promise<TimeSlot> {
    const persistenceModel = TimeSlotMapper.toPersistence(data);
    const newEntity = await this.timeSlotRepository.save(
      this.timeSlotRepository.create(persistenceModel),
    );
    return TimeSlotMapper.toDomain(newEntity);
  }

  async findAllWithPagination({
    paginationOptions,
  }: {
    paginationOptions: IPaginationOptions;
  }): Promise<TimeSlot[]> {
    const entities = await this.timeSlotRepository.find({
      skip: (paginationOptions.page - 1) * paginationOptions.limit,
      take: paginationOptions.limit,
    });

    return entities.map((entity) => TimeSlotMapper.toDomain(entity));
  }

  async findAvailable({
    date,
    slotType,
  }: {
    date?: string;
    slotType?: SlotTypeEnum;
  }): Promise<TimeSlot[]> {
    const qb = this.timeSlotRepository
      .createQueryBuilder('slot')
      .where('slot.active = :active', { active: true })
      .andWhere('slot.booked < slot.capacity');

    if (date) {
      qb.andWhere('slot.date = :date', { date });
    }
    if (slotType) {
      qb.andWhere('slot.slotType = :slotType', { slotType });
    }

    const entities = await qb
      .orderBy('slot.date', 'ASC')
      .addOrderBy('slot.windowStart', 'ASC')
      .getMany();

    return entities.map((entity) => TimeSlotMapper.toDomain(entity));
  }

  async book(id: TimeSlot['id']): Promise<NullableType<TimeSlot>> {
    // Atomic, capacity-safe increment: only succeeds while booked < capacity.
    const result = await this.timeSlotRepository
      .createQueryBuilder()
      .update(TimeSlotEntity)
      .set({ booked: () => '"booked" + 1' })
      .where('id = :id', { id: String(id) })
      .andWhere('active = true')
      .andWhere('"booked" < "capacity"')
      .returning('*')
      .execute();

    if (!result.affected) {
      return null;
    }

    const raw = result.raw[0];
    return raw ? TimeSlotMapper.toDomain(raw) : this.findById(id);
  }

  async release(id: TimeSlot['id']): Promise<NullableType<TimeSlot>> {
    const result = await this.timeSlotRepository
      .createQueryBuilder()
      .update(TimeSlotEntity)
      .set({ booked: () => 'GREATEST("booked" - 1, 0)' })
      .where('id = :id', { id: String(id) })
      .returning('*')
      .execute();

    if (!result.affected) {
      return null;
    }

    const raw = result.raw[0];
    return raw ? TimeSlotMapper.toDomain(raw) : this.findById(id);
  }

  async findById(id: TimeSlot['id']): Promise<NullableType<TimeSlot>> {
    const entity = await this.timeSlotRepository.findOne({
      where: { id: String(id) },
    });

    return entity ? TimeSlotMapper.toDomain(entity) : null;
  }

  async findByIds(ids: TimeSlot['id'][]): Promise<TimeSlot[]> {
    const entities = await this.timeSlotRepository.find({
      where: { id: In(ids) },
    });

    return entities.map((entity) => TimeSlotMapper.toDomain(entity));
  }

  async update(
    id: TimeSlot['id'],
    payload: Partial<TimeSlot>,
  ): Promise<TimeSlot> {
    const entity = await this.timeSlotRepository.findOne({
      where: { id },
    });

    if (!entity) {
      throw new Error('Record not found');
    }

    const updatedEntity = await this.timeSlotRepository.save(
      this.timeSlotRepository.create(
        TimeSlotMapper.toPersistence({
          ...TimeSlotMapper.toDomain(entity),
          ...payload,
        }),
      ),
    );

    return TimeSlotMapper.toDomain(updatedEntity);
  }

  async remove(id: TimeSlot['id']): Promise<void> {
    await this.timeSlotRepository.delete(id);
  }
}
