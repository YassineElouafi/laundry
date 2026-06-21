import { Module } from '@nestjs/common';
import { TimeSlotRepository } from '../time-slot.repository';
import { TimeSlotRelationalRepository } from './repositories/time-slot.repository';
import { TypeOrmModule } from '@nestjs/typeorm';
import { TimeSlotEntity } from './entities/time-slot.entity';

@Module({
  imports: [TypeOrmModule.forFeature([TimeSlotEntity])],
  providers: [
    {
      provide: TimeSlotRepository,
      useClass: TimeSlotRelationalRepository,
    },
  ],
  exports: [TimeSlotRepository],
})
export class RelationalTimeSlotPersistenceModule {}
