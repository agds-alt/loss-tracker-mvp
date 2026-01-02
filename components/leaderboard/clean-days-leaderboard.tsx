"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Avatar } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { formatCurrency } from "@/lib/utils"
import { Trophy, Medal, Award } from "lucide-react"

// Mock data - akan diganti dengan real data setelah migration
const mockLeaderboardData = [
  {
    rank: 1,
    username: "user123",
    avatar: null,
    clean_days: 127,
    total_saved: 15000000,
    badge: "champion",
  },
  {
    rank: 2,
    username: "crypto_warrior",
    avatar: null,
    clean_days: 95,
    total_saved: 8500000,
    badge: "champion",
  },
  {
    rank: 3,
    username: "judol_fighter",
    avatar: null,
    clean_days: 78,
    total_saved: 12000000,
    badge: "fire_streak",
  },
  {
    rank: 4,
    username: "clean_life",
    avatar: null,
    clean_days: 65,
    total_saved: 6200000,
    badge: "fire_streak",
  },
  {
    rank: 5,
    username: "financial_freedom",
    avatar: null,
    clean_days: 54,
    total_saved: 4800000,
    badge: "fire_streak",
  },
]

const getBadgeIcon = (badge: string) => {
  switch (badge) {
    case "champion":
      return "⭐"
    case "fire_streak":
      return "🔥"
    default:
      return ""
  }
}

const getBadgeName = (badge: string) => {
  switch (badge) {
    case "champion":
      return "Champion"
    case "fire_streak":
      return "Fire Streak"
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

export function CleanDaysLeaderboard() {
  return (
    <Card>
      <CardHeader className="p-3 sm:p-4 md:p-6">
        <CardTitle className="text-base sm:text-lg md:text-xl">🔥 Clean Days Leaderboard</CardTitle>
        <CardDescription className="text-xs sm:text-sm">
          Ranking berdasarkan hari bersih berturut-turut tanpa judol
        </CardDescription>
      </CardHeader>
      <CardContent className="p-3 sm:p-4 md:p-6 pt-0">
        <div className="space-y-3 sm:space-y-4">
          {mockLeaderboardData.map((user) => (
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
                <div className="h-full w-full rounded-full bg-primary/10 flex items-center justify-center">
                  <span className="text-sm sm:text-base font-semibold text-primary">
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
                <div className="flex items-center gap-2 sm:gap-3 text-xs sm:text-sm text-muted-foreground">
                  <span className="flex items-center gap-1">
                    🔥 <span className="font-semibold text-clean">{user.clean_days} hari</span>
                  </span>
                  <span>•</span>
                  <span className="hidden sm:inline">Saved {formatCurrency(user.total_saved)}</span>
                  <span className="sm:hidden">{formatCurrency(user.total_saved)}</span>
                </div>
              </div>

              {/* View Profile Button */}
              <button className="px-3 py-1.5 sm:px-4 sm:py-2 text-xs sm:text-sm rounded-md bg-primary/10 hover:bg-primary/20 text-primary font-medium transition-colors flex-shrink-0">
                <span className="hidden sm:inline">Lihat Profil</span>
                <span className="sm:hidden">Profil</span>
              </button>
            </div>
          ))}
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
