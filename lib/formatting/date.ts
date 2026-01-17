/**
 * Date Formatting Utilities
 * Centralized date formatting functions
 */

import { format } from "date-fns"

export const DATE_FORMATS = {
  SHORT: "dd MMM yyyy",
  LONG: "dd MMMM yyyy",
  TIME: "HH:mm:ss",
  ISO: "yyyy-MM-dd",
  FULL: "dd MMMM yyyy HH:mm",
} as const

/**
 * Format a date using predefined formats
 * @param date - Date string or Date object
 * @param formatType - Type of format to use
 * @returns Formatted date string
 */
export function formatDate(
  date: Date | string,
  formatType: keyof typeof DATE_FORMATS = "SHORT"
): string {
  return format(new Date(date), DATE_FORMATS[formatType])
}

/**
 * Format date for Indonesian locale
 * @param date - Date string or Date object
 * @returns Formatted date string in Indonesian locale
 */
export function formatDateID(date: Date | string): string {
  return new Date(date).toLocaleDateString("id-ID")
}

/**
 * Get today's date in ISO format (yyyy-MM-dd)
 * @returns Today's date as ISO string
 */
export function getTodayISO(): string {
  return new Date().toISOString().split("T")[0]
}
