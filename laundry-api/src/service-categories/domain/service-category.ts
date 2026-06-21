import { ApiProperty } from '@nestjs/swagger';
import { LocalizedString } from '../../utils/types/localized-string.type';

export class ServiceCategory {
  @ApiProperty({
    type: () => Number,
    nullable: false,
  })
  sortOrder?: number;

  @ApiProperty({
    type: () => Boolean,
    nullable: false,
  })
  active?: boolean;

  @ApiProperty({
    type: () => String,
    nullable: true,
  })
  icon?: string | null;

  @ApiProperty({
    example: { fr: 'Lavage & Pliage', ar: 'غسل وطي' },
    nullable: false,
  })
  name: LocalizedString;

  @ApiProperty({
    type: String,
  })
  id: string;

  @ApiProperty()
  createdAt: Date;

  @ApiProperty()
  updatedAt: Date;
}
