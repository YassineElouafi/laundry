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
import { OrderStatusEnum } from '../../../../../orders/order-status.enum';

@Entity({
  name: 'order_event',
})
export class OrderEventEntity extends EntityRelationalHelper {
  @Column({
    nullable: true,
    type: String,
  })
  note?: string | null;

  @Column({
    nullable: false,
    type: 'enum',
    enum: OrderStatusEnum,
  })
  status?: OrderStatusEnum;

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
