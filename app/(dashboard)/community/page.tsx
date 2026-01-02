import { createClient } from "@/lib/supabase/server"
import { redirect } from "next/navigation"
import { PostFeed } from "@/components/community/post-feed"
import { CommunitySidebar } from "@/components/community/community-sidebar"
import { CreatePostButton } from "@/components/community/create-post-button"

export const metadata = {
  title: "Komunitas | Loss Tracker",
  description: "Berbagi cerita dan dukungan dengan komunitas",
}

export default async function CommunityPage() {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    redirect("/login")
  }

  // Get user profile - use the correct table name
  const { data: userProfile } = await supabase
    .from("users")
    .select("username")
    .eq("id", user.id)
    .single()

  const username = (userProfile as { username: string } | null)?.username || "User"

  return (
    <div className="container mx-auto px-4 py-6 sm:py-8 max-w-7xl">
      {/* Header */}
      <div className="flex items-center justify-between mb-6 sm:mb-8">
        <div>
          <h1 className="text-2xl sm:text-3xl md:text-4xl font-bold">Komunitas</h1>
          <p className="text-sm sm:text-base text-muted-foreground mt-1">
            Berbagi cerita, dukungan, dan inspirasi
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Main Feed */}
        <div className="lg:col-span-8 space-y-4">
          {/* Create Post Button (Mobile) */}
          <div className="lg:hidden">
            <CreatePostButton username={username} />
          </div>

          {/* Post Feed */}
          <PostFeed userId={user.id} username={username} />
        </div>

        {/* Sidebar (Desktop) */}
        <div className="hidden lg:block lg:col-span-4">
          <div className="sticky top-20 space-y-4">
            <CreatePostButton username={username} />
            <CommunitySidebar />
          </div>
        </div>
      </div>
    </div>
  )
}
