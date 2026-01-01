import { type ClassValue, clsx } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function formatCurrency(amount: number): string {
  return new Intl.NumberFormat('id-ID', {
    style: 'currency',
    currency: 'IDR',
    minimumFractionDigits: 0,
  }).format(amount)
}

export function formatNumber(num: number): string {
  return new Intl.NumberFormat('id-ID').format(num)
}

export function calculateCleanDays(lastJudolDate: Date | null): number {
  if (!lastJudolDate) return 0
  const now = new Date()
  const diffTime = Math.abs(now.getTime() - lastJudolDate.getTime())
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24))
  return diffDays
}

export function getMotivationalQuote(): string {
  const quotes = [
    "Setiap hari tanpa judol adalah kemenangan! 🎯",
    "Investasi terbaik adalah pada diri sendiri, bukan di kasino! 💪",
    "Uang yang kamu hemat hari ini = masa depan yang lebih cerah! ✨",
    "Tobat bukan cuma bicara, tapi action nyata! 🔥",
    "Crypto butuh skill, judol cuma nasib. Pilih yang mana? 🧠",
    "Lost? Learn. Win? Track. Never gamble. 📊",
    "Financial freedom starts with saying NO to judol! 🚫",
    "Every rupiah saved is a step closer to your dreams! 🎯",
    "Disiplin hari ini = kebebasan finansial besok! 💰",
    "Track your losses, fix your habits, build your future! 🏆"
  ]

  const today = new Date().getDate()
  return quotes[today % quotes.length]
}
