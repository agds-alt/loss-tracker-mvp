import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { formatCurrency } from "@/lib/utils"
import { Database } from "@/types/database.types"
import { AlertTriangle } from "lucide-react"

type UserStats = Database["public"]["Tables"]["user_stats"]["Row"]

interface RealityCheckProps {
  stats: UserStats | null
}

export function RealityCheck({ stats }: RealityCheckProps) {
  // Use NET loss (deposits - withdrawals) for fairer calculation
  const netCasino = Number(stats?.net_casino || 0)
  const netCrypto = Number(stats?.net_crypto || 0)
  const totalNetLoss = Math.abs(netCasino) + Math.abs(netCrypto)

  // Get total deposits for reference
  const totalCasinoDeposit = Number(stats?.total_casino_loss || 0)
  const totalCryptoDeposit = Number(stats?.total_crypto_loss || 0)
  const totalCasinoWD = Number(stats?.total_casino_win || 0)
  const totalCryptoWD = Number(stats?.total_crypto_win || 0)

  if (totalNetLoss === 0) return null

  // Calculations based on NET loss
  const btcDCAMonths = Math.floor(totalNetLoss / 1_000_000) // Assuming 1M/month DCA
  const goldGrams = (totalNetLoss / 1_200_000).toFixed(2) // @1.2M/gram
  const umrJakartaPercent = ((totalNetLoss / 5_000_000) * 100).toFixed(1) // 5M UMR
  const kosMonths = Math.floor(totalNetLoss / 1_500_000) // @1.5M/month

  const casinoVsCryptoPercent =
    Math.abs(netCasino) > 0 ? (((Math.abs(netCasino) - Math.abs(netCrypto)) / Math.abs(netCasino)) * 100).toFixed(1) : "0"

  return (
    <Card className="border-2 border-destructive/50 bg-destructive/5">
      <CardHeader>
        <div className="flex items-center gap-2">
          <AlertTriangle className="h-5 w-5 text-destructive" />
          <CardTitle className="text-destructive">Reality Check</CardTitle>
        </div>
      </CardHeader>
      <CardContent className="space-y-3">
        <div className="grid md:grid-cols-2 gap-4">
          <div className="space-y-1">
            <p className="text-sm font-medium text-muted-foreground">
              Bisa DCA Bitcoin
            </p>
            <p className="text-2xl font-bold">
              {btcDCAMonths} bulan
              <span className="text-sm font-normal text-muted-foreground ml-2">
                (@ Rp 1jt/bulan)
              </span>
            </p>
          </div>

          <div className="space-y-1">
            <p className="text-sm font-medium text-muted-foreground">
              Setara Emas
            </p>
            <p className="text-2xl font-bold">
              {goldGrams} gram
              <span className="text-sm font-normal text-muted-foreground ml-2">
                (@ Rp 1.2jt/gram)
              </span>
            </p>
          </div>

          <div className="space-y-1">
            <p className="text-sm font-medium text-muted-foreground">
              % dari UMR Jakarta
            </p>
            <p className="text-2xl font-bold">
              {umrJakartaPercent}%
              <span className="text-sm font-normal text-muted-foreground ml-2">
                (Rp 5jt/bulan)
              </span>
            </p>
          </div>

          <div className="space-y-1">
            <p className="text-sm font-medium text-muted-foreground">
              Bisa Bayar Kos
            </p>
            <p className="text-2xl font-bold">
              {kosMonths} bulan
              <span className="text-sm font-normal text-muted-foreground ml-2">
                (@ Rp 1.5jt/bulan)
              </span>
            </p>
          </div>
        </div>

        {Math.abs(netCasino) > Math.abs(netCrypto) && (
          <div className="mt-6 p-4 bg-destructive/10 rounded-lg border border-destructive/20">
            <p className="text-center font-bold text-destructive text-lg">
              ⚠️ Casino {casinoVsCryptoPercent}% lebih boros dari crypto!
            </p>
            <p className="text-center text-sm text-muted-foreground mt-1">
              Net Loss - Casino: {formatCurrency(Math.abs(netCasino))} vs Crypto: {formatCurrency(Math.abs(netCrypto))}
            </p>
          </div>
        )}

        <div className="mt-4 pt-4 border-t space-y-2">
          <div className="grid grid-cols-2 gap-4">
            <div className="text-center">
              <p className="text-xs text-muted-foreground">Total Deposits</p>
              <p className="font-bold text-destructive">{formatCurrency(totalCasinoDeposit + totalCryptoDeposit)}</p>
            </div>
            <div className="text-center">
              <p className="text-xs text-muted-foreground">Total Withdrawals</p>
              <p className="font-bold text-clean">{formatCurrency(totalCasinoWD + totalCryptoWD)}</p>
            </div>
          </div>
          <div className="text-center pt-2">
            <p className="text-sm text-muted-foreground">
              NET Loss: <span className="font-bold text-destructive text-lg">{formatCurrency(totalNetLoss)}</span>
            </p>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
