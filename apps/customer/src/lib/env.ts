// API base URL. On a device, localhost won't reach your machine, so default to
// the deployed API. Override per-environment with EXPO_PUBLIC_API_URL.
export const API_URL =
  process.env.EXPO_PUBLIC_API_URL ||
  'https://app-back-up-primary-program-ivd5p3-90c72f-207-180-252-70.sslip.io/api/v1';
