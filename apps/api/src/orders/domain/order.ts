import { Address } from '../../addresses/domain/address';
import { User } from '../../users/domain/user';
import { Exclude } from 'class-transformer';
import { ApiProperty } from '@nestjs/swagger';
import { OrderStatusEnum } from '../order-status.enum';
import { PaymentMethodEnum } from '../payment-method.enum';
import { OrderItem } from '../../order-items/domain/order-item';
import { OrderEvent } from '../../order-events/domain/order-event';

export class Order {
  @ApiProperty({
    type: () => String,
    nullable: true,
  })
  notes?: string | null;

  @ApiProperty({
    type: () => Number,
    example: 120.5,
  })
  total?: number;

  @ApiProperty({
    type: () => Number,
    example: 120.5,
  })
  subtotal?: number;

  @ApiProperty({
    enum: PaymentMethodEnum,
    nullable: false,
  })
  paymentMethod: PaymentMethodEnum;

  @ApiProperty({
    enum: OrderStatusEnum,
  })
  status?: OrderStatusEnum;

  @ApiProperty({
    type: () => Address,
    nullable: false,
  })
  deliveryAddress: Address;

  @ApiProperty({
    type: () => Address,
    nullable: false,
  })
  pickupAddress: Address;

  @ApiProperty({
    type: () => [OrderItem],
  })
  items?: OrderItem[];

  @ApiProperty({
    type: () => [OrderEvent],
  })
  events?: OrderEvent[];

  @Exclude({ toPlainOnly: true })
  user?: User;

  @ApiProperty({
    type: String,
  })
  id: string;

  @ApiProperty()
  createdAt: Date;

  @ApiProperty()
  updatedAt: Date;
}
