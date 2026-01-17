"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from "recharts"
import { Database } from "@/types/database.types"
import { formatCurrency } from "@/lib/utils"

type Loss = Database["public"]["Tables"]["losses"]["Row"]

interface WeekSummaryChartProps {
  losses: Loss[]
}

export function WeekSummaryChart({ losses }: WeekSummaryChartProps) {
  // Group losses by date
  const last7Days = Array.from({ length: 7 }, (_, i) => {
    const date = new Date()
    date.setDate(date.getDate() - (6 - i))
    return date.toISOString().split("T")[0]
  })

  const chartData = last7Days.map((date) => {
    const dayLosses = losses.filter((loss) => loss.date === date)

    // Calculate deposits (losses)
    const deposits = dayLosses
      .filter((l) => !l.is_win)
      .reduce((sum, l) => sum + Number(l.amount), 0)

    // Calculate withdrawals (wins)
    const withdrawals = dayLosses
      .filter((l) => l.is_win)
      .reduce((sum, l) => sum + Number(l.amount), 0)

    const dayName = new Date(date).toLocaleDateString("id-ID", {
      weekday: "short",
    })

    return {
      name: dayName,
      deposits: deposits,
      withdrawals: withdrawals,
    }
  })

  return (
    <Card>
      <CardHeader className="p-3 sm:p-4 md:p-6">
        <CardTitle className="text-base sm:text-lg md:text-xl">Ringkasan Minggu Ini</CardTitle>
        <p className="text-xs sm:text-sm text-muted-foreground mt-0.5 sm:mt-1">
          Tracking deposit (merah) vs WD (hijau) 7 hari terakhir
        </p>
      </CardHeader>
      <CardContent className="p-2 sm:p-4 md:p-6 pt-0">
        <ResponsiveContainer width="100%" height={200} className="sm:hidden">
          <BarChart data={chartData}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="name" style={{ fontSize: "11px" }} />
            <YAxis
              style={{ fontSize: "10px" }}
              tickFormatter={(value) => {
                if (value >= 1000000) return `${(value / 1000000).toFixed(1)}jt`
                if (value >= 1000) return `${(value / 1000).toFixed(0)}rb`
                return value.toString()
              }}
            />
            <Tooltip
              formatter={(value: number) => formatCurrency(value)}
              contentStyle={{
                backgroundColor: "hsl(var(--card))",
                border: "1px solid hsl(var(--border))",
                borderRadius: "8px",
              }}
            />
            <Legend wrapperStyle={{ fontSize: "11px" }} />
            <Bar
              dataKey="deposits"
              fill="#ef4444"
              name="Deposit"
              radius={[4, 4, 0, 0]}
            />
            <Bar
              dataKey="withdrawals"
              fill="#22c55e"
              name="Penarikan"
              radius={[4, 4, 0, 0]}
            />
          </BarChart>
        </ResponsiveContainer>
        <ResponsiveContainer width="100%" height={280} className="hidden sm:block">
          <BarChart data={chartData}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="name" />
            <YAxis
              tickFormatter={(value) => {
                if (value >= 1000000) return `${(value / 1000000).toFixed(1)} juta`
                if (value >= 1000) return `${(value / 1000).toFixed(0)} ribu`
                return value.toString()
              }}
            />
            <Tooltip
              formatter={(value: number) => formatCurrency(value)}
              contentStyle={{
                backgroundColor: "hsl(var(--card))",
                border: "1px solid hsl(var(--border))",
                borderRadius: "8px",
              }}
            />
            <Legend />
            <Bar dataKey="deposits" fill="#ef4444" name="Deposit" />
            <Bar dataKey="withdrawals" fill="#22c55e" name="WD" />
          </BarChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  )
}
