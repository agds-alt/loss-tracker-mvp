"use client"

import { useState } from "react"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/card"
import { CleanDaysLeaderboard } from "./clean-days-leaderboard"
import { TurnaroundLeaderboard } from "./turnaround-leaderboard"
import { ImprovedLeaderboard } from "./improved-leaderboard"

export function LeaderboardTabs() {
  const [activeTab, setActiveTab] = useState("clean_days")

  return (
    <div className="w-full">
      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="grid w-full grid-cols-3 h-auto p-1">
          <TabsTrigger
            value="clean_days"
            className="text-xs sm:text-sm py-2 sm:py-2.5 data-[state=active]:bg-clean/20 data-[state=active]:text-clean"
          >
            <span className="hidden sm:inline">🔥 Clean Days</span>
            <span className="sm:hidden">🔥 Clean</span>
          </TabsTrigger>
          <TabsTrigger
            value="turnaround"
            className="text-xs sm:text-sm py-2 sm:py-2.5 data-[state=active]:bg-crypto/20 data-[state=active]:text-crypto"
          >
            <span className="hidden sm:inline">🚀 Turnaround</span>
            <span className="sm:hidden">🚀 Turn</span>
          </TabsTrigger>
          <TabsTrigger
            value="improved"
            className="text-xs sm:text-sm py-2 sm:py-2.5 data-[state=active]:bg-judol/20 data-[state=active]:text-judol"
          >
            <span className="hidden sm:inline">📈 Most Improved</span>
            <span className="sm:hidden">📈 Improve</span>
          </TabsTrigger>
        </TabsList>

        <div className="mt-4 sm:mt-6">
          <TabsContent value="clean_days" className="mt-0">
            <CleanDaysLeaderboard />
          </TabsContent>

          <TabsContent value="turnaround" className="mt-0">
            <TurnaroundLeaderboard />
          </TabsContent>

          <TabsContent value="improved" className="mt-0">
            <ImprovedLeaderboard />
          </TabsContent>
        </div>
      </Tabs>
    </div>
  )
}
