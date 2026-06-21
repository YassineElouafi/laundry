import { ApiProperty } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import {
  IsNotEmptyObject,
  IsNumber,
  IsPositive,
  ValidateNested,
} from 'class-validator';
import { ServiceItemDto } from '../../service-items/dto/service-item.dto';

export class CreateOrderItemDto {
  @ApiProperty({
    required: true,
    type: () => ServiceItemDto,
  })
  @ValidateNested()
  @Type(() => ServiceItemDto)
  @IsNotEmptyObject()
  serviceItem: ServiceItemDto;

  @ApiProperty({
    required: true,
    example: 3,
    description: 'Item count (per_item) or weight in kg (per_kilo).',
  })
  @IsNumber({ maxDecimalPlaces: 3 })
  @IsPositive()
  quantity: number;
}
