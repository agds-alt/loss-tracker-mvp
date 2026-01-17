"use client"

import { useState } from "react"
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
import { ArrowUp, ArrowDown } from "lucide-react"

const transactionSchema = z.object({
  type: z.enum(["judol", "crypto"]),
  is_win: z.boolean(),
  site_coin_name: z.string().min(1, "Site/Coin name harus diisi"),
  amount: z.number().positive("Amount harus lebih dari 0"),
  date: z.string().min(1, "Tanggal harus diisi"),
  notes: z.string().optional(),
})

export function InputForm() {
  const router = useRouter()
  const { toast } = useToast()
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

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setErrors({})

    try {
      const validated = transactionSchema.parse({
        ...formData,
        amount: parseFloat(formData.amount),
      })

      const supabase = createClient()
      const {
        data: { user },
      } = await supabase.auth.getUser()

      if (!user) throw new Error("Not authenticated")

      const { error } = await insertLoss(supabase, {
        user_id: user.id,
        ...validated,
      })

      if (error) throw error

      toast({
        title: validated.is_win ? "Win Added! 🎉" : "Loss Tracked",
        description: `${validated.is_win ? "Withdrawal" : "Deposit"} berhasil ditambahkan ke tracker.`,
      })

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
    <Card className="sticky top-6 z-10 border border-white/10 bg-gradient-to-br from-zinc-950 to-black shadow-2xl">
      <CardHeader className="p-3 sm:p-4 md:p-6 border-b border-white/5">
        <CardTitle className="text-base sm:text-lg md:text-xl flex items-center gap-2">
          <div className="h-8 w-8 rounded-lg bg-white/5 flex items-center justify-center">
            <span className="text-lg">➕</span>
          </div>
          Add Transaction
        </CardTitle>
      </CardHeader>
      <CardContent className="p-3 sm:p-4 md:p-6 pt-0">
        <form onSubmit={handleSubmit} className="space-y-2.5 sm:space-y-3 md:space-y-4">
          {/* Type Selection */}
          <div className="space-y-1.5 sm:space-y-2">
            <Label className="text-xs sm:text-sm">Type</Label>
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
                  Casino
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

          {/* Win/Loss Selection - More compact */}
          <div className="space-y-1.5 sm:space-y-2">
            <Label className="text-xs sm:text-sm">Transaction Type</Label>
            <div className="grid grid-cols-2 gap-2 sm:gap-3">
              <button
                type="button"
                onClick={() => setFormData({ ...formData, is_win: false })}
                className={`p-3 sm:p-4 rounded-xl border-2 transition-all group ${
                  !formData.is_win
                    ? "border-red-500/50 bg-gradient-to-br from-red-950/30 to-black shadow-lg shadow-red-500/10"
                    : "border-white/10 bg-black/40 hover:border-red-500/30"
                }`}
              >
                <div className="flex items-center justify-center gap-2 mb-2">
                  <div className={`h-8 w-8 rounded-lg flex items-center justify-center ${
                    !formData.is_win ? "bg-red-500/20" : "bg-white/5"
                  }`}>
                    <ArrowDown className={`h-4 w-4 ${!formData.is_win ? "text-red-400" : "text-muted-foreground"}`} />
                  </div>
                  <span className={`font-bold text-sm ${!formData.is_win ? "text-red-400" : "text-muted-foreground"}`}>LOSS</span>
                </div>
                <p className="text-[10px] sm:text-xs text-muted-foreground/60">Deposit ke platform</p>
              </button>
              <button
                type="button"
                onClick={() => setFormData({ ...formData, is_win: true })}
                className={`p-3 sm:p-4 rounded-xl border-2 transition-all group ${
                  formData.is_win
                    ? "border-green-500/50 bg-gradient-to-br from-green-950/30 to-black shadow-lg shadow-green-500/10"
                    : "border-white/10 bg-black/40 hover:border-green-500/30"
                }`}
              >
                <div className="flex items-center justify-center gap-2 mb-2">
                  <div className={`h-8 w-8 rounded-lg flex items-center justify-center ${
                    formData.is_win ? "bg-green-500/20" : "bg-white/5"
                  }`}>
                    <ArrowUp className={`h-4 w-4 ${formData.is_win ? "text-green-400" : "text-muted-foreground"}`} />
                  </div>
                  <span className={`font-bold text-sm ${formData.is_win ? "text-green-400" : "text-muted-foreground"}`}>WIN</span>
                </div>
                <p className="text-[10px] sm:text-xs text-muted-foreground/60">Withdraw profit</p>
              </button>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 sm:gap-3 md:gap-4">
            <div className="space-y-1.5 sm:space-y-2">
              <Label htmlFor="site_coin_name" className="text-xs sm:text-sm">
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

            <div className="space-y-1.5 sm:space-y-2">
              <Label htmlFor="amount" className="text-xs sm:text-sm">
                Amount (Rp)
              </Label>
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
            variant={formData.is_win ? "clean" : (formData.type === "judol" ? "casino" : "crypto")}
          >
            {loading ? "Adding..." : (formData.is_win ? "Add Win 📈" : "Add Loss 📉")}
          </Button>
        </form>
      </CardContent>
    </Card>
  )
}
