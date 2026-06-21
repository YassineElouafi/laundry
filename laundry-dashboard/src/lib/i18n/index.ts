import i18n from 'i18next'
import { initReactI18next } from 'react-i18next'
import LanguageDetector from 'i18next-browser-languagedetector'
import fr from './fr.json'
import ar from './ar.json'

export const SUPPORTED_LANGUAGES = ['fr', 'ar'] as const
export type AppLanguage = (typeof SUPPORTED_LANGUAGES)[number]

export const LANGUAGE_COOKIE = 'i18next'

void i18n
  .use(LanguageDetector)
  .use(initReactI18next)
  .init({
    resources: {
      fr: { translation: fr },
      ar: { translation: ar },
    },
    fallbackLng: 'fr',
    supportedLngs: SUPPORTED_LANGUAGES as unknown as string[],
    detection: {
      order: ['cookie', 'localStorage', 'navigator'],
      lookupCookie: LANGUAGE_COOKIE,
      caches: ['cookie', 'localStorage'],
    },
    interpolation: { escapeValue: false },
  })

export function isRtl(lng: string): boolean {
  return lng.startsWith('ar')
}

/** Apply <html lang> + <html dir> for the given language. */
export function applyDocumentLanguage(lng: string): void {
  const html = document.documentElement
  html.lang = lng
  html.dir = isRtl(lng) ? 'rtl' : 'ltr'
}

// Keep <html> in sync on every language change and on first load.
i18n.on('languageChanged', applyDocumentLanguage)
if (typeof document !== 'undefined') {
  applyDocumentLanguage(i18n.language || 'fr')
}

export default i18n
