import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, In } from 'typeorm';
import { OrderItemEntity } from '../entities/order-item.entity';
import { NullableType } from '../../../../../utils/types/nullable.type';
import { OrderItem } from '../../../../domain/order-item';
import { OrderItemRepository } from '../../order-item.repository';
import { OrderItemMapper } from '../mappers/order-item.mapper';
import { IPaginationOptions } from '../../../../../utils/types/pagination-options';

@Injectable()
export class OrderItemRelationalRepository implements OrderItemRepository {
  constructor(
    @InjectRepository(OrderItemEntity)
    private readonly orderItemRepository: Repository<OrderItemEntity>,
  ) {}

  async create(data: OrderItem): Promise<OrderItem> {
    const persistenceModel = OrderItemMapper.toPersistence(data);
    const newEntity = await this.orderItemRepository.save(
      this.orderItemRepository.create(persistenceModel),
    );
    return OrderItemMapper.toDomain(newEntity);
  }

  async findAllWithPagination({
    paginationOptions,
  }: {
    paginationOptions: IPaginationOptions;
  }): Promise<OrderItem[]> {
    const entities = await this.orderItemRepository.find({
      skip: (paginationOptions.page - 1) * paginationOptions.limit,
      take: paginationOptions.limit,
    });

    return entities.map((entity) => OrderItemMapper.toDomain(entity));
  }

  async findById(id: OrderItem['id']): Promise<NullableType<OrderItem>> {
    const entity = await this.orderItemRepository.findOne({
      where: { id },
    });

    return entity ? OrderItemMapper.toDomain(entity) : null;
  }

  async findByIds(ids: OrderItem['id'][]): Promise<OrderItem[]> {
    const entities = await this.orderItemRepository.find({
      where: { id: In(ids) },
    });

    return entities.map((entity) => OrderItemMapper.toDomain(entity));
  }

  async update(
    id: OrderItem['id'],
    payload: Partial<OrderItem>,
  ): Promise<OrderItem> {
    const entity = await this.orderItemRepository.findOne({
      where: { id },
    });

    if (!entity) {
      throw new Error('Record not found');
    }

    const updatedEntity = await this.orderItemRepository.save(
      this.orderItemRepository.create(
        OrderItemMapper.toPersistence({
          ...OrderItemMapper.toDomain(entity),
          ...payload,
        }),
      ),
    );

    return OrderItemMapper.toDomain(updatedEntity);
  }

  async remove(id: OrderItem['id']): Promise<void> {
    await this.orderItemRepository.delete(id);
  }
}
