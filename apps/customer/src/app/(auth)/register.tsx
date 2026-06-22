import { useState } from 'react';
import { Alert, StyleSheet, Text, View } from 'react-native';
import { Link, useRouter } from 'expo-router';
import { useTranslation } from 'react-i18next';
import { login, register, toAuthUser } from '../../lib/api/auth';
import { useAuthStore } from '../../stores/auth-store';
import { Button, Field } from '../../components/ui';
import { colors, spacing } from '../../theme';

export default function RegisterScreen() {
  const { t } = useTranslation();
  const router = useRouter();
  const setSession = useAuthStore((s) => s.setSession);
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);

  async function onSubmit() {
    if (!email || !password || !firstName || !lastName) return;
    setLoading(true);
    try {
      await register({ email: email.trim(), password, firstName, lastName });
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
    <View style={styles.container}>
      <Text style={styles.heading}>{t('auth.register')}</Text>
      <View style={{ gap: spacing.md, marginTop: spacing.lg }}>
        <Field label={t('common.firstName')} value={firstName} onChangeText={setFirstName} />
        <Field label={t('common.lastName')} value={lastName} onChangeText={setLastName} />
        <Field
          label={t('common.email')}
          value={email}
          onChangeText={setEmail}
          autoCapitalize="none"
          keyboardType="email-address"
        />
        <Field label={t('common.password')} value={password} onChangeText={setPassword} secureTextEntry />
        <Button title={t('auth.register')} onPress={onSubmit} loading={loading} />
        <Link href="/(auth)/login" style={styles.link}>
          {t('auth.haveAccount')}
        </Link>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.bg, padding: spacing.lg, justifyContent: 'center' },
  heading: { fontSize: 22, fontWeight: '700', color: colors.text, textAlign: 'center' },
  link: { color: colors.primary, textAlign: 'center', marginTop: spacing.sm, fontWeight: '500' },
});
