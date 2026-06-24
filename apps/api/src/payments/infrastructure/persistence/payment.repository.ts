import { DeepPartial } from '../../../utils/types/deep-partial.type';
import { NullableType } from '../../../utils/types/nullable.type';
import { IPaginationOptions } from '../../../utils/types/pagination-options';
import { User } from '../../../users/domain/user';
import { Order } from '../../../orders/domain/order';
import { Payment } from '../../domain/payment';

export abstract class PaymentRepository {
  abstract create(
    data: Omit<Payment, 'id' | 'createdAt' | 'updatedAt'>,
  ): Promise<Payment>;

  abstract findAllWithPagination({
    paginationOptions,
  }: {
    paginationOptions: IPaginationOptions;
  }): Promise<Payment[]>;

  abstract findById(id: Payment['id']): Promise<NullableType<Payment>>;

  abstract findByIdForUser(
    id: Payment['id'],
    userId: User['id'],
  ): Promise<NullableType<Payment>>;

  abstract findByIds(ids: Payment['id'][]): Promise<Payment[]>;

  /** Most recent payment for an order (orders may be re-initiated). */
  abstract findLatestByOrderId(
    orderId: Order['id'],
  ): Promise<NullableType<Payment>>;

  abstract update(
    id: Payment['id'],
    payload: DeepPartial<Payment>,
  ): Promise<Payment | null>;

  abstract remove(id: Payment['id']): Promise<void>;
}
