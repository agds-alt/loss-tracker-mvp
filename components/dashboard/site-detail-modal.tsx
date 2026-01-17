"use client"

import { useState, useEffect } from "react"
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
import { Badge } from "@/components/ui/badge"
import { formatCurrency } from "@/lib/utils"
import { Calendar, TrendingUp, TrendingDown, DollarSign, BarChart3 } from "lucide-react"
import { useMediaQuery } from "@/hooks/use-media-query"
import { createClient } from "@/lib/supabase/client"
import { Database } from "@/types/database.types"

type Loss = Database["public"]["Tables"]["losses"]["Row"]

interface SiteDetailModalProps {
  siteName: string
  type: "casino" | "crypto"
  isOpen: boolean
  onClose: () => void
}

export function SiteDetailModal({ siteName, type, isOpen, onClose }: SiteDetailModalProps) {
  const isDesktop = useMediaQuery("(min-width: 768px)")
  const [transactions, setTransactions] = useState<Loss[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (isOpen && siteName) {
      fetchTransactions()
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isOpen, siteName])

  const fetchTransactions = async () => {
    setLoading(true)
    try {
      const supabase = createClient()
      const { data: { user } } = await supabase.auth.getUser()

      if (!user) return

      const { data, error } = await supabase
        .from("losses")
        .select("*")
        .eq("user_id", user.id)
        .ilike("site_coin_name", siteName)
        .order("date", { ascending: false })

      if (error) throw error
      setTransactions(data || [])
    } catch (error) {
      console.error("Error fetching transactions:", error)
    } finally {
      setLoading(false)
    }
  }

  // Calculate stats
  const deposits = transactions.filter(t => !t.is_win)
  const withdrawals = transactions.filter(t => t.is_win)

  const totalDeposits = deposits.reduce((sum, t) => sum + Number(t.amount), 0)
  const totalWithdrawals = withdrawals.reduce((sum, t) => sum + Number(t.amount), 0)
  const netPnL = totalWithdrawals - totalDeposits
  const isProfitable = netPnL >= 0

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("id-ID", {
      day: "numeric",
      month: "short",
      year: "numeric",
    })
  }

  const content = (
    <div className="space-y-4">
      {/* Header with Site Name and Type */}
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-2xl font-bold">{siteName}</h3>
          <Badge
            variant={type === "casino" ? "destructive" : "default"}
            className={type === "casino" ? "bg-red-500/20 text-red-400" : "bg-yellow-500/20 text-yellow-400"}
          >
            {type}
          </Badge>
        </div>
      </div>

      {/* Summary Stats */}
      {!loading && (
        <div className="grid grid-cols-2 gap-3">
          {/* Net PnL */}
          <div className={`p-4 rounded-xl border-2 ${
            isProfitable
              ? "bg-gradient-to-br from-green-950/30 to-black border-green-500/30"
              : "bg-gradient-to-br from-red-950/30 to-black border-red-500/30"
          }`}>
            <div className="flex items-center gap-2 mb-2">
              <BarChart3 className="h-4 w-4 text-muted-foreground" />
              <p className="text-xs text-muted-foreground">Net PnL</p>
            </div>
            <p className={`text-xl font-bold ${isProfitable ? "text-green-400" : "text-red-400"}`}>
              {isProfitable ? "+" : ""}{formatCurrency(netPnL)}
            </p>
          </div>

          {/* Total Transactions */}
          <div className="p-4 rounded-xl border-2 bg-gradient-to-br from-blue-950/30 to-black border-blue-500/30">
            <div className="flex items-center gap-2 mb-2">
              <DollarSign className="h-4 w-4 text-muted-foreground" />
              <p className="text-xs text-muted-foreground">Total Transaksi</p>
            </div>
            <p className="text-xl font-bold text-blue-400">{transactions.length}x</p>
          </div>

          {/* Total Deposits */}
          <div className="p-4 rounded-xl border-2 bg-gradient-to-br from-red-950/20 to-black border-red-500/20">
            <div className="flex items-center gap-2 mb-2">
              <TrendingDown className="h-4 w-4 text-red-400" />
              <p className="text-xs text-muted-foreground">Total Deposit</p>
            </div>
            <p className="text-lg font-bold text-red-400">{formatCurrency(totalDeposits)}</p>
            <p className="text-xs text-muted-foreground mt-1">{deposits.length}x deposit</p>
          </div>

          {/* Total Withdrawals */}
          <div className="p-4 rounded-xl border-2 bg-gradient-to-br from-green-950/20 to-black border-green-500/20">
            <div className="flex items-center gap-2 mb-2">
              <TrendingUp className="h-4 w-4 text-green-400" />
              <p className="text-xs text-muted-foreground">Total WD</p>
            </div>
            <p className="text-lg font-bold text-green-400">{formatCurrency(totalWithdrawals)}</p>
            <p className="text-xs text-muted-foreground mt-1">{withdrawals.length}x WD</p>
          </div>
        </div>
      )}

      {/* Transaction History */}
      <div>
        <h4 className="font-semibold mb-3 flex items-center gap-2">
          <Calendar className="h-4 w-4" />
          Riwayat Transaksi
        </h4>

        {loading ? (
          <div className="text-center py-8 text-muted-foreground">
            Loading...
          </div>
        ) : transactions.length === 0 ? (
          <div className="text-center py-8 text-muted-foreground">
            Tidak ada transaksi
          </div>
        ) : (
          <div className="space-y-2 max-h-[400px] overflow-y-auto pr-2">
            {transactions.map((transaction) => (
              <div
                key={transaction.id}
                className={`p-3 rounded-lg border ${
                  transaction.is_win
                    ? "bg-green-950/20 border-green-500/20"
                    : "bg-red-950/20 border-red-500/20"
                }`}
              >
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-2">
                    {transaction.is_win ? (
                      <TrendingUp className="h-4 w-4 text-green-400" />
                    ) : (
                      <TrendingDown className="h-4 w-4 text-red-400" />
                    )}
                    <span className="font-semibold text-sm">
                      {transaction.is_win ? "Withdrawal" : "Deposit"}
                    </span>
                  </div>
                  <span
                    className={`font-bold ${
                      transaction.is_win ? "text-green-400" : "text-red-400"
                    }`}
                  >
                    {transaction.is_win ? "+" : "-"}{formatCurrency(Number(transaction.amount))}
                  </span>
                </div>

                <div className="flex items-center gap-2 text-xs text-muted-foreground">
                  <Calendar className="h-3 w-3" />
                  {formatDate(transaction.date)}
                </div>

                {transaction.notes && (
                  <p className="text-xs text-muted-foreground mt-2 italic">
                    &ldquo;{transaction.notes}&rdquo;
                  </p>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )

  if (isDesktop) {
    return (
      <Dialog open={isOpen} onOpenChange={onClose}>
        <DialogContent className="max-w-2xl max-h-[85vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Detail Transaksi</DialogTitle>
          </DialogHeader>
          {content}
        </DialogContent>
      </Dialog>
    )
  }

  return (
    <Drawer open={isOpen} onOpenChange={onClose}>
      <DrawerContent className="max-h-[90vh]">
        <DrawerHeader>
          <DrawerTitle>Detail Transaksi</DrawerTitle>
        </DrawerHeader>
        <div className="p-4 overflow-y-auto">
          {content}
        </div>
      </DrawerContent>
    </Drawer>
  )
}
