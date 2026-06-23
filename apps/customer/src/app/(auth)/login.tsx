import { useState } from 'react';
import { Alert, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { useRouter } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useTranslation } from 'react-i18next';
import { login, toAuthUser } from '../../lib/api/auth';
import { useAuthStore } from '../../stores/auth-store';
import { OrDivider, PrimaryButton, SocialButton, SoftField } from '../../components/ui';
import {
  AppleIcon,
  ArrowLeftIcon,
  EyeIcon,
  EyeOffIcon,
  FacebookIcon,
  GoogleIcon,
} from '../../components/icons';
import { colors, spacing } from '../../theme';

export default function LoginScreen() {
  const { t } = useTranslation();
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const setSession = useAuthStore((s) => s.setSession);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [secure, setSecure] = useState(true);
  const [loading, setLoading] = useState(false);

  const canSubmit = email.trim().length > 0 && password.length > 0;

  function goBack() {
    if (router.canGoBack()) router.back();
    else router.replace('/(auth)');
  }

  function soon() {
    Alert.alert(t('auth.login'), t('auth.socialSoon'));
  }

  async function onSubmit() {
    if (!canSubmit) return;
    setLoading(true);
    try {
      const res = await login(email.trim(), password);
      await setSession(res.token, res.refreshToken, toAuthUser(res.user));
      router.replace('/(tabs)');
    } catch {
      Alert.alert(t('auth.login'), t('auth.loginError'));
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
        <Text style={styles.heading}>{t('auth.welcomeBack')}</Text>

        <View style={{ gap: spacing.md, marginTop: spacing.xl }}>
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
            placeholder={t('common.password')}
            secureTextEntry={secure}
            autoCapitalize="none"
            rightSlot={
              <Pressable onPress={() => setSecure((s) => !s)} hitSlop={10}>
                {secure ? <EyeOffIcon /> : <EyeIcon />}
              </Pressable>
            }
          />
        </View>

        <View style={{ marginTop: spacing.xl }}>
          <PrimaryButton
            title={t('auth.login')}
            onPress={onSubmit}
            loading={loading}
            disabled={!canSubmit}
          />
        </View>

        <Pressable onPress={() => Alert.alert(t('auth.forgotPassword'), t('auth.forgotSoon'))} hitSlop={8}>
          <Text style={styles.forgot}>{t('auth.forgotPassword')}</Text>
        </Pressable>

        <View style={{ marginVertical: spacing.xl }}>
          <OrDivider label={t('auth.or')} />
        </View>

        <View style={{ gap: spacing.md }}>
          <SocialButton label={t('auth.continueGoogle')} icon={<GoogleIcon />} onPress={soon} />
          <SocialButton
            label={t('auth.continueApple')}
            icon={<AppleIcon color={colors.social} />}
            onPress={soon}
          />
          <SocialButton
            label={t('auth.continueFacebook')}
            icon={<FacebookIcon color={colors.social} />}
            onPress={soon}
          />
        </View>

        <View style={styles.footer}>
          <Text style={styles.footerText}>{t('auth.noAccountPrompt')} </Text>
          <Pressable onPress={() => router.push('/(auth)/register')} hitSlop={8}>
            <Text style={styles.footerLink}>{t('auth.register')}</Text>
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
  forgot: {
    color: colors.accent,
    fontSize: 16,
    fontWeight: '700',
    textAlign: 'center',
    marginTop: spacing.lg,
  },
  footer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: spacing.xl,
  },
  footerText: { color: colors.muted, fontSize: 14 },
  footerLink: { color: colors.text, fontSize: 14, fontWeight: '700' },
});
