export enum PriceTypeEnum {
  perKilo = 'per_kilo',
  perItem = 'per_item',
}
export type PriceType = `${PriceTypeEnum}`

export enum SlotTypeEnum {
  pickup = 'pickup',
  delivery = 'delivery',
}
export type SlotType = `${SlotTypeEnum}`

/**
 * A localized string keyed by locale code, e.g.
 * `{ fr: 'Lavage & Pliage', ar: 'غسل وطي' }`. Stored as jsonb on the API.
 */
export type LocalizedString = {
  fr?: string
  ar?: string
  en?: string
}

/** Render a localized name, preferring the active UI language. */
export function localized(name: LocalizedString, lang: string): string {
  if (!name) return ''
  const key = lang.startsWith('ar') ? 'ar' : 'fr'
  return name[key] ?? name.fr ?? name.en ?? name.ar ?? ''
}
