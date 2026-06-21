import { UserEntity } from '../../../../../users/infrastructure/persistence/relational/entities/user.entity';

import {
  CreateDateColumn,
  Entity,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
  Column,
  ManyToOne,
} from 'typeorm';
import { EntityRelationalHelper } from '../../../../../utils/relational-entity-helper';

@Entity({
  name: 'address',
})
export class AddressEntity extends EntityRelationalHelper {
  @ManyToOne(() => UserEntity, { eager: true, nullable: false })
  user?: UserEntity;

  @Column({
    nullable: false,
    type: Boolean,
  })
  isDefault?: boolean;

  @Column({
    nullable: true,
    type: String,
  })
  notes?: string | null;

  @Column({
    nullable: true,
    type: 'double precision',
  })
  lng?: number | null;

  @Column({
    nullable: true,
    type: 'double precision',
  })
  lat?: number | null;

  @Column({
    nullable: false,
    type: String,
  })
  city: string;

  @Column({
    nullable: false,
    type: String,
  })
  line1: string;

  @Column({
    nullable: false,
    type: String,
  })
  label: string;

  @PrimaryGeneratedColumn('uuid')
  id: string;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
