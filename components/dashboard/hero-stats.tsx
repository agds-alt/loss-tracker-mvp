import { Card, CardContent } from "@/components/ui/card"
import { formatCurrency } from "@/lib/utils"
import { Database } from "@/types/database.types"
import { TrendingDown, TrendingUp, Flame } from "lucide-react"

type UserStats = Database["public"]["Tables"]["user_stats"]["Row"]

interface HeroStatsProps {
  stats: UserStats | null
}

export function HeroStats({ stats }: HeroStatsProps) {
  const judolDeposit = Number(stats?.total_judol_loss || 0)
  const judolWD = Number(stats?.total_judol_win || 0)
  const netJudol = Number(stats?.net_judol || 0)

  const cryptoDeposit = Number(stats?.total_crypto_loss || 0)
  const cryptoWD = Number(stats?.total_crypto_win || 0)
  const netCrypto = Number(stats?.net_crypto || 0)

  const cleanDays = stats?.clean_days || 0

  return (
    <div className="grid gap-3 sm:gap-4 md:grid-cols-3">
      {/* Judol Card */}
      <Card className="border-l-4 border-l-judol">
        <CardContent className="p-3 sm:p-4 md:p-6">
          <div className="flex items-start justify-between mb-2 sm:mb-3 md:mb-4">
            <div>
              <p className="text-xs sm:text-sm font-medium text-muted-foreground">
                Aktivitas Judol
              </p>
              <h3 className="text-lg sm:text-xl md:text-2xl font-bold mt-0.5 sm:mt-1">🎰</h3>
            </div>
          </div>

          <div className="space-y-1.5 sm:space-y-2">
            <div className="flex items-center justify-between text-xs sm:text-sm">
              <div className="flex items-center gap-1.5 sm:gap-2">
                <TrendingDown className="h-3 w-3 sm:h-4 sm:w-4 text-destructive" />
                <span className="text-muted-foreground">Deposit:</span>
              </div>
              <span className="font-semibold text-destructive">
                {formatCurrency(judolDeposit)}
              </span>
            </div>

            <div className="flex items-center justify-between text-xs sm:text-sm">
              <div className="flex items-center gap-1.5 sm:gap-2">
                <TrendingUp className="h-3 w-3 sm:h-4 sm:w-4 text-clean" />
                <span className="text-muted-foreground">WD:</span>
              </div>
              <span className="font-semibold text-clean">
                {formatCurrency(judolWD)}
              </span>
            </div>

            <div className="pt-1.5 sm:pt-2 border-t">
              <div className="flex items-center justify-between">
                <span className="text-xs sm:text-sm font-medium">Hasil Bersih:</span>
                <span className={`text-sm sm:text-base md:text-lg font-bold ${
                  netJudol >= 0 ? 'text-clean' : 'text-destructive'
                }`}>
                  {netJudol >= 0 ? '+' : ''}{formatCurrency(netJudol)}
                </span>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Crypto Card */}
      <Card className="border-l-4 border-l-crypto">
        <CardContent className="p-3 sm:p-4 md:p-6">
          <div className="flex items-start justify-between mb-2 sm:mb-3 md:mb-4">
            <div>
              <p className="text-xs sm:text-sm font-medium text-muted-foreground">
                Aktivitas Crypto
              </p>
              <h3 className="text-lg sm:text-xl md:text-2xl font-bold mt-0.5 sm:mt-1">₿</h3>
            </div>
          </div>

          <div className="space-y-1.5 sm:space-y-2">
            <div className="flex items-center justify-between text-xs sm:text-sm">
              <div className="flex items-center gap-1.5 sm:gap-2">
                <TrendingDown className="h-3 w-3 sm:h-4 sm:w-4 text-destructive" />
                <span className="text-muted-foreground">Deposit:</span>
              </div>
              <span className="font-semibold text-destructive">
                {formatCurrency(cryptoDeposit)}
              </span>
            </div>

            <div className="flex items-center justify-between text-xs sm:text-sm">
              <div className="flex items-center gap-1.5 sm:gap-2">
                <TrendingUp className="h-3 w-3 sm:h-4 sm:w-4 text-clean" />
                <span className="text-muted-foreground">WD:</span>
              </div>
              <span className="font-semibold text-clean">
                {formatCurrency(cryptoWD)}
              </span>
            </div>

            <div className="pt-1.5 sm:pt-2 border-t">
              <div className="flex items-center justify-between">
                <span className="text-xs sm:text-sm font-medium">Hasil Bersih:</span>
                <span className={`text-sm sm:text-base md:text-lg font-bold ${
                  netCrypto >= 0 ? 'text-clean' : 'text-destructive'
                }`}>
                  {netCrypto >= 0 ? '+' : ''}{formatCurrency(netCrypto)}
                </span>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Clean Days Card */}
      <Card className="border-l-4 border-l-clean">
        <CardContent className="p-3 sm:p-4 md:p-6">
          <div className="flex items-center justify-between">
            <div className="flex-1">
              <p className="text-xs sm:text-sm font-medium text-muted-foreground">
                Hari Bersih Beruntun
              </p>
              <h3 className="text-2xl sm:text-3xl md:text-4xl font-bold text-clean mt-1 sm:mt-1.5 md:mt-2">
                {cleanDays}
              </h3>
              <p className="text-xs sm:text-sm text-muted-foreground mt-0.5 sm:mt-1">
                hari tanpa judol
              </p>
            </div>
            <div className="h-12 w-12 sm:h-14 sm:w-14 md:h-16 md:w-16 rounded-full bg-clean/10 flex items-center justify-center flex-shrink-0">
              <Flame className="h-7 w-7 sm:h-8 sm:w-8 md:h-10 md:w-10 text-clean" />
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
