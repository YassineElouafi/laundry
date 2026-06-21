import { ServiceItemEntity } from '../../../../../service-items/infrastructure/persistence/relational/entities/service-item.entity';

import { OrderEntity } from '../../../../../orders/infrastructure/persistence/relational/entities/order.entity';

import {
  CreateDateColumn,
  Entity,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
  ManyToOne,
  Column,
} from 'typeorm';
import { EntityRelationalHelper } from '../../../../../utils/relational-entity-helper';
import { ColumnNumericTransformer } from '../../../../../utils/transformers/column-numeric.transformer';

@Entity({
  name: 'order_item',
})
export class OrderItemEntity extends EntityRelationalHelper {
  @Column({
    nullable: false,
    type: 'numeric',
    precision: 10,
    scale: 2,
    default: 0,
    transformer: new ColumnNumericTransformer(),
  })
  lineTotal?: number;

  @Column({
    nullable: false,
    type: 'numeric',
    precision: 10,
    scale: 2,
    default: 0,
    transformer: new ColumnNumericTransformer(),
  })
  unitPrice?: number;

  @Column({
    nullable: false,
    type: 'numeric',
    precision: 10,
    scale: 3,
    transformer: new ColumnNumericTransformer(),
  })
  quantity: number;

  @ManyToOne(() => ServiceItemEntity, { eager: true, nullable: false })
  serviceItem: ServiceItemEntity;

  @ManyToOne(() => OrderEntity, {
    eager: false,
    nullable: false,
    onDelete: 'CASCADE',
  })
  order?: OrderEntity;

  @PrimaryGeneratedColumn('uuid')
  id: string;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
