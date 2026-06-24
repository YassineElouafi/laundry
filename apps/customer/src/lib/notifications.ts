import type { OrderDto, OrderStatus } from '@laundry/shared';

export interface AppNotification {
  id: string;
  orderId: string;
  status: OrderStatus;
  createdAt: string;
  note?: string | null;
}

/** Flatten every order's status-change events into a single, newest-first feed. */
export function buildNotifications(orders: OrderDto[]): AppNotification[] {
  const out: AppNotification[] = [];
  for (const o of orders) {
    for (const ev of o.events ?? []) {
      out.push({
        id: `${o.id}:${ev.id}`,
        orderId: o.id,
        status: ev.status as OrderStatus,
        createdAt: ev.createdAt,
        note: ev.note,
      });
    }
  }
  // ISO-8601 UTC strings sort correctly lexicographically.
  return out.sort((a, b) => (a.createdAt < b.createdAt ? 1 : -1));
}

/** Count notifications newer than the last time the user opened the center. */
export function countUnread(notifs: AppNotification[], lastSeen: string): number {
  if (!lastSeen) return notifs.length;
  return notifs.filter((n) => n.createdAt > lastSeen).length;
}
