import { ApiProperty } from '@nestjs/swagger';
import { SlotTypeEnum } from '../slot-type.enum';

export class TimeSlot {
  @ApiProperty({
    type: () => Boolean,
    nullable: false,
  })
  active?: boolean;

  @ApiProperty({
    enum: SlotTypeEnum,
    nullable: false,
  })
  slotType: SlotTypeEnum;

  @ApiProperty({
    type: () => Number,
    nullable: false,
  })
  booked?: number;

  @ApiProperty({
    type: () => Number,
    nullable: false,
  })
  capacity: number;

  @ApiProperty({
    type: () => String,
    nullable: false,
  })
  windowEnd: string;

  @ApiProperty({
    type: () => String,
    nullable: false,
  })
  windowStart: string;

  @ApiProperty({
    type: () => Date,
    nullable: false,
  })
  date: Date;

  @ApiProperty({
    type: String,
  })
  id: string;

  @ApiProperty()
  createdAt: Date;

  @ApiProperty()
  updatedAt: Date;
}
