import { Module } from '@nestjs/common';
import { RelationalOrderItemPersistenceModule } from './infrastructure/persistence/relational/relational-persistence.module';

// Order items are created/managed as part of an Order (cascade). This module
// only exposes the persistence layer; no standalone CRUD controller/service.
@Module({
  imports: [RelationalOrderItemPersistenceModule],
  exports: [RelationalOrderItemPersistenceModule],
})
export class OrderItemsModule {}
