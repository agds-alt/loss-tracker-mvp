"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { z } from "zod"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { useToast } from "@/components/ui/use-toast"
import { createClient } from "@/lib/supabase/client"
import { Trophy } from "lucide-react"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"

const winSchema = z.object({
  site_name: z.string().min(1, "Site name harus diisi"),
  amount: z.number().positive("Amount harus lebih dari 0"),
  currency: z.string().default("USD"),
  usd_equivalent: z.number().positive("USD equivalent harus lebih dari 0"),
  withdrawal_date: z.string().min(1, "Tanggal harus diisi"),
  notes: z.string().optional(),
})

interface Site {
  id: string
  name: string
  category: string
  icon_emoji?: string
}

interface WinFormProps {
  sites: Site[]
}

export function WinForm({ sites }: WinFormProps) {
  const router = useRouter()
  const { toast } = useToast()
  const [loading, setLoading] = useState(false)
  const [formData, setFormData] = useState({
    site_name: "",
    amount: "",
    currency: "USD",
    withdrawal_date: new Date().toISOString().split("T")[0],
    notes: "",
  })
  const [errors, setErrors] = useState<Record<string, string>>({})

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setErrors({})

    try {
      const amount = parseFloat(formData.amount)
      const usd_equivalent = formData.currency === "USD" ? amount : amount // TODO: Add currency conversion

      const validated = winSchema.parse({
        ...formData,
        amount,
        usd_equivalent,
      })

      const supabase = createClient()
      const {
        data: { user },
      } = await supabase.auth.getUser()

      if (!user) throw new Error("Not authenticated")

      const winData = {
        user_id: user.id,
        site_name: validated.site_name,
        amount: validated.amount,
        currency: validated.currency,
        usd_equivalent: validated.usd_equivalent,
        withdrawal_date: validated.withdrawal_date,
        notes: validated.notes || null,
        status: "completed",
      } as unknown

      const { error } = await supabase.from("wins").insert(winData as never)

      if (error) throw error

      toast({
        title: "Win Added! 🎉",
        description: "Withdrawal berhasil ditambahkan ke tracker.",
      })

      // Reset form
      setFormData({
        site_name: "",
        amount: "",
        currency: "USD",
        withdrawal_date: new Date().toISOString().split("T")[0],
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
        console.error("Error adding win:", error)
        toast({
          variant: "destructive",
          title: "Error",
          description: "Gagal menambahkan withdrawal. Coba lagi.",
        })
      }
    } finally {
      setLoading(false)
    }
  }

  return (
    <Card className="sticky top-6 z-10 shadow-lg border-green-200 bg-green-50/30">
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-green-700">
          <Trophy className="h-5 w-5" />
          Add New Withdrawal
        </CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="site_name">Site Name</Label>
              <Select
                value={formData.site_name}
                onValueChange={(value) =>
                  setFormData({ ...formData, site_name: value })
                }
                disabled={loading}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Pilih situs..." />
                </SelectTrigger>
                <SelectContent>
                  {sites.map((site) => (
                    <SelectItem key={site.id} value={site.name}>
                      {site.icon_emoji} {site.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {errors.site_name && (
                <p className="text-sm text-destructive">{errors.site_name}</p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="amount">Amount (USD)</Label>
              <Input
                id="amount"
                type="number"
                step="0.01"
                placeholder="1000"
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
            <Label htmlFor="withdrawal_date">Withdrawal Date</Label>
            <Input
              id="withdrawal_date"
              type="date"
              value={formData.withdrawal_date}
              max={new Date().toISOString().split("T")[0]}
              onChange={(e) =>
                setFormData({ ...formData, withdrawal_date: e.target.value })
              }
              disabled={loading}
            />
            {errors.withdrawal_date && (
              <p className="text-sm text-destructive">
                {errors.withdrawal_date}
              </p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="notes">Notes (Optional)</Label>
            <Textarea
              id="notes"
              placeholder="Catatan tentang withdrawal ini..."
              value={formData.notes}
              onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
              disabled={loading}
              rows={3}
            />
          </div>

          <Button
            type="submit"
            className="w-full bg-green-600 hover:bg-green-700"
            disabled={loading}
          >
            {loading ? "Adding..." : "Add Withdrawal 💰"}
          </Button>
        </form>
      </CardContent>
    </Card>
  )
}
