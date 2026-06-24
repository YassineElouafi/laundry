import { useCallback } from 'react';
import { ActivityIndicator, FlatList, StyleSheet, Text, View } from 'react-native';
import { useFocusEffect } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useTranslation } from 'react-i18next';
import { type OrderStatus } from '@laundry/shared';
import { listDriverOrders } from '../lib/api/resources';
import { useAsync } from '../lib/use-async';
import { isTerminal } from '../lib/order-flow';
import { useAuthStore } from '../stores/auth-store';
import { DriverOrderCard } from './driver-order-card';
import { MapPinIcon } from './icons';
import { colors, spacing } from '../theme';

export function DriverHome() {
  const { t } = useTranslation();
  const insets = useSafeAreaInsets();
  const user = useAuthStore((s) => s.user);
  const { data, loading, reload } = useAsync(listDriverOrders, []);

  useFocusEffect(
    useCallback(() => {
      reload();
      // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [])
  );

  const name = user?.firstName || (user?.email ? user.email.split('@')[0] : '');
  const orders = data ?? [];
  const active = orders.filter((o) => !isTerminal(o.status as OrderStatus));

  return (
    <View style={styles.container}>
      <StatusBar style="light" />
      <FlatList
        data={active}
        keyExtractor={(o) => o.id}
        onRefresh={reload}
        refreshing={loading && !!data}
        contentContainerStyle={{
          paddingTop: insets.top + spacing.md,
          paddingHorizontal: spacing.lg,
          paddingBottom: insets.bottom + 90,
          gap: spacing.md,
        }}
        ListHeaderComponent={
          <View style={{ marginBottom: spacing.sm }}>
            <View style={styles.locRow}>
              <MapPinIcon size={14} color={colors.muted} />
              <Text style={styles.location}>{t('home.location')}</Text>
            </View>
            <Text style={styles.greeting}>
              {name ? `${t('home.hi')}, ${name}` : t('home.hi')}
            </Text>
            <Text style={styles.section}>
              {t('driver.assigned')}
              {active.length ? ` · ${active.length}` : ''}
            </Text>
          </View>
        }
        renderItem={({ item }) => <DriverOrderCard order={item} onChanged={reload} />}
        ListEmptyComponent={
          loading ? (
            <ActivityIndicator color={colors.primary} style={{ marginTop: spacing.xl }} />
          ) : (
            <Text style={styles.empty}>{t('driver.empty')}</Text>
          )
        }
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.bg },
  locRow: { flexDirection: 'row', alignItems: 'center', gap: 4 },
  location: { color: colors.muted, fontSize: 13 },
  greeting: { color: colors.text, fontSize: 26, fontWeight: '800', marginTop: 2 },
  section: { color: colors.muted, fontSize: 15, fontWeight: '600', marginTop: spacing.md },
  empty: { color: colors.muted, textAlign: 'center', marginTop: spacing.xl * 2 },
});
