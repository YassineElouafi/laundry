import { Injectable, Logger } from '@nestjs/common';
import { OnEvent } from '@nestjs/event-emitter';
import {
  ORDER_STATUS_CHANGED_EVENT,
  OrderStatusChangedEvent,
} from '../../orders/events/order.events';
import { FcmService } from '../fcm/fcm.service';
import { WhatsappService } from '../whatsapp/whatsapp.service';
import { getStatusMessage } from '../order-status-messages';

/**
 * Subscribes to order lifecycle events and fans out customer notifications
 * over push (FCM) and WhatsApp. Failures are swallowed/logged so a flaky
 * notification channel can never break an order transition.
 */
@Injectable()
export class OrderNotificationsListener {
  private readonly logger = new Logger(OrderNotificationsListener.name);

  constructor(
    private readonly fcmService: FcmService,
    private readonly whatsappService: WhatsappService,
  ) {}

  @OnEvent(ORDER_STATUS_CHANGED_EVENT)
  async handleStatusChanged(event: OrderStatusChangedEvent): Promise<void> {
    const { order, newStatus } = event;
    const user = order.user;
    const message = getStatusMessage(newStatus, user?.locale);

    try {
      await Promise.all([
        this.fcmService.sendPush({
          token: (user as { fcmToken?: string } | undefined)?.fcmToken,
          title: message.title,
          body: message.body,
          data: { orderId: String(order.id), status: newStatus },
        }),
        this.whatsappService.sendMessage({
          phone: user?.phone,
          text: `${message.title} — ${message.body}`,
        }),
      ]);
      this.logger.log(
        `Notified user for order ${order.id} -> ${newStatus}`,
      );
    } catch (error) {
      this.logger.error(
        `Failed to notify for order ${order.id}: ${(error as Error).message}`,
      );
    }
  }
}
