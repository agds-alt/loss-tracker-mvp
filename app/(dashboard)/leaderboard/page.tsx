import { createClient } from "@/lib/supabase/server"
import { LeaderboardTabs } from "@/components/leaderboard/leaderboard-tabs"
import { MyRankingCard } from "@/components/leaderboard/my-ranking-card"

export default async function LeaderboardPage() {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) return null

  // Get user's stats for ranking card
  const { data: userStatsArray } = await supabase
    .from("user_stats")
    .select("*")
    .eq("user_id", user.id)
    .limit(1)

  const userStats = userStatsArray?.[0] || null

  // Get user's current rankings (will implement after migration)
  // For now, using mock data
  const userRankings = {
    clean_days: { rank: 15, total: 100 },
    turnaround: { rank: null, total: 50 },
    improved: { rank: 8, total: 75 },
  }

  return (
    <div className="space-y-4 sm:space-y-6 md:space-y-8">
      <div>
        <h1 className="text-xl sm:text-2xl md:text-3xl font-bold">Leaderboard</h1>
        <p className="text-xs sm:text-sm text-muted-foreground mt-0.5 sm:mt-1">
          Lihat ranking dan progress kamu dibanding user lain
        </p>
      </div>

      {/* My Ranking Card - Sticky */}
      <MyRankingCard
        userStats={userStats}
        rankings={userRankings}
      />

      {/* Leaderboard Tabs */}
      <LeaderboardTabs />
    </div>
  )
}
