import { Module } from '@nestjs/common';
import { ServiceCategoryRepository } from '../service-category.repository';
import { ServiceCategoryRelationalRepository } from './repositories/service-category.repository';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ServiceCategoryEntity } from './entities/service-category.entity';

@Module({
  imports: [TypeOrmModule.forFeature([ServiceCategoryEntity])],
  providers: [
    {
      provide: ServiceCategoryRepository,
      useClass: ServiceCategoryRelationalRepository,
    },
  ],
  exports: [ServiceCategoryRepository],
})
export class RelationalServiceCategoryPersistenceModule {}
