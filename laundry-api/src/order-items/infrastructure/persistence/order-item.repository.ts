import { DeepPartial } from '../../../utils/types/deep-partial.type';
import { NullableType } from '../../../utils/types/nullable.type';
import { IPaginationOptions } from '../../../utils/types/pagination-options';
import { OrderItem } from '../../domain/order-item';

export abstract class OrderItemRepository {
  abstract create(
    data: Omit<OrderItem, 'id' | 'createdAt' | 'updatedAt'>,
  ): Promise<OrderItem>;

  abstract findAllWithPagination({
    paginationOptions,
  }: {
    paginationOptions: IPaginationOptions;
  }): Promise<OrderItem[]>;

  abstract findById(id: OrderItem['id']): Promise<NullableType<OrderItem>>;

  abstract findByIds(ids: OrderItem['id'][]): Promise<OrderItem[]>;

  abstract update(
    id: OrderItem['id'],
    payload: DeepPartial<OrderItem>,
  ): Promise<OrderItem | null>;

  abstract remove(id: OrderItem['id']): Promise<void>;
}
