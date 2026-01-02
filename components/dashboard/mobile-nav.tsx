"use client"

import { useState } from "react"
import Link from "next/link"
import { usePathname, useRouter } from "next/navigation"
import { Menu, Home, TrendingDown, Trophy, Users, Settings, LogOut } from "lucide-react"
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { Sheet, SheetContent, SheetTrigger, SheetHeader, SheetTitle } from "@/components/ui/sheet"
import { createClient } from "@/lib/supabase/client"
import { useToast } from "@/components/ui/use-toast"

interface User {
  id: string
  email: string
  username: string
  created_at: string
  avatar_url: string | null
}

interface MobileNavProps {
  user: User
}

const navigation = [
  { name: "Dashboard", href: "/dashboard", icon: Home },
  { name: "My Tracker", href: "/tracker", icon: TrendingDown },
  { name: "Leaderboard", href: "/leaderboard", icon: Trophy, disabled: true },
  { name: "Community", href: "/community", icon: Users, disabled: true },
  { name: "Settings", href: "/settings", icon: Settings },
]

export function MobileNav({ user }: MobileNavProps) {
  const [open, setOpen] = useState(false)
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
    setOpen(false)
    router.push("/login")
    router.refresh()
  }

  const memberSince = new Date(user.created_at || new Date()).toLocaleDateString("id-ID", {
    month: "short",
    year: "numeric",
  })

  return (
    <header className="md:hidden sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="flex h-14 items-center justify-between px-4">
        <Sheet open={open} onOpenChange={setOpen}>
          <SheetTrigger asChild>
            <Button variant="ghost" size="icon" className="md:hidden">
              <Menu className="h-5 w-5" />
              <span className="sr-only">Toggle menu</span>
            </Button>
          </SheetTrigger>
          <SheetContent side="left" className="w-[280px] sm:w-[320px] p-0">
            <div className="flex flex-col h-full">
              {/* Header */}
              <SheetHeader className="p-4 border-b">
                <SheetTitle className="text-left">
                  <h2 className="text-xl font-bold text-primary">Loss Tracker</h2>
                  <p className="text-xs text-muted-foreground mt-0.5">Financial Freedom Journey</p>
                </SheetTitle>
              </SheetHeader>

              {/* User Info */}
              <div className="px-4 py-3 border-b">
                <div className="flex items-center space-x-3">
                  <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0">
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

              {/* Navigation */}
              <nav className="flex-1 px-3 py-3 space-y-1 overflow-y-auto">
                {navigation.map((item) => {
                  const Icon = item.icon
                  const isActive = pathname === item.href
                  const isDisabled = item.disabled

                  return (
                    <Link
                      key={item.name}
                      href={isDisabled ? "#" : item.href}
                      className={cn(
                        "flex items-center gap-3 px-3 py-2.5 text-sm font-medium rounded-md transition-colors",
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
                        } else {
                          setOpen(false)
                        }
                      }}
                    >
                      <Icon className="h-5 w-5" />
                      {item.name}
                    </Link>
                  )
                })}
              </nav>

              {/* Logout */}
              <div className="p-3 border-t">
                <Button
                  variant="ghost"
                  className="w-full justify-start gap-3 text-muted-foreground hover:text-destructive hover:bg-destructive/10"
                  onClick={handleLogout}
                >
                  <LogOut className="h-5 w-5" />
                  Logout
                </Button>
              </div>
            </div>
          </SheetContent>
        </Sheet>

        <h1 className="text-lg font-bold text-primary">Loss Tracker</h1>
      </div>
    </header>
  )
}
