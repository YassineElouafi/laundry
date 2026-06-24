import { create } from 'zustand';
import * as SecureStore from 'expo-secure-store';

const SEEN = 'laundry_notif_seen';

interface NotifState {
  /** ISO timestamp of the last time the notification center was opened. */
  lastSeen: string;
  hydrated: boolean;
  hydrate: () => Promise<void>;
  markSeen: () => Promise<void>;
}

export const useNotifStore = create<NotifState>((set) => ({
  lastSeen: '',
  hydrated: false,
  hydrate: async () => {
    const v = await SecureStore.getItemAsync(SEEN);
    set({ lastSeen: v ?? '', hydrated: true });
  },
  markSeen: async () => {
    const now = new Date().toISOString();
    await SecureStore.setItemAsync(SEEN, now);
    set({ lastSeen: now });
  },
}));
