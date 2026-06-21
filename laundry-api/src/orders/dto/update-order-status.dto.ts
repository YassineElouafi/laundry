import { ApiProperty } from '@nestjs/swagger';
import { IsEnum, IsOptional, IsString } from 'class-validator';
import { OrderStatusEnum } from '../order-status.enum';

export class UpdateOrderStatusDto {
  @ApiProperty({
    required: true,
    enum: OrderStatusEnum,
    example: OrderStatusEnum.driverAssigned,
  })
  @IsEnum(OrderStatusEnum)
  status: OrderStatusEnum;

  @ApiProperty({
    required: false,
    type: () => String,
  })
  @IsOptional()
  @IsString()
  note?: string;
}
