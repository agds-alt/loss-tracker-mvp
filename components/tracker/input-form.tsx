"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { z } from "zod"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { useToast } from "@/components/ui/use-toast"
import { createClient } from "@/lib/supabase/client"
import { insertLoss } from "@/lib/db/helpers"
import { saveLossOffline } from "@/lib/db/offline-storage"
import { getBackgroundSyncService } from "@/lib/sync/background-sync"
import { useOnlineStatus } from "@/hooks/use-online-status"
import { ArrowDown, ArrowUp, WifiOff } from "lucide-react"
import { cn, formatCurrency } from "@/lib/utils"
import { Database } from "@/types/database.types"

type Loss = Database["public"]["Tables"]["losses"]["Row"]

const lossSchema = z.object({
  type: z.enum(["judol", "crypto"]),
  site_coin_name: z.string().min(1, "Site/Coin name harus diisi"),
  amount: z.number().positive("Amount harus lebih dari 0"),
  date: z.string().min(1, "Tanggal harus diisi"),
  notes: z.string().optional(),
  is_win: z.boolean(),
})

interface InputFormProps {
  losses: Loss[]
}

export function InputForm({ losses }: InputFormProps) {
  const router = useRouter()
  const { toast } = useToast()
  const { isOnline } = useOnlineStatus()
  const [loading, setLoading] = useState(false)
  const [formData, setFormData] = useState({
    type: "judol" as "judol" | "crypto",
    is_win: false,
    site_coin_name: "",
    amount: "",
    date: new Date().toISOString().split("T")[0],
    notes: "",
  })
  const [errors, setErrors] = useState<Record<string, string>>({})

  // Calculate totals
  const totalDeposits = losses
    .filter((l) => !l.is_win)
    .reduce((sum, l) => sum + Number(l.amount), 0)

  const totalWithdrawals = losses
    .filter((l) => l.is_win)
    .reduce((sum, l) => sum + Number(l.amount), 0)

  const netPnL = totalWithdrawals - totalDeposits

  // Auto-sync when coming back online
  useEffect(() => {
    if (isOnline) {
      const syncService = getBackgroundSyncService()
      syncService.syncNow()
    }
  }, [isOnline])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setErrors({})

    try {
      const validated = lossSchema.parse({
        ...formData,
        amount: parseFloat(formData.amount),
      })

      const supabase = createClient()
      const {
        data: { user },
      } = await supabase.auth.getUser()

      if (!user) throw new Error("Not authenticated")

      // If offline, save to IndexedDB
      if (!isOnline) {
        await saveLossOffline({
          id: "", // Will be generated
          user_id: user.id,
          type: validated.type,
          site_coin_name: validated.site_coin_name,
          amount: validated.amount,
          date: validated.date,
          notes: validated.notes || null,
          is_win: validated.is_win,
          created_at: new Date().toISOString(),
        })

        toast({
          title: "Saved Offline!",
          description: "Entry disimpan offline. Akan di-sync saat online.",
        })
      } else {
        // If online, save directly to Supabase
        const { error } = await insertLoss(supabase, {
          user_id: user.id,
          ...validated,
        })

        if (error) throw error

        toast({
          title: validated.is_win ? "Win Added!" : "Loss Added!",
          description: "Entry berhasil ditambahkan ke tracker.",
        })
      }

      // Reset form
      setFormData({
        type: "judol",
        is_win: false,
        site_coin_name: "",
        amount: "",
        date: new Date().toISOString().split("T")[0],
        notes: "",
      })

      router.refresh()
    } catch (error) {
      if (error instanceof z.ZodError) {
        const fieldErrors: Record<string, string> = {}
        error.errors.forEach((err) => {
          if (err.path[0]) {
            fieldErrors[err.path[0].toString()] = err.message
          }
        })
        setErrors(fieldErrors)
      } else {
        toast({
          variant: "destructive",
          title: "Error",
          description: "Gagal menambahkan entry. Coba lagi.",
        })
      }
    } finally {
      setLoading(false)
    }
  }

  return (
    <Card className="shadow-md">
      <CardHeader className="p-3 sm:p-4 md:p-6">
        <CardTitle className="flex items-center justify-between text-base sm:text-lg md:text-xl">
          Tambah Entry Baru
          {!isOnline && (
            <span className="text-[10px] sm:text-xs font-normal text-muted-foreground flex items-center gap-1">
              <WifiOff className="h-2.5 w-2.5 sm:h-3 sm:w-3" /> Offline
            </span>
          )}
        </CardTitle>
      </CardHeader>
      <CardContent className="p-3 sm:p-4 md:p-6 pt-0 sm:pt-0 md:pt-0">
        {/* Running Totals Display */}
        <div className="grid grid-cols-3 gap-2 sm:gap-3 mb-4 sm:mb-6 p-3 sm:p-4 bg-muted/50 rounded-lg border">
          <div className="text-center">
            <p className="text-[10px] sm:text-xs text-muted-foreground mb-1">Total Deposit</p>
            <p className="text-sm sm:text-base md:text-lg font-bold text-destructive">
              {formatCurrency(totalDeposits)}
            </p>
          </div>
          <div className="text-center">
            <p className="text-[10px] sm:text-xs text-muted-foreground mb-1">Total WD</p>
            <p className="text-sm sm:text-base md:text-lg font-bold text-clean">
              {formatCurrency(totalWithdrawals)}
            </p>
          </div>
          <div className="text-center">
            <p className="text-[10px] sm:text-xs text-muted-foreground mb-1">Net P&L</p>
            <p className={cn(
              "text-sm sm:text-base md:text-lg font-bold",
              netPnL >= 0 ? "text-clean" : "text-destructive"
            )}>
              {netPnL >= 0 ? "+" : ""}{formatCurrency(netPnL)}
            </p>
          </div>
        </div>
        <form onSubmit={handleSubmit} className="space-y-3 sm:space-y-4">
          <div className="space-y-1.5 sm:space-y-2">
            <Label className="text-xs sm:text-sm">Tipe</Label>
            <RadioGroup
              value={formData.type}
              onValueChange={(value: "judol" | "crypto") =>
                setFormData({ ...formData, type: value })
              }
              className="flex gap-3 sm:gap-4"
            >
              <div className="flex items-center space-x-1.5 sm:space-x-2">
                <RadioGroupItem value="judol" id="judol" />
                <Label htmlFor="judol" className="cursor-pointer font-normal text-xs sm:text-sm">
                  Judol
                </Label>
              </div>
              <div className="flex items-center space-x-1.5 sm:space-x-2">
                <RadioGroupItem value="crypto" id="crypto" />
                <Label htmlFor="crypto" className="cursor-pointer font-normal text-xs sm:text-sm">
                  Crypto
                </Label>
              </div>
            </RadioGroup>
          </div>

          <div className="space-y-1.5 sm:space-y-2">
            <Label className="text-xs sm:text-sm">WIN / LOSS</Label>
            <div className="grid grid-cols-2 gap-2 sm:gap-3">
              <button
                type="button"
                onClick={() => setFormData({ ...formData, is_win: false })}
                className={cn(
                  "p-2.5 sm:p-4 rounded-lg border-2 transition-all",
                  !formData.is_win
                    ? "border-destructive bg-destructive/10"
                    : "border-border hover:border-destructive/50"
                )}
              >
                <div className="flex items-center justify-center gap-1.5 sm:gap-2 mb-1 sm:mb-2">
                  <ArrowDown className="h-4 w-4 sm:h-5 sm:w-5 text-destructive" />
                  <span className="font-semibold text-xs sm:text-sm">LOSS</span>
                </div>
                <p className="text-[10px] sm:text-xs text-muted-foreground">Deposit</p>
              </button>
              <button
                type="button"
                onClick={() => setFormData({ ...formData, is_win: true })}
                className={cn(
                  "p-2.5 sm:p-4 rounded-lg border-2 transition-all",
                  formData.is_win
                    ? "border-clean bg-clean/10"
                    : "border-border hover:border-clean/50"
                )}
              >
                <div className="flex items-center justify-center gap-1.5 sm:gap-2 mb-1 sm:mb-2">
                  <ArrowUp className="h-4 w-4 sm:h-5 sm:w-5 text-clean" />
                  <span className="font-semibold text-xs sm:text-sm">WIN</span>
                </div>
                <p className="text-[10px] sm:text-xs text-muted-foreground">Withdraw</p>
              </button>
            </div>
          </div>

          <div className="grid sm:grid-cols-2 gap-2.5 sm:gap-3 md:gap-4">
            <div className="space-y-1.5 sm:space-y-2">
              <Label htmlFor="site_coin_name" className="text-xs sm:text-sm">
                {formData.type === "judol" ? "Nama Situs" : "Nama Coin"}
              </Label>
              <Input
                id="site_coin_name"
                placeholder={
                  formData.type === "judol"
                    ? "e.g., Slot88"
                    : "e.g., BTC"
                }
                value={formData.site_coin_name}
                onChange={(e) =>
                  setFormData({ ...formData, site_coin_name: e.target.value })
                }
                disabled={loading}
                className="h-9 sm:h-10 text-sm"
              />
              {errors.site_coin_name && (
                <p className="text-xs sm:text-sm text-destructive">{errors.site_coin_name}</p>
              )}
            </div>

            <div className="space-y-1.5 sm:space-y-2">
              <Label htmlFor="amount" className="text-xs sm:text-sm">Jumlah (Rp)</Label>
              <Input
                id="amount"
                type="number"
                placeholder="500000"
                value={formData.amount}
                onChange={(e) =>
                  setFormData({ ...formData, amount: e.target.value })
                }
                disabled={loading}
                className="h-9 sm:h-10 text-sm"
              />
              {errors.amount && (
                <p className="text-xs sm:text-sm text-destructive">{errors.amount}</p>
              )}
            </div>
          </div>

          <div className="space-y-1.5 sm:space-y-2">
            <Label htmlFor="date" className="text-xs sm:text-sm">Tanggal</Label>
            <Input
              id="date"
              type="date"
              value={formData.date}
              max={new Date().toISOString().split("T")[0]}
              onChange={(e) => setFormData({ ...formData, date: e.target.value })}
              disabled={loading}
              className="h-9 sm:h-10 text-sm"
            />
            {errors.date && (
              <p className="text-xs sm:text-sm text-destructive">{errors.date}</p>
            )}
          </div>

          <div className="space-y-1.5 sm:space-y-2">
            <Label htmlFor="notes" className="text-xs sm:text-sm">Catatan (Opsional)</Label>
            <Textarea
              id="notes"
              placeholder="Catatan tambahan..."
              value={formData.notes}
              onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
              disabled={loading}
              rows={2}
              className="text-sm resize-none"
            />
          </div>

          <Button
            type="submit"
            className="w-full h-9 sm:h-10 text-xs sm:text-sm"
            disabled={loading}
            variant={formData.is_win ? "clean" : (formData.type === "judol" ? "judol" : "crypto")}
          >
            {loading
              ? (isOnline ? "Menambahkan..." : "Menyimpan Offline...")
              : (formData.is_win ? "Tambah Win 📈" : "Tambah Loss 📉")
            }
          </Button>
        </form>
      </CardContent>
    </Card>
  )
}
