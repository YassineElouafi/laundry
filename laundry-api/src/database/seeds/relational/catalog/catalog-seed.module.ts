import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

import { CatalogSeedService } from './catalog-seed.service';
import { ServiceCategoryEntity } from '../../../../service-categories/infrastructure/persistence/relational/entities/service-category.entity';
import { ServiceItemEntity } from '../../../../service-items/infrastructure/persistence/relational/entities/service-item.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([ServiceCategoryEntity, ServiceItemEntity]),
  ],
  providers: [CatalogSeedService],
  exports: [CatalogSeedService],
})
export class CatalogSeedModule {}
