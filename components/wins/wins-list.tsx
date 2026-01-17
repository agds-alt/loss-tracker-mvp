"use client"

import { useState, useEffect } from "react"
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
import { useToast } from "@/components/ui/use-toast"
import { createClient } from "@/lib/supabase/client"
import { formatCurrency, cn } from "@/lib/utils"
import { Edit, Trash2, ChevronLeft, ChevronRight, Trophy, TrendingUp } from "lucide-react"

interface Win {
  id: string
  site_name: string
  amount: number
  currency: string
  usd_equivalent: number
  withdrawal_date: string
  notes?: string
  status: string
  created_at: string
}

interface WinsListProps {
  userId: string
}

const ITEMS_PER_PAGE = 20

const winSchema = z.object({
  site_name: z.string().min(1, "Site name harus diisi"),
  amount: z.number().positive("Amount harus lebih dari 0"),
  withdrawal_date: z.string().min(1, "Tanggal harus diisi"),
  notes: z.string().optional(),
})

export function WinsList({ userId }: WinsListProps) {
  const router = useRouter()
  const { toast } = useToast()
  const [wins, setWins] = useState<Win[]>([])
  const [loading, setLoading] = useState(true)
  const [currentPage, setCurrentPage] = useState(1)
  const [search, setSearch] = useState("")
  const [editModalOpen, setEditModalOpen] = useState(false)
  const [deleteModalOpen, setDeleteModalOpen] = useState(false)
  const [selectedWin, setSelectedWin] = useState<Win | null>(null)
  const [actionLoading, setActionLoading] = useState(false)
  const [editForm, setEditForm] = useState({
    site_name: "",
    amount: "",
    withdrawal_date: "",
    notes: "",
  })

  // Fetch wins
  useEffect(() => {
    fetchWins()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [userId])

  const fetchWins = async () => {
    try {
      const supabase = createClient()
      const { data, error } = await supabase
        .from("wins")
        .select("*")
        .eq("user_id", userId)
        .order("withdrawal_date", { ascending: false })

      if (error) throw error
      const winsData = (data as unknown) as Win[]
      setWins(winsData || [])
    } catch (error) {
      console.error("Error fetching wins:", error)
      toast({
        variant: "destructive",
        title: "Error",
        description: "Gagal memuat data wins.",
      })
    } finally {
      setLoading(false)
    }
  }

  // Filter and search
  const filteredWins = wins.filter((win) => {
    const matchesSearch =
      search === "" ||
      win.site_name.toLowerCase().includes(search.toLowerCase())
    return matchesSearch
  })

  // Pagination
  const totalPages = Math.ceil(filteredWins.length / ITEMS_PER_PAGE)
  const paginatedWins = filteredWins.slice(
    (currentPage - 1) * ITEMS_PER_PAGE,
    currentPage * ITEMS_PER_PAGE
  )

  // Stats
  const totalWins = filteredWins.length
  const totalAmount = filteredWins.reduce((sum, w) => sum + Number(w.usd_equivalent), 0)
  const avgWin = totalWins > 0 ? totalAmount / totalWins : 0
  const biggestWin = filteredWins.reduce(
    (max, w) => (Number(w.usd_equivalent) > Number(max.usd_equivalent) ? w : max),
    filteredWins[0] || { usd_equivalent: 0, withdrawal_date: "", site_name: "" }
  )

  const handleEdit = (win: Win) => {
    setSelectedWin(win)
    setEditForm({
      site_name: win.site_name,
      amount: win.amount.toString(),
      withdrawal_date: win.withdrawal_date,
      notes: win.notes || "",
    })
    setEditModalOpen(true)
  }

  const handleDelete = (win: Win) => {
    setSelectedWin(win)
    setDeleteModalOpen(true)
  }

  const confirmEdit = async () => {
    if (!selectedWin) return
    setActionLoading(true)

    try {
      const validated = winSchema.parse({
        ...editForm,
        amount: parseFloat(editForm.amount),
      })

      const supabase = createClient()

      const updateData = {
        site_name: validated.site_name,
        amount: validated.amount,
        usd_equivalent: validated.amount, // Assuming USD for now
        withdrawal_date: validated.withdrawal_date,
        notes: validated.notes || null,
      } as unknown

      const { error } = await supabase
        .from("wins")
        .update(updateData as never)
        .eq("id", selectedWin.id)

      if (error) throw error

      toast({
        title: "Success",
        description: "Win berhasil diupdate.",
      })

      setEditModalOpen(false)
      fetchWins()
      router.refresh()
    } catch (error) {
      console.error("Error updating win:", error)
      toast({
        variant: "destructive",
        title: "Error",
        description: "Gagal mengupdate win.",
      })
    } finally {
      setActionLoading(false)
    }
  }

  const confirmDelete = async () => {
    if (!selectedWin) return
    setActionLoading(true)

    try {
      const supabase = createClient()
      const { error } = await supabase
        .from("wins")
        .delete()
        .eq("id", selectedWin.id)

      if (error) throw error

      toast({
        title: "Success",
        description: "Win berhasil dihapus.",
      })

      setDeleteModalOpen(false)
      fetchWins()
      router.refresh()
    } catch (error) {
      console.error("Error deleting win:", error)
      toast({
        variant: "destructive",
        title: "Error",
        description: "Gagal menghapus win.",
      })
    } finally {
      setActionLoading(false)
    }
  }

  if (loading) {
    return (
      <Card>
        <CardContent className="pt-6 text-center">
          <p className="text-muted-foreground">Loading withdrawals...</p>
        </CardContent>
      </Card>
    )
  }

  return (
    <>
      <Card>
        <CardHeader>
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div>
              <CardTitle className="flex items-center gap-2">
                <Trophy className="h-5 w-5 text-green-600" />
                Withdrawal History
              </CardTitle>
              <CardDescription>
                {totalWins} withdrawals • Total: {formatCurrency(totalAmount)}
              </CardDescription>
            </div>
            <Input
              placeholder="Search by site..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="max-w-xs"
            />
          </div>
        </CardHeader>
        <CardContent>
          {filteredWins.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              <Trophy className="h-12 w-12 mx-auto mb-2 opacity-50" />
              <p>Belum ada withdrawal.</p>
              <p className="text-sm">Tambahkan withdrawal pertama mu di atas!</p>
            </div>
          ) : (
            <>
              {/* Desktop Table */}
              <div className="hidden md:block overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b">
                      <th className="text-left p-3 font-medium">Date</th>
                      <th className="text-left p-3 font-medium">Site</th>
                      <th className="text-right p-3 font-medium">Amount</th>
                      <th className="text-left p-3 font-medium">Status</th>
                      <th className="text-right p-3 font-medium">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {paginatedWins.map((win) => (
                      <tr
                        key={win.id}
                        className="border-b hover:bg-green-50/30 transition-colors"
                      >
                        <td className="p-3 text-sm">
                          {format(new Date(win.withdrawal_date), "MMM dd, yyyy")}
                        </td>
                        <td className="p-3 font-medium">{win.site_name}</td>
                        <td className="p-3 text-right text-green-600 font-bold">
                          {formatCurrency(win.usd_equivalent)}
                        </td>
                        <td className="p-3">
                          <span className={cn(
                            "inline-flex items-center px-2 py-1 rounded-full text-xs font-medium",
                            win.status === "completed" && "bg-green-100 text-green-800",
                            win.status === "pending" && "bg-yellow-100 text-yellow-800",
                            win.status === "failed" && "bg-red-100 text-red-800"
                          )}>
                            {win.status}
                          </span>
                        </td>
                        <td className="p-3 text-right">
                          <div className="flex items-center justify-end gap-2">
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => handleEdit(win)}
                            >
                              <Edit className="h-4 w-4" />
                            </Button>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => handleDelete(win)}
                            >
                              <Trash2 className="h-4 w-4 text-destructive" />
                            </Button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {/* Mobile Cards */}
              <div className="md:hidden space-y-3">
                {paginatedWins.map((win) => (
                  <Card key={win.id} className="border-green-200 bg-green-50/20">
                    <CardContent className="p-4">
                      <div className="flex items-start justify-between mb-2">
                        <div>
                          <p className="font-bold text-lg">{win.site_name}</p>
                          <p className="text-xs text-muted-foreground">
                            {format(new Date(win.withdrawal_date), "MMM dd, yyyy")}
                          </p>
                        </div>
                        <span className={cn(
                          "inline-flex items-center px-2 py-1 rounded-full text-xs font-medium",
                          win.status === "completed" && "bg-green-100 text-green-800"
                        )}>
                          {win.status}
                        </span>
                      </div>
                      <p className="text-2xl font-bold text-green-600 mb-3">
                        {formatCurrency(win.usd_equivalent)}
                      </p>
                      {win.notes && (
                        <p className="text-sm text-muted-foreground mb-3">
                          {win.notes}
                        </p>
                      )}
                      <div className="flex gap-2">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleEdit(win)}
                          className="flex-1"
                        >
                          <Edit className="h-4 w-4 mr-1" /> Edit
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleDelete(win)}
                          className="flex-1 text-destructive hover:text-destructive"
                        >
                          <Trash2 className="h-4 w-4 mr-1" /> Delete
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>

              {/* Pagination */}
              {totalPages > 1 && (
                <div className="flex items-center justify-between mt-4 pt-4 border-t">
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
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() =>
                        setCurrentPage((p) => Math.min(totalPages, p + 1))
                      }
                      disabled={currentPage === totalPages}
                    >
                      <ChevronRight className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              )}

              {/* Summary Stats */}
              <div className="mt-6 p-4 bg-gradient-to-r from-green-50 to-blue-50 rounded-lg border border-green-200">
                <h3 className="font-semibold mb-3 flex items-center gap-2">
                  <TrendingUp className="h-4 w-4 text-green-600" />
                  Summary Statistics
                </h3>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-sm">
                  <div>
                    <p className="text-muted-foreground">Total Withdrawals</p>
                    <p className="text-lg font-bold">{totalWins}</p>
                  </div>
                  <div>
                    <p className="text-muted-foreground">Average per WD</p>
                    <p className="text-lg font-bold text-green-600">
                      {formatCurrency(avgWin)}
                    </p>
                  </div>
                  <div>
                    <p className="text-muted-foreground">Biggest Withdrawal</p>
                    <p className="text-lg font-bold text-blue-600">
                      {formatCurrency(biggestWin?.usd_equivalent || 0)}
                    </p>
                    {biggestWin && (
                      <p className="text-xs text-muted-foreground">
                        {biggestWin.site_name} •{" "}
                        {format(new Date(biggestWin.withdrawal_date), "MMM dd")}
                      </p>
                    )}
                  </div>
                </div>
              </div>
            </>
          )}
        </CardContent>
      </Card>

      {/* Edit Modal */}
      <Dialog open={editModalOpen} onOpenChange={setEditModalOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Edit Withdrawal</DialogTitle>
            <DialogDescription>
              Update informasi withdrawal ini.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="edit_site_name">Site Name</Label>
              <Input
                id="edit_site_name"
                value={editForm.site_name}
                onChange={(e) =>
                  setEditForm({ ...editForm, site_name: e.target.value })
                }
                disabled={actionLoading}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="edit_amount">Amount (USD)</Label>
              <Input
                id="edit_amount"
                type="number"
                step="0.01"
                value={editForm.amount}
                onChange={(e) =>
                  setEditForm({ ...editForm, amount: e.target.value })
                }
                disabled={actionLoading}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="edit_date">Withdrawal Date</Label>
              <Input
                id="edit_date"
                type="date"
                value={editForm.withdrawal_date}
                onChange={(e) =>
                  setEditForm({ ...editForm, withdrawal_date: e.target.value })
                }
                disabled={actionLoading}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="edit_notes">Notes</Label>
              <Textarea
                id="edit_notes"
                value={editForm.notes}
                onChange={(e) =>
                  setEditForm({ ...editForm, notes: e.target.value })
                }
                disabled={actionLoading}
                rows={3}
              />
            </div>
          </div>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setEditModalOpen(false)}
              disabled={actionLoading}
            >
              Cancel
            </Button>
            <Button onClick={confirmEdit} disabled={actionLoading}>
              {actionLoading ? "Saving..." : "Save Changes"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation Modal */}
      <Dialog open={deleteModalOpen} onOpenChange={setDeleteModalOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Delete Withdrawal</DialogTitle>
            <DialogDescription>
              Apakah kamu yakin ingin menghapus withdrawal ini? Aksi ini tidak bisa
              dibatalkan.
            </DialogDescription>
          </DialogHeader>
          {selectedWin && (
            <div className="p-4 bg-destructive/10 rounded-lg">
              <p className="font-semibold">{selectedWin.site_name}</p>
              <p className="text-sm text-muted-foreground">
                {formatCurrency(selectedWin.usd_equivalent)} •{" "}
                {format(new Date(selectedWin.withdrawal_date), "MMM dd, yyyy")}
              </p>
            </div>
          )}
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setDeleteModalOpen(false)}
              disabled={actionLoading}
            >
              Cancel
            </Button>
            <Button
              variant="destructive"
              onClick={confirmDelete}
              disabled={actionLoading}
            >
              {actionLoading ? "Deleting..." : "Delete"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  )
}
