import { DeepPartial } from '../../../utils/types/deep-partial.type';
import { NullableType } from '../../../utils/types/nullable.type';
import { IPaginationOptions } from '../../../utils/types/pagination-options';
import { ServiceItem } from '../../domain/service-item';

export abstract class ServiceItemRepository {
  abstract create(
    data: Omit<ServiceItem, 'id' | 'createdAt' | 'updatedAt'>,
  ): Promise<ServiceItem>;

  abstract findAllWithPagination({
    paginationOptions,
  }: {
    paginationOptions: IPaginationOptions;
  }): Promise<ServiceItem[]>;

  abstract findById(id: ServiceItem['id']): Promise<NullableType<ServiceItem>>;

  abstract findByIds(ids: ServiceItem['id'][]): Promise<ServiceItem[]>;

  abstract update(
    id: ServiceItem['id'],
    payload: DeepPartial<ServiceItem>,
  ): Promise<ServiceItem | null>;

  abstract remove(id: ServiceItem['id']): Promise<void>;
}
