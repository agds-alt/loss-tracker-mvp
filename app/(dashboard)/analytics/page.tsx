import { createClient } from "@/lib/supabase/server"
import { TopSitesRankings } from "@/components/dashboard/top-sites-rankings"
import { getTopWithdrawals, getTopDeposits } from "@/lib/db/stats-queries"

export default async function AnalyticsPage() {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) return null

  // Get top sites rankings - show all sites
  const topWithdrawals = await getTopWithdrawals(supabase, user.id, 999)
  const topDeposits = await getTopDeposits(supabase, user.id, 999)

  return (
    <div className="space-y-4 sm:space-y-6 md:space-y-8">
      <div>
        <h1 className="text-xl sm:text-2xl md:text-3xl font-bold">Analytics</h1>
        <p className="text-xs sm:text-sm text-muted-foreground mt-0.5 sm:mt-1">
          Analisis mendalam dari aktivitas trading kamu.
        </p>
      </div>

      <TopSitesRankings
        topWithdrawals={topWithdrawals}
        topDeposits={topDeposits}
      />
    </div>
  )
}
