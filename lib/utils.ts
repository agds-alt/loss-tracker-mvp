import { type ClassValue, clsx } from "clsx"
import { twMerge } from "tailwind-merge"
import { MOTIVATIONAL_QUOTES } from "@/lib/constants/messages"

/**
 * Merge Tailwind classes with clsx
 */
export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

/**
 * Re-export formatting utilities from centralized locations
 */
export { formatCurrency, formatCompactNumber, formatCompactNumberID } from "@/lib/formatting/currency"
export { formatDate, formatDateID, getTodayISO } from "@/lib/formatting/date"

/**
 * Format number for Indonesian locale
 */
export function formatNumber(num: number): string {
  return new Intl.NumberFormat("id-ID").format(num)
}

/**
 * Calculate clean days (days without casino)
 * @param lastCasinoDate - Last date of casino activity
 * @returns Number of clean days
 */
export function calculateCleanDays(lastCasinoDate: Date | null): number {
  if (!lastCasinoDate) return 0
  const now = new Date()
  const diffTime = Math.abs(now.getTime() - lastCasinoDate.getTime())
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24))
  return diffDays
}

/**
 * Get a motivational quote based on current date
 * @returns Motivational quote string
 */
export function getMotivationalQuote(): string {
  const today = new Date().getDate()
  return MOTIVATIONAL_QUOTES[today % MOTIVATIONAL_QUOTES.length]
}
