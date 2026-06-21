import { AddressesModule } from '../addresses/addresses.module';
import { UsersModule } from '../users/users.module';
import { Module } from '@nestjs/common';
import { OrdersService } from './orders.service';
import { OrdersController } from './orders.controller';
import { RelationalOrderPersistenceModule } from './infrastructure/persistence/relational/relational-persistence.module';
import { ServiceItemsModule } from '../service-items/service-items.module';
import { RelationalOrderEventPersistenceModule } from '../order-events/infrastructure/persistence/relational/relational-persistence.module';

@Module({
  imports: [
    AddressesModule,
    UsersModule,
    ServiceItemsModule,
    RelationalOrderPersistenceModule,
    RelationalOrderEventPersistenceModule,
  ],
  controllers: [OrdersController],
  providers: [OrdersService],
  exports: [OrdersService, RelationalOrderPersistenceModule],
})
export class OrdersModule {}
