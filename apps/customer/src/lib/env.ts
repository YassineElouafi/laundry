// API base URL. On a device, localhost won't reach your machine, so default to
// the deployed API. Override per-environment with EXPO_PUBLIC_API_URL.
export const API_URL =
  process.env.EXPO_PUBLIC_API_URL ||
  'https://app-back-up-primary-program-ivd5p3-90c72f-207-180-252-70.sslip.io/api/v1';

// Google Sign-In OAuth client IDs (see docs/social-login-setup.md).
// WEB client id is the audience the API verifies the idToken against — it MUST
// match the API's GOOGLE_CLIENT_ID. IOS client id is optional but recommended.
export const GOOGLE_WEB_CLIENT_ID = process.env.EXPO_PUBLIC_GOOGLE_WEB_CLIENT_ID || '';
export const GOOGLE_IOS_CLIENT_ID = process.env.EXPO_PUBLIC_GOOGLE_IOS_CLIENT_ID || '';
