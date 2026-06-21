import { ServiceItem } from '../../service-items/domain/service-item';
import { Order } from '../../orders/domain/order';
import { Exclude } from 'class-transformer';
import { ApiProperty } from '@nestjs/swagger';

export class OrderItem {
  @ApiProperty({
    type: () => Number,
    example: 120.5,
  })
  lineTotal?: number;

  @ApiProperty({
    type: () => Number,
    example: 25,
  })
  unitPrice?: number;

  @ApiProperty({
    type: () => Number,
    nullable: false,
    example: 3,
  })
  quantity: number;

  @ApiProperty({
    type: () => ServiceItem,
    nullable: false,
  })
  serviceItem: ServiceItem;

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
