/**
 * A localized string keyed by locale code, e.g.
 * `{ en: 'Wash & Fold', fr: 'Lavage & Pliage', ar: 'غسل وطي' }`.
 * Stored as a jsonb column. `fr` and `ar` are the primary MA locales.
 */
export type LocalizedString = {
  [locale: string]: string;
};
