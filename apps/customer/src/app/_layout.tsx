import '../lib/i18n';
import { useEffect } from 'react';
import { Stack, useRouter, useSegments } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { useTranslation } from 'react-i18next';
import { useAuthStore } from '../stores/auth-store';
import { colors } from '../theme';

export default function RootLayout() {
  const router = useRouter();
  const segments = useSegments();
  const { t } = useTranslation();
  const hydrated = useAuthStore((s) => s.hydrated);
  const accessToken = useAuthStore((s) => s.accessToken);
  const hydrate = useAuthStore((s) => s.hydrate);

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

  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <SafeAreaProvider>
        <StatusBar style="dark" />
        <Stack screenOptions={{ headerShown: false }}>
          <Stack.Screen name="(auth)" />
          <Stack.Screen name="(tabs)" />
          <Stack.Screen
            name="order/new"
            options={{ headerShown: true, title: t('orders.new') }}
          />
          <Stack.Screen
            name="order/[id]"
            options={{ headerShown: true, title: t('orders.timeline'), headerTintColor: colors.text }}
          />
        </Stack>
      </SafeAreaProvider>
    </GestureHandlerRootView>
  );
}
