import { Card, CardContent } from "@/components/ui/card"
import { formatCurrency } from "@/lib/utils"
import { Database } from "@/types/database.types"
import { TrendingDown, TrendingUp, Flame, Activity } from "lucide-react"

type UserStats = Database["public"]["Tables"]["user_stats"]["Row"]

interface HeroStatsProps {
  stats: UserStats | null
}

export function HeroStats({ stats }: HeroStatsProps) {
  const casinoDeposit = Number(stats?.total_casino_loss || 0)
  const casinoWD = Number(stats?.total_casino_win || 0)
  const netCasino = Number(stats?.net_casino || 0)

  const cryptoDeposit = Number(stats?.total_crypto_loss || 0)
  const cryptoWD = Number(stats?.total_crypto_win || 0)
  const netCrypto = Number(stats?.net_crypto || 0)

  const cleanDays = stats?.clean_days || 0

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4">
      {/* Casino Card */}
      <Card className="border border-red-500/20 bg-gradient-to-br from-red-950/20 to-black hover:border-red-500/40 transition-all duration-300 overflow-hidden relative group">
        <div className="absolute inset-0 bg-gradient-to-br from-red-500/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
        <CardContent className="p-4 sm:p-5 lg:p-6 relative z-10">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-3">
              <div className="h-12 w-12 rounded-xl bg-red-500/10 flex items-center justify-center border border-red-500/20">
                <span className="text-2xl">🎰</span>
              </div>
              <div>
                <p className="text-xs font-medium text-red-400/80 uppercase tracking-wider">Casino</p>
                <p className="text-sm text-muted-foreground">Activity</p>
              </div>
            </div>
            <Activity className="h-5 w-5 text-red-500/40" />
          </div>

          <div className="space-y-3">
            <div className="flex items-center justify-between p-2 rounded-lg bg-black/40">
              <div className="flex items-center gap-2">
                <TrendingDown className="h-4 w-4 text-red-400" />
                <span className="text-xs text-muted-foreground">Deposit</span>
              </div>
              <span className="font-bold text-sm text-red-400">
                {formatCurrency(casinoDeposit)}
              </span>
            </div>

            <div className="flex items-center justify-between p-2 rounded-lg bg-black/40">
              <div className="flex items-center gap-2">
                <TrendingUp className="h-4 w-4 text-green-400" />
                <span className="text-xs text-muted-foreground">Withdraw</span>
              </div>
              <span className="font-bold text-sm text-green-400">
                {formatCurrency(casinoWD)}
              </span>
            </div>

            <div className="pt-2 mt-2 border-t border-red-500/10">
              <div className="flex items-center justify-between">
                <span className="text-xs font-medium text-muted-foreground">Net P&L</span>
                <span className={`text-lg font-bold ${
                  netCasino >= 0 ? 'text-green-400' : 'text-red-400'
                }`}>
                  {netCasino >= 0 ? '+' : ''}{formatCurrency(netCasino)}
                </span>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Crypto Card */}
      <Card className="border border-yellow-500/20 bg-gradient-to-br from-yellow-950/20 to-black hover:border-yellow-500/40 transition-all duration-300 overflow-hidden relative group">
        <div className="absolute inset-0 bg-gradient-to-br from-yellow-500/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
        <CardContent className="p-4 sm:p-5 lg:p-6 relative z-10">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-3">
              <div className="h-12 w-12 rounded-xl bg-yellow-500/10 flex items-center justify-center border border-yellow-500/20">
                <span className="text-2xl">₿</span>
              </div>
              <div>
                <p className="text-xs font-medium text-yellow-400/80 uppercase tracking-wider">Crypto</p>
                <p className="text-sm text-muted-foreground">Activity</p>
              </div>
            </div>
            <Activity className="h-5 w-5 text-yellow-500/40" />
          </div>

          <div className="space-y-3">
            <div className="flex items-center justify-between p-2 rounded-lg bg-black/40">
              <div className="flex items-center gap-2">
                <TrendingDown className="h-4 w-4 text-red-400" />
                <span className="text-xs text-muted-foreground">Deposit</span>
              </div>
              <span className="font-bold text-sm text-red-400">
                {formatCurrency(cryptoDeposit)}
              </span>
            </div>

            <div className="flex items-center justify-between p-2 rounded-lg bg-black/40">
              <div className="flex items-center gap-2">
                <TrendingUp className="h-4 w-4 text-green-400" />
                <span className="text-xs text-muted-foreground">Withdraw</span>
              </div>
              <span className="font-bold text-sm text-green-400">
                {formatCurrency(cryptoWD)}
              </span>
            </div>

            <div className="pt-2 mt-2 border-t border-yellow-500/10">
              <div className="flex items-center justify-between">
                <span className="text-xs font-medium text-muted-foreground">Net P&L</span>
                <span className={`text-lg font-bold ${
                  netCrypto >= 0 ? 'text-green-400' : 'text-red-400'
                }`}>
                  {netCrypto >= 0 ? '+' : ''}{formatCurrency(netCrypto)}
                </span>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Clean Days Card */}
      <Card className="border border-green-500/20 bg-gradient-to-br from-green-950/20 to-black hover:border-green-500/40 transition-all duration-300 overflow-hidden relative group sm:col-span-2 lg:col-span-1">
        <div className="absolute inset-0 bg-gradient-to-br from-green-500/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
        <CardContent className="p-4 sm:p-5 lg:p-6 relative z-10">
          <div className="flex items-center justify-between">
            <div className="flex-1">
              <div className="flex items-center gap-2 mb-3">
                <div className="h-10 w-10 rounded-lg bg-green-500/10 flex items-center justify-center border border-green-500/20">
                  <Flame className="h-5 w-5 text-green-400" />
                </div>
                <div>
                  <p className="text-xs font-medium text-green-400/80 uppercase tracking-wider">Clean Streak</p>
                  <p className="text-xs text-muted-foreground">Hari Bersih</p>
                </div>
              </div>
              <div className="flex items-baseline gap-2">
                <h3 className="text-5xl font-bold text-green-400">
                  {cleanDays}
                </h3>
                <span className="text-sm text-muted-foreground mb-2">days</span>
              </div>
              <p className="text-xs text-green-400/60 mt-2">
                Tanpa casino - Keep it up! 🔥
              </p>
            </div>
            <div className="h-20 w-20 rounded-2xl bg-gradient-to-br from-green-500/10 to-green-500/5 flex items-center justify-center border border-green-500/20 flex-shrink-0">
              <div className="text-4xl animate-pulse">🏆</div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
