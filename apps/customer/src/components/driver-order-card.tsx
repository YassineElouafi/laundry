import { useState } from 'react';
import { ActivityIndicator, Alert, Pressable, StyleSheet, Text, View } from 'react-native';
import { useRouter } from 'expo-router';
import { useTranslation } from 'react-i18next';
import { localized, type OrderDto, type OrderStatus } from '@laundry/shared';
import { advanceOrderStatus } from '../lib/api/resources';
import { nextStatus } from '../lib/order-flow';
import { Badge } from './ui';
import { ChevronRightIcon } from './icons';
import { STATUS_COLOR, colors, radius, spacing } from '../theme';

export function DriverOrderCard({
  order,
  onChanged,
}: {
  order: OrderDto;
  onChanged: () => void;
}) {
  const { t, i18n } = useTranslation();
  const router = useRouter();
  const [busy, setBusy] = useState(false);

  const status = order.status as OrderStatus;
  const next = nextStatus(status);
  const customer = [order.user?.firstName, order.user?.lastName].filter(Boolean).join(' ');
  const first = order.items?.[0];
  const more = (order.items?.length ?? 0) - 1;
  const summary = first
    ? `${localized(first.serviceItem.name, i18n.language)}${more > 0 ? ` +${more}` : ''}`
    : `#${order.id.slice(0, 8)}`;

  async function advance() {
    if (!next || busy) return;
    setBusy(true);
    try {
      await advanceOrderStatus(order.id, next);
      onChanged();
    } catch {
      Alert.alert(t('driver.deliveries'), t('driver.updateError'));
    } finally {
      setBusy(false);
    }
  }

  return (
    <View style={styles.card}>
      <Pressable style={styles.head} onPress={() => router.push(`/order/${order.id}`)}>
        <View style={{ flex: 1 }}>
          <Text style={styles.id}>#{order.id.slice(0, 8)}</Text>
          <Text style={styles.summary} numberOfLines={1}>{summary}</Text>
          {customer ? (
            <Text style={styles.customer}>
              {t('driver.customer')}: {customer}
            </Text>
          ) : null}
        </View>
        <View style={styles.right}>
          <Text style={styles.total}>{order.total} MAD</Text>
          <Badge text={t(`status.${status}`)} color={STATUS_COLOR[status]} />
        </View>
      </Pressable>

      {next ? (
        <Pressable
          style={({ pressed }) => [styles.action, (pressed || busy) && { opacity: 0.85 }]}
          onPress={advance}
          disabled={busy}
        >
          {busy ? (
            <ActivityIndicator color={colors.primaryText} />
          ) : (
            <>
              <Text style={styles.actionText}>
                {t('driver.advance')}: {t(`status.${next}`)}
              </Text>
              <ChevronRightIcon size={18} color={colors.primaryText} />
            </>
          )}
        </Pressable>
      ) : (
        <View style={styles.doneRow}>
          <Text style={styles.doneText}>{t('driver.done')}</Text>
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  card: { backgroundColor: colors.card, borderRadius: radius.lg, padding: spacing.md, gap: spacing.md },
  head: { flexDirection: 'row', alignItems: 'flex-start', gap: spacing.md },
  id: { fontFamily: 'monospace', color: colors.muted, fontSize: 12 },
  summary: { color: colors.text, fontSize: 17, fontWeight: '700', marginTop: 2 },
  customer: { color: colors.muted, fontSize: 13, marginTop: 2 },
  right: { alignItems: 'flex-end', gap: spacing.xs },
  total: { color: colors.text, fontSize: 15, fontWeight: '700' },
  action: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: spacing.xs,
    height: 48,
    borderRadius: radius.pill,
    backgroundColor: colors.primary,
  },
  actionText: { color: colors.primaryText, fontSize: 15, fontWeight: '700' },
  doneRow: {
    height: 40,
    borderRadius: radius.pill,
    borderWidth: 1,
    borderColor: colors.border,
    alignItems: 'center',
    justifyContent: 'center',
  },
  doneText: { color: colors.muted, fontSize: 14, fontWeight: '600' },
});
