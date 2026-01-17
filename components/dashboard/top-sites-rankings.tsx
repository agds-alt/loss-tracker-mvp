"use client"

import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import {
  Drawer,
  DrawerContent,
  DrawerHeader,
  DrawerTitle,
  DrawerTrigger,
} from "@/components/ui/drawer"
import { formatCurrency } from "@/lib/utils"
import { Trophy, TrendingUp, TrendingDown, Medal, Award, ChevronRight } from "lucide-react"
import { SiteStats } from "@/lib/db/stats-queries"
import { useMediaQuery } from "@/hooks/use-media-query"
import { SiteDetailModal } from "./site-detail-modal"

interface TopSitesRankingsProps {
  topWithdrawals: SiteStats[]
  topDeposits: SiteStats[]
}

function RankingsList({ sites, type, onSiteClick }: {
  sites: SiteStats[]
  type: "withdrawal" | "deposit"
  onSiteClick: (site: SiteStats) => void
}) {
  const getRankIcon = (rank: number) => {
    switch (rank) {
      case 1:
        return <Trophy className="h-5 w-5 text-yellow-400" />
      case 2:
        return <Medal className="h-5 w-5 text-gray-400" />
      case 3:
        return <Award className="h-5 w-5 text-amber-600" />
      default:
        return <span className="text-sm font-bold text-muted-foreground">#{rank}</span>
    }
  }

  const getRankBadge = (rank: number) => {
    const colors = {
      1: "bg-gradient-to-r from-yellow-500/20 to-yellow-600/20 border-yellow-500/30",
      2: "bg-gradient-to-r from-gray-400/20 to-gray-500/20 border-gray-400/30",
      3: "bg-gradient-to-r from-amber-600/20 to-amber-700/20 border-amber-600/30",
    }
    return colors[rank as keyof typeof colors] || "bg-black/40 border-white/10"
  }

  const textColor = type === "withdrawal" ? "text-green-400" : "text-red-400"

  return (
    <div className="space-y-2">
      {sites.map((site, index) => (
        <div
          key={site.site_coin_name}
          onClick={() => onSiteClick(site)}
          className={`flex items-center gap-3 p-3 rounded-xl border transition-all hover:scale-[1.02] cursor-pointer ${getRankBadge(
            index + 1
          )}`}
        >
          <div className="flex items-center justify-center w-8">
            {getRankIcon(index + 1)}
          </div>
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2">
              <p className="font-semibold text-sm truncate">
                {site.site_coin_name}
              </p>
              <span
                className={`text-[10px] px-2 py-0.5 rounded-full ${
                  site.type === "casino"
                    ? "bg-red-500/20 text-red-400"
                    : "bg-yellow-500/20 text-yellow-400"
                }`}
              >
                {site.type}
              </span>
            </div>
            <p className="text-xs text-muted-foreground">
              {site.count}x {type === "withdrawal" ? "WD" : "deposit"} · Highest: {formatCurrency(site.highest_single)}
            </p>
          </div>
          <div className="text-right">
            <p className={`font-bold text-sm ${textColor}`}>
              {formatCurrency(site.total_amount)}
            </p>
          </div>
        </div>
      ))}
    </div>
  )
}

