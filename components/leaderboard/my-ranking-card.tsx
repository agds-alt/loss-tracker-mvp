"use client"

import { Card, CardContent } from "@/components/ui/card"
import { formatCurrency } from "@/lib/utils"
import { Trophy, TrendingUp, Flame } from "lucide-react"
import { Database } from "@/types/database.types"

type UserStats = Database["public"]["Tables"]["user_stats"]["Row"]

interface MyRankingCardProps {
  userStats: UserStats | null
  rankings: {
    clean_days: { rank: number | null; total: number }
    turnaround: { rank: number | null; total: number }
    improved: { rank: number | null; total: number }
  }
}

export function MyRankingCard({ userStats, rankings }: MyRankingCardProps) {
  const cleanDaysRank = rankings.clean_days.rank
  const totalUsers = rankings.clean_days.total

  return (
    <Card className="sticky top-20 z-10 border-2 border-primary/20 bg-gradient-to-r from-primary/5 to-clean/5">
      <CardContent className="p-4 sm:p-6">
        <div className="flex items-center gap-3 sm:gap-4 mb-4">
          <div className="h-12 w-12 sm:h-14 sm:w-14 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0">
            <Trophy className="h-6 w-6 sm:h-7 sm:w-7 text-primary" />
          </div>
          <div className="flex-1">
            <h3 className="text-base sm:text-lg font-bold">Ranking Kamu</h3>
            <p className="text-xs sm:text-sm text-muted-foreground">
              {cleanDaysRank ? `#${cleanDaysRank} dari ${totalUsers} users` : "Belum masuk ranking"}
            </p>
          </div>
        </div>

        <div className="grid grid-cols-3 gap-3 sm:gap-4">
          {/* Clean Days Rank */}
          <div className="text-center p-3 rounded-lg bg-muted/50">
            <Flame className="h-4 w-4 sm:h-5 sm:w-5 text-clean mx-auto mb-1" />
            <p className="text-xs text-muted-foreground">Clean Days</p>
            <p className="text-base sm:text-lg font-bold">
              {cleanDaysRank ? `#${cleanDaysRank}` : "-"}
            </p>
          </div>

          {/* Turnaround Rank */}
          <div className="text-center p-3 rounded-lg bg-muted/50">
            <TrendingUp className="h-4 w-4 sm:h-5 sm:w-5 text-crypto mx-auto mb-1" />
            <p className="text-xs text-muted-foreground">Turnaround</p>
            <p className="text-base sm:text-lg font-bold">
              {rankings.turnaround.rank ? `#${rankings.turnaround.rank}` : "-"}
            </p>
          </div>

          {/* Improved Rank */}
          <div className="text-center p-3 rounded-lg bg-muted/50">
            <Trophy className="h-4 w-4 sm:h-5 sm:w-5 text-judol mx-auto mb-1" />
            <p className="text-xs text-muted-foreground">Improved</p>
            <p className="text-base sm:text-lg font-bold">
              {rankings.improved.rank ? `#${rankings.improved.rank}` : "-"}
            </p>
          </div>
        </div>

        {cleanDaysRank && cleanDaysRank > 10 && (
          <div className="mt-4 p-3 rounded-lg bg-primary/10 border border-primary/20">
            <p className="text-xs sm:text-sm text-center">
              <span className="font-semibold">{cleanDaysRank - 10} ranking lagi</span> untuk masuk Top 10! 🚀
            </p>
          </div>
        )}
      </CardContent>
    </Card>
  )
}
