import { type OrderStatus } from '@laundry/shared';

// Dark + lime is the default (and only) theme on mobile.
export const colors = {
  bg: '#0e100c', // near-black, faint warm/olive base
  card: '#1a1c17', // dark card, subtle green tint
  cardAlt: '#23261f', // raised/secondary surface
  tabBar: '#33372d', // floating tab bar — distinctly lighter so it reads as a card
  border: '#2c2f27', // hairline border on dark
  text: '#f4f6ef', // near-white
  muted: '#9aa091', // muted grey-green
  primary: '#c5f94e', // lime / chartreuse accent
  primaryText: '#15180e', // near-black text on lime
  primarySoft: '#c5f94e22', // translucent lime fill
  accent: '#c5f94e', // links / highlights (lime)
  social: '#e9ece2', // social button labels & mono icons on dark
  danger: '#ff6b6b',
  success: '#c5f94e',
  // Auth / form surfaces
  inputBg: '#1f221b',
  disabledBg: '#262920',
  disabledText: '#6d7464',
};

export const spacing = { xs: 4, sm: 8, md: 16, lg: 24, xl: 32 };
export const radius = { sm: 10, md: 16, lg: 20, xl: 28, pill: 999 };

export const STATUS_COLOR: Record<OrderStatus, string> = {
  scheduled: '#5b8cff',
  driver_assigned: '#8b87ff',
  picked_up: '#b07cff',
  at_facility: '#3bc9db',
  in_cleaning: '#ffb454',
  ready: '#3bd6c6',
  out_for_delivery: '#ff924d',
  delivered: '#c5f94e',
  cancelled: '#ff6b6b',
};
