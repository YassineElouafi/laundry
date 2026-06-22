import { Module } from '@nestjs/common';
import { FcmService } from './fcm/fcm.service';
import { WhatsappService } from './whatsapp/whatsapp.service';
import { OrderNotificationsListener } from './listeners/order-notifications.listener';

/**
 * Notifications fan-out. Listens to domain events (via @nestjs/event-emitter)
 * and delivers over FCM push + WhatsApp. Adapters are swappable transports.
 */
@Module({
  providers: [FcmService, WhatsappService, OrderNotificationsListener],
  exports: [FcmService, WhatsappService],
})
export class NotificationsModule {}
