import { Module } from '@nestjs/common';
import { RelationalOrderEventPersistenceModule } from './infrastructure/persistence/relational/relational-persistence.module';

// Order events form the status timeline. They are written by the OrdersService
// state machine. This module only exposes the persistence layer.
@Module({
  imports: [RelationalOrderEventPersistenceModule],
  exports: [RelationalOrderEventPersistenceModule],
})
export class OrderEventsModule {}
