"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { formatCurrency } from "@/lib/utils"
import { Trophy, TrendingUp, TrendingDown, Medal, Award } from "lucide-react"
import { SiteStats } from "@/lib/db/stats-queries"

interface TopSitesRankingsProps {
  topWithdrawals: SiteStats[]
  topDeposits: SiteStats[]
}

export function TopSitesRankings({ topWithdrawals, topDeposits }: TopSitesRankingsProps) {
  const getRankIcon = (rank: number) => {
    switch (rank) {
      case 1:
        return <Trophy className="h-5 w-5 text-yellow-400" />
      case 2:
        return <Medal className="h-5 w-5 text-gray-400" />
      case 3:
        return <Award className="h-5 w-5 text-amber-600" />
      default:
        return <span className="text-sm font-bold text-muted-foreground">#{rank}</span>
    }
  }

  const getRankBadge = (rank: number) => {
    const colors = {
      1: "bg-gradient-to-r from-yellow-500/20 to-yellow-600/20 border-yellow-500/30",
      2: "bg-gradient-to-r from-gray-400/20 to-gray-500/20 border-gray-400/30",
      3: "bg-gradient-to-r from-amber-600/20 to-amber-700/20 border-amber-600/30",
    }
    return colors[rank as keyof typeof colors] || "bg-black/40 border-white/10"
  }

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
      {/* Top Withdrawals */}
      <Card className="border border-green-500/20 bg-gradient-to-br from-green-950/10 to-black">
        <CardHeader className="pb-3 border-b border-green-500/10">
          <div className="flex items-center gap-3">
            <div className="h-10 w-10 rounded-xl bg-green-500/10 flex items-center justify-center border border-green-500/20">
              <TrendingUp className="h-5 w-5 text-green-400" />
            </div>
            <div>
              <CardTitle className="text-lg">Top Withdrawals</CardTitle>
              <p className="text-xs text-muted-foreground">Situs dengan WD terbesar</p>
            </div>
          </div>
        </CardHeader>
        <CardContent className="pt-4">
          {topWithdrawals.length === 0 ? (
            <p className="text-center text-muted-foreground py-8 text-sm">
              Belum ada withdrawal 💸
            </p>
          ) : (
            <div className="space-y-2">
              {topWithdrawals.map((site, index) => (
                <div
                  key={site.site_coin_name}
                  className={`flex items-center gap-3 p-3 rounded-xl border transition-all hover:scale-[1.02] ${getRankBadge(
                    index + 1
                  )}`}
                >
                  <div className="flex items-center justify-center w-8">
                    {getRankIcon(index + 1)}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <p className="font-semibold text-sm truncate">
                        {site.site_coin_name}
                      </p>
                      <span
                        className={`text-[10px] px-2 py-0.5 rounded-full ${
                          site.type === "judol"
                            ? "bg-red-500/20 text-red-400"
                            : "bg-yellow-500/20 text-yellow-400"
                        }`}
                      >
                        {site.type}
                      </span>
                    </div>
                    <p className="text-xs text-muted-foreground">
                      {site.count}x WD · Highest: {formatCurrency(site.highest_single)}
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="font-bold text-sm text-green-400">
                      {formatCurrency(site.total_amount)}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Top Deposits */}
      <Card className="border border-red-500/20 bg-gradient-to-br from-red-950/10 to-black">
        <CardHeader className="pb-3 border-b border-red-500/10">
          <div className="flex items-center gap-3">
            <div className="h-10 w-10 rounded-xl bg-red-500/10 flex items-center justify-center border border-red-500/20">
              <TrendingDown className="h-5 w-5 text-red-400" />
            </div>
            <div>
              <CardTitle className="text-lg">Top Deposits</CardTitle>
              <p className="text-xs text-muted-foreground">Situs dengan deposit terbesar</p>
            </div>
          </div>
        </CardHeader>
        <CardContent className="pt-4">
          {topDeposits.length === 0 ? (
            <p className="text-center text-muted-foreground py-8 text-sm">
              Belum ada deposit 💰
            </p>
          ) : (
            <div className="space-y-2">
              {topDeposits.map((site, index) => (
                <div
                  key={site.site_coin_name}
                  className={`flex items-center gap-3 p-3 rounded-xl border transition-all hover:scale-[1.02] ${getRankBadge(
                    index + 1
                  )}`}
                >
                  <div className="flex items-center justify-center w-8">
                    {getRankIcon(index + 1)}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <p className="font-semibold text-sm truncate">
                        {site.site_coin_name}
                      </p>
                      <span
                        className={`text-[10px] px-2 py-0.5 rounded-full ${
                          site.type === "judol"
                            ? "bg-red-500/20 text-red-400"
                            : "bg-yellow-500/20 text-yellow-400"
                        }`}
                      >
                        {site.type}
                      </span>
                    </div>
                    <p className="text-xs text-muted-foreground">
                      {site.count}x deposit · Highest: {formatCurrency(site.highest_single)}
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="font-bold text-sm text-red-400">
                      {formatCurrency(site.total_amount)}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
