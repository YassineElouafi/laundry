import { DeepPartial } from '../../../utils/types/deep-partial.type';
import { NullableType } from '../../../utils/types/nullable.type';
import { IPaginationOptions } from '../../../utils/types/pagination-options';
import { ServiceCategory } from '../../domain/service-category';

export abstract class ServiceCategoryRepository {
  abstract create(
    data: Omit<ServiceCategory, 'id' | 'createdAt' | 'updatedAt'>,
  ): Promise<ServiceCategory>;

  abstract findAllWithPagination({
    paginationOptions,
  }: {
    paginationOptions: IPaginationOptions;
  }): Promise<ServiceCategory[]>;

  abstract findById(
    id: ServiceCategory['id'],
  ): Promise<NullableType<ServiceCategory>>;

  abstract findByIds(ids: ServiceCategory['id'][]): Promise<ServiceCategory[]>;

  abstract update(
    id: ServiceCategory['id'],
    payload: DeepPartial<ServiceCategory>,
  ): Promise<ServiceCategory | null>;

  abstract remove(id: ServiceCategory['id']): Promise<void>;
}
