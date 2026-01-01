"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { z } from "zod"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { useToast } from "@/components/ui/use-toast"
import { createClient } from "@/lib/supabase/client"
import { PlusCircle, FileText, ArrowUp, ArrowDown } from "lucide-react"

const lossSchema = z.object({
  site_coin_name: z.string().min(1, "Site/Coin name harus diisi"),
  amount: z.number().positive("Amount harus lebih dari 0"),
  date: z.string().min(1, "Tanggal harus diisi"),
  notes: z.string().optional(),
  is_win: z.boolean(),
})

export function QuickActions() {
  const router = useRouter()
  const { toast } = useToast()
  const [judolModalOpen, setJudolModalOpen] = useState(false)
  const [cryptoModalOpen, setCryptoModalOpen] = useState(false)
  const [loading, setLoading] = useState(false)

  const [judolForm, setJudolForm] = useState({
    site_coin_name: "",
    amount: "",
    date: new Date().toISOString().split("T")[0],
    notes: "",
    is_win: false,
  })

  const [cryptoForm, setCryptoForm] = useState({
    site_coin_name: "",
    amount: "",
    date: new Date().toISOString().split("T")[0],
    notes: "",
    is_win: false,
  })

  const handleAddLoss = async (type: "judol" | "crypto") => {
    setLoading(true)
    const formData = type === "judol" ? judolForm : cryptoForm

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
        type,
        ...validated,
      })

      if (error) throw error

      toast({
        title: formData.is_win ? "Win Added! 🎉" : "Loss Tracked",
        description: `${formData.is_win ? "Withdrawal" : "Deposit"} berhasil ditambahkan ke tracker.`,
      })

      // Reset form and close modal
      if (type === "judol") {
        setJudolForm({
          site_coin_name: "",
          amount: "",
          date: new Date().toISOString().split("T")[0],
          notes: "",
          is_win: false,
        })
        setJudolModalOpen(false)
      } else {
        setCryptoForm({
          site_coin_name: "",
          amount: "",
          date: new Date().toISOString().split("T")[0],
          notes: "",
          is_win: false,
        })
        setCryptoModalOpen(false)
      }

      router.refresh()
    } catch (error) {
      if (error instanceof z.ZodError) {
        toast({
          variant: "destructive",
          title: "Validation Error",
          description: error.errors[0].message,
        })
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
    <>
      <Card>
        <CardHeader>
          <CardTitle>Quick Actions</CardTitle>
        </CardHeader>
        <CardContent className="flex flex-wrap gap-4">
          <Button variant="judol" onClick={() => setJudolModalOpen(true)}>
            <PlusCircle className="mr-2 h-4 w-4" />
            Add Judol Loss
          </Button>
          <Button variant="crypto" onClick={() => setCryptoModalOpen(true)}>
            <PlusCircle className="mr-2 h-4 w-4" />
            Add Crypto Loss
          </Button>
          <Button variant="outline" onClick={() => router.push("/tracker")}>
            <FileText className="mr-2 h-4 w-4" />
            View Full Report
          </Button>
        </CardContent>
      </Card>

      {/* Judol Modal */}
      <Dialog open={judolModalOpen} onOpenChange={setJudolModalOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Add Judol Loss</DialogTitle>
            <DialogDescription>
              Catat loss judol kamu untuk tracking yang lebih baik.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            {/* Win/Loss Selection */}
            <div className="space-y-2">
              <Label>Transaction Type</Label>
              <div className="grid grid-cols-2 gap-3">
                <button
                  type="button"
                  onClick={() => setJudolForm({ ...judolForm, is_win: false })}
                  className={`p-4 rounded-lg border-2 transition-all ${
                    !judolForm.is_win
                      ? "border-destructive bg-destructive/10"
                      : "border-border hover:border-destructive/50"
                  }`}
                >
                  <div className="flex items-center justify-center gap-2 mb-2">
                    <ArrowDown className="h-5 w-5 text-destructive" />
                    <span className="font-semibold">LOSS</span>
                  </div>
                  <p className="text-xs text-muted-foreground">Deposit / Modal</p>
                </button>
                <button
                  type="button"
                  onClick={() => setJudolForm({ ...judolForm, is_win: true })}
                  className={`p-4 rounded-lg border-2 transition-all ${
                    judolForm.is_win
                      ? "border-clean bg-clean/10"
                      : "border-border hover:border-clean/50"
                  }`}
                >
                  <div className="flex items-center justify-center gap-2 mb-2">
                    <ArrowUp className="h-5 w-5 text-clean" />
                    <span className="font-semibold">WIN</span>
                  </div>
                  <p className="text-xs text-muted-foreground">Withdraw / Profit</p>
                </button>
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="judol-site">Site Name</Label>
              <Input
                id="judol-site"
                placeholder="e.g., Slot88, Pragmatic Play"
                value={judolForm.site_coin_name}
                onChange={(e) =>
                  setJudolForm({ ...judolForm, site_coin_name: e.target.value })
                }
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="judol-amount">Amount (Rp)</Label>
              <Input
                id="judol-amount"
                type="number"
                placeholder="500000"
                value={judolForm.amount}
                onChange={(e) =>
                  setJudolForm({ ...judolForm, amount: e.target.value })
                }
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="judol-date">Date</Label>
              <Input
                id="judol-date"
                type="date"
                value={judolForm.date}
                onChange={(e) =>
                  setJudolForm({ ...judolForm, date: e.target.value })
                }
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="judol-notes">Notes (Optional)</Label>
              <Textarea
                id="judol-notes"
                placeholder="Catatan tambahan..."
                value={judolForm.notes}
                onChange={(e) =>
                  setJudolForm({ ...judolForm, notes: e.target.value })
                }
              />
            </div>
          </div>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setJudolModalOpen(false)}
              disabled={loading}
            >
              Cancel
            </Button>
            <Button
              variant={judolForm.is_win ? "clean" : "judol"}
              onClick={() => handleAddLoss("judol")}
              disabled={loading}
            >
              {loading ? "Adding..." : (judolForm.is_win ? "Add Win 📈" : "Add Loss 📉")}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Crypto Modal */}
      <Dialog open={cryptoModalOpen} onOpenChange={setCryptoModalOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Add Crypto Loss</DialogTitle>
            <DialogDescription>
              Catat loss crypto kamu untuk tracking yang lebih baik.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            {/* Win/Loss Selection */}
            <div className="space-y-2">
              <Label>Transaction Type</Label>
              <div className="grid grid-cols-2 gap-3">
                <button
                  type="button"
                  onClick={() => setCryptoForm({ ...cryptoForm, is_win: false })}
                  className={`p-4 rounded-lg border-2 transition-all ${
                    !cryptoForm.is_win
                      ? "border-destructive bg-destructive/10"
                      : "border-border hover:border-destructive/50"
                  }`}
                >
                  <div className="flex items-center justify-center gap-2 mb-2">
                    <ArrowDown className="h-5 w-5 text-destructive" />
                    <span className="font-semibold">LOSS</span>
                  </div>
                  <p className="text-xs text-muted-foreground">Deposit / Modal</p>
                </button>
                <button
                  type="button"
                  onClick={() => setCryptoForm({ ...cryptoForm, is_win: true })}
                  className={`p-4 rounded-lg border-2 transition-all ${
                    cryptoForm.is_win
                      ? "border-clean bg-clean/10"
                      : "border-border hover:border-clean/50"
                  }`}
                >
                  <div className="flex items-center justify-center gap-2 mb-2">
                    <ArrowUp className="h-5 w-5 text-clean" />
                    <span className="font-semibold">WIN</span>
                  </div>
                  <p className="text-xs text-muted-foreground">Withdraw / Profit</p>
                </button>
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="crypto-coin">Coin Name</Label>
              <Input
                id="crypto-coin"
                placeholder="e.g., BTC, ETH, SOL"
                value={cryptoForm.site_coin_name}
                onChange={(e) =>
                  setCryptoForm({ ...cryptoForm, site_coin_name: e.target.value })
                }
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="crypto-amount">Amount (Rp)</Label>
              <Input
                id="crypto-amount"
                type="number"
                placeholder="1000000"
                value={cryptoForm.amount}
                onChange={(e) =>
                  setCryptoForm({ ...cryptoForm, amount: e.target.value })
                }
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="crypto-date">Date</Label>
              <Input
                id="crypto-date"
                type="date"
                value={cryptoForm.date}
                onChange={(e) =>
                  setCryptoForm({ ...cryptoForm, date: e.target.value })
                }
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="crypto-notes">Notes (Optional)</Label>
              <Textarea
                id="crypto-notes"
                placeholder="Catatan tambahan..."
                value={cryptoForm.notes}
                onChange={(e) =>
                  setCryptoForm({ ...cryptoForm, notes: e.target.value })
                }
              />
            </div>
          </div>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setCryptoModalOpen(false)}
              disabled={loading}
            >
              Cancel
            </Button>
            <Button
              variant={cryptoForm.is_win ? "clean" : "crypto"}
              onClick={() => handleAddLoss("crypto")}
              disabled={loading}
            >
              {loading ? "Adding..." : (cryptoForm.is_win ? "Add Win 📈" : "Add Loss 📉")}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  )
}
