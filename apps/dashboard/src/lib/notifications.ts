import type { OrderDto, OrderStatus } from '@/lib/api/types'

export type DashNotification = {
  id: string
  orderId: string
  orderShort: string
  status: OrderStatus
  createdAt: string
}

/** Flatten every order's status events into a single newest-first activity feed. */
export function buildNotifications(orders: OrderDto[]): DashNotification[] {
  const out: DashNotification[] = []
  for (const o of orders) {
    for (const ev of o.events ?? []) {
      out.push({
        id: `${o.id}:${ev.id}`,
        orderId: o.id,
        orderShort: o.id.slice(0, 8),
        status: ev.status as OrderStatus,
        createdAt: ev.createdAt,
      })
    }
  }
  return out.sort((a, b) => (a.createdAt < b.createdAt ? 1 : -1))
}

export function countUnread(notifs: DashNotification[], lastSeen: string): number {
  if (!lastSeen) return notifs.length
  return notifs.filter((n) => n.createdAt > lastSeen).length
}

const SEEN_KEY = 'laundry_dash_notif_seen'

export function getLastSeen(): string {
  try {
    return localStorage.getItem(SEEN_KEY) ?? ''
  } catch {
    return ''
  }
}

export function setLastSeen(iso: string): void {
  try {
    localStorage.setItem(SEEN_KEY, iso)
  } catch {
    /* ignore */
  }
}
