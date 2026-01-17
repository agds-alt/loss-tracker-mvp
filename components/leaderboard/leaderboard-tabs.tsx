"use client"

import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { CleanDaysLeaderboard } from "./clean-days-leaderboard"
import { TurnaroundLeaderboard } from "./turnaround-leaderboard"
import { ImprovedLeaderboard } from "./improved-leaderboard"
import { WithdrawalLeaderboard } from "./withdrawal-leaderboard"

export function LeaderboardTabs() {
  return (
    <div className="w-full">
      <Tabs defaultValue="withdrawals" className="w-full">
        <TabsList className="grid w-full grid-cols-4 h-auto p-1">
          <TabsTrigger
            value="withdrawals"
            className="text-xs sm:text-sm py-2 sm:py-2.5 data-[state=active]:bg-green-500/20 data-[state=active]:text-green-600"
          >
            <span className="hidden sm:inline">💰 Withdrawals</span>
            <span className="sm:hidden">💰 WD</span>
          </TabsTrigger>
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
            className="text-xs sm:text-sm py-2 sm:py-2.5 data-[state=active]:bg-casino/20 data-[state=active]:text-casino"
          >
            <span className="hidden sm:inline">📈 Improved</span>
            <span className="sm:hidden">📈 +</span>
          </TabsTrigger>
        </TabsList>

        <div className="mt-4 sm:mt-6">
          <TabsContent value="withdrawals" className="mt-0">
            <WithdrawalLeaderboard />
          </TabsContent>

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
