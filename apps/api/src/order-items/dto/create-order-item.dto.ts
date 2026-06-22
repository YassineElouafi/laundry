import { ServiceItemDto } from '../../service-items/dto/service-item.dto';

import { OrderDto } from '../../orders/dto/order.dto';

import {
  // decorators here
  Type,
} from 'class-transformer';

import {
  // decorators here

  ValidateNested,
  IsNotEmptyObject,
  IsNumber,
} from 'class-validator';

import {
  // decorators here
  ApiProperty,
} from '@nestjs/swagger';

export class CreateOrderItemDto {
  lineTotal?: number;

  unitPrice?: number;

  @ApiProperty({
    required: true,
    type: () => Number,
  })
  @IsNumber()
  quantity: number;

  @ApiProperty({
    required: true,
    type: () => ServiceItemDto,
  })
  @ValidateNested()
  @Type(() => ServiceItemDto)
  @IsNotEmptyObject()
  serviceItem: ServiceItemDto;

  order?: OrderDto;

  // Don't forget to use the class-validator decorators in the DTO properties.
}
