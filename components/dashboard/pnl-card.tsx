"use client"

import { useRef, useState } from "react"
import { CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { formatCurrency } from "@/lib/utils"
import { Download, TrendingDown, TrendingUp, Target, Award, Loader2 } from "lucide-react"
import { Database } from "@/types/database.types"
import { useToast } from "@/components/ui/use-toast"
import { calculateTransactionStats, calculateTypeBreakdown } from "@/lib/calculations/transaction-stats"
import { TOAST_MESSAGES, LABEL_TEXT } from "@/lib/constants/messages"

type Loss = Database["public"]["Tables"]["losses"]["Row"]

interface PnLCardProps {
  losses: Loss[]
  username: string
}

export function PnLCard({ losses, username }: PnLCardProps) {
  const cardRef = useRef<HTMLDivElement>(null)
  const { toast } = useToast()
  const [isDownloading, setIsDownloading] = useState(false)

  // Calculate stats using utility functions
  const stats = calculateTransactionStats(losses)
  const typeBreakdown = calculateTypeBreakdown(losses)

  const {
    totalDeposits,
    totalWithdrawals,
    netPnL,
    isProfitable,
    totalWins,
    totalDepositsCount,
    totalTransactions,
    winRate,
    uniqueSites,
  } = stats

  const { judol, crypto } = typeBreakdown

  const handleDownload = async () => {
    if (!cardRef.current || isDownloading) return

    setIsDownloading(true)
    try {
      toast({
        title: TOAST_MESSAGES.INFO.CREATING_IMAGE,
        description: TOAST_MESSAGES.INFO.LOADING,
      })

      // Lazy load html2canvas
      const { default: html2canvas } = await import("html2canvas")

      const canvas = await html2canvas(cardRef.current, {
        backgroundColor: null,
        scale: 2,
        logging: false,
        useCORS: true,
      })

      const link = document.createElement("a")
      const timestamp = new Date().toISOString().split("T")[0]
      link.download = `pnl-card-${timestamp}.png`
      link.href = canvas.toDataURL("image/png")
      link.click()

      toast({
        title: TOAST_MESSAGES.SUCCESS.DOWNLOAD_SUCCESS,
        description: TOAST_MESSAGES.SUCCESS.DOWNLOAD_SUCCESS,
      })
    } catch {
      toast({
        variant: "destructive",
        title: "Error",
        description: TOAST_MESSAGES.ERROR.DOWNLOAD_FAILED,
      })
    } finally {
      setIsDownloading(false)
    }
  }

  return (
    <div className="space-y-3 sm:space-y-4">
      <div
        ref={cardRef}
        className="relative overflow-hidden rounded-2xl border shadow-2xl"
        style={{
          background: isProfitable
            ? "linear-gradient(135deg, #000000 0%, #0a3d0f 50%, #000000 100%)"
            : "linear-gradient(135deg, #000000 0%, #3d0a0a 50%, #000000 100%)",
          borderColor: isProfitable
            ? "rgba(34, 197, 94, 0.3)"
            : "rgba(239, 68, 68, 0.3)",
        }}
      >
        {/* Decorative gradient overlays */}
        <div className="absolute inset-0 bg-gradient-to-br from-white/5 via-transparent to-transparent opacity-50" />
        <div className="absolute top-0 right-0 w-96 h-96 bg-gradient-radial from-white/10 to-transparent blur-3xl" />
        <div className="absolute bottom-0 left-0 w-80 h-80 bg-gradient-radial from-white/5 to-transparent blur-3xl" />

        <CardContent className="relative p-3 sm:p-6 md:p-8 text-white">
          {/* Header */}
          <div className="flex items-center justify-between mb-3 sm:mb-6">
            <div>
              <h2 className="text-lg sm:text-2xl md:text-3xl font-bold">Laporan PnL</h2>
              <p className="text-white/80 text-xs sm:text-sm mt-0.5">@{username}</p>
            </div>
            <div className="text-right">
              <p className="text-white/80 text-xs sm:text-sm">Loss Tracker</p>
              <p className="text-white/60 text-[10px] sm:text-xs">{new Date().toLocaleDateString("id-ID")}</p>
            </div>
          </div>

          {/* Main PnL */}
          <div className="bg-white/20 backdrop-blur-sm rounded-lg sm:rounded-2xl p-3 sm:p-6 md:p-8 mb-3 sm:mb-6 border border-white/30">
            <div className="flex items-center gap-2 sm:gap-3 mb-2 sm:mb-3">
              {isProfitable ? (
                <Award className="h-6 w-6 sm:h-8 sm:w-8 md:h-10 md:w-10" />
              ) : (
                <Target className="h-6 w-6 sm:h-8 sm:w-8 md:h-10 md:w-10" />
              )}
              <div>
                <p className="text-white/90 text-xs sm:text-sm md:text-base">Untung & Rugi Bersih</p>
                <p className="text-[10px] sm:text-xs md:text-sm text-white/70">Sepanjang Waktu</p>
              </div>
            </div>
            <div className="flex items-baseline gap-2">
              <h3 className="text-2xl sm:text-4xl md:text-5xl lg:text-6xl font-bold">
                {isProfitable ? "+" : "-"}
                {formatCurrency(Math.abs(netPnL))}
              </h3>
            </div>
            <div className="flex items-center gap-2 mt-3">
              {isProfitable ? (
                <TrendingUp className="h-5 w-5 text-green-300" />
              ) : (
                <TrendingDown className="h-5 w-5 text-red-300" />
              )}
              <span className="text-sm sm:text-base font-semibold">
                {isProfitable ? "Untung" : "Rugi"}
              </span>
            </div>
          </div>

          {/* Stats Grid - More compact on mobile */}
          <div className="grid grid-cols-2 gap-2 sm:gap-3 md:gap-4 mb-3 sm:mb-6">
            {/* Total Deposits */}
            <div className="bg-white/10 backdrop-blur-sm rounded-lg sm:rounded-xl p-2.5 sm:p-4 md:p-5 border border-white/20">
              <p className="text-white/80 text-[10px] sm:text-xs md:text-sm mb-1 sm:mb-2">Deposit</p>
              <p className="text-base sm:text-xl md:text-2xl font-bold">{formatCurrency(totalDeposits)}</p>
              <p className="text-[10px] sm:text-xs text-white/60 mt-0.5 sm:mt-1">{totalDepositsCount}x</p>
            </div>

            {/* Total Withdrawals */}
            <div className="bg-white/10 backdrop-blur-sm rounded-lg sm:rounded-xl p-2.5 sm:p-4 md:p-5 border border-white/20">
              <p className="text-white/80 text-[10px] sm:text-xs md:text-sm mb-1 sm:mb-2">Penarikan</p>
              <p className="text-base sm:text-xl md:text-2xl font-bold">{formatCurrency(totalWithdrawals)}</p>
              <p className="text-[10px] sm:text-xs text-white/60 mt-0.5 sm:mt-1">{totalWins}x</p>
            </div>

            {/* Win Rate */}
            <div className="bg-white/10 backdrop-blur-sm rounded-lg sm:rounded-xl p-2.5 sm:p-4 md:p-5 border border-white/20">
              <p className="text-white/80 text-[10px] sm:text-xs md:text-sm mb-1 sm:mb-2">Win Rate</p>
              <p className="text-base sm:text-xl md:text-2xl font-bold">{winRate.toFixed(1)}%</p>
              <p className="text-[10px] sm:text-xs text-white/60 mt-0.5 sm:mt-1">
                {totalWins}/{totalTransactions}
              </p>
            </div>

            {/* Total Sites */}
            <div className="bg-white/10 backdrop-blur-sm rounded-lg sm:rounded-xl p-2.5 sm:p-4 md:p-5 border border-white/20">
              <p className="text-white/80 text-[10px] sm:text-xs md:text-sm mb-1 sm:mb-2">Platform</p>
              <p className="text-base sm:text-xl md:text-2xl font-bold">{uniqueSites}</p>
              <p className="text-[10px] sm:text-xs text-white/60 mt-0.5 sm:mt-1">Unik</p>
            </div>
          </div>

          {/* Breakdown by Type - Compact */}
          <div className="space-y-2 sm:space-y-3">
            <h4 className="text-sm sm:text-lg md:text-xl font-semibold">Rincian</h4>

            {/* Judol */}
            <div className="bg-white/10 backdrop-blur-sm rounded-lg sm:rounded-xl p-2.5 sm:p-4 md:p-5 border border-white/20">
              <div className="flex items-center justify-between mb-2 sm:mb-3">
                <div className="flex items-center gap-1.5 sm:gap-2">
                  <span className="text-lg sm:text-2xl">🎰</span>
                  <span className="font-semibold text-xs sm:text-sm md:text-base">{LABEL_TEXT.JUDOL}</span>
                </div>
                <span
                  className={`text-sm sm:text-lg md:text-xl font-bold ${
                    judol.isProfitable ? "text-green-300" : "text-red-300"
                  }`}
                >
                  {judol.isProfitable ? "+" : "-"}
                  {formatCurrency(Math.abs(judol.netPnL))}
                </span>
              </div>
              <div className="grid grid-cols-2 gap-2 text-[10px] sm:text-xs md:text-sm">
                <div>
                  <p className="text-white/70">{LABEL_TEXT.DEPOSIT}</p>
                  <p className="font-semibold">{formatCurrency(judol.deposits)}</p>
                </div>
                <div>
                  <p className="text-white/70">{LABEL_TEXT.WITHDRAWAL}</p>
                  <p className="font-semibold">{formatCurrency(judol.withdrawals)}</p>
                </div>
              </div>
            </div>

            {/* Crypto */}
            <div className="bg-white/10 backdrop-blur-sm rounded-lg sm:rounded-xl p-2.5 sm:p-4 md:p-5 border border-white/20">
              <div className="flex items-center justify-between mb-2 sm:mb-3">
                <div className="flex items-center gap-1.5 sm:gap-2">
                  <span className="text-lg sm:text-2xl">₿</span>
                  <span className="font-semibold text-xs sm:text-sm md:text-base">{LABEL_TEXT.CRYPTO}</span>
                </div>
                <span
                  className={`text-sm sm:text-lg md:text-xl font-bold ${
                    crypto.isProfitable ? "text-green-300" : "text-red-300"
                  }`}
                >
                  {crypto.isProfitable ? "+" : "-"}
                  {formatCurrency(Math.abs(crypto.netPnL))}
                </span>
              </div>
              <div className="grid grid-cols-2 gap-2 text-[10px] sm:text-xs md:text-sm">
                <div>
                  <p className="text-white/70">{LABEL_TEXT.DEPOSIT}</p>
                  <p className="font-semibold">{formatCurrency(crypto.deposits)}</p>
                </div>
                <div>
                  <p className="text-white/70">{LABEL_TEXT.WITHDRAWAL}</p>
                  <p className="font-semibold">{formatCurrency(crypto.withdrawals)}</p>
                </div>
              </div>
            </div>
          </div>

          {/* Footer */}
          <div className="mt-3 sm:mt-6 md:mt-8 pt-3 sm:pt-4 md:pt-6 border-t border-white/20 text-center">
            <p className="text-[10px] sm:text-xs md:text-sm text-white/80">
              Lacak perjalananmu menuju kebebasan finansial 🚀
            </p>
            <p className="text-[10px] sm:text-xs text-white/60 mt-0.5 sm:mt-1">Dibuat oleh Loss Tracker MVP</p>
          </div>
        </CardContent>
      </div>

      {/* Download Button */}
      <Button
        onClick={handleDownload}
        disabled={isDownloading}
        className="w-full h-10 sm:h-11 md:h-12 text-xs sm:text-sm md:text-base"
        size="lg"
      >
        {isDownloading ? (
          <>
            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            Mengunduh...
          </>
        ) : (
          <>
            <Download className="mr-2 h-3 w-3 sm:h-4 sm:w-4 md:h-5 md:w-5" />
            <span className="hidden sm:inline">Download PnL Card sebagai Gambar</span>
            <span className="sm:hidden">Download PnL</span>
          </>
        )}
      </Button>
    </div>
  )
}
