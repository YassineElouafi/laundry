import * as LocalAuthentication from 'expo-local-authentication';

/** True only if the device has biometric hardware AND the user has enrolled at least one. */
export async function isBiometricAvailable(): Promise<boolean> {
  try {
    const [hasHardware, enrolled] = await Promise.all([
      LocalAuthentication.hasHardwareAsync(),
      LocalAuthentication.isEnrolledAsync(),
    ]);
    return hasHardware && enrolled;
  } catch {
    return false;
  }
}

/** Prompt the OS biometric (Face ID / Touch ID / fingerprint). Returns whether it succeeded. */
export async function authenticate(promptMessage: string, cancelLabel?: string): Promise<boolean> {
  try {
    const res = await LocalAuthentication.authenticateAsync({
      promptMessage,
      cancelLabel,
      disableDeviceFallback: false, // allow device PIN/passcode as fallback
    });
    return res.success;
  } catch {
    return false;
  }
}
