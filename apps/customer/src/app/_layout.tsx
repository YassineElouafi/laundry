import '../lib/i18n';
import { useEffect, useRef } from 'react';
import { AppState } from 'react-native';
import { Stack, useRouter, useSegments } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { useTranslation } from 'react-i18next';
import { useAuthStore } from '../stores/auth-store';
import { useNotifStore } from '../stores/notif-store';
import { fetchMe, toAuthUser } from '../lib/api/auth';
import { LockScreen } from '../components/lock-screen';
import { colors } from '../theme';

export default function RootLayout() {
  const router = useRouter();
  const segments = useSegments();
  const { t } = useTranslation();
  const hydrated = useAuthStore((s) => s.hydrated);
  const accessToken = useAuthStore((s) => s.accessToken);
  const biometricEnabled = useAuthStore((s) => s.biometricEnabled);
  const locked = useAuthStore((s) => s.locked);
  const user = useAuthStore((s) => s.user);
  const hydrate = useAuthStore((s) => s.hydrate);
  const setUser = useAuthStore((s) => s.setUser);
  const lock = useAuthStore((s) => s.lock);
  const hydrateNotif = useNotifStore((s) => s.hydrate);

  useEffect(() => {
    void hydrate();
    void hydrateNotif();
  }, [hydrate, hydrateNotif]);

  // Restore the current user on cold start (hydrate only restores tokens).
  useEffect(() => {
    if (hydrated && accessToken && !user) {
      fetchMe()
        .then((u) => setUser(toAuthUser(u)))
        .catch(() => {});
    }
  }, [hydrated, accessToken, user, setUser]);

  const inAuth = segments[0] === '(auth)';
  const inTabs = segments[0] === '(tabs)';

  useEffect(() => {
    if (!hydrated) return;
    if (!accessToken && !inAuth) {
      router.replace('/(auth)');
    } else if (accessToken && inAuth && !locked) {
      // Stay on the auth screens while locked so the user can unlock there.
      router.replace('/(tabs)');
    }
  }, [hydrated, accessToken, locked, inAuth, router]);

  // Re-lock when the app returns to the foreground from background.
  const appState = useRef(AppState.currentState);
  useEffect(() => {
    const sub = AppState.addEventListener('change', (next) => {
      if (appState.current.match(/inactive|background/) && next === 'active') {
        lock();
      }
      appState.current = next;
    });
    return () => sub.remove();
  }, [lock]);

  const headerOptions = {
    headerShown: true,
    headerStyle: { backgroundColor: colors.bg },
    headerShadowVisible: false,
    headerTintColor: colors.text,
    headerTitleStyle: { color: colors.text },
  } as const;

  // Cold-start locks are handled on the auth screens; the overlay only covers
  // an in-app re-lock (returning from background while inside the tabs).
  const showLock = hydrated && !!accessToken && biometricEnabled && locked && inTabs;

  return (
    <GestureHandlerRootView style={{ flex: 1, backgroundColor: colors.bg }}>
      <SafeAreaProvider>
        <StatusBar style="light" />
        <Stack screenOptions={{ headerShown: false, contentStyle: { backgroundColor: colors.bg } }}>
          <Stack.Screen name="(auth)" />
          <Stack.Screen name="(tabs)" />
          <Stack.Screen name="catalog" options={{ ...headerOptions, title: t('catalog.title') }} />
          <Stack.Screen name="notifications" options={{ ...headerOptions, title: t('notif.title') }} />
          <Stack.Screen name="order/new" options={{ ...headerOptions, title: t('orders.new') }} />
          <Stack.Screen name="order/[id]" options={{ headerShown: false }} />
          <Stack.Screen name="account/edit" options={{ ...headerOptions, title: t('profile.editTitle') }} />
        </Stack>
        {showLock && <LockScreen />}
      </SafeAreaProvider>
    </GestureHandlerRootView>
  );
}
