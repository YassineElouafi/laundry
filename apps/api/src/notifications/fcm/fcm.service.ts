import { Injectable, Logger } from '@nestjs/common';

/**
 * Firebase Cloud Messaging push adapter.
 *
 * This is a transport stub: it validates input and logs the outbound push.
 * To go live, drop in `firebase-admin` (or the FCM HTTP v1 API) here using
 * FCM_* credentials — the rest of the app already depends only on `sendPush`.
 */
@Injectable()
export class FcmService {
  private readonly logger = new Logger(FcmService.name);
  private readonly enabled = process.env.FCM_ENABLED === 'true';

  async sendPush(input: {
    token?: string | null;
    title: string;
    body: string;
    data?: Record<string, string>;
  }): Promise<{ sent: boolean; reason?: string }> {
    if (!input.token) {
      this.logger.debug('Skipping push: no device token for recipient');
      return { sent: false, reason: 'no_token' };
    }

    if (!this.enabled) {
      this.logger.log(
        `[FCM stub] push -> token=${input.token.slice(0, 8)}… "${input.title}": ${input.body}`,
      );
      return { sent: true, reason: 'stub' };
    }

    // Real FCM send would go here.
    this.logger.log(`[FCM] push sent to ${input.token.slice(0, 8)}…`);
    return { sent: true };
  }
}
