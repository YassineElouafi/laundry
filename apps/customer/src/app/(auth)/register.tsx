import { useState } from 'react';
import { Alert, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { useRouter } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useTranslation } from 'react-i18next';
import { login, register, toAuthUser } from '../../lib/api/auth';
import { useAuthStore } from '../../stores/auth-store';
import { PrimaryButton, SoftField } from '../../components/ui';
import { ArrowLeftIcon, EyeIcon, EyeOffIcon, InfoIcon } from '../../components/icons';
import { colors, spacing } from '../../theme';

export default function RegisterScreen() {
  const { t } = useTranslation();
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const setSession = useAuthStore((s) => s.setSession);
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [phone, setPhone] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [secure, setSecure] = useState(true);
  const [loading, setLoading] = useState(false);

  const canSubmit =
    firstName.trim().length > 0 &&
    lastName.trim().length > 0 &&
    email.trim().length > 0 &&
    password.length >= 6;

  function goBack() {
    if (router.canGoBack()) router.back();
    else router.replace('/(auth)');
  }

  async function onSubmit() {
    if (!canSubmit) return;
    setLoading(true);
    try {
      await register({ email: email.trim(), password, firstName: firstName.trim(), lastName: lastName.trim() });
      const res = await login(email.trim(), password);
      await setSession(res.token, res.refreshToken, toAuthUser(res.user));
      router.replace('/(tabs)');
    } catch {
      Alert.alert(t('auth.register'), t('auth.loginError'));
    } finally {
      setLoading(false);
    }
  }

  return (
    <View style={[styles.screen, { paddingTop: insets.top }]}>
      <StatusBar style="light" />
      <Pressable onPress={goBack} hitSlop={12} style={styles.back}>
        <ArrowLeftIcon color={colors.text} />
      </Pressable>
      <ScrollView
        contentContainerStyle={styles.content}
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}
      >
        <Text style={styles.heading}>{t('auth.letsStart')}</Text>

        <View style={{ gap: spacing.md, marginTop: spacing.xl }}>
          <View style={styles.row}>
            <SoftField
              containerStyle={styles.half}
              value={firstName}
              onChangeText={setFirstName}
              placeholder={t('common.firstName')}
            />
            <SoftField
              containerStyle={styles.half}
              value={lastName}
              onChangeText={setLastName}
              placeholder={t('common.lastName')}
            />
          </View>

          <SoftField
            value={phone}
            onChangeText={setPhone}
            placeholder={t('common.phone')}
            keyboardType="phone-pad"
            rightSlot={
              <Pressable
                onPress={() => Alert.alert(t('common.phone'), t('auth.socialSoon'))}
                hitSlop={10}
              >
                <InfoIcon color={colors.accent} />
              </Pressable>
            }
          />

          <SoftField
            value={email}
            onChangeText={setEmail}
            placeholder={t('common.email')}
            autoCapitalize="none"
            autoComplete="email"
            keyboardType="email-address"
          />

          <SoftField
            value={password}
            onChangeText={setPassword}
            placeholder={t('auth.createPassword')}
            secureTextEntry={secure}
            autoCapitalize="none"
            rightSlot={
              <Pressable onPress={() => setSecure((s) => !s)} hitSlop={10}>
                {secure ? <EyeOffIcon /> : <EyeIcon />}
              </Pressable>
            }
          />
        </View>

        <Text style={styles.terms}>
          {t('auth.termsPrefix')}
          <Text style={styles.termsLink}>{t('auth.terms')}</Text>
          {t('auth.termsAnd')}
          <Text style={styles.termsLink}>{t('auth.privacy')}</Text>.
        </Text>

        <View style={{ marginTop: spacing.lg }}>
          <PrimaryButton
            title={t('auth.continue')}
            onPress={onSubmit}
            loading={loading}
            disabled={!canSubmit}
          />
        </View>

        <View style={styles.footer}>
          <Text style={styles.footerText}>{t('auth.signInPrompt')} </Text>
          <Pressable onPress={() => router.push('/(auth)/login')} hitSlop={8}>
            <Text style={styles.footerLink}>{t('auth.login')}</Text>
          </Pressable>
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: colors.card },
  back: { paddingHorizontal: spacing.lg, paddingTop: spacing.md },
  content: { paddingHorizontal: spacing.lg, paddingTop: spacing.lg, paddingBottom: spacing.xl },
  heading: { fontSize: 34, fontWeight: '800', color: colors.text, letterSpacing: -0.5 },
  row: { flexDirection: 'row', gap: spacing.md },
  half: { flex: 1 },
  terms: {
    color: colors.muted,
    fontSize: 13,
    lineHeight: 20,
    marginTop: spacing.lg,
  },
  termsLink: { color: colors.accent, fontWeight: '600' },
  footer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: spacing.xl,
  },
  footerText: { color: colors.muted, fontSize: 14 },
  footerLink: { color: colors.text, fontSize: 14, fontWeight: '700' },
});
