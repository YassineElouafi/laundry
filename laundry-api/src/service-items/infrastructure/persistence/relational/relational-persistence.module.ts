import { Module } from '@nestjs/common';
import { ServiceItemRepository } from '../service-item.repository';
import { ServiceItemRelationalRepository } from './repositories/service-item.repository';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ServiceItemEntity } from './entities/service-item.entity';

@Module({
  imports: [TypeOrmModule.forFeature([ServiceItemEntity])],
  providers: [
    {
      provide: ServiceItemRepository,
      useClass: ServiceItemRelationalRepository,
    },
  ],
  exports: [ServiceItemRepository],
})
export class RelationalServiceItemPersistenceModule {}
