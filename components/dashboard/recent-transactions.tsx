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
      <CardHeader className="p-3 sm:p-4 md:p-6">
        <CardTitle className="text-base sm:text-lg md:text-xl">Recent Transactions</CardTitle>
        <CardDescription className="text-xs sm:text-sm">Your latest deposits and withdrawals</CardDescription>
      </CardHeader>
      <CardContent className="p-3 sm:p-4 md:p-6 pt-0 sm:pt-0 md:pt-0">
        <div className="space-y-2 sm:space-y-3">
          {recentLosses.map((loss) => {
            const isWin = loss.is_win
            const typeColor = loss.type === "judol" ? "judol" : "crypto"

            return (
              <div
                key={loss.id}
                className={cn(
                  "flex items-start sm:items-center gap-2 sm:gap-3 md:gap-4 p-2.5 sm:p-3 md:p-4 rounded-lg border transition-colors hover:bg-accent/50",
                  isWin
                    ? "border-clean/20 bg-clean/5"
                    : `border-${typeColor}/20 bg-${typeColor}/5`
                )}
              >
                <div
                  className={cn(
                    "h-8 w-8 sm:h-9 sm:w-9 md:h-10 md:w-10 rounded-full flex items-center justify-center flex-shrink-0",
                    isWin ? "bg-clean/20" : `bg-${typeColor}/20`
                  )}
                >
                  {isWin ? (
                    <ArrowUp className="h-4 w-4 sm:h-5 sm:w-5 text-clean" />
                  ) : (
                    <ArrowDown className={`h-4 w-4 sm:h-5 sm:w-5 text-${typeColor}`} />
                  )}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex flex-col sm:flex-row sm:items-center gap-1 sm:gap-2">
                    <p className="font-semibold text-sm sm:text-base truncate">{loss.site_coin_name}</p>
                    <div className="flex items-center gap-1.5 sm:gap-2 flex-wrap">
                      <span
                        className={cn(
                          "text-[10px] sm:text-xs px-1.5 sm:px-2 py-0.5 rounded-full font-medium whitespace-nowrap",
                          loss.type === "judol" ? "bg-judol/20 text-judol" : "bg-crypto/20 text-crypto"
                        )}
                      >
                        {loss.type === "judol" ? "Judol" : "Crypto"}
                      </span>
                      <span
                        className={cn(
                          "text-[10px] sm:text-xs px-1.5 sm:px-2 py-0.5 rounded-full font-medium whitespace-nowrap",
                          isWin ? "bg-clean/20 text-clean" : "bg-destructive/20 text-destructive"
                        )}
                      >
                        {isWin ? "WD" : "Deposit"}
                      </span>
                    </div>
                  </div>
                  <div className="flex items-center gap-1.5 sm:gap-2 mt-0.5 sm:mt-1">
                    <p className="text-[10px] sm:text-xs md:text-sm text-muted-foreground whitespace-nowrap">
                      {format(new Date(loss.date), "dd MMM yyyy")}
                    </p>
                    {loss.notes && (
                      <>
                        <span className="text-muted-foreground hidden sm:inline">•</span>
                        <p className="text-[10px] sm:text-xs md:text-sm text-muted-foreground truncate hidden sm:block">
                          {loss.notes}
                        </p>
                      </>
                    )}
                  </div>
                </div>
                <div className="text-right flex-shrink-0">
                  <p className={cn(
                    "font-bold text-sm sm:text-base md:text-lg whitespace-nowrap",
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
