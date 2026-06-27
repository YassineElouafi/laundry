import { useCallback, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useAuthStore } from '../stores/auth-store';
import { authenticate } from './biometric';

/**
 * Prompts the OS biometric (Face ID / Touch ID / fingerprint) and, on success,
 * clears the app lock. Shared by the lock overlay and the auth (intro/login)
 * screens so a returning user can unlock from wherever they land.
 */
export function useBiometricUnlock() {
  const { t } = useTranslation();
  const unlock = useAuthStore((s) => s.unlock);
  const [busy, setBusy] = useState(false);

  const tryUnlock = useCallback(async (): Promise<boolean> => {
    if (busy) return false;
    setBusy(true);
    const ok = await authenticate(t('biometric.unlockPrompt'), t('common.cancel'));
    setBusy(false);
    if (ok) unlock();
    return ok;
  }, [busy, t, unlock]);

  return { busy, tryUnlock };
}
