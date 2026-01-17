/**
 * Transaction Statistics Calculations
 * Centralized calculation logic for transaction data
 */

import { Database } from "@/types/database.types"

type Loss = Database["public"]["Tables"]["losses"]["Row"]
type TransactionType = "judol" | "crypto"

export interface TransactionStats {
  totalDeposits: number
  totalWithdrawals: number
  totalTransactions: number
  totalWins: number
  totalDepositsCount: number
  winRate: number
  netPnL: number
  isProfitable: boolean
  uniqueSites: number
}

export interface TypeBreakdown {
  deposits: number
  withdrawals: number
  netPnL: number
  isProfitable: boolean
}

export interface AllTypeBreakdown {
  casino: TypeBreakdown
  crypto: TypeBreakdown
}

/**
 * Calculate comprehensive statistics for transactions
 * @param losses - Array of loss/transaction records
 * @returns TransactionStats object with all calculated values
 */
export function calculateTransactionStats(losses: Loss[]): TransactionStats {
  const totalDeposits = losses
    .filter((l) => !l.is_win)
    .reduce((sum, l) => sum + Number(l.amount), 0)

  const totalWithdrawals = losses
    .filter((l) => l.is_win)
    .reduce((sum, l) => sum + Number(l.amount), 0)

  const totalTransactions = losses.length
  const totalWins = losses.filter((l) => l.is_win).length
  const totalDepositsCount = totalTransactions - totalWins
  const winRate = totalTransactions > 0 ? (totalWins / totalTransactions) * 100 : 0
  const netPnL = totalWithdrawals - totalDeposits

  return {
    totalDeposits,
    totalWithdrawals,
    totalTransactions,
    totalWins,
    totalDepositsCount,
    winRate,
    netPnL,
    isProfitable: netPnL >= 0,
    uniqueSites: new Set(losses.map((l) => l.site_coin_name.toLowerCase())).size,
  }
}

/**
 * Calculate statistics for a specific transaction type
 * @param losses - Array of loss/transaction records
 * @param type - Transaction type (casino or crypto)
 * @returns TypeBreakdown object
 */
export function calculateTypeStats(
  losses: Loss[],
  type: TransactionType
): TypeBreakdown {
  const deposits = losses
    .filter((l) => l.type === type && !l.is_win)
    .reduce((sum, l) => sum + Number(l.amount), 0)

  const withdrawals = losses
    .filter((l) => l.type === type && l.is_win)
    .reduce((sum, l) => sum + Number(l.amount), 0)

  const netPnL = withdrawals - deposits

  return {
    deposits,
    withdrawals,
    netPnL,
    isProfitable: netPnL >= 0,
  }
}

/**
 * Calculate breakdown for all transaction types
 * @param losses - Array of loss/transaction records
 * @returns AllTypeBreakdown with casino and crypto stats
 */
export function calculateTypeBreakdown(losses: Loss[]): AllTypeBreakdown {
  return {
    casino: calculateTypeStats(losses, "casino"),
    crypto: calculateTypeStats(losses, "crypto"),
  }
}

/**
 * Get unique sites/coins from transactions
 * @param losses - Array of loss/transaction records
 * @returns Array of unique site/coin names
 */
export function getUniqueSites(losses: Loss[]): string[] {
  return Array.from(new Set(losses.map((l) => l.site_coin_name.toLowerCase())))
}

/**
 * Calculate running totals from transactions
 * @param losses - Array of loss/transaction records (should be sorted by date)
 * @returns Running totals for deposits, withdrawals, and net
 */
export function calculateRunningTotals(losses: Loss[]): {
  totalDeposit: number
  totalWithdrawal: number
  netTotal: number
} {
  const totalDeposit = losses
    .filter((l) => !l.is_win)
    .reduce((sum, l) => sum + Number(l.amount), 0)

  const totalWithdrawal = losses
    .filter((l) => l.is_win)
    .reduce((sum, l) => sum + Number(l.amount), 0)

  return {
    totalDeposit,
    totalWithdrawal,
    netTotal: totalWithdrawal - totalDeposit,
  }
}
