import { createClient } from "@/lib/supabase/server"
import { MotivationSection } from "@/components/dashboard/motivation-section"
import { PnLCard } from "@/components/dashboard/pnl-card"

export default async function StatsPage() {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) return null

  // Get user stats
  const { data: stats } = await supabase
    .from("user_stats")
    .select("*")
    .eq("user_id", user.id)
    .single()

  // Get all losses for PnL card
  const { data: allLossesForPnL } = await supabase
    .from("losses")
    .select("*")
    .eq("user_id", user.id)
    .order("created_at", { ascending: false })

  // Get user profile for username
  const { data: userProfile } = await supabase
    .from("users")
    .select("username")
    .eq("id", user.id)
    .single() as { data: { username: string } | null }

  return (
    <div className="space-y-4 sm:space-y-6 md:space-y-8">
      <div>
        <h1 className="text-xl sm:text-2xl md:text-3xl font-bold">My Stats</h1>
        <p className="text-xs sm:text-sm text-muted-foreground mt-0.5 sm:mt-1">
          Performance dan statistik lengkap kamu.
        </p>
      </div>

      <PnLCard losses={allLossesForPnL || []} username={userProfile?.username || "User"} />

      <MotivationSection stats={stats} />
    </div>
  )
}
