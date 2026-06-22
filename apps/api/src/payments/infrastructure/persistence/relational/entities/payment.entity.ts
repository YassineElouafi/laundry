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
import { PaymentMethodEnum } from '../../../../../orders/payment-method.enum';
import { PaymentStatusEnum } from '../../../../payment-status.enum';

@Entity({
  name: 'payment',
})
export class PaymentEntity extends EntityRelationalHelper {
  @Column({
    nullable: true,
    type: String,
  })
  ref?: string | null;

  @Column({
    nullable: false,
    type: 'numeric',
    precision: 10,
    scale: 2,
    default: 0,
    transformer: new ColumnNumericTransformer(),
  })
  amount?: number;

  @Column({
    nullable: false,
    type: 'enum',
    enum: PaymentStatusEnum,
    default: PaymentStatusEnum.pending,
  })
  status?: PaymentStatusEnum;

  @Column({
    nullable: false,
    type: 'enum',
    enum: PaymentMethodEnum,
  })
  method?: PaymentMethodEnum;

  @ManyToOne(() => OrderEntity, { eager: true, nullable: false })
  order?: OrderEntity;

  @PrimaryGeneratedColumn('uuid')
  id: string;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
