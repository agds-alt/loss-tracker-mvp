"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Avatar } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { formatCurrency } from "@/lib/utils"
import { Trophy, Medal, Award, TrendingUp } from "lucide-react"

// Mock data
const mockTurnaroundData = [
  {
    rank: 1,
    username: "comeback_hero",
    avatar: null,
    from_loss: -25000000,
    to_profit: 8000000,
    months: 6,
    badge: "comeback_king",
  },
  {
    rank: 2,
    username: "crypto_phoenix",
    avatar: null,
    from_loss: -18000000,
    to_profit: 5000000,
    months: 4,
    badge: "diamond_hands",
  },
  {
    rank: 3,
    username: "judol_recovery",
    avatar: null,
    from_loss: -12000000,
    to_profit: 3500000,
    months: 5,
    badge: "diamond_hands",
  },
]

const getBadgeIcon = (badge: string) => {
  switch (badge) {
    case "comeback_king":
      return "🚀"
    case "diamond_hands":
      return "💎"
    default:
      return ""
  }
}

const getBadgeName = (badge: string) => {
  switch (badge) {
    case "comeback_king":
      return "Comeback King"
    case "diamond_hands":
      return "Diamond Hands"
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

export function TurnaroundLeaderboard() {
  return (
    <Card>
      <CardHeader className="p-3 sm:p-4 md:p-6">
        <CardTitle className="text-base sm:text-lg md:text-xl">🚀 Biggest Turnaround</CardTitle>
        <CardDescription className="text-xs sm:text-sm">
          User yang berhasil comeback dari loss besar ke profit
        </CardDescription>
      </CardHeader>
      <CardContent className="p-3 sm:p-4 md:p-6 pt-0">
        <div className="space-y-3 sm:space-y-4">
          {mockTurnaroundData.map((user) => {
            const totalGain = user.to_profit - user.from_loss
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
                  <div className="h-full w-full rounded-full bg-crypto/10 flex items-center justify-center">
                    <span className="text-sm sm:text-base font-semibold text-crypto">
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
                      <span className="text-destructive font-semibold">
                        {formatCurrency(Math.abs(user.from_loss))}
                      </span>
                      <TrendingUp className="h-3 w-3 sm:h-4 sm:w-4 text-clean" />
                      <span className="text-clean font-semibold">
                        +{formatCurrency(user.to_profit)}
                      </span>
                    </div>
                    <p className="text-xs text-muted-foreground">
                      Gain: <span className="font-semibold text-clean">+{formatCurrency(totalGain)}</span> dalam {user.months} bulan
                    </p>
                  </div>
                </div>

                {/* View Profile Button */}
                <button className="px-3 py-1.5 sm:px-4 sm:py-2 text-xs sm:text-sm rounded-md bg-crypto/10 hover:bg-crypto/20 text-crypto font-medium transition-colors flex-shrink-0">
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
