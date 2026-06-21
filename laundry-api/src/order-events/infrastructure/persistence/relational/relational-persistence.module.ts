import { Module } from '@nestjs/common';
import { OrderEventRepository } from '../order-event.repository';
import { OrderEventRelationalRepository } from './repositories/order-event.repository';
import { TypeOrmModule } from '@nestjs/typeorm';
import { OrderEventEntity } from './entities/order-event.entity';

@Module({
  imports: [TypeOrmModule.forFeature([OrderEventEntity])],
  providers: [
    {
      provide: OrderEventRepository,
      useClass: OrderEventRelationalRepository,
    },
  ],
  exports: [OrderEventRepository],
})
export class RelationalOrderEventPersistenceModule {}
