import {
  ActivityIndicator,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { useLocalSearchParams } from 'expo-router';
import { useTranslation } from 'react-i18next';
import { localized, type OrderStatus } from '@laundry/shared';
import { getMyOrder } from '../../lib/api/resources';
import { useAsync } from '../../lib/use-async';
import { Badge, Card } from '../../components/ui';
import { STATUS_COLOR, colors, spacing } from '../../theme';

export default function OrderTrackingScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const { t, i18n } = useTranslation();
  const { data: order, loading } = useAsync(() => getMyOrder(String(id)), [id]);

  if (loading || !order) {
    return (
      <View style={styles.center}>
        <ActivityIndicator color={colors.primary} />
      </View>
    );
  }

  const status = order.status as OrderStatus;
  const events = (order.events ?? [])
    .slice()
    .sort((a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime());

  return (
    <ScrollView style={styles.container} contentContainerStyle={{ padding: spacing.md, gap: spacing.md }}>
      <View style={styles.headerRow}>
        <Text style={styles.id}>#{order.id.slice(0, 8)}</Text>
        <Badge text={t(`status.${status}`)} color={STATUS_COLOR[status]} />
      </View>

      <Card>
        <Text style={styles.h}>{t('orders.items')}</Text>
        {order.items?.map((it) => (
          <View key={it.id} style={styles.line}>
            <Text style={styles.lineText}>
              {it.quantity}× {localized(it.serviceItem.name, i18n.language)}
            </Text>
            <Text style={styles.lineText}>{it.lineTotal} MAD</Text>
          </View>
        ))}
        <View style={[styles.line, styles.totalRow]}>
          <Text style={styles.total}>{t('common.total')}</Text>
          <Text style={styles.total}>{order.total} MAD</Text>
        </View>
      </Card>

      <Card>
        <Text style={styles.h}>{t('orders.timeline')}</Text>
        {events.map((ev) => (
          <View key={ev.id} style={styles.event}>
            <View style={[styles.dot, { backgroundColor: STATUS_COLOR[ev.status as OrderStatus] }]} />
            <View style={{ flex: 1 }}>
              <Text style={styles.eventStatus}>{t(`status.${ev.status as OrderStatus}`)}</Text>
              <Text style={styles.muted}>{new Date(ev.createdAt).toLocaleString()}</Text>
              {ev.note ? <Text style={styles.muted}>{ev.note}</Text> : null}
            </View>
          </View>
        ))}
      </Card>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.bg },
  center: { flex: 1, alignItems: 'center', justifyContent: 'center', backgroundColor: colors.bg },
  headerRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  id: { fontFamily: 'monospace', fontSize: 18, fontWeight: '700', color: colors.text },
  h: { fontSize: 16, fontWeight: '700', color: colors.text, marginBottom: spacing.sm },
  line: { flexDirection: 'row', justifyContent: 'space-between', paddingVertical: 2 },
  lineText: { color: colors.text },
  totalRow: { borderTopWidth: 1, borderTopColor: colors.border, paddingTop: spacing.sm, marginTop: spacing.sm },
  total: { fontWeight: '700', color: colors.text },
  event: { flexDirection: 'row', gap: spacing.sm, paddingVertical: spacing.sm },
  dot: { width: 12, height: 12, borderRadius: 6, marginTop: 4 },
  eventStatus: { fontWeight: '600', color: colors.text },
  muted: { color: colors.muted, marginTop: 2, fontSize: 12 },
});
