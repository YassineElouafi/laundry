import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, In } from 'typeorm';
import { ServiceItemEntity } from '../entities/service-item.entity';
import { NullableType } from '../../../../../utils/types/nullable.type';
import { ServiceItem } from '../../../../domain/service-item';
import { ServiceItemRepository } from '../../service-item.repository';
import { ServiceItemMapper } from '../mappers/service-item.mapper';
import { IPaginationOptions } from '../../../../../utils/types/pagination-options';

@Injectable()
export class ServiceItemRelationalRepository implements ServiceItemRepository {
  constructor(
    @InjectRepository(ServiceItemEntity)
    private readonly serviceItemRepository: Repository<ServiceItemEntity>,
  ) {}

  async create(data: ServiceItem): Promise<ServiceItem> {
    const persistenceModel = ServiceItemMapper.toPersistence(data);
    const newEntity = await this.serviceItemRepository.save(
      this.serviceItemRepository.create(persistenceModel),
    );
    return ServiceItemMapper.toDomain(newEntity);
  }

  async findAllWithPagination({
    paginationOptions,
  }: {
    paginationOptions: IPaginationOptions;
  }): Promise<ServiceItem[]> {
    const entities = await this.serviceItemRepository.find({
      skip: (paginationOptions.page - 1) * paginationOptions.limit,
      take: paginationOptions.limit,
    });

    return entities.map((entity) => ServiceItemMapper.toDomain(entity));
  }

  async findById(id: ServiceItem['id']): Promise<NullableType<ServiceItem>> {
    const entity = await this.serviceItemRepository.findOne({
      where: { id },
    });

    return entity ? ServiceItemMapper.toDomain(entity) : null;
  }

  async findByIds(ids: ServiceItem['id'][]): Promise<ServiceItem[]> {
    const entities = await this.serviceItemRepository.find({
      where: { id: In(ids) },
    });

    return entities.map((entity) => ServiceItemMapper.toDomain(entity));
  }

  async update(
    id: ServiceItem['id'],
    payload: Partial<ServiceItem>,
  ): Promise<ServiceItem> {
    const entity = await this.serviceItemRepository.findOne({
      where: { id },
    });

    if (!entity) {
      throw new Error('Record not found');
    }

    const updatedEntity = await this.serviceItemRepository.save(
      this.serviceItemRepository.create(
        ServiceItemMapper.toPersistence({
          ...ServiceItemMapper.toDomain(entity),
          ...payload,
        }),
      ),
    );

    return ServiceItemMapper.toDomain(updatedEntity);
  }

  async remove(id: ServiceItem['id']): Promise<void> {
    await this.serviceItemRepository.delete(id);
  }
}
