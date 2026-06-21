import { Module } from '@nestjs/common';
import { OrderItemRepository } from '../order-item.repository';
import { OrderItemRelationalRepository } from './repositories/order-item.repository';
import { TypeOrmModule } from '@nestjs/typeorm';
import { OrderItemEntity } from './entities/order-item.entity';

@Module({
  imports: [TypeOrmModule.forFeature([OrderItemEntity])],
  providers: [
    {
      provide: OrderItemRepository,
      useClass: OrderItemRelationalRepository,
    },
  ],
  exports: [OrderItemRepository],
})
export class RelationalOrderItemPersistenceModule {}
