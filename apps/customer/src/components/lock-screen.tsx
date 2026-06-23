import { useCallback, useEffect, useState } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { useRouter } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { useTranslation } from 'react-i18next';
import { useAuthStore } from '../stores/auth-store';
import { authenticate } from '../lib/biometric';
import { FingerprintIcon, LockIcon } from './icons';
import { colors, radius, spacing } from '../theme';

export function LockScreen() {
  const { t } = useTranslation();
  const router = useRouter();
  const unlock = useAuthStore((s) => s.unlock);
  const reset = useAuthStore((s) => s.reset);
  const [busy, setBusy] = useState(false);

  const tryUnlock = useCallback(async () => {
    if (busy) return;
    setBusy(true);
    const ok = await authenticate(t('biometric.unlockPrompt'), t('common.cancel'));
    setBusy(false);
    if (ok) unlock();
  }, [busy, t, unlock]);

  // Auto-prompt as soon as the lock screen appears.
  useEffect(() => {
    void tryUnlock();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  async function logout() {
    await reset();
    router.replace('/(auth)');
  }

  return (
    <View style={styles.container}>
      <StatusBar style="light" />
      <View style={styles.iconWrap}>
        <LockIcon size={44} />
      </View>
      <Text style={styles.title}>{t('biometric.lockedTitle')}</Text>
      <Text style={styles.subtitle}>{t('biometric.lockedSubtitle')}</Text>

      <Pressable
        onPress={tryUnlock}
        style={({ pressed }) => [styles.btn, pressed && { opacity: 0.85 }]}
      >
        <FingerprintIcon size={20} color={colors.primaryText} />
        <Text style={styles.btnText}>{t('biometric.unlock')}</Text>
      </Pressable>

      <Pressable onPress={logout} hitSlop={8} style={{ marginTop: spacing.lg }}>
        <Text style={styles.logout}>{t('profile.logout')}</Text>
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: colors.bg,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: spacing.xl,
    zIndex: 1000,
  },
  iconWrap: {
    width: 88,
    height: 88,
    borderRadius: 44,
    backgroundColor: colors.primarySoft,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: spacing.lg,
  },
  title: { color: colors.text, fontSize: 22, fontWeight: '800', textAlign: 'center' },
  subtitle: {
    color: colors.muted,
    fontSize: 15,
    textAlign: 'center',
    marginTop: spacing.sm,
    marginBottom: spacing.xl,
  },
  btn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: spacing.sm,
    height: 54,
    paddingHorizontal: spacing.xl,
    borderRadius: radius.pill,
    backgroundColor: colors.primary,
  },
  btnText: { color: colors.primaryText, fontSize: 16, fontWeight: '700' },
  logout: { color: colors.muted, fontSize: 14, fontWeight: '600' },
});
