import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, In } from 'typeorm';
import { OrderEventEntity } from '../entities/order-event.entity';
import { NullableType } from '../../../../../utils/types/nullable.type';
import { OrderEvent } from '../../../../domain/order-event';
import { OrderEventRepository } from '../../order-event.repository';
import { OrderEventMapper } from '../mappers/order-event.mapper';
import { IPaginationOptions } from '../../../../../utils/types/pagination-options';

@Injectable()
export class OrderEventRelationalRepository implements OrderEventRepository {
  constructor(
    @InjectRepository(OrderEventEntity)
    private readonly orderEventRepository: Repository<OrderEventEntity>,
  ) {}

  async create(data: OrderEvent): Promise<OrderEvent> {
    const persistenceModel = OrderEventMapper.toPersistence(data);
    const newEntity = await this.orderEventRepository.save(
      this.orderEventRepository.create(persistenceModel),
    );
    return OrderEventMapper.toDomain(newEntity);
  }

  async findAllWithPagination({
    paginationOptions,
  }: {
    paginationOptions: IPaginationOptions;
  }): Promise<OrderEvent[]> {
    const entities = await this.orderEventRepository.find({
      skip: (paginationOptions.page - 1) * paginationOptions.limit,
      take: paginationOptions.limit,
    });

    return entities.map((entity) => OrderEventMapper.toDomain(entity));
  }

  async findById(id: OrderEvent['id']): Promise<NullableType<OrderEvent>> {
    const entity = await this.orderEventRepository.findOne({
      where: { id },
    });

    return entity ? OrderEventMapper.toDomain(entity) : null;
  }

  async findByIds(ids: OrderEvent['id'][]): Promise<OrderEvent[]> {
    const entities = await this.orderEventRepository.find({
      where: { id: In(ids) },
    });

    return entities.map((entity) => OrderEventMapper.toDomain(entity));
  }

  async update(
    id: OrderEvent['id'],
    payload: Partial<OrderEvent>,
  ): Promise<OrderEvent> {
    const entity = await this.orderEventRepository.findOne({
      where: { id },
    });

    if (!entity) {
      throw new Error('Record not found');
    }

    const updatedEntity = await this.orderEventRepository.save(
      this.orderEventRepository.create(
        OrderEventMapper.toPersistence({
          ...OrderEventMapper.toDomain(entity),
          ...payload,
        }),
      ),
    );

    return OrderEventMapper.toDomain(updatedEntity);
  }

  async remove(id: OrderEvent['id']): Promise<void> {
    await this.orderEventRepository.delete(id);
  }
}
