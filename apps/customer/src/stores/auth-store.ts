import { create } from 'zustand';
import * as SecureStore from 'expo-secure-store';

const ACCESS = 'laundry_access_token';
const REFRESH = 'laundry_refresh_token';

export interface AuthUser {
  id: number | string;
  email: string;
  firstName?: string | null;
  lastName?: string | null;
  role?: string;
}

interface AuthState {
  hydrated: boolean;
  accessToken: string;
  refreshToken: string;
  user: AuthUser | null;
  hydrate: () => Promise<void>;
  setSession: (token: string, refresh: string, user: AuthUser) => Promise<void>;
  setTokens: (token: string, refresh: string) => Promise<void>;
  setUser: (user: AuthUser | null) => void;
  reset: () => Promise<void>;
}

export const useAuthStore = create<AuthState>((set) => ({
  hydrated: false,
  accessToken: '',
  refreshToken: '',
  user: null,

  hydrate: async () => {
    const [accessToken, refreshToken] = await Promise.all([
      SecureStore.getItemAsync(ACCESS),
      SecureStore.getItemAsync(REFRESH),
    ]);
    set({
      accessToken: accessToken ?? '',
      refreshToken: refreshToken ?? '',
      hydrated: true,
    });
  },

  setSession: async (token, refresh, user) => {
    await SecureStore.setItemAsync(ACCESS, token);
    await SecureStore.setItemAsync(REFRESH, refresh);
    set({ accessToken: token, refreshToken: refresh, user });
  },

  setTokens: async (token, refresh) => {
    await SecureStore.setItemAsync(ACCESS, token);
    await SecureStore.setItemAsync(REFRESH, refresh);
    set({ accessToken: token, refreshToken: refresh });
  },

  setUser: (user) => set({ user }),

  reset: async () => {
    await SecureStore.deleteItemAsync(ACCESS);
    await SecureStore.deleteItemAsync(REFRESH);
    set({ accessToken: '', refreshToken: '', user: null });
  },
}));
