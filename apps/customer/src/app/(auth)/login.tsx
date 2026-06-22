import { useState } from 'react';
import { Alert, StyleSheet, Text, View } from 'react-native';
import { Link, useRouter } from 'expo-router';
import { useTranslation } from 'react-i18next';
import { login, toAuthUser } from '../../lib/api/auth';
import { useAuthStore } from '../../stores/auth-store';
import { Button, Field } from '../../components/ui';
import { colors, spacing } from '../../theme';

export default function LoginScreen() {
  const { t } = useTranslation();
  const router = useRouter();
  const setSession = useAuthStore((s) => s.setSession);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);

  async function onSubmit() {
    if (!email || !password) return;
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
    <View style={styles.container}>
      <Text style={styles.brand}>🧺 Laundry</Text>
      <Text style={styles.heading}>{t('auth.welcome')}</Text>
      <View style={{ gap: spacing.md, marginTop: spacing.lg }}>
        <Field
          label={t('common.email')}
          value={email}
          onChangeText={setEmail}
          autoCapitalize="none"
          keyboardType="email-address"
          placeholder="you@example.com"
        />
        <Field
          label={t('common.password')}
          value={password}
          onChangeText={setPassword}
          secureTextEntry
          placeholder="••••••"
        />
        <Button title={t('auth.login')} onPress={onSubmit} loading={loading} />
        <Link href="/(auth)/register" style={styles.link}>
          {t('auth.noAccount')}
        </Link>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.bg, padding: spacing.lg, justifyContent: 'center' },
  brand: { fontSize: 28, fontWeight: '800', color: colors.primary, textAlign: 'center' },
  heading: { fontSize: 20, fontWeight: '700', color: colors.text, textAlign: 'center', marginTop: spacing.sm },
  link: { color: colors.primary, textAlign: 'center', marginTop: spacing.sm, fontWeight: '500' },
});
