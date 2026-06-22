import { AddressDto } from '../../addresses/dto/address.dto';

import { Type } from 'class-transformer';

import {
  ValidateNested,
  IsNotEmptyObject,
  IsString,
  IsOptional,
  IsEnum,
  IsArray,
  ArrayNotEmpty,
} from 'class-validator';

import { ApiProperty } from '@nestjs/swagger';
import { PaymentMethodEnum } from '../payment-method.enum';
import { CreateOrderItemDto } from './create-order-item.dto';

export class CreateOrderDto {
  @ApiProperty({
    required: false,
    type: () => String,
  })
  @IsOptional()
  @IsString()
  notes?: string | null;

  @ApiProperty({
    required: true,
    enum: PaymentMethodEnum,
    example: PaymentMethodEnum.cod,
  })
  @IsEnum(PaymentMethodEnum)
  paymentMethod: PaymentMethodEnum;

  @ApiProperty({
    required: true,
    type: () => AddressDto,
  })
  @ValidateNested()
  @Type(() => AddressDto)
  @IsNotEmptyObject()
  deliveryAddress: AddressDto;

  @ApiProperty({
    required: true,
    type: () => AddressDto,
  })
  @ValidateNested()
  @Type(() => AddressDto)
  @IsNotEmptyObject()
  pickupAddress: AddressDto;

  @ApiProperty({
    required: true,
    type: () => [CreateOrderItemDto],
  })
  @IsArray()
  @ArrayNotEmpty()
  @ValidateNested({ each: true })
  @Type(() => CreateOrderItemDto)
  items: CreateOrderItemDto[];
}
