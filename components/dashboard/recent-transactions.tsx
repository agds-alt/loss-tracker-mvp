import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { formatCurrency, formatDate, cn } from "@/lib/utils"
import { Database } from "@/types/database.types"
import { ArrowDown, ArrowUp } from "lucide-react"
import { TYPE_COLOR_STYLES } from "@/lib/constants/ui"
import { EMPTY_STATE_MESSAGES, LABEL_TEXT } from "@/lib/constants/messages"

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
          <CardTitle>Transaksi Terbaru</CardTitle>
          <CardDescription>Deposit dan penarikan terbaru kamu</CardDescription>
        </CardHeader>
        <CardContent>
          <p className="text-center text-muted-foreground py-8">
            {EMPTY_STATE_MESSAGES.NO_TRANSACTIONS}
          </p>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card>
      <CardHeader className="p-3 sm:p-4 md:p-6">
        <CardTitle className="text-base sm:text-lg md:text-xl">Transaksi Terbaru</CardTitle>
        <CardDescription className="text-xs sm:text-sm">Deposit dan penarikan terbaru kamu</CardDescription>
      </CardHeader>
      <CardContent className="p-3 sm:p-4 md:p-6 pt-0 sm:pt-0 md:pt-0">
        <div className="space-y-2 sm:space-y-3">
          {recentLosses.map((loss) => {
            const isWin = loss.is_win
            const colorType = loss.type as keyof typeof TYPE_COLOR_STYLES
            const colors = isWin ? TYPE_COLOR_STYLES.clean : TYPE_COLOR_STYLES[colorType]

            return (
              <div
                key={loss.id}
                className={cn(
                  "flex items-start sm:items-center gap-2 sm:gap-3 md:gap-4 p-2.5 sm:p-3 md:p-4 rounded-lg border transition-colors hover:bg-accent/50",
                  colors.borderLight,
                  colors.bgLight
                )}
              >
                <div
                  className={cn(
                    "h-8 w-8 sm:h-9 sm:w-9 md:h-10 md:w-10 rounded-full flex items-center justify-center flex-shrink-0",
                    colors.bgMedium
                  )}
                >
                  {isWin ? (
                    <ArrowUp className="h-4 w-4 sm:h-5 sm:w-5 text-clean" />
                  ) : (
                    <ArrowDown className={cn("h-4 w-4 sm:h-5 sm:w-5", colors.text)} />
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
                        {isWin ? LABEL_TEXT.WITHDRAWAL : LABEL_TEXT.DEPOSIT}
                      </span>
                    </div>
                  </div>
                  <div className="flex items-center gap-1.5 sm:gap-2 mt-0.5 sm:mt-1">
                    <p className="text-[10px] sm:text-xs md:text-sm text-muted-foreground whitespace-nowrap">
                      {formatDate(loss.date)}
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
