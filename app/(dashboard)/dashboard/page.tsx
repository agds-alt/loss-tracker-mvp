import { createClient } from "@/lib/supabase/server"
import { HeroStats } from "@/components/dashboard/hero-stats"
import { QuickActions } from "@/components/dashboard/quick-actions"
import { WeekSummaryChart } from "@/components/dashboard/week-summary-chart"
import { MotivationSection } from "@/components/dashboard/motivation-section"
import { RecentTransactions } from "@/components/dashboard/recent-transactions"

export default async function DashboardPage() {
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

  // Get losses from last 7 days for chart
  const sevenDaysAgo = new Date()
  sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7)

  const { data: recentLosses } = await supabase
    .from("losses")
    .select("*")
    .eq("user_id", user.id)
    .gte("date", sevenDaysAgo.toISOString().split("T")[0])
    .order("date", { ascending: true })

  // Get all recent losses for transactions list (last 10)
  const { data: allLosses } = await supabase
    .from("losses")
    .select("*")
    .eq("user_id", user.id)
    .order("created_at", { ascending: false })
    .limit(10)

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold">Dashboard</h1>
        <p className="text-muted-foreground mt-1">
          Selamat datang kembali! Ini progress financial journey kamu.
        </p>
      </div>

      <HeroStats stats={stats} />

      <QuickActions />

      <WeekSummaryChart losses={recentLosses || []} />

      <RecentTransactions losses={allLosses || []} />

      <MotivationSection stats={stats} />
    </div>
  )
}
