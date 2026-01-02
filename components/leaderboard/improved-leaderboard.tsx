"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Avatar } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { formatCurrency } from "@/lib/utils"
import { Trophy, Medal, Award, TrendingDown } from "lucide-react"

// Mock data
const mockImprovedData = [
  {
    rank: 1,
    username: "progress_master",
    avatar: null,
    last_month_loss: 5000000,
    this_month_loss: 1000000,
    reduction_percent: 80,
    badge: "rising_star",
  },
  {
    rank: 2,
    username: "getting_better",
    avatar: null,
    last_month_loss: 3000000,
    this_month_loss: 900000,
    reduction_percent: 70,
    badge: "on_track",
  },
  {
    rank: 3,
    username: "slow_progress",
    avatar: null,
    last_month_loss: 2500000,
    this_month_loss: 1000000,
    reduction_percent: 60,
    badge: "on_track",
  },
]

const getBadgeIcon = (badge: string) => {
  switch (badge) {
    case "rising_star":
      return "📈"
    case "on_track":
      return "🎯"
    default:
      return ""
  }
}

const getBadgeName = (badge: string) => {
  switch (badge) {
    case "rising_star":
      return "Rising Star"
    case "on_track":
      return "On Track"
    default:
      return ""
  }
}

const getRankIcon = (rank: number) => {
  switch (rank) {
    case 1:
      return <Trophy className="h-5 w-5 sm:h-6 sm:w-6 text-yellow-500" />
    case 2:
      return <Medal className="h-5 w-5 sm:h-6 sm:w-6 text-gray-400" />
    case 3:
      return <Award className="h-5 w-5 sm:h-6 sm:w-6 text-orange-600" />
    default:
      return <span className="text-lg sm:text-xl font-bold text-muted-foreground">#{rank}</span>
  }
}

export function ImprovedLeaderboard() {
  return (
    <Card>
      <CardHeader className="p-3 sm:p-4 md:p-6">
        <CardTitle className="text-base sm:text-lg md:text-xl">📈 Most Improved</CardTitle>
        <CardDescription className="text-xs sm:text-sm">
          User dengan pengurangan loss terbesar bulan ini
        </CardDescription>
      </CardHeader>
      <CardContent className="p-3 sm:p-4 md:p-6 pt-0">
        <div className="space-y-3 sm:space-y-4">
          {mockImprovedData.map((user) => {
            const saved = user.last_month_loss - user.this_month_loss
            return (
              <div
                key={user.rank}
                className="flex items-center gap-3 sm:gap-4 p-3 sm:p-4 rounded-lg border bg-card hover:bg-accent/50 transition-colors"
              >
                {/* Rank */}
                <div className="flex items-center justify-center w-10 sm:w-12 flex-shrink-0">
                  {getRankIcon(user.rank)}
                </div>

                {/* Avatar */}
                <Avatar className="h-10 w-10 sm:h-12 sm:w-12 flex-shrink-0">
                  <div className="h-full w-full rounded-full bg-judol/10 flex items-center justify-center">
                    <span className="text-sm sm:text-base font-semibold text-judol">
                      {user.username[0].toUpperCase()}
                    </span>
                  </div>
                </Avatar>

                {/* User Info */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    <p className="font-semibold text-sm sm:text-base truncate">{user.username}</p>
                    {user.badge && (
                      <Badge variant="outline" className="text-[10px] sm:text-xs px-1.5 sm:px-2 py-0 sm:py-0.5">
                        {getBadgeIcon(user.badge)} {getBadgeName(user.badge)}
                      </Badge>
                    )}
                  </div>
                  <div className="space-y-0.5 sm:space-y-1">
                    <div className="flex items-center gap-2 text-xs sm:text-sm">
                      <TrendingDown className="h-3 w-3 sm:h-4 sm:w-4 text-clean" />
                      <span className="font-semibold text-clean">
                        -{user.reduction_percent}%
                      </span>
                      <span className="text-muted-foreground hidden sm:inline">
                        dari bulan lalu
                      </span>
                    </div>
                    <p className="text-xs text-muted-foreground">
                      Saved: <span className="font-semibold text-clean">{formatCurrency(saved)}</span> bulan ini
                    </p>
                  </div>
                </div>

                {/* View Profile Button */}
                <button className="px-3 py-1.5 sm:px-4 sm:py-2 text-xs sm:text-sm rounded-md bg-judol/10 hover:bg-judol/20 text-judol font-medium transition-colors flex-shrink-0">
                  <span className="hidden sm:inline">Lihat Profil</span>
                  <span className="sm:hidden">Profil</span>
                </button>
              </div>
            )
          })}
        </div>

        {/* Load More */}
        <div className="mt-4 sm:mt-6 text-center">
          <button className="px-4 sm:px-6 py-2 sm:py-2.5 text-xs sm:text-sm rounded-md border border-border hover:bg-accent transition-colors">
            Load More Rankings
          </button>
        </div>
      </CardContent>
    </Card>
  )
}
