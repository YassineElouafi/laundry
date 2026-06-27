import { useEffect, useRef } from 'react';
import { Image, Pressable, StyleSheet, Text, View } from 'react-native';
import { useRouter } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useTranslation } from 'react-i18next';
import { useVideoPlayer, VideoView } from 'expo-video';
import { LinearGradient } from 'expo-linear-gradient';
import { FingerprintIcon, GoogleIcon } from '../../components/icons';
import { useAuthStore } from '../../stores/auth-store';
import { useBiometricUnlock } from '../../lib/use-biometric-unlock';
import { useSocialLogin } from '../../lib/use-social-login';
import { radius, spacing } from '../../theme';

const HERO = require('../../../assets/images/intro-hero.jpg');
const HERO_VIDEO = require('../../../assets/videos/intro-hero.mp4');

export default function IntroScreen() {
  const { t } = useTranslation();
  const router = useRouter();
  const insets = useSafeAreaInsets();

  const accessToken = useAuthStore((s) => s.accessToken);
  const biometricEnabled = useAuthStore((s) => s.biometricEnabled);
  const locked = useAuthStore((s) => s.locked);
  const reset = useAuthStore((s) => s.reset);
  const { busy, tryUnlock } = useBiometricUnlock();
  const { pending, signIn } = useSocialLogin();

  // A returning user with a biometric-protected session lands here locked.
  const returningLocked = !!accessToken && biometricEnabled && locked;

  // Auto-prompt the biometric scan once when greeting a returning user.
  const prompted = useRef(false);
  useEffect(() => {
    if (returningLocked && !prompted.current) {
      prompted.current = true;
      void tryUnlock();
    }
  }, [returningLocked, tryUnlock]);

  const player = useVideoPlayer(HERO_VIDEO, (p) => {
    p.loop = true;
    p.muted = true;
    p.play();
  });

  async function logout() {
    await reset();
  }

  return (
    <View style={styles.bg}>
      <StatusBar style="light" />
      {/* Poster — shows instantly while the video buffers and on web */}
      <Image source={HERO} style={StyleSheet.absoluteFill} resizeMode="cover" />
      {/* Looping, muted ambient video background */}
      <VideoView
        style={StyleSheet.absoluteFill}
        player={player}
        contentFit="cover"
        nativeControls={false}
        pointerEvents="none"
      />
      {/* Keep the video crisp on top, then fade into a solid-black panel for the text */}
      <LinearGradient
        colors={['transparent', 'transparent', '#000000', '#000000']}
        locations={[0, 0.46, 0.66, 1]}
        style={StyleSheet.absoluteFill}
        pointerEvents="none"
      />
      <View style={[styles.content, { paddingBottom: insets.bottom + spacing.lg }]}>
        {returningLocked ? (
          <>
            <Text style={styles.title}>{t('auth.welcomeBack')}</Text>
            <Text style={styles.subtitle}>{t('biometric.lockedSubtitle')}</Text>

            <Pressable
              onPress={tryUnlock}
              disabled={busy}
              style={({ pressed }) => [styles.primaryBtn, styles.unlockBtn, pressed && styles.pressed]}
            >
              <FingerprintIcon size={20} color="#101418" />
              <Text style={styles.primaryBtnText}>{t('biometric.quickUnlock')}</Text>
            </Pressable>

            <Pressable
              onPress={() => router.push('/(auth)/login')}
              hitSlop={8}
              style={styles.linkRow}
            >
              <Text style={styles.signInLink}>{t('biometric.usePassword')}</Text>
            </Pressable>

            <Pressable onPress={logout} hitSlop={8} style={styles.linkRow}>
              <Text style={styles.signInPrompt}>{t('biometric.notYou')}</Text>
            </Pressable>
          </>
        ) : (
          <>
            <Text style={styles.title}>{t('auth.introTitle')}</Text>
            <Text style={styles.subtitle}>{t('auth.introSubtitle')}</Text>

            <Pressable
              onPress={() => router.push('/(auth)/register')}
              style={({ pressed }) => [styles.primaryBtn, pressed && styles.pressed]}
            >
              <Text style={styles.primaryBtnText}>{t('auth.getStarted')}</Text>
            </Pressable>

            <Pressable
              onPress={() => signIn('google')}
              disabled={!!pending}
              style={({ pressed }) => [
                styles.googleBtn,
                pressed && styles.pressed,
                !!pending && styles.pressed,
              ]}
            >
              <View style={styles.googleLogo}>
                <GoogleIcon size={18} />
              </View>
              <Text style={styles.googleBtnText}>{t('auth.continueGoogle')}</Text>
            </Pressable>

            <View style={styles.signInRow}>
              <Text style={styles.signInPrompt}>{t('auth.signInPrompt')} </Text>
              <Pressable onPress={() => router.push('/(auth)/login')} hitSlop={8}>
                <Text style={styles.signInLink}>{t('auth.login')}</Text>
              </Pressable>
            </View>
          </>
        )}
      </View>
    </View>
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
  unlockBtn: { flexDirection: 'row', gap: spacing.sm },
  linkRow: { alignSelf: 'center', marginTop: spacing.xs },
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
