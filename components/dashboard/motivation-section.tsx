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
  const totalCasino = Number(stats?.total_casino_loss || 0)
  const totalCrypto = Number(stats?.total_crypto_loss || 0)
  const progressPercentage = totalCasino > 0 && totalCrypto > 0
    ? Math.min(100, Math.round((totalCrypto / totalCasino) * 100))
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
            <span className="font-medium">Days since last casino:</span>
            <span className="text-2xl font-bold text-clean">{cleanDays} days</span>
          </div>
        </div>

        {totalCasino > 0 && totalCrypto > 0 && (
          <div className="space-y-2">
            <div className="flex items-center justify-between text-sm">
              <span className="font-medium">Crypto vs Casino Loss Ratio:</span>
              <span className="font-semibold">{progressPercentage}%</span>
            </div>
            <div className="w-full bg-muted rounded-full h-2.5">
              <div
                className="bg-clean h-2.5 rounded-full transition-all duration-500"
                style={{ width: `${Math.min(100, progressPercentage)}%` }}
              />
            </div>
            <p className="text-xs text-muted-foreground text-center">
              {totalCasino > totalCrypto
                ? `Casino ${Math.round(((totalCasino - totalCrypto) / totalCasino) * 100)}% lebih boros dari crypto!`
                : "Crypto loss kamu lebih tinggi. Keep learning!"}
            </p>
          </div>
        )}
      </CardContent>
    </Card>
  )
}
