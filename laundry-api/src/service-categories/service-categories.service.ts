import {
  // common
  Injectable,
} from '@nestjs/common';
import { CreateServiceCategoryDto } from './dto/create-service-category.dto';
import { UpdateServiceCategoryDto } from './dto/update-service-category.dto';
import { ServiceCategoryRepository } from './infrastructure/persistence/service-category.repository';
import { IPaginationOptions } from '../utils/types/pagination-options';
import { ServiceCategory } from './domain/service-category';

@Injectable()
export class ServiceCategoriesService {
  constructor(
    // Dependencies here
    private readonly serviceCategoryRepository: ServiceCategoryRepository,
  ) {}

  async create(createServiceCategoryDto: CreateServiceCategoryDto) {
    // Do not remove comment below.
    // <creating-property />

    return this.serviceCategoryRepository.create({
      // Do not remove comment below.
      // <creating-property-payload />
      sortOrder: createServiceCategoryDto.sortOrder,

      active: createServiceCategoryDto.active,

      icon: createServiceCategoryDto.icon,

      name: createServiceCategoryDto.name,
    });
  }

  findAllWithPagination({
    paginationOptions,
  }: {
    paginationOptions: IPaginationOptions;
  }) {
    return this.serviceCategoryRepository.findAllWithPagination({
      paginationOptions: {
        page: paginationOptions.page,
        limit: paginationOptions.limit,
      },
    });
  }

  findById(id: ServiceCategory['id']) {
    return this.serviceCategoryRepository.findById(id);
  }

  findByIds(ids: ServiceCategory['id'][]) {
    return this.serviceCategoryRepository.findByIds(ids);
  }

  async update(
    id: ServiceCategory['id'],

    updateServiceCategoryDto: UpdateServiceCategoryDto,
  ) {
    // Do not remove comment below.
    // <updating-property />

    return this.serviceCategoryRepository.update(id, {
      // Do not remove comment below.
      // <updating-property-payload />
      sortOrder: updateServiceCategoryDto.sortOrder,

      active: updateServiceCategoryDto.active,

      icon: updateServiceCategoryDto.icon,

      name: updateServiceCategoryDto.name,
    });
  }

  remove(id: ServiceCategory['id']) {
    return this.serviceCategoryRepository.remove(id);
  }
}
