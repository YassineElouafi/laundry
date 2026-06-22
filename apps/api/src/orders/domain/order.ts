import { Address } from '../../addresses/domain/address';
import { User } from '../../users/domain/user';
import { Exclude } from 'class-transformer';
import { ApiProperty } from '@nestjs/swagger';
import { OrderStatusEnum } from '../order-status.enum';
import { PaymentMethodEnum } from '../payment-method.enum';
import { DeliveryTypeEnum } from '../delivery-type.enum';
import { OrderItem } from '../../order-items/domain/order-item';
import { OrderEvent } from '../../order-events/domain/order-event';
import { TimeSlot } from '../../time-slots/domain/time-slot';

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
    enum: DeliveryTypeEnum,
  })
  deliveryType?: DeliveryTypeEnum;

  @ApiProperty({
    type: () => Number,
    example: 15,
  })
  deliveryFee?: number;

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
    type: () => TimeSlot,
    nullable: true,
  })
  pickupSlot?: TimeSlot | null;

  @ApiProperty({
    type: () => TimeSlot,
    nullable: true,
  })
  deliverySlot?: TimeSlot | null;

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
    type: () => User,
    nullable: true,
  })
  driver?: User | null;

  @ApiProperty({
    type: String,
  })
  id: string;

  @ApiProperty()
  createdAt: Date;

  @ApiProperty()
  updatedAt: Date;
}
