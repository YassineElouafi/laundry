import { useCallback } from 'react';
import {
  ActivityIndicator,
  FlatList,
  Pressable,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { useFocusEffect, useRouter } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useTranslation } from 'react-i18next';
import { type OrderStatus } from '@laundry/shared';
import { listMyOrders } from '../../lib/api/resources';
import { useAsync } from '../../lib/use-async';
import { Badge } from '../../components/ui';
import { STATUS_COLOR, colors, radius, spacing } from '../../theme';

export default function OrdersScreen() {
  const { t } = useTranslation();
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { data, loading, reload } = useAsync(listMyOrders, []);

  // Refresh when returning to this tab (e.g. after placing an order).
  useFocusEffect(
    useCallback(() => {
      reload();
    }, [reload])
  );

  if (loading && !data) {
    return (
      <View style={styles.center}>
        <ActivityIndicator color={colors.primary} />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <FlatList
        data={data ?? []}
        keyExtractor={(o) => o.id}
        contentContainerStyle={{ padding: spacing.md, paddingBottom: insets.bottom + 100, gap: spacing.sm }}
        ListEmptyComponent={<Text style={styles.muted}>{t('orders.empty')}</Text>}
        renderItem={({ item }) => {
          const status = item.status as OrderStatus;
          return (
            <Pressable style={styles.card} onPress={() => router.push(`/order/${item.id}`)}>
              <View style={styles.rowBetween}>
                <Text style={styles.id}>#{item.id.slice(0, 8)}</Text>
                <Text style={styles.total}>{item.total} MAD</Text>
              </View>
              <View style={[styles.rowBetween, { marginTop: spacing.sm }]}>
                <Badge text={t(`status.${status}`)} color={STATUS_COLOR[status]} />
                <Text style={styles.muted}>
                  {item.items?.length ?? 0} · {item.paymentMethod.toUpperCase()}
                </Text>
              </View>
            </Pressable>
          );
        }}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.bg },
  center: { flex: 1, alignItems: 'center', justifyContent: 'center', backgroundColor: colors.bg },
  muted: { color: colors.muted, textAlign: 'center', marginTop: spacing.xl },
  card: { backgroundColor: colors.card, borderRadius: radius.md, borderWidth: 1, borderColor: colors.border, padding: spacing.md },
  rowBetween: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  id: { fontFamily: 'monospace', color: colors.text, fontWeight: '600' },
  total: { fontWeight: '700', color: colors.text },
});
