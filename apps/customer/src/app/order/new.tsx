import { useState } from 'react';
import { Alert, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { useRouter } from 'expo-router';
import * as Linking from 'expo-linking';
import { useTranslation } from 'react-i18next';
import { localized, type PaymentMethod } from '@laundry/shared';
import {
  createAddress,
  createOrder,
  initiatePayment,
  listAddresses,
} from '../../lib/api/resources';
import { useAsync } from '../../lib/use-async';
import { cartTotal, useCartStore } from '../../stores/cart-store';
import { Button, Card, Field } from '../../components/ui';
import { colors, radius, spacing } from '../../theme';

export default function NewOrderScreen() {
  const { t, i18n } = useTranslation();
  const router = useRouter();
  const lines = useCartStore((s) => s.lines);
  const clear = useCartStore((s) => s.clear);
  const addresses = useAsync(listAddresses, []);

  const [addressId, setAddressId] = useState<string>('');
  const [method, setMethod] = useState<PaymentMethod>('cod');
  const [placing, setPlacing] = useState(false);

  // Inline new-address form
  const [adding, setAdding] = useState(false);
  const [label, setLabel] = useState('');
  const [line1, setLine1] = useState('');
  const [city, setCity] = useState('');

  const cart = Object.values(lines);
  const total = cartTotal(lines);
  const selected = addressId || addresses.data?.find((a) => a.isDefault)?.id || addresses.data?.[0]?.id || '';

  async function saveAddress() {
    if (!label || !line1 || !city) return;
    const a = await createAddress({ label, line1, city, isDefault: !addresses.data?.length });
    setAdding(false);
    setLabel('');
    setLine1('');
    setCity('');
    addresses.reload();
    setAddressId(a.id);
  }

  async function place() {
    if (!selected || !cart.length) {
      Alert.alert(t('orders.new'), t('orders.chooseAddress'));
      return;
    }
    setPlacing(true);
    try {
      const order = await createOrder({
        paymentMethod: method,
        pickupAddress: { id: selected },
        deliveryAddress: { id: selected },
        items: cart.map((l) => ({ serviceItem: { id: l.item.id }, quantity: l.qty })),
      });
      const pay = await initiatePayment(order.id);
      clear();
      if (method === 'cmi' && pay.redirect?.url) {
        await Linking.openURL(pay.redirect.url).catch(() => {});
      }
      router.replace(`/order/${order.id}`);
    } catch {
      Alert.alert(t('orders.new'), t('auth.loginError'));
    } finally {
      setPlacing(false);
    }
  }

  return (
    <ScrollView style={styles.container} contentContainerStyle={{ padding: spacing.md, gap: spacing.md, paddingBottom: spacing.xl }}>
      {/* Cart */}
      <Card>
        <Text style={styles.h}>{t('orders.items')}</Text>
        {cart.map((l) => (
          <View key={l.item.id} style={styles.line}>
            <Text style={styles.lineText}>
              {l.qty}× {localized(l.item.name, i18n.language)}
            </Text>
            <Text style={styles.lineText}>{l.item.unitPrice * l.qty} MAD</Text>
          </View>
        ))}
        <View style={[styles.line, { borderTopWidth: 1, borderTopColor: colors.border, paddingTop: spacing.sm, marginTop: spacing.sm }]}>
          <Text style={styles.total}>{t('common.total')}</Text>
          <Text style={styles.total}>{total} MAD</Text>
        </View>
      </Card>

      {/* Address */}
      <Card>
        <Text style={styles.h}>{t('orders.pickup')} / {t('orders.delivery')}</Text>
        {(addresses.data ?? []).map((a) => (
          <Pressable
            key={a.id}
            style={[styles.option, selected === a.id && styles.optionSelected]}
            onPress={() => setAddressId(a.id)}
          >
            <Text style={styles.optionTitle}>{a.label}</Text>
            <Text style={styles.muted}>{a.line1}, {a.city}</Text>
          </Pressable>
        ))}
        {adding ? (
          <View style={{ gap: spacing.sm, marginTop: spacing.sm }}>
            <Field label={t('address.label')} value={label} onChangeText={setLabel} />
            <Field label={t('address.line1')} value={line1} onChangeText={setLine1} />
            <Field label={t('address.city')} value={city} onChangeText={setCity} />
            <Button title={t('common.save')} onPress={saveAddress} variant="outline" />
          </View>
        ) : (
          <Pressable onPress={() => setAdding(true)}>
            <Text style={styles.link}>+ {t('address.add')}</Text>
          </Pressable>
        )}
      </Card>

      {/* Payment */}
      <Card>
        <Text style={styles.h}>{t('orders.payment')}</Text>
        <View style={{ flexDirection: 'row', gap: spacing.sm }}>
          {(['cod', 'cmi'] as PaymentMethod[]).map((m) => (
            <Pressable
              key={m}
              style={[styles.pay, method === m && styles.optionSelected]}
              onPress={() => setMethod(m)}
            >
              <Text style={[styles.optionTitle, method === m && { color: colors.primary }]}>
                {t(`orders.${m}`)}
              </Text>
            </Pressable>
          ))}
        </View>
      </Card>

      <Button title={t('orders.place')} onPress={place} loading={placing} />
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.bg },
  h: { fontSize: 16, fontWeight: '700', color: colors.text, marginBottom: spacing.sm },
  line: { flexDirection: 'row', justifyContent: 'space-between', paddingVertical: 2 },
  lineText: { color: colors.text },
  total: { fontWeight: '700', color: colors.text },
  option: { borderWidth: 1, borderColor: colors.border, borderRadius: radius.md, padding: spacing.sm, marginBottom: spacing.sm },
  optionSelected: { borderColor: colors.primary, backgroundColor: colors.primary + '11' },
  optionTitle: { fontWeight: '600', color: colors.text },
  muted: { color: colors.muted, marginTop: 2 },
  link: { color: colors.primary, fontWeight: '600', paddingVertical: spacing.xs },
  pay: { flex: 1, alignItems: 'center', borderWidth: 1, borderColor: colors.border, borderRadius: radius.md, padding: spacing.md },
});
