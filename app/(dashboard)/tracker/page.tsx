import { createClient } from "@/lib/supabase/server"
import { InputForm } from "@/components/tracker/input-form"
import { EntryList } from "@/components/tracker/entry-list"
import { RealityCheck } from "@/components/tracker/reality-check"

export default async function TrackerPage() {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) return null

  // Get all losses
  const { data: losses } = await supabase
    .from("losses")
    .select("*")
    .eq("user_id", user.id)
    .order("date", { ascending: false })

  // Get user stats for reality check
  const { data: stats } = await supabase
    .from("user_stats")
    .select("*")
    .eq("user_id", user.id)
    .single()

  return (
    <div className="space-y-4 sm:space-y-6 md:space-y-8">
      <div>
        <h1 className="text-xl sm:text-2xl md:text-3xl font-bold">My Tracker</h1>
        <p className="text-xs sm:text-sm text-muted-foreground mt-0.5 sm:mt-1">
          Track all your gambling and crypto losses in one place.
        </p>
      </div>

      <InputForm />

      <RealityCheck stats={stats} />

      <EntryList losses={losses || []} />
    </div>
  )
}
