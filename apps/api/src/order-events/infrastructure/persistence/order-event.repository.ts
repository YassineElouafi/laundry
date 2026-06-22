import { DeepPartial } from '../../../utils/types/deep-partial.type';
import { NullableType } from '../../../utils/types/nullable.type';
import { IPaginationOptions } from '../../../utils/types/pagination-options';
import { OrderEvent } from '../../domain/order-event';

export abstract class OrderEventRepository {
  abstract create(
    data: Omit<OrderEvent, 'id' | 'createdAt' | 'updatedAt'>,
  ): Promise<OrderEvent>;

  abstract findAllWithPagination({
    paginationOptions,
  }: {
    paginationOptions: IPaginationOptions;
  }): Promise<OrderEvent[]>;

  abstract findById(id: OrderEvent['id']): Promise<NullableType<OrderEvent>>;

  abstract findByIds(ids: OrderEvent['id'][]): Promise<OrderEvent[]>;

  abstract update(
    id: OrderEvent['id'],
    payload: DeepPartial<OrderEvent>,
  ): Promise<OrderEvent | null>;

  abstract remove(id: OrderEvent['id']): Promise<void>;
}
