"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { DollarSign, TrendingUp, Trophy, Target } from "lucide-react"
import { formatCurrency } from "@/lib/utils"
import { EMPTY_STATE_MESSAGES } from "@/lib/constants/messages"

interface WinsStatsProps {
  stats: {
    total_wins: number
    total_withdrawal_amount: number
    highest_withdrawal: number
    withdrawal_rank: number | null
    favorite_site: string | null
  } | null
}

export function WinsStats({ stats }: WinsStatsProps) {

  if (!stats) {
    return (
      <Card>
        <CardContent className="pt-6 text-center text-muted-foreground">
          {EMPTY_STATE_MESSAGES.NO_WITHDRAWALS}
        </CardContent>
      </Card>
    )
  }

  return (
    <div className="grid grid-cols-2 lg:grid-cols-4 gap-2 sm:gap-3 md:gap-4">
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Total Wins</CardTitle>
          <Target className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{stats.total_wins}</div>
          <p className="text-xs text-muted-foreground">
            Withdrawals recorded
          </p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Total Amount</CardTitle>
          <DollarSign className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold text-green-600">
            {formatCurrency(stats.total_withdrawal_amount)}
          </div>
          <p className="text-xs text-muted-foreground">
            All-time withdrawals
          </p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Highest WD</CardTitle>
          <TrendingUp className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold text-blue-600">
            {formatCurrency(stats.highest_withdrawal)}
          </div>
          <p className="text-xs text-muted-foreground">
            Biggest single withdrawal
          </p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Global Rank</CardTitle>
          <Trophy className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold text-purple-600">
            {stats.withdrawal_rank ? `#${stats.withdrawal_rank}` : "-"}
          </div>
          <p className="text-xs text-muted-foreground">
            {stats.favorite_site || "No favorite yet"}
          </p>
        </CardContent>
      </Card>
    </div>
  )
}
