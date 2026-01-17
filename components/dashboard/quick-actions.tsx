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
import { insertLoss } from "@/lib/db/helpers"
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
  const [casinoModalOpen, setCasinoModalOpen] = useState(false)
  const [cryptoModalOpen, setCryptoModalOpen] = useState(false)
  const [loading, setLoading] = useState(false)

  const [casinoForm, setCasinoForm] = useState({
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
    const formData = type === "judol" ? casinoForm : cryptoForm

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

      const { error } = await insertLoss(supabase, {
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
        setCasinoForm({
          site_coin_name: "",
          amount: "",
          date: new Date().toISOString().split("T")[0],
          notes: "",
          is_win: false,
        })
        setCasinoModalOpen(false)
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
        <CardHeader className="p-3 sm:p-4 md:p-6">
          <CardTitle className="text-base sm:text-lg md:text-xl">Aksi Cepat</CardTitle>
        </CardHeader>
        <CardContent className="p-3 sm:p-4 md:p-6 pt-0 sm:pt-0 md:pt-0">
          <div className="grid grid-cols-2 sm:flex sm:flex-wrap gap-2 sm:gap-3 md:gap-4">
            <Button
              variant="casino"
              onClick={() => setCasinoModalOpen(true)}
              className="text-xs sm:text-sm h-9 sm:h-10"
            >
              <PlusCircle className="mr-1 sm:mr-2 h-3 w-3 sm:h-4 sm:w-4" />
              <span className="hidden sm:inline">Tambah Casino</span>
              <span className="sm:hidden">Casino</span>
            </Button>
            <Button
              variant="crypto"
              onClick={() => setCryptoModalOpen(true)}
              className="text-xs sm:text-sm h-9 sm:h-10"
            >
              <PlusCircle className="mr-1 sm:mr-2 h-3 w-3 sm:h-4 sm:w-4" />
              <span className="hidden sm:inline">Tambah Crypto</span>
              <span className="sm:hidden">Crypto</span>
            </Button>
            <Button
              variant="outline"
              onClick={() => router.push("/tracker")}
              className="col-span-2 sm:col-span-1 text-xs sm:text-sm h-9 sm:h-10"
            >
              <FileText className="mr-1 sm:mr-2 h-3 w-3 sm:h-4 sm:w-4" />
              <span className="hidden sm:inline">Lihat Laporan Lengkap</span>
              <span className="sm:hidden">Laporan</span>
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Casino Modal */}
      <Dialog open={casinoModalOpen} onOpenChange={setCasinoModalOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Tambah Loss Casino</DialogTitle>
            <DialogDescription>
              Catat loss casino kamu untuk tracking yang lebih baik.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-3 sm:space-y-4 py-2 sm:py-4">
            {/* Win/Loss Selection */}
            <div className="space-y-1.5 sm:space-y-2">
              <Label className="text-xs sm:text-sm">Tipe Transaksi</Label>
              <div className="grid grid-cols-2 gap-2 sm:gap-3">
                <button
                  type="button"
                  onClick={() => setCasinoForm({ ...casinoForm, is_win: false })}
                  className={`p-2.5 sm:p-4 rounded-lg border-2 transition-all ${
                    !casinoForm.is_win
                      ? "border-destructive bg-destructive/10"
                      : "border-border hover:border-destructive/50"
                  }`}
                >
                  <div className="flex items-center justify-center gap-1.5 sm:gap-2 mb-1 sm:mb-2">
                    <ArrowDown className="h-4 w-4 sm:h-5 sm:w-5 text-destructive" />
                    <span className="font-semibold text-xs sm:text-sm">LOSS</span>
                  </div>
                  <p className="text-[10px] sm:text-xs text-muted-foreground">Deposit</p>
                </button>
                <button
                  type="button"
                  onClick={() => setCasinoForm({ ...casinoForm, is_win: true })}
                  className={`p-2.5 sm:p-4 rounded-lg border-2 transition-all ${
                    casinoForm.is_win
                      ? "border-clean bg-clean/10"
                      : "border-border hover:border-clean/50"
                  }`}
                >
                  <div className="flex items-center justify-center gap-1.5 sm:gap-2 mb-1 sm:mb-2">
                    <ArrowUp className="h-4 w-4 sm:h-5 sm:w-5 text-clean" />
                    <span className="font-semibold text-xs sm:text-sm">WIN</span>
                  </div>
                  <p className="text-[10px] sm:text-xs text-muted-foreground">Withdraw</p>
                </button>
              </div>
            </div>

            <div className="space-y-1.5 sm:space-y-2">
              <Label htmlFor="casino-site" className="text-xs sm:text-sm">Nama Situs</Label>
              <Input
                id="casino-site"
                placeholder="e.g., Slot88"
                value={casinoForm.site_coin_name}
                onChange={(e) =>
                  setCasinoForm({ ...casinoForm, site_coin_name: e.target.value })
                }
                className="h-9 sm:h-10 text-sm"
              />
            </div>
            <div className="space-y-1.5 sm:space-y-2">
              <Label htmlFor="casino-amount" className="text-xs sm:text-sm">Jumlah (Rp)</Label>
              <Input
                id="casino-amount"
                type="number"
                placeholder="500000"
                value={casinoForm.amount}
                onChange={(e) =>
                  setCasinoForm({ ...casinoForm, amount: e.target.value })
                }
                className="h-9 sm:h-10 text-sm"
              />
            </div>
            <div className="space-y-1.5 sm:space-y-2">
              <Label htmlFor="casino-date" className="text-xs sm:text-sm">Tanggal</Label>
              <Input
                id="casino-date"
                type="date"
                value={casinoForm.date}
                onChange={(e) =>
                  setCasinoForm({ ...casinoForm, date: e.target.value })
                }
                className="h-9 sm:h-10 text-sm"
              />
            </div>
            <div className="space-y-1.5 sm:space-y-2">
              <Label htmlFor="casino-notes" className="text-xs sm:text-sm">Catatan (Opsional)</Label>
              <Textarea
                id="casino-notes"
                placeholder="Catatan tambahan..."
                value={casinoForm.notes}
                onChange={(e) =>
                  setCasinoForm({ ...casinoForm, notes: e.target.value })
                }
                rows={2}
                className="text-sm resize-none"
              />
            </div>
          </div>
          <DialogFooter className="gap-2">
            <Button
              variant="outline"
              onClick={() => setCasinoModalOpen(false)}
              disabled={loading}
              className="h-9 sm:h-10 text-xs sm:text-sm"
            >
              Batal
            </Button>
            <Button
              variant={casinoForm.is_win ? "clean" : "casino"}
              onClick={() => handleAddLoss("judol")}
              disabled={loading}
              className="h-9 sm:h-10 text-xs sm:text-sm"
            >
              {loading ? "Menambahkan..." : (casinoForm.is_win ? "Tambah Win 📈" : "Tambah Loss 📉")}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Crypto Modal */}
      <Dialog open={cryptoModalOpen} onOpenChange={setCryptoModalOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Tambah Loss Crypto</DialogTitle>
            <DialogDescription>
              Catat loss crypto kamu untuk tracking yang lebih baik.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-3 sm:space-y-4 py-2 sm:py-4">
            {/* Win/Loss Selection */}
            <div className="space-y-1.5 sm:space-y-2">
              <Label className="text-xs sm:text-sm">Tipe Transaksi</Label>
              <div className="grid grid-cols-2 gap-2 sm:gap-3">
                <button
                  type="button"
                  onClick={() => setCryptoForm({ ...cryptoForm, is_win: false })}
                  className={`p-2.5 sm:p-4 rounded-lg border-2 transition-all ${
                    !cryptoForm.is_win
                      ? "border-destructive bg-destructive/10"
                      : "border-border hover:border-destructive/50"
                  }`}
                >
                  <div className="flex items-center justify-center gap-1.5 sm:gap-2 mb-1 sm:mb-2">
                    <ArrowDown className="h-4 w-4 sm:h-5 sm:w-5 text-destructive" />
                    <span className="font-semibold text-xs sm:text-sm">LOSS</span>
                  </div>
                  <p className="text-[10px] sm:text-xs text-muted-foreground">Deposit</p>
                </button>
                <button
                  type="button"
                  onClick={() => setCryptoForm({ ...cryptoForm, is_win: true })}
                  className={`p-2.5 sm:p-4 rounded-lg border-2 transition-all ${
                    cryptoForm.is_win
                      ? "border-clean bg-clean/10"
                      : "border-border hover:border-clean/50"
                  }`}
                >
                  <div className="flex items-center justify-center gap-1.5 sm:gap-2 mb-1 sm:mb-2">
                    <ArrowUp className="h-4 w-4 sm:h-5 sm:w-5 text-clean" />
                    <span className="font-semibold text-xs sm:text-sm">WIN</span>
                  </div>
                  <p className="text-[10px] sm:text-xs text-muted-foreground">Withdraw</p>
                </button>
              </div>
            </div>

            <div className="space-y-1.5 sm:space-y-2">
              <Label htmlFor="crypto-coin" className="text-xs sm:text-sm">Nama Coin</Label>
              <Input
                id="crypto-coin"
                placeholder="e.g., BTC, ETH"
                value={cryptoForm.site_coin_name}
                onChange={(e) =>
                  setCryptoForm({ ...cryptoForm, site_coin_name: e.target.value })
                }
                className="h-9 sm:h-10 text-sm"
              />
            </div>
            <div className="space-y-1.5 sm:space-y-2">
              <Label htmlFor="crypto-amount" className="text-xs sm:text-sm">Jumlah (Rp)</Label>
              <Input
                id="crypto-amount"
                type="number"
                placeholder="1000000"
                value={cryptoForm.amount}
                onChange={(e) =>
                  setCryptoForm({ ...cryptoForm, amount: e.target.value })
                }
                className="h-9 sm:h-10 text-sm"
              />
            </div>
            <div className="space-y-1.5 sm:space-y-2">
              <Label htmlFor="crypto-date" className="text-xs sm:text-sm">Tanggal</Label>
              <Input
                id="crypto-date"
                type="date"
                value={cryptoForm.date}
                onChange={(e) =>
                  setCryptoForm({ ...cryptoForm, date: e.target.value })
                }
                className="h-9 sm:h-10 text-sm"
              />
            </div>
            <div className="space-y-1.5 sm:space-y-2">
              <Label htmlFor="crypto-notes" className="text-xs sm:text-sm">Catatan (Opsional)</Label>
              <Textarea
                id="crypto-notes"
                placeholder="Catatan tambahan..."
                value={cryptoForm.notes}
                onChange={(e) =>
                  setCryptoForm({ ...cryptoForm, notes: e.target.value })
                }
                rows={2}
                className="text-sm resize-none"
              />
            </div>
          </div>
          <DialogFooter className="gap-2">
            <Button
              variant="outline"
              onClick={() => setCryptoModalOpen(false)}
              disabled={loading}
              className="h-9 sm:h-10 text-xs sm:text-sm"
            >
              Batal
            </Button>
            <Button
              variant={cryptoForm.is_win ? "clean" : "crypto"}
              onClick={() => handleAddLoss("crypto")}
              disabled={loading}
              className="h-9 sm:h-10 text-xs sm:text-sm"
            >
              {loading ? "Menambahkan..." : (cryptoForm.is_win ? "Tambah Win 📈" : "Tambah Loss 📉")}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  )
}
