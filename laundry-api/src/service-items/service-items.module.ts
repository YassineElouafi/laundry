import { ServiceCategoriesModule } from '../service-categories/service-categories.module';
import {
  // do not remove this comment
  Module,
} from '@nestjs/common';
import { ServiceItemsService } from './service-items.service';
import { ServiceItemsController } from './service-items.controller';
import { RelationalServiceItemPersistenceModule } from './infrastructure/persistence/relational/relational-persistence.module';

@Module({
  imports: [
    ServiceCategoriesModule,

    // do not remove this comment
    RelationalServiceItemPersistenceModule,
  ],
  controllers: [ServiceItemsController],
  providers: [ServiceItemsService],
  exports: [ServiceItemsService, RelationalServiceItemPersistenceModule],
})
export class ServiceItemsModule {}
