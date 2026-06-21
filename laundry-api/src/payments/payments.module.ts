import { OrdersModule } from '../orders/orders.module';
import { Module } from '@nestjs/common';
import { PaymentsService } from './payments.service';
import { PaymentsController } from './payments.controller';
import { RelationalPaymentPersistenceModule } from './infrastructure/persistence/relational/relational-persistence.module';
import { CmiService } from './cmi/cmi.service';

@Module({
  imports: [OrdersModule, RelationalPaymentPersistenceModule],
  controllers: [PaymentsController],
  providers: [PaymentsService, CmiService],
  exports: [PaymentsService, RelationalPaymentPersistenceModule],
})
export class PaymentsModule {}
