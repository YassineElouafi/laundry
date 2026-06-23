import { Alert, Image, Pressable, StyleSheet, Text, View } from 'react-native';
import { useRouter } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useTranslation } from 'react-i18next';
import { useVideoPlayer, VideoView } from 'expo-video';
import { LinearGradient } from 'expo-linear-gradient';
import { GoogleIcon } from '../../components/icons';
import { radius, spacing } from '../../theme';

const HERO = require('../../../assets/images/intro-hero.jpg');
const HERO_VIDEO = require('../../../assets/videos/intro-hero.mp4');

export default function IntroScreen() {
  const { t } = useTranslation();
  const router = useRouter();
  const insets = useSafeAreaInsets();

  const player = useVideoPlayer(HERO_VIDEO, (p) => {
    p.loop = true;
    p.muted = true;
    p.play();
  });

  function onGoogle() {
    // Google OAuth is not wired up yet on the API/mobile side.
    Alert.alert(t('auth.continueGoogle'), t('auth.socialSoon'));
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
