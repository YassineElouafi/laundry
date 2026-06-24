import { useEffect, useMemo } from 'react';
import { ActivityIndicator, FlatList, Pressable, StyleSheet, Text, View } from 'react-native';
import { useRouter } from 'expo-router';
import { useTranslation } from 'react-i18next';
import { type OrderStatus } from '@laundry/shared';
import { listMyOrders } from '../lib/api/resources';
import { useAsync } from '../lib/use-async';
import { buildNotifications } from '../lib/notifications';
import { useNotifStore } from '../stores/notif-store';
import { BellIcon, CheckIcon } from '../components/icons';
import { STATUS_COLOR, colors, radius, spacing } from '../theme';

export default function NotificationsScreen() {
  const { t } = useTranslation();
  const router = useRouter();
  const { data, loading } = useAsync(listMyOrders, []);
  const lastSeen = useNotifStore((s) => s.lastSeen);
  const markSeen = useNotifStore((s) => s.markSeen);

  const notifs = useMemo(() => buildNotifications(data ?? []), [data]);

  // Mark everything as read once the list has loaded.
  useEffect(() => {
    if (!loading) void markSeen();
  }, [loading, markSeen]);

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
        data={notifs}
        keyExtractor={(n) => n.id}
        contentContainerStyle={{ padding: spacing.md, gap: spacing.sm }}
        ListEmptyComponent={
          <View style={styles.empty}>
            <BellIcon size={40} color={colors.muted} />
            <Text style={styles.emptyText}>{t('notif.empty')}</Text>
          </View>
        }
        renderItem={({ item }) => {
          const unseen = !lastSeen || item.createdAt > lastSeen;
          const color = STATUS_COLOR[item.status as OrderStatus];
          return (
            <Pressable
              style={[styles.row, unseen && styles.rowUnseen]}
              onPress={() => router.push(`/order/${item.orderId}`)}
            >
              <View style={[styles.dot, { backgroundColor: color + '22' }]}>
                <CheckIcon size={16} color={color} />
              </View>
              <View style={{ flex: 1 }}>
                <Text style={styles.title}>{t(`status.${item.status as OrderStatus}`)}</Text>
                <Text style={styles.body}>
                  {t('notif.order')} #{item.orderId.slice(0, 8)}
                </Text>
                <Text style={styles.time}>{new Date(item.createdAt).toLocaleString()}</Text>
              </View>
              {unseen && <View style={styles.unseenDot} />}
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
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
    backgroundColor: colors.card,
    borderRadius: radius.lg,
    padding: spacing.md,
  },
  rowUnseen: { backgroundColor: colors.cardAlt },
  dot: { width: 40, height: 40, borderRadius: 20, alignItems: 'center', justifyContent: 'center' },
  title: { color: colors.text, fontSize: 16, fontWeight: '700' },
  body: { color: colors.muted, fontSize: 13, marginTop: 1 },
  time: { color: colors.muted, fontSize: 12, marginTop: 2 },
  unseenDot: { width: 10, height: 10, borderRadius: 5, backgroundColor: colors.primary },
  empty: { alignItems: 'center', gap: spacing.md, marginTop: spacing.xl * 3 },
  emptyText: { color: colors.muted, fontSize: 15 },
});
