import { useCallback, useMemo, useState } from 'react'
import {
  ActivityIndicator,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native'
import { useFocusEffect, useRouter } from 'expo-router'
import { StatusBar } from 'expo-status-bar'
import { useSafeAreaInsets } from 'react-native-safe-area-context'
import { useTranslation } from 'react-i18next'
import { localized, type OrderStatus } from '@laundry/shared'
import { listMyOrders, listServiceItems } from '../../lib/api/resources'
import { useAsync } from '../../lib/use-async'
import { cartCount, cartTotal, useCartStore } from '../../stores/cart-store'
import { useAuthStore } from '../../stores/auth-store'
import { DriverHome } from '../../components/driver-home'
import { useNotifStore } from '../../stores/notif-store'
import { buildNotifications, countUnread } from '../../lib/notifications'
import { Badge, Button } from '../../components/ui'
import {
  BellIcon,
  ChevronRightIcon,
  GridIcon,
  MapPinIcon,
  SearchIcon,
  ShirtIcon,
  SlidersIcon,
} from '../../components/icons'
import { STATUS_COLOR, colors, radius, spacing } from '../../theme'

export default function HomeScreen() {
  const { t, i18n } = useTranslation()
  const router = useRouter()
  const insets = useSafeAreaInsets()
  const user = useAuthStore((s) => s.user)
  const isDriver = user?.role === 'driver'
  const services = useAsync(listServiceItems, [])
  const orders = useAsync(listMyOrders, [])
  const [query, setQuery] = useState('')

  const lines = useCartStore((s) => s.lines)
  const add = useCartStore((s) => s.add)
  const count = cartCount(lines)
  const total = cartTotal(lines)

  const lastSeen = useNotifStore((s) => s.lastSeen)
  const unread = useMemo(
    () => countUnread(buildNotifications(orders.data ?? []), lastSeen),
    [orders.data, lastSeen]
  )

  // Refresh recent orders when returning to this tab.
  useFocusEffect(
    useCallback(() => {
      orders.reload()
      // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [])
  )

  const name = user?.firstName || (user?.email ? user.email.split('@')[0] : '')
  const q = query.trim().toLowerCase()
  const filteredServices = (services.data ?? []).filter(
    (s) => !q || localized(s.name, i18n.language).toLowerCase().includes(q)
  )
  const recent = (orders.data ?? []).slice(0, 4)

  // Drivers get a delivery-focused home instead of the customer storefront.
  if (isDriver) return <DriverHome />

  return (
    <View style={styles.container}>
      <StatusBar style="light" />
      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{
          paddingTop: insets.top + spacing.md,
          paddingBottom: insets.bottom + (count > 0 ? 160 : 90),
        }}
      >
        {/* Header */}
        <View style={styles.headerRow}>
          <View style={{ flex: 1 }}>
            <View style={styles.locRow}>
              <MapPinIcon size={14} color={colors.muted} />
              <Text style={styles.location}>{t('home.location')}</Text>
            </View>
            <Text style={styles.greeting} numberOfLines={1}>
              {name ? `${t('home.hi')}, ${name}` : t('home.hi')}
            </Text>
          </View>
          <View style={styles.headerIcons}>
            <Pressable style={styles.iconBtn} onPress={() => router.push('/notifications')}>
              <BellIcon size={20} color={colors.text} />
              {unread > 0 && (
                <View style={styles.badge}>
                  <Text style={styles.badgeText}>{unread > 9 ? '9+' : unread}</Text>
                </View>
              )}
            </Pressable>
            <Pressable style={styles.iconBtn} onPress={() => router.push('/catalog')}>
              <GridIcon size={18} color={colors.text} />
            </Pressable>
          </View>
        </View>

        {/* Search */}
        <View style={styles.search}>
          <SearchIcon size={20} color={colors.muted} />
          <TextInput
            style={styles.searchInput}
            placeholder={t('home.search')}
            placeholderTextColor={colors.muted}
            value={query}
            onChangeText={setQuery}
            returnKeyType="search"
          />
          <SlidersIcon size={20} color={colors.muted} />
        </View>

        {/* Services */}
        <SectionHeader
          title={t('home.services')}
          action={t('home.seeAll')}
          onAction={() => router.push('/catalog')}
        />
        {services.loading ? (
          <ActivityIndicator color={colors.primary} style={{ marginVertical: spacing.lg }} />
        ) : filteredServices.length ? (
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.chipsRow}
          >
            {filteredServices.map((item) => {
              const unit = item.priceType === 'per_kilo' ? t('catalog.perKilo') : t('catalog.perItem')
              return (
                <Pressable key={item.id} style={styles.chip} onPress={() => add(item)}>
                  <View style={styles.chipIcon}>
                    <ShirtIcon size={22} color={colors.primaryText} />
                  </View>
                  <Text style={styles.chipName} numberOfLines={1}>
                    {localized(item.name, i18n.language)}
                  </Text>
                  <Text style={styles.chipPrice}>
                    {item.unitPrice} MAD {unit}
                  </Text>
                </Pressable>
              )
            })}
          </ScrollView>
        ) : (
          <Text style={styles.muted}>{t('home.noServices')}</Text>
        )}

        {/* Recent orders */}
        <SectionHeader
          title={t('home.recent')}
          action={t('home.seeAll')}
          onAction={() => router.push('/(tabs)/orders')}
        />
        <View style={styles.section}>
          {orders.loading && !orders.data ? (
            <ActivityIndicator color={colors.primary} style={{ marginVertical: spacing.lg }} />
          ) : recent.length ? (
            recent.map((o, idx) => {
              const status = o.status as OrderStatus
              const first = o.items?.[0]
              const more = (o.items?.length ?? 0) - 1
              const title = first
                ? `${localized(first.serviceItem.name, i18n.language)}${more > 0 ? ` +${more}` : ''}`
                : `#${o.id.slice(0, 8)}`
              const featured = idx === 0
              return (
                <Pressable
                  key={o.id}
                  style={[styles.orderCard, featured && styles.orderCardFeatured]}
                  onPress={() => router.push(`/order/${o.id}`)}
                >
                  <View style={styles.orderTop}>
                    <Text style={styles.orderDate}>
                      {new Date(o.createdAt).toLocaleDateString()}
                    </Text>
                    <Text style={styles.orderTotal}>{o.total} MAD</Text>
                  </View>
                  <Text style={[styles.orderTitle, featured && styles.orderTitleFeatured]} numberOfLines={1}>
                    {title}
                  </Text>
                  <View style={styles.orderBottom}>
                    <Badge text={t(`status.${status}`)} color={STATUS_COLOR[status]} />
                    <View style={styles.trackRow}>
                      <Text style={styles.trackText}>{t('home.track')}</Text>
                      <ChevronRightIcon size={16} color={colors.primary} />
                    </View>
                  </View>
                </Pressable>
              )
            })
          ) : (
            <Text style={styles.muted}>{t('orders.empty')}</Text>
          )}
        </View>
      </ScrollView>

      {count > 0 && (
        <View style={[styles.cartBar, { bottom: Math.max(insets.bottom - 8, 4) + 66 + spacing.sm }]}>
          <Button
            title={`${t('orders.new')} · ${count} · ${total} MAD`}
            onPress={() => router.push('/order/new')}
          />
        </View>
      )}
    </View>
  )
}

function SectionHeader({
  title,
  action,
  onAction,
}: {
  title: string
  action: string
  onAction: () => void
}) {
  return (
    <View style={styles.sectionHeader}>
      <Text style={styles.sectionTitle}>{title}</Text>
      <Pressable onPress={onAction} hitSlop={8}>
        <Text style={styles.sectionAction}>{action}</Text>
      </Pressable>
    </View>
  )
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.bg },
  headerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: spacing.lg,
    gap: spacing.md,
  },
  locRow: { flexDirection: 'row', alignItems: 'center', gap: 4 },
  location: { color: colors.muted, fontSize: 13 },
  greeting: { color: colors.text, fontSize: 26, fontWeight: '800', marginTop: 2 },
  headerIcons: { flexDirection: 'row', gap: spacing.sm },
  iconBtn: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: colors.card,
    alignItems: 'center',
    justifyContent: 'center',
  },
  badge: {
    position: 'absolute',
    top: 6,
    right: 6,
    minWidth: 18,
    height: 18,
    borderRadius: 9,
    paddingHorizontal: 4,
    backgroundColor: colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 2,
    borderColor: colors.bg,
  },
  badgeText: { color: colors.primaryText, fontSize: 10, fontWeight: '800' },
  search: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    backgroundColor: colors.card,
    borderRadius: radius.pill,
    paddingHorizontal: spacing.md,
    height: 52,
    marginHorizontal: spacing.lg,
    marginTop: spacing.lg,
  },
  searchInput: { flex: 1, color: colors.text, fontSize: 15 },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: spacing.lg,
    marginTop: spacing.xl,
    marginBottom: spacing.md,
  },
  sectionTitle: { color: colors.text, fontSize: 19, fontWeight: '800' },
  sectionAction: { color: colors.primary, fontSize: 14, fontWeight: '600' },
  chipsRow: { paddingHorizontal: spacing.lg, gap: spacing.md },
  chip: {
    width: 140,
    backgroundColor: colors.card,
    borderRadius: radius.lg,
    padding: spacing.md,
    gap: spacing.sm,
  },
  chipIcon: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
  },
  chipName: { color: colors.text, fontSize: 15, fontWeight: '700' },
  chipPrice: { color: colors.muted, fontSize: 12 },
  section: { paddingHorizontal: spacing.lg, gap: spacing.md },
  muted: { color: colors.muted, paddingHorizontal: spacing.lg },
  orderCard: {
    backgroundColor: colors.card,
    borderRadius: radius.lg,
    padding: spacing.md,
    gap: spacing.sm,
  },
  orderCardFeatured: { backgroundColor: colors.cardAlt },
  orderTop: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  orderDate: { color: colors.muted, fontSize: 13 },
  orderTotal: { color: colors.text, fontSize: 15, fontWeight: '700' },
  orderTitle: { color: colors.text, fontSize: 18, fontWeight: '700' },
  orderTitleFeatured: { fontSize: 24, fontWeight: '800' },
  orderBottom: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginTop: 2,
  },
  trackRow: { flexDirection: 'row', alignItems: 'center', gap: 2 },
  trackText: { color: colors.primary, fontSize: 14, fontWeight: '600' },
  cartBar: { position: 'absolute', left: spacing.lg, right: spacing.lg },
})
