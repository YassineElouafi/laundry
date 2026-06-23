import { Alert, ImageBackground, Pressable, StyleSheet, Text, View } from 'react-native';
import { useRouter } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useTranslation } from 'react-i18next';
import Svg, { Path } from 'react-native-svg';
import { radius, spacing } from '../../theme';

const HERO = require('../../../assets/images/intro-hero.jpg');

function GoogleLogo({ size = 20 }: { size?: number }) {
  return (
    <Svg width={size} height={size} viewBox="0 0 48 48">
      <Path
        fill="#EA4335"
        d="M24 9.5c3.54 0 6.71 1.22 9.21 3.6l6.85-6.85C35.9 2.38 30.47 0 24 0 14.62 0 6.51 5.38 2.56 13.22l7.98 6.19C12.43 13.72 17.74 9.5 24 9.5z"
      />
      <Path
        fill="#4285F4"
        d="M46.98 24.55c0-1.57-.15-3.09-.38-4.55H24v9.02h12.94c-.58 2.96-2.26 5.48-4.78 7.18l7.73 6c4.51-4.18 7.09-10.36 7.09-17.65z"
      />
      <Path
        fill="#FBBC05"
        d="M10.53 28.59c-.48-1.45-.76-2.99-.76-4.59s.27-3.14.76-4.59l-7.98-6.19C.92 16.46 0 20.12 0 24c0 3.88.92 7.54 2.56 10.78l7.97-6.19z"
      />
      <Path
        fill="#34A853"
        d="M24 48c6.48 0 11.93-2.13 15.89-5.81l-7.73-6c-2.15 1.45-4.92 2.3-8.16 2.3-6.26 0-11.57-4.22-13.47-9.91l-7.98 6.19C6.51 42.62 14.62 48 24 48z"
      />
    </Svg>
  );
}

export default function IntroScreen() {
  const { t } = useTranslation();
  const router = useRouter();
  const insets = useSafeAreaInsets();

  function onGoogle() {
    // Google OAuth is not wired up yet on the API/mobile side.
    Alert.alert(t('auth.continueGoogle'), t('auth.googleSoon'));
  }

  return (
    <ImageBackground source={HERO} style={styles.bg} resizeMode="cover">
      <StatusBar style="light" />
      <View style={[styles.content, { paddingBottom: insets.bottom + spacing.lg }]}>
        <Text style={styles.title}>{t('auth.introTitle')}</Text>
        <Text style={styles.subtitle}>{t('auth.introSubtitle')}</Text>

        <Pressable
          onPress={() => router.push('/(auth)/register')}
          style={({ pressed }) => [styles.primaryBtn, pressed && styles.pressed]}
        >
          <Text style={styles.primaryBtnText}>{t('auth.getStarted')}</Text>
        </Pressable>

        <Pressable
          onPress={onGoogle}
          style={({ pressed }) => [styles.googleBtn, pressed && styles.pressed]}
        >
          <View style={styles.googleLogo}>
            <GoogleLogo size={18} />
          </View>
          <Text style={styles.googleBtnText}>{t('auth.continueGoogle')}</Text>
        </Pressable>

        <View style={styles.signInRow}>
          <Text style={styles.signInPrompt}>{t('auth.signInPrompt')} </Text>
          <Pressable onPress={() => router.push('/(auth)/login')} hitSlop={8}>
            <Text style={styles.signInLink}>{t('auth.login')}</Text>
          </Pressable>
        </View>
      </View>
    </ImageBackground>
  );
}

const styles = StyleSheet.create({
  bg: { flex: 1, backgroundColor: '#000' },
  content: {
    flex: 1,
    justifyContent: 'flex-end',
    paddingHorizontal: spacing.lg,
    gap: spacing.md,
  },
  title: {
    color: '#ffffff',
    fontSize: 40,
    lineHeight: 44,
    fontWeight: '800',
    letterSpacing: -0.5,
  },
  subtitle: {
    color: 'rgba(255,255,255,0.75)',
    fontSize: 15,
    lineHeight: 22,
    marginBottom: spacing.sm,
  },
  primaryBtn: {
    height: 56,
    borderRadius: radius.pill,
    backgroundColor: '#ffffff',
    alignItems: 'center',
    justifyContent: 'center',
  },
  primaryBtnText: { color: '#101418', fontSize: 17, fontWeight: '700' },
  googleBtn: {
    height: 56,
    borderRadius: radius.pill,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.3)',
    backgroundColor: 'rgba(255,255,255,0.08)',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: spacing.sm,
  },
  googleLogo: {
    width: 22,
    height: 22,
    borderRadius: 11,
    backgroundColor: '#ffffff',
    alignItems: 'center',
    justifyContent: 'center',
  },
  googleBtnText: { color: '#ffffff', fontSize: 16, fontWeight: '600' },
  signInRow: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: spacing.xs,
  },
  signInPrompt: { color: 'rgba(255,255,255,0.7)', fontSize: 14 },
  signInLink: { color: '#ffffff', fontSize: 14, fontWeight: '700' },
  pressed: { opacity: 0.85 },
});
