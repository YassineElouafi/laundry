import { Platform } from 'react-native';
import * as AppleAuthentication from 'expo-apple-authentication';
import {
  GoogleSignin,
  statusCodes,
} from '@react-native-google-signin/google-signin';
import { AccessToken, LoginManager } from 'react-native-fbsdk-next';
import { GOOGLE_IOS_CLIENT_ID, GOOGLE_WEB_CLIENT_ID } from './env';

/** Thrown when the user dismisses a provider sheet — callers should stay silent. */
export class SocialCancelledError extends Error {
  constructor() {
    super('social-cancelled');
    this.name = 'SocialCancelledError';
  }
}

let googleConfigured = false;
function ensureGoogleConfigured() {
  if (googleConfigured) return;
  GoogleSignin.configure({
    // Audience for the returned idToken — must equal the API's GOOGLE_CLIENT_ID.
    webClientId: GOOGLE_WEB_CLIENT_ID,
    iosClientId: GOOGLE_IOS_CLIENT_ID || undefined,
    offlineAccess: false,
  });
  googleConfigured = true;
}

/** Runs the native Google sheet and returns an idToken for the API. */
export async function getGoogleIdToken(): Promise<string> {
  ensureGoogleConfigured();
  try {
    await GoogleSignin.hasPlayServices({ showPlayServicesUpdateDialog: true });
    // v13+ returns { type, data }; older versions return the user object directly.
    const response: any = await GoogleSignin.signIn();
    if (response?.type === 'cancelled') throw new SocialCancelledError();
    const idToken: string | undefined = response?.data?.idToken ?? response?.idToken;
    if (!idToken) throw new Error('Google sign-in returned no idToken');
    return idToken;
  } catch (err: any) {
    if (err instanceof SocialCancelledError) throw err;
    if (err?.code === statusCodes.SIGN_IN_CANCELLED) throw new SocialCancelledError();
    throw err;
  }
}

export interface AppleCredential {
  idToken: string;
  firstName?: string | null;
  lastName?: string | null;
}

/** Runs the native Apple sheet (iOS only) and returns the identity token + name. */
export async function getAppleCredential(): Promise<AppleCredential> {
  try {
    const cred = await AppleAuthentication.signInAsync({
      requestedScopes: [
        AppleAuthentication.AppleAuthenticationScope.FULL_NAME,
        AppleAuthentication.AppleAuthenticationScope.EMAIL,
      ],
    });
    if (!cred.identityToken) throw new Error('Apple sign-in returned no identityToken');
    return {
      idToken: cred.identityToken,
      // Apple only sends the name on the very first authorization.
      firstName: cred.fullName?.givenName ?? undefined,
      lastName: cred.fullName?.familyName ?? undefined,
    };
  } catch (err: any) {
    if (err?.code === 'ERR_REQUEST_CANCELED') throw new SocialCancelledError();
    throw err;
  }
}

/** Runs the native Facebook flow and returns a short-lived access token. */
export async function getFacebookAccessToken(): Promise<string> {
  const result = await LoginManager.logInWithPermissions(['public_profile', 'email']);
  if (result.isCancelled) throw new SocialCancelledError();
  const data = await AccessToken.getCurrentAccessToken();
  if (!data?.accessToken) throw new Error('Facebook sign-in returned no access token');
  return data.accessToken;
}

/** Apple Sign-In is only offered on iOS. */
export const isAppleSignInSupported = Platform.OS === 'ios';
