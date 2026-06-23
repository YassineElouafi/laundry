import { create } from 'zustand';
import * as SecureStore from 'expo-secure-store';

const ACCESS = 'laundry_access_token';
const REFRESH = 'laundry_refresh_token';
const BIOMETRIC = 'laundry_biometric_enabled';

export interface AuthUser {
  id: number | string;
  email: string;
  firstName?: string | null;
  lastName?: string | null;
  phone?: string | null;
  role?: string;
}

interface AuthState {
  hydrated: boolean;
  accessToken: string;
  refreshToken: string;
  user: AuthUser | null;
  /** Whether the user has opted into biometric app lock. */
  biometricEnabled: boolean;
  /** Runtime gate: true while the app is locked behind biometrics. */
  locked: boolean;
  hydrate: () => Promise<void>;
  setSession: (token: string, refresh: string, user: AuthUser) => Promise<void>;
  setTokens: (token: string, refresh: string) => Promise<void>;
  setUser: (user: AuthUser | null) => void;
  setBiometricEnabled: (enabled: boolean) => Promise<void>;
  lock: () => void;
  unlock: () => void;
  reset: () => Promise<void>;
}

export const useAuthStore = create<AuthState>((set, get) => ({
  hydrated: false,
  accessToken: '',
  refreshToken: '',
  user: null,
  biometricEnabled: false,
  locked: false,

  hydrate: async () => {
    const [accessToken, refreshToken, biometric] = await Promise.all([
      SecureStore.getItemAsync(ACCESS),
      SecureStore.getItemAsync(REFRESH),
      SecureStore.getItemAsync(BIOMETRIC),
    ]);
    const biometricEnabled = biometric === '1';
    set({
      accessToken: accessToken ?? '',
      refreshToken: refreshToken ?? '',
      biometricEnabled,
      // Start locked when there's a session protected by biometrics.
      locked: biometricEnabled && !!accessToken,
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

  setBiometricEnabled: async (enabled) => {
    if (enabled) await SecureStore.setItemAsync(BIOMETRIC, '1');
    else await SecureStore.deleteItemAsync(BIOMETRIC);
    set({ biometricEnabled: enabled });
  },

  lock: () => {
    if (get().biometricEnabled && get().accessToken) set({ locked: true });
  },
  unlock: () => set({ locked: false }),

  reset: async () => {
    await SecureStore.deleteItemAsync(ACCESS);
    await SecureStore.deleteItemAsync(REFRESH);
    await SecureStore.deleteItemAsync(BIOMETRIC);
    set({ accessToken: '', refreshToken: '', user: null, biometricEnabled: false, locked: false });
  },
}));
