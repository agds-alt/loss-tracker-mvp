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
    <div className="grid gap-4 md:grid-cols-3">
      {/* Judol Card */}
      <Card className="border-l-4 border-l-judol">
        <CardContent className="p-6">
          <div className="flex items-start justify-between mb-4">
            <div>
              <p className="text-sm font-medium text-muted-foreground">
                Judol Activity
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
                {formatCurrency(judolDeposit)}
              </span>
            </div>

            <div className="flex items-center justify-between text-sm">
              <div className="flex items-center gap-2">
                <TrendingUp className="h-4 w-4 text-clean" />
                <span className="text-muted-foreground">WD:</span>
              </div>
              <span className="font-semibold text-clean">
                {formatCurrency(judolWD)}
              </span>
            </div>

            <div className="pt-2 border-t">
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium">Net Result:</span>
                <span className={`text-lg font-bold ${
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
                days without judol
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
