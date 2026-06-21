import {
  // decorators here

  Transform,
} from 'class-transformer';

import {
  // decorators here

  IsDate,
  IsString,
  IsNumber,
  IsBoolean,
  IsOptional,
  IsEnum,
  Min,
  Matches,
} from 'class-validator';

import {
  // decorators here
  ApiProperty,
} from '@nestjs/swagger';
import { SlotTypeEnum } from '../slot-type.enum';

export class CreateTimeSlotDto {
  @ApiProperty({
    required: false,
    type: () => Boolean,
  })
  @IsOptional()
  @IsBoolean()
  active?: boolean;

  @ApiProperty({
    required: true,
    enum: SlotTypeEnum,
    example: SlotTypeEnum.pickup,
  })
  @IsEnum(SlotTypeEnum)
  slotType: SlotTypeEnum;

  @ApiProperty({
    required: true,
    type: () => Number,
    example: 10,
  })
  @IsNumber()
  @Min(1)
  capacity: number;

  @ApiProperty({
    required: true,
    type: () => String,
    example: '11:00',
  })
  @IsString()
  @Matches(/^([01]\d|2[0-3]):[0-5]\d$/, { message: 'windowEnd must be HH:mm' })
  windowEnd: string;

  @ApiProperty({
    required: true,
    type: () => String,
    example: '09:00',
  })
  @IsString()
  @Matches(/^([01]\d|2[0-3]):[0-5]\d$/, {
    message: 'windowStart must be HH:mm',
  })
  windowStart: string;

  @ApiProperty({
    required: true,
    type: () => Date,
  })
  @Transform(({ value }) => new Date(value))
  @IsDate()
  date: Date;

  // Don't forget to use the class-validator decorators in the DTO properties.
}
