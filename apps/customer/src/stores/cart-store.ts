import { create } from 'zustand';
import type { ServiceItemDto } from '@laundry/shared';

export interface CartLine {
  item: ServiceItemDto;
  qty: number;
}

interface CartState {
  lines: Record<string, CartLine>;
  add: (item: ServiceItemDto) => void;
  setQty: (id: string, qty: number) => void;
  clear: () => void;
}

export const useCartStore = create<CartState>((set) => ({
  lines: {},
  add: (item) =>
    set((s) => ({
      lines: {
        ...s.lines,
        [item.id]: { item, qty: (s.lines[item.id]?.qty ?? 0) + 1 },
      },
    })),
  setQty: (id, qty) =>
    set((s) => {
      const next = { ...s.lines };
      if (qty <= 0) delete next[id];
      else if (next[id]) next[id] = { ...next[id], qty };
      return { lines: next };
    }),
  clear: () => set({ lines: {} }),
}));

export function cartTotal(lines: Record<string, CartLine>): number {
  return Object.values(lines).reduce((sum, l) => sum + l.item.unitPrice * l.qty, 0);
}

export function cartCount(lines: Record<string, CartLine>): number {
  return Object.values(lines).reduce((n, l) => n + l.qty, 0);
}
