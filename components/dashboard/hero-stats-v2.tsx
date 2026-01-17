import { Card, CardContent } from "@/components/ui/card"
import { formatCurrency } from "@/lib/utils"
import { Database } from "@/types/database.types"
import { TrendingDown, TrendingUp, Flame } from "lucide-react"

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
    <div className="grid gap-4 md:grid-cols-3">
      {/* Casino Card */}
      <Card className="border-l-4 border-l-casino">
        <CardContent className="p-6">
          <div className="flex items-start justify-between mb-4">
            <div>
              <p className="text-sm font-medium text-muted-foreground">
                Casino Activity
              </p>
              <h3 className="text-2xl font-bold mt-1">🎰</h3>
            </div>
          </div>

          <div className="space-y-2">
            <div className="flex items-center justify-between text-sm">
              <div className="flex items-center gap-2">
                <TrendingDown className="h-4 w-4 text-destructive" />
                <span className="text-muted-foreground">Deposit:</span>
              </div>
              <span className="font-semibold text-destructive">
                {formatCurrency(casinoDeposit)}
              </span>
            </div>

            <div className="flex items-center justify-between text-sm">
              <div className="flex items-center gap-2">
                <TrendingUp className="h-4 w-4 text-clean" />
                <span className="text-muted-foreground">WD:</span>
              </div>
              <span className="font-semibold text-clean">
                {formatCurrency(casinoWD)}
              </span>
            </div>

            <div className="pt-2 border-t">
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium">Net Result:</span>
                <span className={`text-lg font-bold ${
                  netCasino >= 0 ? 'text-clean' : 'text-destructive'
                }`}>
                  {netCasino >= 0 ? '+' : ''}{formatCurrency(netCasino)}
                </span>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Crypto Card */}
      <Card className="border-l-4 border-l-crypto">
        <CardContent className="p-6">
          <div className="flex items-start justify-between mb-4">
            <div>
              <p className="text-sm font-medium text-muted-foreground">
                Crypto Activity
              </p>
              <h3 className="text-2xl font-bold mt-1">₿</h3>
            </div>
          </div>

          <div className="space-y-2">
            <div className="flex items-center justify-between text-sm">
              <div className="flex items-center gap-2">
                <TrendingDown className="h-4 w-4 text-destructive" />
                <span className="text-muted-foreground">Deposit:</span>
              </div>
              <span className="font-semibold text-destructive">
                {formatCurrency(cryptoDeposit)}
              </span>
            </div>

            <div className="flex items-center justify-between text-sm">
              <div className="flex items-center gap-2">
                <TrendingUp className="h-4 w-4 text-clean" />
                <span className="text-muted-foreground">WD:</span>
              </div>
              <span className="font-semibold text-clean">
                {formatCurrency(cryptoWD)}
              </span>
            </div>

            <div className="pt-2 border-t">
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium">Net Result:</span>
                <span className={`text-lg font-bold ${
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
        <CardContent className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-muted-foreground">
                Clean Days Streak
              </p>
              <h3 className="text-4xl font-bold text-clean mt-2">
                {cleanDays}
              </h3>
              <p className="text-sm text-muted-foreground mt-1">
                days without casino
              </p>
            </div>
            <div className="h-16 w-16 rounded-full bg-clean/10 flex items-center justify-center">
              <Flame className="h-10 w-10 text-clean" />
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
