/**
 * UI Constants
 * Centralized configuration for UI components
 */

export const UI_CONSTANTS = {
  PAGINATION: {
    DEFAULT_LIMIT: 10,
    ITEMS_PER_PAGE: 20,
    LEADERBOARD_LIMIT: 10,
  },
  COLORS: {
    CASINO: "casino",
    CRYPTO: "crypto",
    CLEAN: "clean",
    DESTRUCTIVE: "destructive",
  },
  GRID: {
    RESPONSIVE_STATS: "grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4",
    RESPONSIVE_CARDS: "grid grid-cols-2 lg:grid-cols-4 gap-2 sm:gap-3 md:gap-4",
    RESPONSIVE_DUAL: "grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4",
  },
  BREAKPOINTS: {
    MOBILE: "sm" as const,
    TABLET: "md" as const,
    DESKTOP: "lg" as const,
  },
} as const

/**
 * Type-specific color styles for Tailwind
 * Pre-defined to avoid dynamic class generation issues
 */
export const TYPE_COLOR_STYLES = {
  casino: {
    border: "border-casino",
    borderLight: "border-casino/20",
    bg: "bg-casino",
    bgLight: "bg-casino/5",
    bgMedium: "bg-casino/10",
    text: "text-casino",
    textLight: "text-casino/80",
  },
  crypto: {
    border: "border-crypto",
    borderLight: "border-crypto/20",
    bg: "bg-crypto",
    bgLight: "bg-crypto/5",
    bgMedium: "bg-crypto/10",
    text: "text-crypto",
    textLight: "text-crypto/80",
  },
  clean: {
    border: "border-clean",
    borderLight: "border-clean/20",
    bg: "bg-clean",
    bgLight: "bg-clean/5",
    bgMedium: "bg-clean/10",
    text: "text-clean",
    textLight: "text-clean/80",
  },
  destructive: {
    border: "border-destructive",
    borderLight: "border-destructive/20",
    bg: "bg-destructive",
    bgLight: "bg-destructive/5",
    bgMedium: "bg-destructive/10",
    text: "text-destructive",
    textLight: "text-destructive/80",
  },
} as const

export type ColorType = keyof typeof TYPE_COLOR_STYLES
