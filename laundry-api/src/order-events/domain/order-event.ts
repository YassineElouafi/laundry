import { Order } from '../../orders/domain/order';
import { Exclude } from 'class-transformer';
import { ApiProperty } from '@nestjs/swagger';
import { OrderStatusEnum } from '../../orders/order-status.enum';

export class OrderEvent {
  @ApiProperty({
    type: () => String,
    nullable: true,
  })
  note?: string | null;

  @ApiProperty({
    enum: OrderStatusEnum,
  })
  status?: OrderStatusEnum;

  @Exclude({ toPlainOnly: true })
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
