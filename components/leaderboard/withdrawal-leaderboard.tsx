"use client"

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { TrendingUp, Trophy, DollarSign, Target } from "lucide-react"
import { createClient } from "@/lib/supabase/client"
import { useEffect, useState } from "react"

interface LeaderboardEntry {
  rank: number
  username: string
  avatar_url: string | null
  total_wins: number
  total_withdrawal_amount: number
  highest_withdrawal: number
  favorite_site: string | null
  last_withdrawal_date: string | null
  user_id: string
}

export function WithdrawalLeaderboard() {
  const [leaderboard, setLeaderboard] = useState<LeaderboardEntry[]>([])
  const [loading, setLoading] = useState(true)
  const [currentUserId, setCurrentUserId] = useState<string | null>(null)

  useEffect(() => {
    const fetchLeaderboard = async () => {
      const supabase = createClient()

      // Get current user
      const { data: { user } } = await supabase.auth.getUser()
      setCurrentUserId(user?.id || null)

      // Fetch leaderboard data
      const { data, error } = await supabase
        .from('leaderboard_withdrawals')
        .select('*')
        .limit(100)

      if (!error && data) {
        setLeaderboard(data)
      }

      setLoading(false)
    }

    fetchLeaderboard()

    // Subscribe to real-time updates
    const supabase = createClient()
    const channel = supabase
      .channel('withdrawal-leaderboard')
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'win_stats' },
        () => {
          fetchLeaderboard()
        }
      )
      .subscribe()

    return () => {
      supabase.removeChannel(channel)
    }
  }, [])

  const getRankBadge = (rank: number) => {
    if (rank === 1) return <Trophy className="h-5 w-5 text-yellow-500" />
    if (rank === 2) return <Trophy className="h-5 w-5 text-gray-400" />
    if (rank === 3) return <Trophy className="h-5 w-5 text-amber-600" />
    return <span className="text-sm font-bold text-muted-foreground">#{rank}</span>
  }

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('id-ID', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(amount)
  }

  if (loading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <DollarSign className="h-5 w-5" />
            Withdrawal Leaderboard
          </CardTitle>
          <CardDescription>Loading...</CardDescription>
        </CardHeader>
      </Card>
    )
  }

  if (leaderboard.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <DollarSign className="h-5 w-5" />
            Withdrawal Leaderboard
          </CardTitle>
          <CardDescription>
            Belum ada data withdrawal. Jadilah yang pertama!
          </CardDescription>
        </CardHeader>
      </Card>
    )
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <DollarSign className="h-5 w-5" />
          Withdrawal Leaderboard
        </CardTitle>
        <CardDescription>
          Top users dengan total withdrawal terbesar dari berbagai situs
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-3">
          {leaderboard.map((entry) => {
            const isCurrentUser = entry.user_id === currentUserId

            return (
              <div
                key={entry.user_id}
                className={`flex items-center gap-3 p-3 rounded-lg transition-colors ${
                  isCurrentUser
                    ? "bg-primary/10 border-2 border-primary"
                    : "bg-muted/50 hover:bg-muted"
                }`}
              >
                {/* Rank */}
                <div className="flex items-center justify-center w-10">
                  {getRankBadge(entry.rank)}
                </div>

                {/* Avatar */}
                <Avatar className="h-10 w-10">
                  <AvatarImage src={entry.avatar_url || undefined} />
                  <AvatarFallback>
                    {entry.username.slice(0, 2).toUpperCase()}
                  </AvatarFallback>
                </Avatar>

                {/* User Info */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <p className="font-semibold truncate">
                      {entry.username}
                      {isCurrentUser && (
                        <Badge variant="secondary" className="ml-2">
                          You
                        </Badge>
                      )}
                    </p>
                  </div>
                  <div className="flex items-center gap-3 text-xs text-muted-foreground">
                    <span className="flex items-center gap-1">
                      <Target className="h-3 w-3" />
                      {entry.total_wins} wins
                    </span>
                    {entry.favorite_site && (
                      <span className="truncate">
                        Favorite: {entry.favorite_site}
                      </span>
                    )}
                  </div>
                </div>

                {/* Stats */}
                <div className="text-right">
                  <div className="font-bold text-green-600">
                    {formatCurrency(entry.total_withdrawal_amount)}
                  </div>
                  <div className="text-xs text-muted-foreground">
                    Highest: {formatCurrency(entry.highest_withdrawal)}
                  </div>
                </div>

                {/* Trend Icon */}
                {entry.rank <= 10 && (
                  <TrendingUp className="h-5 w-5 text-green-500" />
                )}
              </div>
            )
          })}
        </div>

        {/* Footer Stats */}
        <div className="mt-6 pt-4 border-t">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-center">
            <div>
              <div className="text-2xl font-bold text-primary">
                {leaderboard.length}
              </div>
              <div className="text-xs text-muted-foreground">Total Users</div>
            </div>
            <div>
              <div className="text-2xl font-bold text-green-600">
                {formatCurrency(
                  leaderboard.reduce((sum, entry) => sum + entry.total_withdrawal_amount, 0)
                )}
              </div>
              <div className="text-xs text-muted-foreground">Total Withdrawals</div>
            </div>
            <div>
              <div className="text-2xl font-bold text-blue-600">
                {formatCurrency(
                  Math.max(...leaderboard.map(entry => entry.total_withdrawal_amount), 0)
                )}
              </div>
              <div className="text-xs text-muted-foreground">Highest User</div>
            </div>
            <div>
              <div className="text-2xl font-bold text-purple-600">
                {Math.round(
                  leaderboard.reduce((sum, entry) => sum + entry.total_withdrawal_amount, 0) /
                  leaderboard.length
                ).toLocaleString()}
              </div>
              <div className="text-xs text-muted-foreground">Average</div>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
