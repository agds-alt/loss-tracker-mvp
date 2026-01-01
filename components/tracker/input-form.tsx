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

const lossSchema = z.object({
  type: z.enum(["judol", "crypto"]),
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
      const validated = lossSchema.parse({
        ...formData,
        amount: parseFloat(formData.amount),
      })

      const supabase = createClient()
      const {
        data: { user },
      } = await supabase.auth.getUser()

      if (!user) throw new Error("Not authenticated")

      const { error } = await supabase.from("losses").insert({
        user_id: user.id,
        ...validated,
      })

      if (error) throw error

      toast({
        title: "Loss Added!",
        description: "Entry berhasil ditambahkan ke tracker.",
      })

      // Reset form
      setFormData({
        type: "judol",
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
          description: "Gagal menambahkan loss. Coba lagi.",
        })
      }
    } finally {
      setLoading(false)
    }
  }

  return (
    <Card className="sticky top-6 z-10 shadow-lg">
      <CardHeader>
        <CardTitle>Add New Entry</CardTitle>
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
            variant={formData.type === "judol" ? "judol" : "crypto"}
          >
            {loading ? "Adding..." : "Add Entry"}
          </Button>
        </form>
      </CardContent>
    </Card>
  )
}