function RankingCard({
  title,
  subtitle,
  sites,
  type,
  icon: Icon,
  borderColor,
  bgGradient,
  iconBg
}: {
  title: string
  subtitle: string
  sites: SiteStats[]
  type: "withdrawal" | "deposit"
  icon: any
  borderColor: string
  bgGradient: string
  iconBg: string
}) {
  const isDesktop = useMediaQuery("(min-width: 768px)")
  const [open, setOpen] = useState(false)
  const [selectedSite, setSelectedSite] = useState<SiteStats | null>(null)

  const topThree = sites.slice(0, 3)
  const hasMore = sites.length > 3

  const handleSiteClick = (site: SiteStats) => {
    setOpen(false) // Close the rankings modal if open
    setSelectedSite(site)
  }

  const content = (
    <>
      <CardHeader className="pb-3 border-b border-opacity-10">
        <div className="flex items-center gap-3">
          <div className={`h-10 w-10 rounded-xl ${iconBg} flex items-center justify-center border border-opacity-20`}>
            <Icon className="h-5 w-5" />
          </div>
          <div className="flex-1">
            <CardTitle className="text-lg">{title}</CardTitle>
            <p className="text-xs text-muted-foreground">{subtitle}</p>
          </div>
          {sites.length > 0 && (
            <div className="text-right">
              <p className="text-xs text-muted-foreground">{sites.length} sites</p>
            </div>
          )}
        </div>
      </CardHeader>
      <CardContent className="pt-4">
        {sites.length === 0 ? (
          <p className="text-center text-muted-foreground py-8 text-sm">
            Belum ada {type === "withdrawal" ? "withdrawal 💸" : "deposit 💰"}
          </p>
        ) : (
          <>
            <RankingsList sites={topThree} type={type} onSiteClick={handleSiteClick} />

            {hasMore && (
              <div className="mt-3">
                {isDesktop ? (
                  <Dialog open={open} onOpenChange={setOpen}>
                    <DialogTrigger asChild>
                      <Button
                        variant="outline"
                        className="w-full group"
                      >
                        <span>View All {sites.length} Sites</span>
                        <ChevronRight className="ml-2 h-4 w-4 transition-transform group-hover:translate-x-1" />
                      </Button>
                    </DialogTrigger>
                    <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
                      <DialogHeader>
                        <DialogTitle className="flex items-center gap-3">
                          <Icon className="h-6 w-6" />
                          {title}
                        </DialogTitle>
                      </DialogHeader>
                      <div className="mt-4">
                        <RankingsList sites={sites} type={type} onSiteClick={handleSiteClick} />
                      </div>
                    </DialogContent>
                  </Dialog>
                ) : (
                  <Drawer open={open} onOpenChange={setOpen}>
                    <DrawerTrigger asChild>
                      <Button
                        variant="outline"
                        className="w-full group"
                      >
                        <span>View All {sites.length} Sites</span>
                        <ChevronRight className="ml-2 h-4 w-4 transition-transform group-hover:translate-x-1" />
                      </Button>
                    </DrawerTrigger>
                    <DrawerContent className="max-h-[85vh]">
                      <DrawerHeader>
                        <DrawerTitle className="flex items-center gap-3">
                          <Icon className="h-6 w-6" />
                          {title}
                        </DrawerTitle>
                      </DrawerHeader>
                      <div className="p-4 overflow-y-auto">
                        <RankingsList sites={sites} type={type} onSiteClick={handleSiteClick} />
                      </div>
                    </DrawerContent>
                  </Drawer>
                )}
              </div>
            )}
          </>
        )}
      </CardContent>
    </>
  )

  return (
    <>
      <Card className={`border ${borderColor} ${bgGradient}`}>
        {content}
      </Card>

      {/* Site Detail Modal */}
      {selectedSite && (
        <SiteDetailModal
          siteName={selectedSite.site_coin_name}
          type={selectedSite.type}
          isOpen={!!selectedSite}
          onClose={() => setSelectedSite(null)}
        />
      )}
    </>
  )
}

export function TopSitesRankings({ topWithdrawals, topDeposits }: TopSitesRankingsProps) {
  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
      <RankingCard
        title="Top Withdrawals"
        subtitle="Situs dengan WD terbesar"
        sites={topWithdrawals}
        type="withdrawal"
        icon={TrendingUp}
        borderColor="border-green-500/20"
        bgGradient="bg-gradient-to-br from-green-950/10 to-black"
        iconBg="bg-green-500/10 border-green-500/20 text-green-400"
      />

      <RankingCard
        title="Top Deposits"
        subtitle="Situs dengan deposit terbesar"
        sites={topDeposits}
        type="deposit"
        icon={TrendingDown}
        borderColor="border-red-500/20"
        bgGradient="bg-gradient-to-br from-red-950/10 to-black"
        iconBg="bg-red-500/10 border-red-500/20 text-red-400"
      />
    </div>
  )
}
