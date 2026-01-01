"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { format } from "date-fns"
import { z } from "zod"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
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
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { useToast } from "@/components/ui/use-toast"
import { createClient } from "@/lib/supabase/client"
import { formatCurrency, formatNumber, cn } from "@/lib/utils"
import { Database } from "@/types/database.types"
import { Edit, Trash2, ChevronLeft, ChevronRight, ArrowUp, ArrowDown } from "lucide-react"

type Loss = Database["public"]["Tables"]["losses"]["Row"]

interface EntryListProps {
  losses: Loss[]
}

const ITEMS_PER_PAGE = 20

const lossSchema = z.object({
  type: z.enum(["judol", "crypto"]),
  site_coin_name: z.string().min(1, "Site/Coin name harus diisi"),
  amount: z.number().positive("Amount harus lebih dari 0"),
  date: z.string().min(1, "Tanggal harus diisi"),
  notes: z.string().optional(),
  is_win: z.boolean(),
})

export function EntryList({ losses: initialLosses }: EntryListProps) {
  const router = useRouter()
  const { toast } = useToast()
  const [losses, setLosses] = useState(initialLosses)
  const [currentPage, setCurrentPage] = useState(1)
  const [filter, setFilter] = useState<"all" | "judol" | "crypto">("all")
  const [search, setSearch] = useState("")
  const [editModalOpen, setEditModalOpen] = useState(false)
  const [deleteModalOpen, setDeleteModalOpen] = useState(false)
  const [selectedLoss, setSelectedLoss] = useState<Loss | null>(null)
  const [loading, setLoading] = useState(false)
  const [editForm, setEditForm] = useState({
    type: "judol" as "judol" | "crypto",
    site_coin_name: "",
    amount: "",
    date: "",
    notes: "",
    is_win: false,
  })

  // Filter and search
  const filteredLosses = losses.filter((loss) => {
    const matchesFilter = filter === "all" || loss.type === filter
    const matchesSearch =
      search === "" ||
      loss.site_coin_name.toLowerCase().includes(search.toLowerCase())
    return matchesFilter && matchesSearch
  })

  // Pagination
  const totalPages = Math.ceil(filteredLosses.length / ITEMS_PER_PAGE)
  const paginatedLosses = filteredLosses.slice(
    (currentPage - 1) * ITEMS_PER_PAGE,
    currentPage * ITEMS_PER_PAGE
  )

  // Stats
  const totalEntries = filteredLosses.length
  const avgLoss = totalEntries > 0
    ? filteredLosses.reduce((sum, l) => sum + Number(l.amount), 0) / totalEntries
    : 0
  const biggestLoss = filteredLosses.reduce(
    (max, l) => (Number(l.amount) > Number(max.amount) ? l : max),
    filteredLosses[0] || { amount: 0, date: "", site_coin_name: "" }
  )

  const handleEdit = (loss: Loss) => {
    setSelectedLoss(loss)
    setEditForm({
      type: loss.type,
      site_coin_name: loss.site_coin_name,
      amount: loss.amount.toString(),
      date: loss.date,
      notes: loss.notes || "",
      is_win: loss.is_win,
    })
    setEditModalOpen(true)
  }

  const handleUpdateLoss = async () => {
    if (!selectedLoss) return
    setLoading(true)

    try {
      const validated = lossSchema.parse({
        ...editForm,
        amount: parseFloat(editForm.amount),
      })

      const supabase = createClient()
      const { error } = await supabase
        .from("losses")
        .update(validated)
        .eq("id", selectedLoss.id)

      if (error) throw error

      toast({
        title: "Updated!",
        description: "Entry berhasil diupdate.",
      })

      setEditModalOpen(false)
      router.refresh()
    } catch (error) {
      toast({
        variant: "destructive",
        title: "Error",
        description: "Gagal update entry.",
      })
    } finally {
      setLoading(false)
    }
  }

  const handleDelete = (loss: Loss) => {
    setSelectedLoss(loss)
    setDeleteModalOpen(true)
  }

  const confirmDelete = async () => {
    if (!selectedLoss) return
    setLoading(true)

    try {
      const supabase = createClient()
      const { error } = await supabase
        .from("losses")
        .delete()
        .eq("id", selectedLoss.id)

      if (error) throw error

      toast({
        title: "Deleted!",
        description: "Entry berhasil dihapus.",
      })

      setDeleteModalOpen(false)
      router.refresh()
    } catch (error) {
      toast({
        variant: "destructive",
        title: "Error",
        description: "Gagal hapus entry.",
      })
    } finally {
      setLoading(false)
    }
  }

  return (
    <>
      <Card>
        <CardHeader>
          <CardTitle>Entry History</CardTitle>
          <CardDescription>
            Semua catatan loss kamu dalam satu tempat
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Filters */}
          <div className="flex flex-col md:flex-row gap-4">
            <div className="flex-1">
              <Input
                placeholder="Search by site/coin name..."
                value={search}
                onChange={(e) => {
                  setSearch(e.target.value)
                  setCurrentPage(1)
                }}
              />
            </div>
            <div className="flex gap-2">
              <Button
                variant={filter === "all" ? "default" : "outline"}
                onClick={() => {
                  setFilter("all")
                  setCurrentPage(1)
                }}
              >
                All
              </Button>
              <Button
                variant={filter === "judol" ? "judol" : "outline"}
                onClick={() => {
                  setFilter("judol")
                  setCurrentPage(1)
                }}
              >
                Judol
              </Button>
              <Button
                variant={filter === "crypto" ? "crypto" : "outline"}
                onClick={() => {
                  setFilter("crypto")
                  setCurrentPage(1)
                }}
              >
                Crypto
              </Button>
            </div>
          </div>

          {/* Table */}
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b">
                  <th className="text-left py-3 px-2">Date</th>
                  <th className="text-left py-3 px-2">Type</th>
                  <th className="text-left py-3 px-2">Site/Coin</th>
                  <th className="text-center py-3 px-2">Deposit/WD</th>
                  <th className="text-right py-3 px-2">Amount</th>
                  <th className="text-left py-3 px-2">Notes</th>
                  <th className="text-right py-3 px-2">Action</th>
                </tr>
              </thead>
              <tbody>
                {paginatedLosses.length === 0 ? (
                  <tr>
                    <td colSpan={7} className="text-center py-8 text-muted-foreground">
                      Belum ada entry. Tambahkan entry pertama kamu!
                    </td>
                  </tr>
                ) : (
                  paginatedLosses.map((loss) => (
                    <tr
                      key={loss.id}
                      className={cn(
                        "border-b hover:bg-accent/50 transition-colors",
                        loss.type === "judol" ? "bg-judol/5" : "bg-crypto/5"
                      )}
                    >
                      <td className="py-3 px-2 text-sm">
                        {format(new Date(loss.date), "dd MMM yyyy")}
                      </td>
                      <td className="py-3 px-2">
                        <span
                          className={cn(
                            "text-xs font-medium px-2 py-1 rounded-full",
                            loss.type === "judol"
                              ? "bg-judol/20 text-judol"
                              : "bg-crypto/20 text-crypto"
                          )}
                        >
                          {loss.type === "judol" ? "Judol" : "Crypto"}
                        </span>
                      </td>
                      <td className="py-3 px-2 font-medium">{loss.site_coin_name}</td>
                      <td className="py-3 px-2 text-center">
                        {loss.is_win ? (
                          <div className="flex items-center justify-center gap-1">
                            <ArrowUp className="h-4 w-4 text-clean" />
                            <span className="text-xs font-medium px-2 py-0.5 rounded-full bg-clean/20 text-clean">
                              WD
                            </span>
                          </div>
                        ) : (
                          <div className="flex items-center justify-center gap-1">
                            <ArrowDown className="h-4 w-4 text-destructive" />
                            <span className="text-xs font-medium px-2 py-0.5 rounded-full bg-destructive/20 text-destructive">
                              Deposit
                            </span>
                          </div>
                        )}
                      </td>
                      <td className={cn(
                        "py-3 px-2 text-right font-semibold",
                        loss.is_win ? "text-clean" : "text-destructive"
                      )}>
                        {loss.is_win ? '+' : '-'}{formatCurrency(Number(loss.amount))}
                      </td>
                      <td className="py-3 px-2 text-sm text-muted-foreground max-w-xs truncate">
                        {loss.notes || "-"}
                      </td>
                      <td className="py-3 px-2">
                        <div className="flex justify-end gap-2">
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => handleEdit(loss)}
                          >
                            <Edit className="h-4 w-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => handleDelete(loss)}
                          >
                            <Trash2 className="h-4 w-4 text-destructive" />
                          </Button>
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="flex items-center justify-between">
              <p className="text-sm text-muted-foreground">
                Page {currentPage} of {totalPages}
              </p>
              <div className="flex gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                  disabled={currentPage === 1}
                >
                  <ChevronLeft className="h-4 w-4" />
                  Previous
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
                  disabled={currentPage === totalPages}
                >
                  Next
                  <ChevronRight className="h-4 w-4" />
                </Button>
              </div>
            </div>
          )}

          {/* Summary Stats */}
          <div className="grid md:grid-cols-3 gap-4 pt-4 border-t">
            <div>
              <p className="text-sm text-muted-foreground">Total Entries</p>
              <p className="text-2xl font-bold">{formatNumber(totalEntries)}</p>
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Average Loss</p>
              <p className="text-2xl font-bold">{formatCurrency(avgLoss)}</p>
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Biggest Loss</p>
              <p className="text-2xl font-bold">
                {formatCurrency(Number(biggestLoss?.amount || 0))}
              </p>
              {biggestLoss && (
                <p className="text-xs text-muted-foreground mt-1">
                  {biggestLoss.site_coin_name} - {format(new Date(biggestLoss.date), "dd MMM yyyy")}
                </p>
              )}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Edit Modal */}
      <Dialog open={editModalOpen} onOpenChange={setEditModalOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Edit Entry</DialogTitle>
            <DialogDescription>Update informasi loss kamu</DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label>Type</Label>
              <RadioGroup
                value={editForm.type}
                onValueChange={(value: "judol" | "crypto") =>
                  setEditForm({ ...editForm, type: value })
                }
                className="flex gap-4"
              >
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="judol" id="edit-judol" />
                  <Label htmlFor="edit-judol" className="cursor-pointer font-normal">
                    Judol
                  </Label>
                </div>
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="crypto" id="edit-crypto" />
                  <Label htmlFor="edit-crypto" className="cursor-pointer font-normal">
                    Crypto
                  </Label>
                </div>
              </RadioGroup>
            </div>

            {/* Win/Loss Selection */}
            <div className="space-y-2">
              <Label>Transaction Type</Label>
              <div className="grid grid-cols-2 gap-3">
                <button
                  type="button"
                  onClick={() => setEditForm({ ...editForm, is_win: false })}
                  className={`p-4 rounded-lg border-2 transition-all ${
                    !editForm.is_win
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
                  onClick={() => setEditForm({ ...editForm, is_win: true })}
                  className={`p-4 rounded-lg border-2 transition-all ${
                    editForm.is_win
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
              <Label htmlFor="edit-site">Site/Coin Name</Label>
              <Input
                id="edit-site"
                value={editForm.site_coin_name}
                onChange={(e) =>
                  setEditForm({ ...editForm, site_coin_name: e.target.value })
                }
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="edit-amount">Amount (Rp)</Label>
              <Input
                id="edit-amount"
                type="number"
                value={editForm.amount}
                onChange={(e) => setEditForm({ ...editForm, amount: e.target.value })}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="edit-date">Date</Label>
              <Input
                id="edit-date"
                type="date"
                value={editForm.date}
                onChange={(e) => setEditForm({ ...editForm, date: e.target.value })}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="edit-notes">Notes</Label>
              <Textarea
                id="edit-notes"
                value={editForm.notes}
                onChange={(e) => setEditForm({ ...editForm, notes: e.target.value })}
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setEditModalOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleUpdateLoss} disabled={loading}>
              {loading ? "Updating..." : "Update"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation Modal */}
      <Dialog open={deleteModalOpen} onOpenChange={setDeleteModalOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Delete Entry?</DialogTitle>
            <DialogDescription>
              Yakin mau hapus entry ini? Action ini tidak bisa di-undo.
            </DialogDescription>
          </DialogHeader>
          {selectedLoss && (
            <div className="py-4">
              <div className="p-4 rounded-lg bg-muted">
                <p className="font-medium">{selectedLoss.site_coin_name}</p>
                <p className="text-sm text-muted-foreground">
                  {formatCurrency(Number(selectedLoss.amount))} -{" "}
                  {format(new Date(selectedLoss.date), "dd MMM yyyy")}
                </p>
              </div>
            </div>
          )}
          <DialogFooter>
            <Button variant="outline" onClick={() => setDeleteModalOpen(false)}>
              Cancel
            </Button>
            <Button variant="destructive" onClick={confirmDelete} disabled={loading}>
              {loading ? "Deleting..." : "Delete"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  )
}
