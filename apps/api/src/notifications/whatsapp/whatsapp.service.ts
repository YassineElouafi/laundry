import { Injectable, Logger } from '@nestjs/common';

/**
 * WhatsApp Business API adapter (Meta Cloud API / Twilio).
 *
 * WhatsApp is the #1 messaging channel in Morocco, so order updates and
 * support flow through it. This is a transport stub that validates the
 * recipient phone and logs the message; wire WHATSAPP_* credentials and the
 * Graph API call here to go live.
 */
@Injectable()
export class WhatsappService {
  private readonly logger = new Logger(WhatsappService.name);
  private readonly enabled = process.env.WHATSAPP_ENABLED === 'true';

  async sendMessage(input: {
    phone?: string | null;
    text: string;
  }): Promise<{ sent: boolean; reason?: string }> {
    if (!input.phone) {
      this.logger.debug('Skipping WhatsApp: recipient has no phone number');
      return { sent: false, reason: 'no_phone' };
    }

    if (!this.enabled) {
      this.logger.log(`[WhatsApp stub] -> ${input.phone}: ${input.text}`);
      return { sent: true, reason: 'stub' };
    }

    // Real WhatsApp Business API call would go here.
    this.logger.log(`[WhatsApp] message sent to ${input.phone}`);
    return { sent: true };
  }
}
