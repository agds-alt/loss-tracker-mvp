"use client"

import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import {
  Drawer,
  DrawerContent,
  DrawerHeader,
  DrawerTitle,
} from "@/components/ui/drawer"
import { formatCurrency, formatDate, cn } from "@/lib/utils"
import { Database } from "@/types/database.types"
import { ArrowDown, ArrowUp, ChevronRight, Calendar } from "lucide-react"
import { TYPE_COLOR_STYLES } from "@/lib/constants/ui"
import { EMPTY_STATE_MESSAGES } from "@/lib/constants/messages"
import { useMediaQuery } from "@/hooks/use-media-query"

type Loss = Database["public"]["Tables"]["losses"]["Row"]

interface RecentTransactionsProps {
  losses: Loss[]
}

function TransactionItem({ loss }: { loss: Loss }) {
  const isWin = loss.is_win
  const colorType = loss.type as keyof typeof TYPE_COLOR_STYLES
  const colors = isWin ? TYPE_COLOR_STYLES.clean : TYPE_COLOR_STYLES[colorType]

  return (
    <div
      className={cn(
        "flex items-start sm:items-center gap-2 sm:gap-3 p-2.5 sm:p-3 rounded-lg border transition-colors hover:bg-accent/50",
        colors.borderLight,
        colors.bgLight
      )}
    >
      <div
        className={cn(
          "h-8 w-8 sm:h-9 sm:w-9 rounded-full flex items-center justify-center flex-shrink-0",
          colors.bgMedium
        )}
      >
        {isWin ? (
          <ArrowUp className="h-4 w-4 sm:h-5 sm:w-5 text-clean" />
        ) : (
          <ArrowDown className={cn("h-4 w-4 sm:h-5 sm:w-5", colors.text)} />
        )}
      </div>
      <div className="flex-1 min-w-0">
        <div className="flex flex-col sm:flex-row sm:items-center gap-1 sm:gap-2">
          <p className="font-semibold text-sm sm:text-base truncate">{loss.site_coin_name}</p>
          <span
            className={cn(
              "text-[10px] sm:text-xs px-1.5 sm:px-2 py-0.5 rounded-full font-medium whitespace-nowrap w-fit",
              loss.type === "judol" ? "bg-judol/20 text-judol" : "bg-crypto/20 text-crypto"
            )}
          >
            {loss.type === "judol" ? "Judol" : "Crypto"}
          </span>
        </div>
        <div className="flex items-center gap-1.5 sm:gap-2 mt-0.5 sm:mt-1">
          <Calendar className="h-3 w-3 text-muted-foreground" />
          <p className="text-[10px] sm:text-xs text-muted-foreground whitespace-nowrap">
            {formatDate(loss.date)}
          </p>
          {loss.notes && (
            <>
              <span className="text-muted-foreground hidden sm:inline">•</span>
              <p className="text-[10px] sm:text-xs text-muted-foreground truncate hidden sm:block">
                {loss.notes}
              </p>
            </>
          )}
        </div>
      </div>
      <div className="text-right flex-shrink-0">
        <p className={cn(
          "font-bold text-sm sm:text-base whitespace-nowrap",
          isWin ? "text-clean" : "text-destructive"
        )}>
          {isWin ? '+' : '-'}{formatCurrency(Number(loss.amount))}
        </p>
      </div>
    </div>
  )
}

function TransactionList({ transactions, type }: { transactions: Loss[], type: "deposit" | "withdrawal" }) {
  if (transactions.length === 0) {
    return (
      <p className="text-center text-muted-foreground py-8 text-sm">
        {type === "deposit" ? "Belum ada deposit" : "Belum ada withdrawal"} 💰
      </p>
    )
  }

  return (
    <div className="space-y-2">
      {transactions.map((loss) => (
        <TransactionItem key={loss.id} loss={loss} />
      ))}
    </div>
  )
}

