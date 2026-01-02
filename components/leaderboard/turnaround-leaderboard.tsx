"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Avatar } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { Trophy, Medal, Award, Loader2 } from "lucide-react"
import { getLeaderboard, LeaderboardUser } from "@/app/actions/leaderboard"

const getBadge = (longestStreak: number) => {
  if (longestStreak >= 100) {
    return { icon: "🚀", name: "Comeback King", variant: "default" as const }
  }
  if (longestStreak >= 50) {
    return { icon: "💎", name: "Diamond Hands", variant: "secondary" as const }
  }
  return null
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
  const [users, setUsers] = useState<LeaderboardUser[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [isLoadingMore, setIsLoadingMore] = useState(false)
  const [hasMore, setHasMore] = useState(true)
  const LIMIT = 10

  useEffect(() => {
    const fetchLeaderboard = async () => {
      setIsLoading(true)
      try {
        const result = await getLeaderboard({
          rankBy: "longest_streak",
          limit: LIMIT,
          offset: 0,
        })

        if (result.success && result.data) {
          setUsers(result.data)
          if (result.data.length < LIMIT) {
            setHasMore(false)
          }
        }
      } catch (error) {
        console.error("Error fetching leaderboard:", error)
      } finally {
        setIsLoading(false)
      }
    }

    fetchLeaderboard()
  }, [])

  const loadMore = async () => {
    setIsLoadingMore(true)
    try {
      const result = await getLeaderboard({
        rankBy: "longest_streak",
        limit: LIMIT,
        offset: users.length,
      })

      if (result.success && result.data) {
        setUsers((prev) => [...prev, ...result.data])
        if (result.data.length < LIMIT) {
          setHasMore(false)
        }
      }
    } catch (error) {
      console.error("Error loading more:", error)
    } finally {
      setIsLoadingMore(false)
    }
  }

  if (isLoading) {
    return (
      <Card>
        <CardHeader className="p-3 sm:p-4 md:p-6">
          <CardTitle className="text-base sm:text-lg md:text-xl">🚀 Best Streak Ever</CardTitle>
          <CardDescription className="text-xs sm:text-sm">
            Ranking berdasarkan streak terpanjang sepanjang masa
          </CardDescription>
        </CardHeader>
        <CardContent className="p-3 sm:p-4 md:p-6 pt-0">
          <div className="flex justify-center py-12">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card>
      <CardHeader className="p-3 sm:p-4 md:p-6">
        <CardTitle className="text-base sm:text-lg md:text-xl">🚀 Best Streak Ever</CardTitle>
        <CardDescription className="text-xs sm:text-sm">
          Ranking berdasarkan streak terpanjang sepanjang masa
        </CardDescription>
      </CardHeader>
      <CardContent className="p-3 sm:p-4 md:p-6 pt-0">
        {users.length === 0 ? (
          <div className="text-center py-12 text-muted-foreground text-sm">
            Belum ada data leaderboard
          </div>
        ) : (
          <>
            <div className="space-y-3 sm:space-y-4">
              {users.map((user) => {
                const badge = getBadge(user.longest_streak)

                return (
                  <div
                    key={user.user_id}
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
                          {user.username[0]?.toUpperCase() || "U"}
                        </span>
                      </div>
                    </Avatar>

                    {/* User Info */}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1">
                        <p className="font-semibold text-sm sm:text-base truncate">{user.username}</p>
                        {badge && (
                          <Badge variant={badge.variant} className="text-[10px] sm:text-xs px-1.5 sm:px-2 py-0 sm:py-0.5">
                            {badge.icon} {badge.name}
                          </Badge>
                        )}
                      </div>
                      <div className="flex items-center gap-2 sm:gap-3 text-xs sm:text-sm text-muted-foreground">
                        <span className="flex items-center gap-1">
                          🏆 <span className="font-semibold text-clean">{user.longest_streak} hari</span>
                        </span>
                        <span>•</span>
                        <span>Sekarang: {user.current_streak} hari</span>
                      </div>
                    </div>
                  </div>
                )
              })}
            </div>

            {/* Load More */}
            {hasMore && (
              <div className="mt-4 sm:mt-6 text-center">
                <button
                  onClick={loadMore}
                  disabled={isLoadingMore}
                  className="px-4 sm:px-6 py-2 sm:py-2.5 text-xs sm:text-sm rounded-md border border-border hover:bg-accent transition-colors disabled:opacity-50"
                >
                  {isLoadingMore ? (
                    <>
                      <Loader2 className="inline h-4 w-4 animate-spin mr-2" />
                      Loading...
                    </>
                  ) : (
                    "Load More Rankings"
                  )}
                </button>
              </div>
            )}
          </>
        )}
      </CardContent>
    </Card>
  )
}
