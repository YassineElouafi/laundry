import {
  Injectable,
  NotFoundException,
  UnprocessableEntityException,
  HttpStatus,
} from '@nestjs/common';
import { randomUUID } from 'crypto';
import { PaymentRepository } from './infrastructure/persistence/payment.repository';
import { Payment } from './domain/payment';
import { User } from '../users/domain/user';
import { Order } from '../orders/domain/order';
import { OrdersService } from '../orders/orders.service';
import { PaymentMethodEnum } from '../orders/payment-method.enum';
import { PaymentStatusEnum } from './payment-status.enum';
import { CmiService, CmiRedirect } from './cmi/cmi.service';

@Injectable()
export class PaymentsService {
  constructor(
    private readonly paymentRepository: PaymentRepository,
    private readonly ordersService: OrdersService,
    private readonly cmiService: CmiService,
  ) {}

  /**
   * Initiate payment for one of the user's orders. COD payments are created as
   * pending (driver collects on delivery); CMI payments return a hosted-page
   * redirect the client must POST to.
   */
  async initiate(
    userId: User['id'],
    orderId: Order['id'],
  ): Promise<{ payment: Payment; redirect?: CmiRedirect }> {
    const order = await this.ordersService.findByIdForUser(orderId, userId);

    const payment = await this.paymentRepository.create({
      order: { id: order.id } as Order,
      method: order.paymentMethod,
      amount: order.total ?? 0,
      status: PaymentStatusEnum.pending,
      ref: null,
    });

    if (order.paymentMethod === PaymentMethodEnum.cmi) {
      const redirect = this.cmiService.buildPaymentRequest({
        oid: payment.id,
        amount: payment.amount ?? 0,
        rnd: randomUUID(),
      });
      return { payment, redirect };
    }

    return { payment };
  }

  findById(id: Payment['id']) {
    return this.paymentRepository.findById(id);
  }

  async findByIdForUser(id: Payment['id'], userId: User['id']) {
    const payment = await this.paymentRepository.findByIdForUser(id, userId);
    if (!payment) {
      throw new NotFoundException('paymentNotFound');
    }
    return payment;
  }

  /**
   * Driver/admin marks a cash-on-delivery payment as collected.
   */
  async markCodPaid(id: Payment['id']): Promise<Payment> {
    const payment = await this.paymentRepository.findById(id);
    if (!payment) {
      throw new NotFoundException('paymentNotFound');
    }
    if (payment.method !== PaymentMethodEnum.cod) {
      throw new UnprocessableEntityException({
        status: HttpStatus.UNPROCESSABLE_ENTITY,
        errors: { method: 'notCashOnDelivery' },
      });
    }

    return (await this.paymentRepository.update(id, {
      status: PaymentStatusEnum.paid,
      ref: 'COD',
    })) as Payment;
  }

  /**
   * Handle the CMI hosted-page callback. Verifies the HASH and updates the
   * referenced payment. Returns the new status.
   */
  async handleCmiCallback(
    params: Record<string, string>,
  ): Promise<{ status: PaymentStatusEnum; paymentId?: string }> {
    const result = this.cmiService.verifyCallback(params);

    if (!result.valid || !result.oid) {
      throw new UnprocessableEntityException({
        status: HttpStatus.UNPROCESSABLE_ENTITY,
        errors: { hash: 'invalidSignature' },
      });
    }

    const payment = await this.paymentRepository.findById(result.oid);
    if (!payment) {
      throw new NotFoundException('paymentNotFound');
    }

    const newStatus = result.approved
      ? PaymentStatusEnum.paid
      : PaymentStatusEnum.failed;

    await this.paymentRepository.update(result.oid, {
      status: newStatus,
      ref: params.TransId ?? params.AuthCode ?? null,
    });

    return { status: newStatus, paymentId: result.oid };
  }
}
