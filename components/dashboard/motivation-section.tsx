import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { getMotivationalQuote } from "@/lib/utils"
import { Database } from "@/types/database.types"

type UserStats = Database["public"]["Tables"]["user_stats"]["Row"]

interface MotivationSectionProps {
  stats: UserStats | null
}

export function MotivationSection({ stats }: MotivationSectionProps) {
  const cleanDays = stats?.clean_days || 0
  const quote = getMotivationalQuote()

  // Calculate percentage less loss compared to max
  const totalJudol = Number(stats?.total_judol_loss || 0)
  const totalCrypto = Number(stats?.total_crypto_loss || 0)
  const progressPercentage = totalJudol > 0 && totalCrypto > 0
    ? Math.min(100, Math.round((totalCrypto / totalJudol) * 100))
    : 0

  return (
    <Card className="bg-gradient-to-br from-card via-card to-primary/5">
      <CardHeader>
        <CardTitle>Motivation</CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="text-center py-6">
          <p className="text-2xl font-bold text-primary">{quote}</p>
        </div>

        <div className="space-y-2">
          <div className="flex items-center justify-between text-sm">
            <span className="font-medium">Days since last judol:</span>
            <span className="text-2xl font-bold text-clean">{cleanDays} days</span>
          </div>
        </div>

        {totalJudol > 0 && totalCrypto > 0 && (
          <div className="space-y-2">
            <div className="flex items-center justify-between text-sm">
              <span className="font-medium">Crypto vs Judol Loss Ratio:</span>
              <span className="font-semibold">{progressPercentage}%</span>
            </div>
            <div className="w-full bg-muted rounded-full h-2.5">
              <div
                className="bg-clean h-2.5 rounded-full transition-all duration-500"
                style={{ width: `${Math.min(100, progressPercentage)}%` }}
              />
            </div>
            <p className="text-xs text-muted-foreground text-center">
              {totalJudol > totalCrypto
                ? `Judol ${Math.round(((totalJudol - totalCrypto) / totalJudol) * 100)}% lebih boros dari crypto!`
                : "Crypto loss kamu lebih tinggi. Keep learning!"}
            </p>
          </div>
        )}
      </CardContent>
    </Card>
  )
}
