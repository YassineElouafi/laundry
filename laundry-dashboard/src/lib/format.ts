/** Format an amount as Moroccan dirham (MAD), localized. */
export function formatMAD(amount: number, lang = 'fr'): string {
  const locale = lang.startsWith('ar') ? 'ar-MA' : 'fr-MA'
  try {
    return new Intl.NumberFormat(locale, {
      style: 'currency',
      currency: 'MAD',
      maximumFractionDigits: 2,
    }).format(amount)
  } catch {
    return `${amount.toFixed(2)} MAD`
  }
}

export function formatDateTime(iso: string, lang = 'fr'): string {
  const locale = lang.startsWith('ar') ? 'ar-MA' : 'fr-MA'
  try {
    return new Intl.DateTimeFormat(locale, {
      dateStyle: 'medium',
      timeStyle: 'short',
    }).format(new Date(iso))
  } catch {
    return iso
  }
}

export function formatDate(iso: string, lang = 'fr'): string {
  const locale = lang.startsWith('ar') ? 'ar-MA' : 'fr-MA'
  try {
    return new Intl.DateTimeFormat(locale, { dateStyle: 'medium' }).format(
      new Date(iso)
    )
  } catch {
    return iso
  }
}
