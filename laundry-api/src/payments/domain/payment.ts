import { Order } from '../../orders/domain/order';
import { ApiProperty } from '@nestjs/swagger';
import { PaymentMethodEnum } from '../../orders/payment-method.enum';
import { PaymentStatusEnum } from '../payment-status.enum';

export class Payment {
  @ApiProperty({ type: String, nullable: true })
  ref?: string | null;

  @ApiProperty({ type: Number, example: 250.0 })
  amount?: number;

  @ApiProperty({ enum: PaymentStatusEnum })
  status?: PaymentStatusEnum;

  @ApiProperty({ enum: PaymentMethodEnum })
  method?: PaymentMethodEnum;

  @ApiProperty({ type: () => Order })
  order?: Order;

  @ApiProperty({
    type: String,
  })
  id: string;

  @ApiProperty()
  createdAt: Date;

  @ApiProperty()
  updatedAt: Date;
}
