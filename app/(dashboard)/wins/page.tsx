import { createClient } from "@/lib/supabase/server"
import { WinForm } from "@/components/wins/win-form"
import { WinsList } from "@/components/wins/wins-list"
import { WinsStats } from "@/components/wins/wins-stats"

export default async function WinsPage() {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) return null

  // Get user's wins stats
  const { data: winStats } = await supabase
    .from("win_stats")
    .select("*")
    .eq("user_id", user.id)
    .single()

  // Get available sites
  const sitesQuery = await supabase
    .from("sites")
    .select("*")
    .eq("is_active", true)
    .order("name")

  const sites = (sitesQuery.data as unknown) as never[]

  return (
    <div className="space-y-4 sm:space-y-6 md:space-y-8">
      <div>
        <h1 className="text-xl sm:text-2xl md:text-3xl font-bold">
          💰 Track Wins & Withdrawals
        </h1>
        <p className="text-xs sm:text-sm text-muted-foreground mt-0.5 sm:mt-1">
          Catat semua withdrawal dari berbagai situs dan lihat ranking kamu!
        </p>
      </div>

      {/* Stats Overview */}
      <WinsStats stats={winStats} />

      {/* Add New Win Form */}
      <WinForm sites={sites || []} />

      {/* Wins History */}
      <WinsList userId={user.id} />
    </div>
  )
}
