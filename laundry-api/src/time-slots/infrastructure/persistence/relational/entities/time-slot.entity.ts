import {
  CreateDateColumn,
  Entity,
  Index,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
  Column,
} from 'typeorm';
import { EntityRelationalHelper } from '../../../../../utils/relational-entity-helper';
import { SlotTypeEnum } from '../../../../slot-type.enum';

@Entity({
  name: 'time_slot',
})
@Index(['date', 'slotType'])
export class TimeSlotEntity extends EntityRelationalHelper {
  @Column({
    nullable: false,
    type: Boolean,
    default: true,
  })
  active?: boolean;

  @Column({
    nullable: false,
    type: 'enum',
    enum: SlotTypeEnum,
  })
  slotType: SlotTypeEnum;

  @Column({
    nullable: false,
    type: Number,
    default: 0,
  })
  booked?: number;

  @Column({
    nullable: false,
    type: Number,
  })
  capacity: number;

  @Column({
    nullable: false,
    type: String,
  })
  windowEnd: string;

  @Column({
    nullable: false,
    type: String,
  })
  windowStart: string;

  @Column({
    nullable: false,
    type: 'date',
  })
  date: Date;

  @PrimaryGeneratedColumn('uuid')
  id: string;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
