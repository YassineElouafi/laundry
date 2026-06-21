import {
  // do not remove this comment
  Module,
} from '@nestjs/common';
import { TimeSlotsService } from './time-slots.service';
import { TimeSlotsController } from './time-slots.controller';
import { RelationalTimeSlotPersistenceModule } from './infrastructure/persistence/relational/relational-persistence.module';

@Module({
  imports: [
    // do not remove this comment
    RelationalTimeSlotPersistenceModule,
  ],
  controllers: [TimeSlotsController],
  providers: [TimeSlotsService],
  exports: [TimeSlotsService, RelationalTimeSlotPersistenceModule],
})
export class TimeSlotsModule {}
