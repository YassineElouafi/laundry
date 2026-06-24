import { ORDER_TRANSITIONS, type OrderStatus } from '@laundry/shared';

/** The next forward status a driver can advance an order to (skips "cancelled"). */
export function nextStatus(status: OrderStatus): OrderStatus | null {
  const next = (ORDER_TRANSITIONS[status] ?? []).find((s) => s !== 'cancelled');
  return next ?? null;
}

export function isTerminal(status: OrderStatus): boolean {
  return status === 'delivered' || status === 'cancelled';
}
