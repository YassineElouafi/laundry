import { useState } from 'react';
import { Alert, Pressable, ScrollView, StyleSheet, Switch, Text, View } from 'react-native';
import { useRouter } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useTranslation } from 'react-i18next';
import { useAuthStore } from '../../stores/auth-store';
import { authenticate, isBiometricAvailable } from '../../lib/biometric';
import { ChevronRightIcon, FingerprintIcon } from '../../components/icons';
import { colors, radius, spacing } from '../../theme';

export default function ProfileScreen() {
  const { t, i18n } = useTranslation();
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const user = useAuthStore((s) => s.user);
  const reset = useAuthStore((s) => s.reset);
  const biometricEnabled = useAuthStore((s) => s.biometricEnabled);
  const setBiometricEnabled = useAuthStore((s) => s.setBiometricEnabled);
  const [working, setWorking] = useState(false);

  const name = [user?.firstName, user?.lastName].filter(Boolean).join(' ') || user?.email || '';
  const initials =
    (user?.firstName?.[0] ?? user?.email?.[0] ?? '?').toUpperCase() + (user?.lastName?.[0]?.toUpperCase() ?? '');

  async function logout() {
    await reset();
    router.replace('/(auth)');
  }

  function toggleLang() {
    void i18n.changeLanguage(i18n.language === 'ar' ? 'fr' : 'ar');
  }

  async function onToggleBiometric(next: boolean) {
    if (working) return;
    if (!next) {
      await setBiometricEnabled(false);
      return;
    }
    setWorking(true);
    try {
      const available = await isBiometricAvailable();
      if (!available) {
        Alert.alert(t('biometric.title'), t('biometric.unavailable'));
        return;
      }
      const ok = await authenticate(t('biometric.confirmPrompt'), t('common.cancel'));
      if (!ok) return;
      await setBiometricEnabled(true);
      Alert.alert(t('biometric.title'), t('biometric.enabled'));
    } finally {
      setWorking(false);
    }
  }

  return (
    <ScrollView
      style={styles.container}
      contentContainerStyle={{ padding: spacing.md, paddingBottom: insets.bottom + 100, gap: spacing.lg }}
    >
      {/* Identity */}
      <View style={styles.headerCard}>
        <View style={styles.avatar}>
          <Text style={styles.avatarText}>{initials}</Text>
        </View>
        <View style={{ flex: 1 }}>
          <Text style={styles.name}>{name}</Text>
          <Text style={styles.muted}>{user?.email}</Text>
          {user?.phone ? <Text style={styles.muted}>{user.phone}</Text> : null}
        </View>
      </View>

      {/* Account */}
      <View>
        <Text style={styles.section}>{t('profile.account')}</Text>
        <View style={styles.group}>
          <Pressable
            style={({ pressed }) => [styles.row, pressed && styles.rowPressed]}
            onPress={() => router.push('/account/edit')}
          >
            <Text style={styles.rowLabel}>{t('profile.editProfile')}</Text>
            <ChevronRightIcon />
          </Pressable>
        </View>
      </View>

      {/* Security */}
      <View>
        <Text style={styles.section}>{t('profile.security')}</Text>
        <View style={styles.group}>
          <View style={styles.row}>
            <View style={styles.rowLeft}>
              <View style={styles.rowIcon}>
                <FingerprintIcon size={18} color={colors.primary} />
              </View>
              <View style={{ flex: 1 }}>
                <Text style={styles.rowLabel}>{t('biometric.title')}</Text>
                <Text style={styles.rowSub}>{t('biometric.subtitle')}</Text>
              </View>
            </View>
            <Switch
              value={biometricEnabled}
              onValueChange={onToggleBiometric}
              disabled={working}
              trackColor={{ false: colors.border, true: colors.primary }}
              thumbColor={biometricEnabled ? colors.primaryText : '#f4f6ef'}
              ios_backgroundColor={colors.border}
            />
          </View>
        </View>
      </View>

      {/* Preferences */}
      <View>
        <Text style={styles.section}>{t('profile.preferences')}</Text>
        <View style={styles.group}>
          <Pressable style={({ pressed }) => [styles.row, pressed && styles.rowPressed]} onPress={toggleLang}>
            <Text style={styles.rowLabel}>{t('profile.language')}</Text>
            <Text style={styles.rowValue}>{i18n.language === 'ar' ? 'العربية' : 'Français'}</Text>
          </Pressable>
        </View>
      </View>

      <Pressable
        style={({ pressed }) => [styles.logout, pressed && { opacity: 0.85 }]}
        onPress={logout}
      >
        <Text style={styles.logoutText}>{t('profile.logout')}</Text>
      </Pressable>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.bg },
  headerCard: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
    backgroundColor: colors.card,
    borderRadius: radius.lg,
    padding: spacing.md,
  },
  avatar: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
  },
  avatarText: { color: colors.primaryText, fontSize: 20, fontWeight: '800' },
  name: { fontSize: 18, fontWeight: '700', color: colors.text },
  muted: { color: colors.muted, marginTop: 2, fontSize: 13 },
  section: {
    color: colors.muted,
    fontSize: 12,
    fontWeight: '700',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
    marginBottom: spacing.sm,
    marginLeft: spacing.xs,
  },
  group: { backgroundColor: colors.card, borderRadius: radius.lg, overflow: 'hidden' },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.md,
    minHeight: 60,
  },
  rowPressed: { backgroundColor: colors.cardAlt },
  rowLeft: { flexDirection: 'row', alignItems: 'center', gap: spacing.sm, flex: 1 },
  rowIcon: {
    width: 34,
    height: 34,
    borderRadius: 17,
    backgroundColor: colors.primarySoft,
    alignItems: 'center',
    justifyContent: 'center',
  },
  rowLabel: { color: colors.text, fontSize: 16, fontWeight: '600' },
  rowSub: { color: colors.muted, fontSize: 12, marginTop: 2 },
  rowValue: { color: colors.muted, fontSize: 15 },
  logout: {
    height: 54,
    borderRadius: radius.lg,
    borderWidth: 1,
    borderColor: colors.border,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: spacing.sm,
  },
  logoutText: { color: colors.danger, fontSize: 16, fontWeight: '700' },
});
