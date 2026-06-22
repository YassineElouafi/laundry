import { ServiceCategoriesService } from '../service-categories/service-categories.service';
import { ServiceCategory } from '../service-categories/domain/service-category';

import {
  // common
  Injectable,
  HttpStatus,
  UnprocessableEntityException,
} from '@nestjs/common';
import { CreateServiceItemDto } from './dto/create-service-item.dto';
import { UpdateServiceItemDto } from './dto/update-service-item.dto';
import { ServiceItemRepository } from './infrastructure/persistence/service-item.repository';
import { IPaginationOptions } from '../utils/types/pagination-options';
import { ServiceItem } from './domain/service-item';

@Injectable()
export class ServiceItemsService {
  constructor(
    private readonly serviceCategoryService: ServiceCategoriesService,

    // Dependencies here
    private readonly serviceItemRepository: ServiceItemRepository,
  ) {}

  async create(createServiceItemDto: CreateServiceItemDto) {
    // Do not remove comment below.
    // <creating-property />
    const categoryObject = await this.serviceCategoryService.findById(
      createServiceItemDto.category.id,
    );
    if (!categoryObject) {
      throw new UnprocessableEntityException({
        status: HttpStatus.UNPROCESSABLE_ENTITY,
        errors: {
          category: 'notExists',
        },
      });
    }
    const category = categoryObject;

    return this.serviceItemRepository.create({
      // Do not remove comment below.
      // <creating-property-payload />
      category,

      active: createServiceItemDto.active,

      unitPrice: createServiceItemDto.unitPrice,

      priceType: createServiceItemDto.priceType,

      name: createServiceItemDto.name,
    });
  }

  findAllWithPagination({
    paginationOptions,
  }: {
    paginationOptions: IPaginationOptions;
  }) {
    return this.serviceItemRepository.findAllWithPagination({
      paginationOptions: {
        page: paginationOptions.page,
        limit: paginationOptions.limit,
      },
    });
  }

  findById(id: ServiceItem['id']) {
    return this.serviceItemRepository.findById(id);
  }

  findByIds(ids: ServiceItem['id'][]) {
    return this.serviceItemRepository.findByIds(ids);
  }

  async update(
    id: ServiceItem['id'],

    updateServiceItemDto: UpdateServiceItemDto,
  ) {
    // Do not remove comment below.
    // <updating-property />
    let category: ServiceCategory | undefined = undefined;

    if (updateServiceItemDto.category) {
      const categoryObject = await this.serviceCategoryService.findById(
        updateServiceItemDto.category.id,
      );
      if (!categoryObject) {
        throw new UnprocessableEntityException({
          status: HttpStatus.UNPROCESSABLE_ENTITY,
          errors: {
            category: 'notExists',
          },
        });
      }
      category = categoryObject;
    }

    return this.serviceItemRepository.update(id, {
      // Do not remove comment below.
      // <updating-property-payload />
      category,

      active: updateServiceItemDto.active,

      unitPrice: updateServiceItemDto.unitPrice,

      priceType: updateServiceItemDto.priceType,

      name: updateServiceItemDto.name,
    });
  }

  remove(id: ServiceItem['id']) {
    return this.serviceItemRepository.remove(id);
  }
}
