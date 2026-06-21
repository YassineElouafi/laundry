import {
  // decorators here

  IsString,
  IsOptional,
  IsBoolean,
  IsNumber,
  IsObject,
} from 'class-validator';

import {
  // decorators here
  ApiProperty,
} from '@nestjs/swagger';
import { LocalizedString } from '../../utils/types/localized-string.type';

export class CreateServiceCategoryDto {
  @ApiProperty({
    required: false,
    type: () => Number,
  })
  @IsOptional()
  @IsNumber()
  sortOrder?: number;

  @ApiProperty({
    required: false,
    type: () => Boolean,
  })
  @IsOptional()
  @IsBoolean()
  active?: boolean;

  @ApiProperty({
    required: false,
    type: () => String,
  })
  @IsOptional()
  @IsString()
  icon?: string | null;

  @ApiProperty({
    required: true,
    example: { fr: 'Lavage & Pliage', ar: 'غسل وطي' },
  })
  @IsObject()
  name: LocalizedString;

  // Don't forget to use the class-validator decorators in the DTO properties.
}
