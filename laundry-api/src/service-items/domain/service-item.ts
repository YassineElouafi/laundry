import { ServiceCategory } from '../../service-categories/domain/service-category';

import { ApiProperty } from '@nestjs/swagger';
import { LocalizedString } from '../../utils/types/localized-string.type';
import { PriceTypeEnum } from '../price-type.enum';

export class ServiceItem {
  @ApiProperty({
    type: () => ServiceCategory,
    nullable: false,
  })
  category: ServiceCategory;

  @ApiProperty({
    type: () => Boolean,
    nullable: false,
  })
  active?: boolean;

  @ApiProperty({
    type: () => Number,
    nullable: false,
  })
  unitPrice: number;

  @ApiProperty({
    enum: PriceTypeEnum,
    nullable: false,
  })
  priceType: PriceTypeEnum;

  @ApiProperty({
    example: { fr: 'Chemise', ar: 'قميص' },
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
