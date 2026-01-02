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
import { cn } from "@/lib/utils"

const lossSchema = z.object({
  type: z.enum(["judol", "crypto"]),
  site_coin_name: z.string().min(1, "Site/Coin name harus diisi"),
  amount: z.number().positive("Amount harus lebih dari 0"),
  date: z.string().min(1, "Tanggal harus diisi"),
  notes: z.string().optional(),
  is_win: z.boolean(),
})

export function InputForm() {
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
    <Card className="sticky top-6 z-10 shadow-lg">
      <CardHeader>
        <CardTitle className="flex items-center justify-between">
          Add New Entry
          {!isOnline && (
            <span className="text-xs font-normal text-muted-foreground flex items-center gap-1">
              <WifiOff className="h-3 w-3" /> Offline Mode
            </span>
          )}
        </CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label>Type</Label>
            <RadioGroup
              value={formData.type}
              onValueChange={(value: "judol" | "crypto") =>
                setFormData({ ...formData, type: value })
              }
              className="flex gap-4"
            >
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="judol" id="judol" />
                <Label htmlFor="judol" className="cursor-pointer font-normal">
                  Judol
                </Label>
              </div>
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="crypto" id="crypto" />
                <Label htmlFor="crypto" className="cursor-pointer font-normal">
                  Crypto
                </Label>
              </div>
            </RadioGroup>
          </div>

          <div className="space-y-2">
            <Label>WIN / LOSS</Label>
            <div className="grid grid-cols-2 gap-3">
              <button
                type="button"
                onClick={() => setFormData({ ...formData, is_win: false })}
                className={cn(
                  "p-4 rounded-lg border-2 transition-all",
                  !formData.is_win
                    ? "border-destructive bg-destructive/10"
                    : "border-border hover:border-destructive/50"
                )}
              >
                <div className="flex items-center justify-center gap-2 mb-2">
                  <ArrowDown className="h-5 w-5 text-destructive" />
                  <span className="font-semibold">LOSS</span>
                </div>
                <p className="text-xs text-muted-foreground">Deposit / Modal</p>
              </button>
              <button
                type="button"
                onClick={() => setFormData({ ...formData, is_win: true })}
                className={cn(
                  "p-4 rounded-lg border-2 transition-all",
                  formData.is_win
                    ? "border-clean bg-clean/10"
                    : "border-border hover:border-clean/50"
                )}
              >
                <div className="flex items-center justify-center gap-2 mb-2">
                  <ArrowUp className="h-5 w-5 text-clean" />
                  <span className="font-semibold">WIN</span>
                </div>
                <p className="text-xs text-muted-foreground">Withdraw / Profit</p>
              </button>
            </div>
          </div>

          <div className="grid md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="site_coin_name">
                {formData.type === "judol" ? "Site Name" : "Coin Name"}
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
              />
              {errors.site_coin_name && (
                <p className="text-sm text-destructive">{errors.site_coin_name}</p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="amount">Amount (Rp)</Label>
              <Input
                id="amount"
                type="number"
                placeholder="500000"
                value={formData.amount}
                onChange={(e) =>
                  setFormData({ ...formData, amount: e.target.value })
                }
                disabled={loading}
              />
              {errors.amount && (
                <p className="text-sm text-destructive">{errors.amount}</p>
              )}
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="date">Date</Label>
            <Input
              id="date"
              type="date"
              value={formData.date}
              max={new Date().toISOString().split("T")[0]}
              onChange={(e) => setFormData({ ...formData, date: e.target.value })}
              disabled={loading}
            />
            {errors.date && (
              <p className="text-sm text-destructive">{errors.date}</p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="notes">Notes (Optional)</Label>
            <Textarea
              id="notes"
              placeholder="Catatan tambahan..."
              value={formData.notes}
              onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
              disabled={loading}
              rows={3}
            />
          </div>

          <Button
            type="submit"
            className="w-full"
            disabled={loading}
            variant={formData.is_win ? "clean" : (formData.type === "judol" ? "judol" : "crypto")}
          >
            {loading
              ? (isOnline ? "Adding..." : "Saving Offline...")
              : (formData.is_win ? "Add Win 📈" : "Add Loss 📉")
            }
          </Button>
        </form>
      </CardContent>
    </Card>
  )
}
