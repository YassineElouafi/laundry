import { ServiceCategoryDto } from '../../service-categories/dto/service-category.dto';

import {
  IsNumber,
  IsBoolean,
  IsOptional,
  IsObject,
  IsEnum,
  Min,
  ValidateNested,
  IsNotEmptyObject,
} from 'class-validator';

import { ApiProperty } from '@nestjs/swagger';

import { Type } from 'class-transformer';
import { LocalizedString } from '../../utils/types/localized-string.type';
import { PriceTypeEnum } from '../price-type.enum';

export class CreateServiceItemDto {
  @ApiProperty({
    required: true,
    type: () => ServiceCategoryDto,
  })
  @ValidateNested()
  @Type(() => ServiceCategoryDto)
  @IsNotEmptyObject()
  category: ServiceCategoryDto;

  @ApiProperty({
    required: false,
    type: () => Boolean,
  })
  @IsOptional()
  @IsBoolean()
  active?: boolean;

  @ApiProperty({
    required: true,
    type: () => Number,
    example: 15.5,
  })
  @IsNumber({ maxDecimalPlaces: 2 })
  @Min(0)
  unitPrice: number;

  @ApiProperty({
    required: true,
    enum: PriceTypeEnum,
    example: PriceTypeEnum.perItem,
  })
  @IsEnum(PriceTypeEnum)
  priceType: PriceTypeEnum;

  @ApiProperty({
    required: true,
    example: { fr: 'Chemise', ar: 'قميص' },
  })
  @IsObject()
  name: LocalizedString;

  // Don't forget to use the class-validator decorators in the DTO properties.
}
