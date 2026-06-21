import { User } from '../../users/domain/user';
import { Exclude } from 'class-transformer';
import { ApiProperty } from '@nestjs/swagger';

export class Address {
  @Exclude({ toPlainOnly: true })
  user?: User;

  @ApiProperty({
    type: () => Boolean,
    nullable: false,
  })
  isDefault?: boolean;

  @ApiProperty({
    type: () => String,
    nullable: true,
  })
  notes?: string | null;

  @ApiProperty({
    type: () => Number,
    nullable: true,
  })
  lng?: number | null;

  @ApiProperty({
    type: () => Number,
    nullable: true,
  })
  lat?: number | null;

  @ApiProperty({
    type: () => String,
    nullable: false,
  })
  city: string;

  @ApiProperty({
    type: () => String,
    nullable: false,
  })
  line1: string;

  @ApiProperty({
    type: () => String,
    nullable: false,
  })
  label: string;

  @ApiProperty({
    type: String,
  })
  id: string;

  @ApiProperty()
  createdAt: Date;

  @ApiProperty()
  updatedAt: Date;
}
