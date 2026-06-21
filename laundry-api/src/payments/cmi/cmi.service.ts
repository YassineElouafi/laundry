import { Injectable } from '@nestjs/common';
import { createHash } from 'crypto';

export type CmiRedirect = {
  url: string;
  fields: Record<string, string>;
};

/**
 * Adapter for CMI (Centre Monétique Interbancaire) — the dominant Moroccan
 * card gateway. Uses the hosted-payment-page (3D_PAY_HOSTING) redirect model:
 * we POST a signed form to CMI, the user pays on CMI's page, and CMI calls our
 * callback URL with a signed payload we verify here.
 *
 * Credentials come from env (sandbox-friendly defaults). The HASH uses CMI's
 * "ver3" algorithm: all request params except `hash`/`encoding`, sorted by key
 * (case-insensitive), values escaped and joined by `|`, the store key appended,
 * then SHA-512 and Base64.
 */
@Injectable()
export class CmiService {
  private readonly clientId = process.env.CMI_CLIENT_ID ?? 'TEST_CLIENT_ID';
  private readonly storeKey = process.env.CMI_STORE_KEY ?? 'TEST_STORE_KEY';
  private readonly gatewayUrl =
    process.env.CMI_GATEWAY_URL ??
    'https://testpayment.cmi.co.ma/fim/est3Dgate';
  private readonly okUrl =
    process.env.CMI_OK_URL ??
    'http://localhost:3001/api/v1/payments/cmi/callback';
  private readonly failUrl =
    process.env.CMI_FAIL_URL ??
    'http://localhost:3001/api/v1/payments/cmi/callback';
  private readonly callbackUrl =
    process.env.CMI_CALLBACK_URL ??
    'http://localhost:3001/api/v1/payments/cmi/callback';
  private readonly currency = process.env.CMI_CURRENCY ?? '504'; // ISO 4217: MAD

  private escape(value: string): string {
    return value.replace(/\\/g, '\\\\').replace(/\|/g, '\\|');
  }

  /**
   * Compute the CMI ver3 HASH over a set of params (excluding hash/encoding).
   */
  computeHash(params: Record<string, string>): string {
    const keys = Object.keys(params)
      .filter((k) => {
        const lower = k.toLowerCase();
        return lower !== 'hash' && lower !== 'encoding';
      })
      .sort((a, b) => a.toLowerCase().localeCompare(b.toLowerCase()));

    const plain =
      keys.map((k) => this.escape(String(params[k] ?? ''))).join('|') +
      '|' +
      this.escape(this.storeKey);

    return createHash('sha512').update(plain, 'utf8').digest('base64');
  }

  /**
   * Build the redirect form for a payment. `oid` is the gateway order id (our
   * payment id), `amount` in major units, `rnd` a per-request nonce.
   */
  buildPaymentRequest(input: {
    oid: string;
    amount: number;
    rnd: string;
    email?: string;
  }): CmiRedirect {
    const fields: Record<string, string> = {
      clientid: this.clientId,
      oid: input.oid,
      amount: input.amount.toFixed(2),
      currency: this.currency,
      okUrl: this.okUrl,
      failUrl: this.failUrl,
      callbackUrl: this.callbackUrl,
      storetype: '3D_PAY_HOSTING',
      hashAlgorithm: 'ver3',
      lang: 'fr',
      rnd: input.rnd,
      TranType: 'PreAuth',
      ...(input.email ? { email: input.email } : {}),
    };

    fields.hash = this.computeHash(fields);

    return { url: this.gatewayUrl, fields };
  }

  /**
   * Verify a callback payload: recompute the hash from the returned params and
   * compare against the supplied HASH. Returns whether the signature is valid
   * and whether the transaction succeeded (ProcReturnCode === '00').
   */
  verifyCallback(params: Record<string, string>): {
    valid: boolean;
    approved: boolean;
    oid?: string;
  } {
    const supplied = params.HASH ?? params.hash ?? '';
    const computed = this.computeHash(params);
    const valid = supplied.length > 0 && supplied === computed;
    const approved = valid && params.ProcReturnCode === '00';
    return { valid, approved, oid: params.oid };
  }
}
