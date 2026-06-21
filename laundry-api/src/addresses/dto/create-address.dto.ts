import { UserDto } from '../../users/dto/user.dto';

import {
  // decorators here

  IsString,
  IsNumber,
  IsOptional,
  IsBoolean,
} from 'class-validator';

import {
  // decorators here
  ApiProperty,
} from '@nestjs/swagger';

export class CreateAddressDto {
  user?: UserDto;

  @ApiProperty({
    required: false,
    type: () => Boolean,
  })
  @IsOptional()
  @IsBoolean()
  isDefault?: boolean;

  @ApiProperty({
    required: false,
    type: () => String,
  })
  @IsOptional()
  @IsString()
  notes?: string | null;

  @ApiProperty({
    required: false,
    type: () => Number,
  })
  @IsOptional()
  @IsNumber()
  lng?: number | null;

  @ApiProperty({
    required: false,
    type: () => Number,
  })
  @IsOptional()
  @IsNumber()
  lat?: number | null;

  @ApiProperty({
    required: true,
    type: () => String,
  })
  @IsString()
  city: string;

  @ApiProperty({
    required: true,
    type: () => String,
  })
  @IsString()
  line1: string;

  @ApiProperty({
    required: true,
    type: () => String,
  })
  @IsString()
  label: string;

  // Don't forget to use the class-validator decorators in the DTO properties.
}
