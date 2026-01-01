import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { formatCurrency, cn } from "@/lib/utils"
import { Database } from "@/types/database.types"
import { format } from "date-fns"
import { ArrowDown, ArrowUp } from "lucide-react"

type Loss = Database["public"]["Tables"]["losses"]["Row"]

interface RecentTransactionsProps {
  losses: Loss[]
}

export function RecentTransactions({ losses }: RecentTransactionsProps) {
  // Get last 10 transactions
  const recentLosses = losses.slice(0, 10)

  if (recentLosses.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Recent Transactions</CardTitle>
          <CardDescription>Your latest deposits and withdrawals</CardDescription>
        </CardHeader>
        <CardContent>
          <p className="text-center text-muted-foreground py-8">
            Belum ada transaksi. Mulai tracking sekarang!
          </p>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Recent Transactions</CardTitle>
        <CardDescription>Your latest deposits and withdrawals</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-3">
          {recentLosses.map((loss) => {
            const isWin = loss.is_win
            const typeColor = loss.type === "judol" ? "judol" : "crypto"

            return (
              <div
                key={loss.id}
                className={cn(
                  "flex items-center justify-between p-4 rounded-lg border transition-colors hover:bg-accent/50",
                  isWin
                    ? "border-clean/20 bg-clean/5"
                    : `border-${typeColor}/20 bg-${typeColor}/5`
                )}
              >
                <div className="flex items-center gap-4 flex-1">
                  <div
                    className={cn(
                      "h-10 w-10 rounded-full flex items-center justify-center",
                      isWin ? "bg-clean/20" : `bg-${typeColor}/20`
                    )}
                  >
                    {isWin ? (
                      <ArrowUp className="h-5 w-5 text-clean" />
                    ) : (
                      <ArrowDown className={`h-5 w-5 text-${typeColor}`} />
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <p className="font-semibold truncate">{loss.site_coin_name}</p>
                      <span
                        className={cn(
                          "text-xs px-2 py-0.5 rounded-full font-medium",
                          loss.type === "judol" ? "bg-judol/20 text-judol" : "bg-crypto/20 text-crypto"
                        )}
                      >
                        {loss.type === "judol" ? "Judol" : "Crypto"}
                      </span>
                      <span
                        className={cn(
                          "text-xs px-2 py-0.5 rounded-full font-medium",
                          isWin ? "bg-clean/20 text-clean" : "bg-destructive/20 text-destructive"
                        )}
                      >
                        {isWin ? "WD" : "Deposit"}
                      </span>
                    </div>
                    <div className="flex items-center gap-2 mt-1">
                      <p className="text-sm text-muted-foreground">
                        {format(new Date(loss.date), "dd MMM yyyy")}
                      </p>
                      {loss.notes && (
                        <>
                          <span className="text-muted-foreground">•</span>
                          <p className="text-sm text-muted-foreground truncate">{loss.notes}</p>
                        </>
                      )}
                    </div>
                  </div>
                </div>
                <div className="text-right">
                  <p className={cn(
                    "font-bold text-lg",
                    isWin ? "text-clean" : "text-destructive"
                  )}>
                    {isWin ? '+' : '-'}{formatCurrency(Number(loss.amount))}
                  </p>
                </div>
              </div>
            )
          })}
        </div>
      </CardContent>
    </Card>
  )
}
