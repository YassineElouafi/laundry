import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, In } from 'typeorm';
import { ServiceCategoryEntity } from '../entities/service-category.entity';
import { NullableType } from '../../../../../utils/types/nullable.type';
import { ServiceCategory } from '../../../../domain/service-category';
import { ServiceCategoryRepository } from '../../service-category.repository';
import { ServiceCategoryMapper } from '../mappers/service-category.mapper';
import { IPaginationOptions } from '../../../../../utils/types/pagination-options';

@Injectable()
export class ServiceCategoryRelationalRepository implements ServiceCategoryRepository {
  constructor(
    @InjectRepository(ServiceCategoryEntity)
    private readonly serviceCategoryRepository: Repository<ServiceCategoryEntity>,
  ) {}

  async create(data: ServiceCategory): Promise<ServiceCategory> {
    const persistenceModel = ServiceCategoryMapper.toPersistence(data);
    const newEntity = await this.serviceCategoryRepository.save(
      this.serviceCategoryRepository.create(persistenceModel),
    );
    return ServiceCategoryMapper.toDomain(newEntity);
  }

  async findAllWithPagination({
    paginationOptions,
  }: {
    paginationOptions: IPaginationOptions;
  }): Promise<ServiceCategory[]> {
    const entities = await this.serviceCategoryRepository.find({
      skip: (paginationOptions.page - 1) * paginationOptions.limit,
      take: paginationOptions.limit,
    });

    return entities.map((entity) => ServiceCategoryMapper.toDomain(entity));
  }

  async findById(
    id: ServiceCategory['id'],
  ): Promise<NullableType<ServiceCategory>> {
    const entity = await this.serviceCategoryRepository.findOne({
      where: { id },
    });

    return entity ? ServiceCategoryMapper.toDomain(entity) : null;
  }

  async findByIds(ids: ServiceCategory['id'][]): Promise<ServiceCategory[]> {
    const entities = await this.serviceCategoryRepository.find({
      where: { id: In(ids) },
    });

    return entities.map((entity) => ServiceCategoryMapper.toDomain(entity));
  }

  async update(
    id: ServiceCategory['id'],
    payload: Partial<ServiceCategory>,
  ): Promise<ServiceCategory> {
    const entity = await this.serviceCategoryRepository.findOne({
      where: { id },
    });

    if (!entity) {
      throw new Error('Record not found');
    }

    const updatedEntity = await this.serviceCategoryRepository.save(
      this.serviceCategoryRepository.create(
        ServiceCategoryMapper.toPersistence({
          ...ServiceCategoryMapper.toDomain(entity),
          ...payload,
        }),
      ),
    );

    return ServiceCategoryMapper.toDomain(updatedEntity);
  }

  async remove(id: ServiceCategory['id']): Promise<void> {
    await this.serviceCategoryRepository.delete(id);
  }
}
