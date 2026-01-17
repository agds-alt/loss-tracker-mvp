/**
 * Currency Formatting Utilities
 * Centralized currency formatting to ensure consistency across the app
 */

export const CURRENCY_CONFIG = {
  locale: "id-ID",
  currency: "IDR",
  minimumFractionDigits: 0,
  maximumFractionDigits: 0,
} as const

/**
 * Format a number as currency (IDR by default)
 * @param amount - The amount to format
 * @returns Formatted currency string
 */
export function formatCurrency(amount: number): string {
  return new Intl.NumberFormat(CURRENCY_CONFIG.locale, {
    style: "currency",
    currency: CURRENCY_CONFIG.currency,
    minimumFractionDigits: CURRENCY_CONFIG.minimumFractionDigits,
    maximumFractionDigits: CURRENCY_CONFIG.maximumFractionDigits,
  }).format(amount)
}

/**
 * Format a number with custom currency
 * @param amount - The amount to format
 * @param currency - Currency code (IDR, USD, etc)
 * @returns Formatted currency string
 */
export function formatWithCurrency(
  amount: number,
  currency: "IDR" | "USD" = "IDR"
): string {
  const locale = currency === "IDR" ? "id-ID" : "en-US"
  return new Intl.NumberFormat(locale, {
    style: "currency",
    currency,
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(amount)
}

/**
 * Format large numbers with abbreviations (K, M, B)
 * @param value - The value to format
 * @returns Abbreviated number string
 */
export function formatCompactNumber(value: number): string {
  if (value >= 1_000_000_000) {
    return `${(value / 1_000_000_000).toFixed(1)}B`
  }
  if (value >= 1_000_000) {
    return `${(value / 1_000_000).toFixed(1)}M`
  }
  if (value >= 1_000) {
    return `${(value / 1_000).toFixed(1)}K`
  }
  return value.toString()
}

/**
 * Format number for Indonesian locale (juta, ribu)
 * @param value - The value to format
 * @returns Formatted string with Indonesian abbreviations
 */
export function formatCompactNumberID(value: number): string {
  if (value >= 1_000_000) {
    return `${(value / 1_000_000).toFixed(1)}jt`
  }
  if (value >= 1_000) {
    return `${(value / 1_000).toFixed(0)}rb`
  }
  return value.toString()
}
