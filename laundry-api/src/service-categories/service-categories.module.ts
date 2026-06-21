import {
  // do not remove this comment
  Module,
} from '@nestjs/common';
import { ServiceCategoriesService } from './service-categories.service';
import { ServiceCategoriesController } from './service-categories.controller';
import { RelationalServiceCategoryPersistenceModule } from './infrastructure/persistence/relational/relational-persistence.module';

@Module({
  imports: [
    // do not remove this comment
    RelationalServiceCategoryPersistenceModule,
  ],
  controllers: [ServiceCategoriesController],
  providers: [ServiceCategoriesService],
  exports: [
    ServiceCategoriesService,
    RelationalServiceCategoryPersistenceModule,
  ],
})
export class ServiceCategoriesModule {}
