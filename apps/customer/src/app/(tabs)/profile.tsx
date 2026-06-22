import { StyleSheet, Text, View } from 'react-native';
import { useRouter } from 'expo-router';
import { useTranslation } from 'react-i18next';
import { useAuthStore } from '../../stores/auth-store';
import { Button, Card } from '../../components/ui';
import { colors, spacing } from '../../theme';

export default function ProfileScreen() {
  const { t, i18n } = useTranslation();
  const router = useRouter();
  const user = useAuthStore((s) => s.user);
  const reset = useAuthStore((s) => s.reset);

  const name = [user?.firstName, user?.lastName].filter(Boolean).join(' ') || user?.email;

  async function logout() {
    await reset();
    router.replace('/(auth)/login');
  }

  function toggleLang() {
    void i18n.changeLanguage(i18n.language === 'ar' ? 'fr' : 'ar');
  }

  return (
    <View style={styles.container}>
      <Card>
        <Text style={styles.name}>{name}</Text>
        <Text style={styles.muted}>{user?.email}</Text>
      </Card>

      <View style={{ gap: spacing.md, marginTop: spacing.lg }}>
        <Button
          title={`${t('profile.language')}: ${i18n.language === 'ar' ? 'العربية' : 'Français'}`}
          onPress={toggleLang}
          variant="outline"
        />
        <Button title={t('profile.logout')} onPress={logout} />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.bg, padding: spacing.md },
  name: { fontSize: 18, fontWeight: '700', color: colors.text },
  muted: { color: colors.muted, marginTop: 2 },
});
