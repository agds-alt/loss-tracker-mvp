"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { TrendingUp, Trophy, Users, Heart } from "lucide-react"
import Link from "next/link"

const trendingHashtags = [
  { tag: "clean30days", count: 145 },
  { tag: "recoveryjourney", count: 89 },
  { tag: "milestone", count: 67 },
  { tag: "needhelp", count: 54 },
  { tag: "inspiration", count: 43 },
]

const topMembers = [
  { username: "progress_champ", badge: "🏆", stats: "127 hari clean" },
  { username: "comeback_king", badge: "🚀", stats: "Turnaround +33jt" },
  { username: "motivator_daily", badge: "💪", stats: "342 support diberikan" },
]

const communityStats = {
  totalMembers: 1247,
  activeToday: 89,
  totalSupport: 3451,
}

export function CommunitySidebar() {
  return (
    <div className="space-y-4">
      {/* Community Stats */}
      <Card>
        <CardHeader className="p-4">
          <CardTitle className="text-base flex items-center gap-2">
            <Users className="h-4 w-4" />
            Statistik Komunitas
          </CardTitle>
        </CardHeader>
        <CardContent className="p-4 pt-0 space-y-3">
          <div className="flex items-center justify-between text-sm">
            <span className="text-muted-foreground">Total Member</span>
            <span className="font-semibold">{communityStats.totalMembers.toLocaleString()}</span>
          </div>
          <div className="flex items-center justify-between text-sm">
            <span className="text-muted-foreground">Aktif Hari Ini</span>
            <span className="font-semibold text-green-600">{communityStats.activeToday}</span>
          </div>
          <div className="flex items-center justify-between text-sm">
            <span className="text-muted-foreground">Total Support</span>
            <span className="font-semibold text-orange-600">
              {communityStats.totalSupport.toLocaleString()}
            </span>
          </div>
        </CardContent>
      </Card>

      {/* Trending Hashtags */}
      <Card>
        <CardHeader className="p-4">
          <CardTitle className="text-base flex items-center gap-2">
            <TrendingUp className="h-4 w-4" />
            Trending Hashtags
          </CardTitle>
          <CardDescription className="text-xs">Topik populer hari ini</CardDescription>
        </CardHeader>
        <CardContent className="p-4 pt-0 space-y-2">
          {trendingHashtags.map((item, index) => (
            <div
              key={item.tag}
              className="flex items-center justify-between p-2 rounded-md hover:bg-accent transition-colors cursor-pointer"
            >
              <div className="flex items-center gap-2">
                <span className="text-xs font-bold text-muted-foreground w-5">#{index + 1}</span>
                <span className="text-sm font-medium">#{item.tag}</span>
              </div>
              <span className="text-xs text-muted-foreground">{item.count} post</span>
            </div>
          ))}
        </CardContent>
      </Card>

      {/* Top Members */}
      <Card>
        <CardHeader className="p-4">
          <CardTitle className="text-base flex items-center gap-2">
            <Trophy className="h-4 w-4" />
            Member Teratas
          </CardTitle>
          <CardDescription className="text-xs">Kontributor aktif minggu ini</CardDescription>
        </CardHeader>
        <CardContent className="p-4 pt-0 space-y-3">
          {topMembers.map((member, index) => (
            <div
              key={member.username}
              className="flex items-center gap-3 p-2 rounded-md hover:bg-accent transition-colors cursor-pointer"
            >
              <div className="flex items-center justify-center w-6 h-6 rounded-full bg-primary/10 text-xs font-bold">
                {index + 1}
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-1.5">
                  <p className="text-sm font-medium truncate">{member.username}</p>
                  <span>{member.badge}</span>
                </div>
                <p className="text-xs text-muted-foreground truncate">{member.stats}</p>
              </div>
            </div>
          ))}
          <Link href="/leaderboard">
            <button className="w-full text-xs text-center py-2 text-primary hover:underline">
              Lihat Leaderboard Lengkap →
            </button>
          </Link>
        </CardContent>
      </Card>

      {/* Community Guidelines */}
      <Card className="border-primary/20 bg-primary/5">
        <CardHeader className="p-4">
          <CardTitle className="text-base flex items-center gap-2">
            <Heart className="h-4 w-4 text-primary" />
            Pedoman Komunitas
          </CardTitle>
        </CardHeader>
        <CardContent className="p-4 pt-0">
          <ul className="space-y-2 text-xs text-muted-foreground">
            <li className="flex items-start gap-2">
              <span className="text-primary">✓</span>
              <span>Saling support dan menghormati</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-primary">✓</span>
              <span>Jaga privasi diri dan orang lain</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-primary">✓</span>
              <span>No spam, iklan, atau konten negatif</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-primary">✓</span>
              <span>Laporkan konten yang tidak pantas</span>
            </li>
          </ul>
        </CardContent>
      </Card>
    </div>
  )
}
