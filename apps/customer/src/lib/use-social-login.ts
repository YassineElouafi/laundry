import { useState } from 'react';
import { Alert } from 'react-native';
import { useRouter } from 'expo-router';
import { useTranslation } from 'react-i18next';
import { useAuthStore } from '../stores/auth-store';
import { loginWithApple, loginWithFacebook, loginWithGoogle, toAuthUser } from './api/auth';
import {
  getAppleCredential,
  getFacebookAccessToken,
  getGoogleIdToken,
  SocialCancelledError,
  type AppleCredential,
} from './social';
import type { LoginResponse } from './api/auth';

export type SocialProvider = 'google' | 'apple' | 'facebook';

/**
 * Drives a social sign-in end to end: native provider sheet → existing API
 * endpoint → persisted session → navigate into the app. `pending` is the
 * provider currently in flight so screens can show a per-button spinner.
 */
export function useSocialLogin() {
  const { t } = useTranslation();
  const router = useRouter();
  const setSession = useAuthStore((s) => s.setSession);
  const [pending, setPending] = useState<SocialProvider | null>(null);

  async function signIn(provider: SocialProvider) {
    if (pending) return;
    setPending(provider);
    try {
      let res: LoginResponse;
      if (provider === 'google') {
        res = await loginWithGoogle(await getGoogleIdToken());
      } else if (provider === 'apple') {
        const cred: AppleCredential = await getAppleCredential();
        res = await loginWithApple(cred);
      } else {
        res = await loginWithFacebook(await getFacebookAccessToken());
      }
      await setSession(res.token, res.refreshToken, toAuthUser(res.user));
      router.replace('/(tabs)');
    } catch (err) {
      // A user-cancelled sheet is not an error worth surfacing.
      if (err instanceof SocialCancelledError) return;
      Alert.alert(t('auth.login'), t('auth.socialError'));
    } finally {
      setPending(null);
    }
  }

  return { pending, signIn };
}
