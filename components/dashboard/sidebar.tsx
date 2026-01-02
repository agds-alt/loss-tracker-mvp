"use client"

import Link from "next/link"
import { usePathname, useRouter } from "next/navigation"
import { Home, TrendingDown, Trophy, Users, Settings, LogOut } from "lucide-react"
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { createClient } from "@/lib/supabase/client"
import { useToast } from "@/components/ui/use-toast"

interface User {
  id: string
  email: string
  username: string
  created_at: string
  avatar_url: string | null
}

interface SidebarProps {
  user: User
}

const navigation = [
  { name: "Dashboard", href: "/dashboard", icon: Home },
  { name: "My Tracker", href: "/tracker", icon: TrendingDown },
  { name: "Leaderboard", href: "/leaderboard", icon: Trophy },
  { name: "Community", href: "/community", icon: Users, disabled: true },
  { name: "Pengaturan", href: "/settings", icon: Settings },
]

export function Sidebar({ user }: SidebarProps) {
  const pathname = usePathname()
  const router = useRouter()
  const { toast } = useToast()

  const handleLogout = async () => {
    const supabase = createClient()
    await supabase.auth.signOut()
    toast({
      title: "Logged out",
      description: "Sampai jumpa lagi!",
    })
    router.push("/login")
    router.refresh()
  }

  const memberSince = new Date(user.created_at || new Date()).toLocaleDateString("id-ID", {
    month: "short",
    year: "numeric",
  })

  return (
    <aside className="hidden md:flex md:flex-col w-64 border-r bg-card">
      <div className="p-4">
        <h1 className="text-lg font-bold text-primary">Loss Tracker</h1>
        <p className="text-xs text-muted-foreground mt-0.5">Financial Freedom Journey</p>
      </div>

      <div className="px-3 py-3 border-y">
        <div className="flex items-center space-x-2.5">
          <div className="h-9 w-9 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0">
            <span className="text-base font-semibold text-primary">
              {user.username?.[0]?.toUpperCase() || "U"}
            </span>
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-medium truncate">{user.username}</p>
            <p className="text-xs text-muted-foreground">Member since {memberSince}</p>
          </div>
        </div>
      </div>

      <nav className="flex-1 px-2.5 py-3 space-y-0.5">
        {navigation.map((item) => {
          const Icon = item.icon
          const isActive = pathname === item.href
          const isDisabled = item.disabled

          return (
            <Link
              key={item.name}
              href={isDisabled ? "#" : item.href}
              className={cn(
                "flex items-center gap-2.5 px-3 py-2 text-sm font-medium rounded-md transition-colors",
                isActive
                  ? "bg-primary text-primary-foreground"
                  : isDisabled
                  ? "text-muted-foreground cursor-not-allowed opacity-50"
                  : "text-muted-foreground hover:bg-accent hover:text-accent-foreground"
              )}
              onClick={(e) => {
                if (isDisabled) {
                  e.preventDefault()
                  toast({
                    title: "Coming Soon",
                    description: "Fitur ini akan segera hadir!",
                  })
                }
              }}
            >
              <Icon className="h-4 w-4" />
              {item.name}
            </Link>
          )
        })}
      </nav>

      <div className="p-2.5 border-t">
        <Button
          variant="ghost"
          className="w-full justify-start gap-2.5 text-sm text-muted-foreground hover:text-destructive hover:bg-destructive/10"
          onClick={handleLogout}
        >
          <LogOut className="h-4 w-4" />
          Logout
        </Button>
      </div>
    </aside>
  )
}
