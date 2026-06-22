import { ServiceCategoryEntity } from '../../../../../service-categories/infrastructure/persistence/relational/entities/service-category.entity';

import {
  CreateDateColumn,
  Entity,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
  Column,
  ManyToOne,
} from 'typeorm';
import { EntityRelationalHelper } from '../../../../../utils/relational-entity-helper';
import { LocalizedString } from '../../../../../utils/types/localized-string.type';
import { PriceTypeEnum } from '../../../../price-type.enum';
import { ColumnNumericTransformer } from '../../../../../utils/transformers/column-numeric.transformer';

@Entity({
  name: 'service_item',
})
export class ServiceItemEntity extends EntityRelationalHelper {
  @ManyToOne(() => ServiceCategoryEntity, { eager: true, nullable: false })
  category: ServiceCategoryEntity;

  @Column({
    nullable: false,
    type: Boolean,
    default: true,
  })
  active?: boolean;

  @Column({
    nullable: false,
    type: 'numeric',
    precision: 10,
    scale: 2,
    transformer: new ColumnNumericTransformer(),
  })
  unitPrice: number;

  @Column({
    nullable: false,
    type: 'enum',
    enum: PriceTypeEnum,
  })
  priceType: PriceTypeEnum;

  @Column({
    nullable: false,
    type: 'jsonb',
  })
  name: LocalizedString;

  @PrimaryGeneratedColumn('uuid')
  id: string;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
