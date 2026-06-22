import {
  ActivityIndicator,
  FlatList,
  Pressable,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { useRouter } from 'expo-router';
import { useTranslation } from 'react-i18next';
import { localized } from '@laundry/shared';
import { listServiceItems } from '../../lib/api/resources';
import { useAsync } from '../../lib/use-async';
import { cartCount, cartTotal, useCartStore } from '../../stores/cart-store';
import { Button } from '../../components/ui';
import { colors, radius, spacing } from '../../theme';

export default function CatalogScreen() {
  const { t, i18n } = useTranslation();
  const router = useRouter();
  const { data, loading, error, reload } = useAsync(listServiceItems, []);
  const lines = useCartStore((s) => s.lines);
  const add = useCartStore((s) => s.add);
  const setQty = useCartStore((s) => s.setQty);

  const count = cartCount(lines);
  const total = cartTotal(lines);

  if (loading) {
    return (
      <View style={styles.center}>
        <ActivityIndicator color={colors.primary} />
      </View>
    );
  }
  if (error) {
    return (
      <View style={styles.center}>
        <Button title={t('common.retry')} onPress={reload} variant="outline" />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <FlatList
        data={data ?? []}
        keyExtractor={(it) => it.id}
        contentContainerStyle={{ padding: spacing.md, paddingBottom: 120, gap: spacing.sm }}
        ListEmptyComponent={<Text style={styles.muted}>{t('catalog.empty')}</Text>}
        renderItem={({ item }) => {
          const qty = lines[item.id]?.qty ?? 0;
          const unit = item.priceType === 'per_kilo' ? t('catalog.perKilo') : t('catalog.perItem');
          return (
            <View style={styles.row}>
              <View style={{ flex: 1 }}>
                <Text style={styles.name}>{localized(item.name, i18n.language)}</Text>
                <Text style={styles.price}>
                  {item.unitPrice} MAD {unit}
                </Text>
              </View>
              {qty === 0 ? (
                <Pressable style={styles.addBtn} onPress={() => add(item)}>
                  <Text style={styles.addText}>+ {t('catalog.order')}</Text>
                </Pressable>
              ) : (
                <View style={styles.stepper}>
                  <Pressable style={styles.step} onPress={() => setQty(item.id, qty - 1)}>
                    <Text style={styles.stepText}>−</Text>
                  </Pressable>
                  <Text style={styles.qty}>{qty}</Text>
                  <Pressable style={styles.step} onPress={() => setQty(item.id, qty + 1)}>
                    <Text style={styles.stepText}>+</Text>
                  </Pressable>
                </View>
              )}
            </View>
          );
        }}
      />
      {count > 0 && (
        <View style={styles.bar}>
          <Button
            title={`${t('orders.new')} · ${count} · ${total} MAD`}
            onPress={() => router.push('/order/new')}
          />
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.bg },
  center: { flex: 1, alignItems: 'center', justifyContent: 'center', backgroundColor: colors.bg },
  muted: { color: colors.muted, textAlign: 'center', marginTop: spacing.xl },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.card,
    borderRadius: radius.md,
    borderWidth: 1,
    borderColor: colors.border,
    padding: spacing.md,
  },
  name: { fontSize: 16, fontWeight: '600', color: colors.text },
  price: { color: colors.muted, marginTop: 2 },
  addBtn: { backgroundColor: colors.primary, paddingHorizontal: spacing.md, paddingVertical: spacing.sm, borderRadius: radius.pill },
  addText: { color: colors.primaryText, fontWeight: '600' },
  stepper: { flexDirection: 'row', alignItems: 'center', gap: spacing.sm },
  step: { width: 34, height: 34, borderRadius: radius.pill, backgroundColor: colors.primary, alignItems: 'center', justifyContent: 'center' },
  stepText: { color: colors.primaryText, fontSize: 18, fontWeight: '700' },
  qty: { minWidth: 24, textAlign: 'center', fontSize: 16, fontWeight: '600', color: colors.text },
  bar: { position: 'absolute', left: 0, right: 0, bottom: 0, padding: spacing.md, backgroundColor: colors.bg, borderTopWidth: 1, borderTopColor: colors.border },
});
