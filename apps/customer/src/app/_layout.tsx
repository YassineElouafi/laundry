import '../lib/i18n';
import { useEffect, useRef } from 'react';
import { AppState } from 'react-native';
import { Stack, useRouter, useSegments } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { useTranslation } from 'react-i18next';
import { useAuthStore } from '../stores/auth-store';
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
  const hydrate = useAuthStore((s) => s.hydrate);
  const lock = useAuthStore((s) => s.lock);

  useEffect(() => {
    void hydrate();
  }, [hydrate]);

  useEffect(() => {
    if (!hydrated) return;
    const inAuth = segments[0] === '(auth)';
    if (!accessToken && !inAuth) {
      router.replace('/(auth)');
    } else if (accessToken && inAuth) {
      router.replace('/(tabs)');
    }
  }, [hydrated, accessToken, segments, router]);

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

  const showLock = hydrated && !!accessToken && biometricEnabled && locked;

  return (
    <GestureHandlerRootView style={{ flex: 1, backgroundColor: colors.bg }}>
      <SafeAreaProvider>
        <StatusBar style="light" />
        <Stack screenOptions={{ headerShown: false, contentStyle: { backgroundColor: colors.bg } }}>
          <Stack.Screen name="(auth)" />
          <Stack.Screen name="(tabs)" />
          <Stack.Screen name="order/new" options={{ ...headerOptions, title: t('orders.new') }} />
          <Stack.Screen name="order/[id]" options={{ ...headerOptions, title: t('orders.timeline') }} />
          <Stack.Screen name="account/edit" options={{ ...headerOptions, title: t('profile.editTitle') }} />
        </Stack>
        {showLock && <LockScreen />}
      </SafeAreaProvider>
    </GestureHandlerRootView>
  );
}
