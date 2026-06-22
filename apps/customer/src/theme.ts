import { type OrderStatus } from '@laundry/shared';

export const colors = {
  bg: '#f7f8fa',
  card: '#ffffff',
  border: '#e6e8ec',
  text: '#101418',
  muted: '#6b7280',
  primary: '#208AEF',
  primaryText: '#ffffff',
  danger: '#dc2626',
  success: '#16a34a',
};

export const spacing = { xs: 4, sm: 8, md: 16, lg: 24, xl: 32 };
export const radius = { sm: 8, md: 12, lg: 16, pill: 999 };

export const STATUS_COLOR: Record<OrderStatus, string> = {
  scheduled: '#2563eb',
  driver_assigned: '#4f46e5',
  picked_up: '#7c3aed',
  at_facility: '#0891b2',
  in_cleaning: '#d97706',
  ready: '#0d9488',
  out_for_delivery: '#ea580c',
  delivered: '#16a34a',
  cancelled: '#dc2626',
};
