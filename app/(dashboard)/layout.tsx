import { createClient } from "@/lib/supabase/server"
import { redirect } from "next/navigation"
import { Sidebar } from "@/components/dashboard/sidebar"
import { MobileNav } from "@/components/dashboard/mobile-nav"

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    redirect("/login")
  }

  // Get user profile
  const { data: profile } = await supabase
    .from("users")
    .select("*")
    .eq("id", user.id)
    .single()

  const userProfile = profile || {
    id: user.id,
    email: user.email || "",
    username: user.email?.split("@")[0] || "User",
    created_at: "",
    avatar_url: null
  }

  return (
    <div className="flex flex-col md:flex-row h-screen bg-background">
      {/* Mobile Header */}
      <MobileNav user={userProfile} />

      {/* Desktop Sidebar */}
      <Sidebar user={userProfile} />

      {/* Main Content */}
      <main className="flex-1 overflow-y-auto">
        <div className="container mx-auto p-4 sm:p-6 md:p-8 max-w-7xl">{children}</div>
      </main>
    </div>
  )
}