export function RecentTransactions({ losses }: RecentTransactionsProps) {
  const isDesktop = useMediaQuery("(min-width: 768px)")
  const [openDeposits, setOpenDeposits] = useState(false)
  const [openWithdrawals, setOpenWithdrawals] = useState(false)

  // Separate deposits and withdrawals
  const deposits = losses.filter(l => !l.is_win)
  const withdrawals = losses.filter(l => l.is_win)

  // Get top 5 for each
  const topDeposits = deposits.slice(0, 5)
  const topWithdrawals = withdrawals.slice(0, 5)

  const hasMoreDeposits = deposits.length > 5
  const hasMoreWithdrawals = withdrawals.length > 5

  if (losses.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Transaksi Terbaru</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-center text-muted-foreground py-8">
            {EMPTY_STATE_MESSAGES.NO_TRANSACTIONS}
          </p>
        </CardContent>
      </Card>
    )
  }

  const ModalContent = ({ transactions, type }: { transactions: Loss[], type: "deposit" | "withdrawal" }) => (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-xl font-bold">
            {type === "deposit" ? "Semua Deposit" : "Semua Withdrawal"}
          </h3>
          <p className="text-sm text-muted-foreground">
            {transactions.length} transaksi
          </p>
        </div>
      </div>
      <div className="max-h-[500px] overflow-y-auto pr-2">
        <TransactionList transactions={transactions} type={type} />
      </div>
    </div>
  )

  return (
    <>
      <Card>
        <CardHeader className="p-3 sm:p-4 md:p-6">
          <CardTitle className="text-base sm:text-lg md:text-xl">Transaksi Terbaru</CardTitle>
        </CardHeader>
        <CardContent className="p-3 sm:p-4 md:p-6 pt-0">
          <Tabs defaultValue="deposits" className="w-full">
            <TabsList className="grid w-full grid-cols-2 mb-4">
              <TabsTrigger value="deposits" className="gap-2">
                <ArrowDown className="h-4 w-4" />
                Deposit ({deposits.length})
              </TabsTrigger>
              <TabsTrigger value="withdrawals" className="gap-2">
                <ArrowUp className="h-4 w-4" />
                Withdrawal ({withdrawals.length})
              </TabsTrigger>
            </TabsList>

            <TabsContent value="deposits" className="space-y-3">
              <TransactionList transactions={topDeposits} type="deposit" />

              {hasMoreDeposits && (
                <Button
                  variant="outline"
                  className="w-full group"
                  onClick={() => setOpenDeposits(true)}
                >
                  <span>View All {deposits.length} Deposits</span>
                  <ChevronRight className="ml-2 h-4 w-4 transition-transform group-hover:translate-x-1" />
                </Button>
              )}
            </TabsContent>

            <TabsContent value="withdrawals" className="space-y-3">
              <TransactionList transactions={topWithdrawals} type="withdrawal" />

              {hasMoreWithdrawals && (
                <Button
                  variant="outline"
                  className="w-full group"
                  onClick={() => setOpenWithdrawals(true)}
                >
                  <span>View All {withdrawals.length} Withdrawals</span>
                  <ChevronRight className="ml-2 h-4 w-4 transition-transform group-hover:translate-x-1" />
                </Button>
              )}
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>

      {/* Deposits Modal/Drawer */}
      {isDesktop ? (
        <Dialog open={openDeposits} onOpenChange={setOpenDeposits}>
          <DialogContent className="max-w-2xl max-h-[85vh] overflow-hidden">
            <DialogHeader>
              <DialogTitle>All Deposits</DialogTitle>
            </DialogHeader>
            <ModalContent transactions={deposits} type="deposit" />
          </DialogContent>
        </Dialog>
      ) : (
        <Drawer open={openDeposits} onOpenChange={setOpenDeposits}>
          <DrawerContent className="max-h-[90vh]">
            <DrawerHeader>
              <DrawerTitle>All Deposits</DrawerTitle>
            </DrawerHeader>
            <div className="p-4 overflow-y-auto">
              <ModalContent transactions={deposits} type="deposit" />
            </div>
          </DrawerContent>
        </Drawer>
      )}

      {/* Withdrawals Modal/Drawer */}
      {isDesktop ? (
        <Dialog open={openWithdrawals} onOpenChange={setOpenWithdrawals}>
          <DialogContent className="max-w-2xl max-h-[85vh] overflow-hidden">
            <DialogHeader>
              <DialogTitle>All Withdrawals</DialogTitle>
            </DialogHeader>
            <ModalContent transactions={withdrawals} type="withdrawal" />
          </DialogContent>
        </Dialog>
      ) : (
        <Drawer open={openWithdrawals} onOpenChange={setOpenWithdrawals}>
          <DrawerContent className="max-h-[90vh]">
            <DrawerHeader>
              <DrawerTitle>All Withdrawals</DrawerTitle>
            </DrawerHeader>
            <div className="p-4 overflow-y-auto">
              <ModalContent transactions={withdrawals} type="withdrawal" />
            </div>
          </DrawerContent>
        </Drawer>
      )}
    </>
  )
}
