import {
  CreateDateColumn,
  Entity,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
  Column,
} from 'typeorm';
import { EntityRelationalHelper } from '../../../../../utils/relational-entity-helper';
import { LocalizedString } from '../../../../../utils/types/localized-string.type';

@Entity({
  name: 'service_category',
})
export class ServiceCategoryEntity extends EntityRelationalHelper {
  @Column({
    nullable: false,
    type: Number,
    default: 0,
  })
  sortOrder?: number;

  @Column({
    nullable: false,
    type: Boolean,
    default: true,
  })
  active?: boolean;

  @Column({
    nullable: true,
    type: String,
  })
  icon?: string | null;

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
