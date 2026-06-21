import { AddressEntity } from '../../../../../addresses/infrastructure/persistence/relational/entities/address.entity';

import { UserEntity } from '../../../../../users/infrastructure/persistence/relational/entities/user.entity';

import {
  CreateDateColumn,
  Entity,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
  ManyToOne,
  OneToMany,
  Column,
} from 'typeorm';
import { OrderItemEntity } from '../../../../../order-items/infrastructure/persistence/relational/entities/order-item.entity';
import { OrderEventEntity } from '../../../../../order-events/infrastructure/persistence/relational/entities/order-event.entity';
import { EntityRelationalHelper } from '../../../../../utils/relational-entity-helper';
import { ColumnNumericTransformer } from '../../../../../utils/transformers/column-numeric.transformer';
import { OrderStatusEnum } from '../../../../order-status.enum';
import { PaymentMethodEnum } from '../../../../payment-method.enum';

@Entity({
  name: 'order',
})
export class OrderEntity extends EntityRelationalHelper {
  @Column({
    nullable: true,
    type: String,
  })
  notes?: string | null;

  @Column({
    nullable: false,
    type: 'numeric',
    precision: 10,
    scale: 2,
    default: 0,
    transformer: new ColumnNumericTransformer(),
  })
  total?: number;

  @Column({
    nullable: false,
    type: 'numeric',
    precision: 10,
    scale: 2,
    default: 0,
    transformer: new ColumnNumericTransformer(),
  })
  subtotal?: number;

  @Column({
    nullable: false,
    type: 'enum',
    enum: PaymentMethodEnum,
  })
  paymentMethod: PaymentMethodEnum;

  @Column({
    nullable: false,
    type: 'enum',
    enum: OrderStatusEnum,
    default: OrderStatusEnum.scheduled,
  })
  status?: OrderStatusEnum;

  @ManyToOne(() => AddressEntity, { eager: true, nullable: false })
  deliveryAddress: AddressEntity;

  @ManyToOne(() => AddressEntity, { eager: true, nullable: false })
  pickupAddress: AddressEntity;

  @ManyToOne(() => UserEntity, { eager: true, nullable: false })
  user?: UserEntity;

  @OneToMany(() => OrderItemEntity, (item) => item.order, {
    eager: true,
    cascade: true,
  })
  items?: OrderItemEntity[];

  @OneToMany(() => OrderEventEntity, (event) => event.order, {
    eager: true,
  })
  events?: OrderEventEntity[];

  @PrimaryGeneratedColumn('uuid')
  id: string;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
