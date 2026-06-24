import {
  ActivityIndicator,
  Alert,
  ImageBackground,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import * as Linking from 'expo-linking';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import { useTranslation } from 'react-i18next';
import { type OrderStatus } from '@laundry/shared';
import { getMyOrder } from '../../lib/api/resources';
import { useAsync } from '../../lib/use-async';
import {
  ArrowLeftIcon,
  BikeIcon,
  ChatIcon,
  CheckIcon,
  PhoneIcon,
} from '../../components/icons';
import { colors, radius, spacing } from '../../theme';

const HERO = require('../../../assets/images/laundromat.jpg');

// Canonical happy-path order flow for the timeline.
const FLOW: OrderStatus[] = [
  'scheduled',
  'driver_assigned',
  'picked_up',
  'at_facility',
  'in_cleaning',
  'ready',
  'out_for_delivery',
  'delivered',
];

export default function OrderTrackingScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const { t } = useTranslation();
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { data: order, loading } = useAsync(() => getMyOrder(String(id)), [id]);

  if (loading && !order) {
    return (
      <View style={styles.center}>
        <StatusBar style="light" />
        <ActivityIndicator color={colors.primary} />
      </View>
    );
  }
  if (!order) return <View style={styles.center} />;

  const status = order.status as OrderStatus;
  const cancelled = status === 'cancelled';
  const currentIndex = FLOW.indexOf(status);
  const events = order.events ?? [];
  const tsFor = (s: OrderStatus) => events.find((e) => e.status === s)?.createdAt;

  const driver = order.driver;
  const driverName = [driver?.firstName, driver?.lastName].filter(Boolean).join(' ');
  const driverInitials =
    (driver?.firstName?.[0] ?? '?').toUpperCase() + (driver?.lastName?.[0]?.toUpperCase() ?? '');

  function callDriver() {
    if (!driver?.phone) return Alert.alert(t('track.title'), t('track.noPhone'));
    void Linking.openURL(`tel:${driver.phone}`);
  }
  function messageDriver() {
    if (!driver?.phone) return Alert.alert(t('track.title'), t('track.noPhone'));
    void Linking.openURL(`sms:${driver.phone}`);
  }

  return (
    <View style={styles.container}>
      <StatusBar style="light" />
      <ScrollView
        contentContainerStyle={{ paddingBottom: insets.bottom + spacing.xl }}
        showsVerticalScrollIndicator={false}
      >
        {/* Hero image with header + driver card */}
        <ImageBackground source={HERO} style={styles.hero}>
          <LinearGradient
            colors={['rgba(0,0,0,0.55)', 'rgba(0,0,0,0.1)', 'rgba(14,16,12,0.6)', colors.bg]}
            locations={[0, 0.35, 0.8, 1]}
            style={StyleSheet.absoluteFill}
          />
          <View style={[styles.header, { paddingTop: insets.top + spacing.sm }]}>
            <Pressable onPress={() => router.back()} hitSlop={10} style={styles.backBtn}>
              <ArrowLeftIcon color="#ffffff" size={22} />
            </Pressable>
            <Text style={styles.headerTitle}>{t('track.title')}</Text>
            <View style={{ width: 40 }} />
          </View>

          {/* Driver card overlapping the bottom of the hero */}
          <View style={styles.driverWrap}>
            {driver ? (
              <View style={styles.driverCard}>
                <View style={[styles.driverAvatar, styles.driverAvatarFallback]}>
                  <Text style={styles.driverInitials}>{driverInitials}</Text>
                </View>
                <View style={{ flex: 1 }}>
                  <Text style={styles.driverName}>{driverName || t('track.driverRole')}</Text>
                  <Text style={styles.driverRole}>{t('track.driverRole')}</Text>
                </View>
                <Pressable onPress={messageDriver} style={styles.driverAction} hitSlop={6}>
                  <ChatIcon size={18} color={colors.primary} />
                </Pressable>
                <Pressable onPress={callDriver} style={styles.driverAction} hitSlop={6}>
                  <PhoneIcon size={18} color={colors.primary} />
                </Pressable>
              </View>
            ) : (
              <View style={styles.driverPending}>
                <View style={styles.pendingDot} />
                <View style={{ flex: 1 }}>
                  <Text style={styles.driverPendingTitle}>{t('track.awaitingDriver')}</Text>
                  <Text style={styles.driverRole}>{t('track.awaitingDriverSub')}</Text>
                </View>
              </View>
            )}
          </View>
        </ImageBackground>

        {/* Status timeline */}
        <View style={styles.body}>
          <Text style={styles.statusTitle}>{t('track.statusTitle')}</Text>

          {cancelled && (
            <View style={styles.cancelledBanner}>
              <Text style={styles.cancelledText}>{t('track.cancelled')}</Text>
            </View>
          )}

          <View style={{ marginTop: spacing.md }}>
            {FLOW.map((step, i) => {
              const isDone = i < currentIndex || status === 'delivered';
              const isCurrent = i === currentIndex && status !== 'delivered' && !cancelled;
              const last = i === FLOW.length - 1;
              const ts = tsFor(step);
              return (
                <View key={step} style={styles.step}>
                  <View style={styles.stepCol}>
                    <View
                      style={[
                        styles.node,
                        isDone && styles.nodeDone,
                        isCurrent && styles.nodeCurrent,
                        !isDone && !isCurrent && styles.nodePending,
                      ]}
                    >
                      {isDone ? (
                        <CheckIcon size={16} color={colors.primaryText} />
                      ) : isCurrent ? (
                        <ActivityIndicator size="small" color={colors.primary} />
                      ) : step === 'out_for_delivery' ? (
                        <BikeIcon size={16} color={colors.muted} />
                      ) : null}
                    </View>
                    {!last && <View style={[styles.connector, isDone && styles.connectorDone]} />}
                  </View>
                  <View style={{ flex: 1, paddingBottom: last ? 0 : spacing.lg }}>
                    <Text style={[styles.stepLabel, !isDone && !isCurrent && styles.stepLabelMuted]}>
                      {t(`status.${step}`)}
                    </Text>
                    <Text style={styles.stepSub}>
                      {ts ? new Date(ts).toLocaleString() : t('track.pending')}
                    </Text>
                  </View>
                </View>
              );
            })}
          </View>
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.bg },
  center: { flex: 1, alignItems: 'center', justifyContent: 'center', backgroundColor: colors.bg },
  hero: { width: '100%', height: 420, justifyContent: 'space-between' },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: spacing.md,
    paddingBottom: spacing.sm,
  },
  backBtn: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(0,0,0,0.4)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  headerTitle: { color: '#fff', fontSize: 18, fontWeight: '700' },
  driverWrap: { paddingHorizontal: spacing.md, paddingBottom: spacing.lg },
  driverCard: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    backgroundColor: colors.primary,
    borderRadius: radius.lg,
    padding: spacing.sm,
  },
  driverAvatar: { width: 48, height: 48, borderRadius: 24, marginRight: spacing.xs },
  driverAvatarFallback: { backgroundColor: colors.bg, alignItems: 'center', justifyContent: 'center' },
  driverInitials: { color: colors.primary, fontWeight: '800', fontSize: 16 },
  driverName: { color: colors.primaryText, fontSize: 17, fontWeight: '800' },
  driverRole: { color: colors.primaryText, opacity: 0.7, fontSize: 13, marginTop: 1 },
  driverAction: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: colors.bg,
    alignItems: 'center',
    justifyContent: 'center',
  },
  driverPending: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    backgroundColor: colors.cardAlt,
    borderRadius: radius.lg,
    padding: spacing.md,
  },
  pendingDot: { width: 12, height: 12, borderRadius: 6, backgroundColor: colors.muted },
  driverPendingTitle: { color: colors.text, fontSize: 15, fontWeight: '700' },
  body: { paddingHorizontal: spacing.lg, paddingTop: spacing.lg },
  statusTitle: { color: colors.text, fontSize: 22, fontWeight: '800' },
  cancelledBanner: {
    marginTop: spacing.md,
    backgroundColor: colors.danger + '22',
    borderRadius: radius.md,
    padding: spacing.md,
  },
  cancelledText: { color: colors.danger, fontWeight: '600' },
  step: { flexDirection: 'row', gap: spacing.md },
  stepCol: { alignItems: 'center' },
  node: {
    width: 44,
    height: 44,
    borderRadius: 22,
    alignItems: 'center',
    justifyContent: 'center',
  },
  nodeDone: { backgroundColor: colors.primary },
  nodeCurrent: { backgroundColor: colors.primarySoft, borderWidth: 2, borderColor: colors.primary },
  nodePending: { borderWidth: 2, borderColor: colors.border, borderStyle: 'dashed' },
  connector: { width: 2, flex: 1, minHeight: 18, backgroundColor: colors.border, marginVertical: 2 },
  connectorDone: { backgroundColor: colors.primary },
  stepLabel: { color: colors.text, fontSize: 17, fontWeight: '700', marginTop: spacing.sm },
  stepLabelMuted: { color: colors.muted },
  stepSub: { color: colors.muted, fontSize: 13, marginTop: 2 },
});
