/**
 * Database queries for statistics and rankings
 */

export interface SiteStats {
  site_coin_name: string
  type: "judol" | "crypto"
  total_amount: number
  count: number
  highest_single: number
}

/**
 * Get top withdrawals grouped by site
 */
// eslint-disable-next-line @typescript-eslint/no-explicit-any
export async function getTopWithdrawals(
  supabase: any,
  userId: string,
  limit: number = 10
) {
  const { data: losses, error } = await supabase
    .from("losses")
    .select("*")
    .eq("user_id", userId)
    .eq("is_win", true)
    .order("amount", { ascending: false })

  if (error) throw error

  // Group by site and calculate stats
  const siteMap = new Map<string, SiteStats>()

  losses?.forEach((loss: any) => {
    const key = loss.site_coin_name.toLowerCase()
    const existing = siteMap.get(key)

    if (existing) {
      existing.total_amount += Number(loss.amount)
      existing.count += 1
      existing.highest_single = Math.max(
        existing.highest_single,
        Number(loss.amount)
      )
    } else {
      siteMap.set(key, {
        site_coin_name: loss.site_coin_name,
        type: loss.type as "judol" | "crypto",
        total_amount: Number(loss.amount),
        count: 1,
        highest_single: Number(loss.amount),
      })
    }
  })

  // Convert to array and sort by total amount
  const rankings = Array.from(siteMap.values())
    .sort((a, b) => b.total_amount - a.total_amount)
    .slice(0, limit)

  return rankings
}

/**
 * Get top deposits/losses grouped by site
 */
// eslint-disable-next-line @typescript-eslint/no-explicit-any
export async function getTopDeposits(
  supabase: any,
  userId: string,
  limit: number = 10
) {
  const { data: losses, error } = await supabase
    .from("losses")
    .select("*")
    .eq("user_id", userId)
    .eq("is_win", false)
    .order("amount", { ascending: false })

  if (error) throw error

  // Group by site and calculate stats
  const siteMap = new Map<string, SiteStats>()

  losses?.forEach((loss: any) => {
    const key = loss.site_coin_name.toLowerCase()
    const existing = siteMap.get(key)

    if (existing) {
      existing.total_amount += Number(loss.amount)
      existing.count += 1
      existing.highest_single = Math.max(
        existing.highest_single,
        Number(loss.amount)
      )
    } else {
      siteMap.set(key, {
        site_coin_name: loss.site_coin_name,
        type: loss.type as "judol" | "crypto",
        total_amount: Number(loss.amount),
        count: 1,
        highest_single: Number(loss.amount),
      })
    }
  })

  // Convert to array and sort by total amount
  const rankings = Array.from(siteMap.values())
    .sort((a, b) => b.total_amount - a.total_amount)
    .slice(0, limit)

  return rankings
}

/**
 * Get biggest single withdrawal
 */
// eslint-disable-next-line @typescript-eslint/no-explicit-any
export async function getBiggestWithdrawal(
  supabase: any,
  userId: string
) {
  const { data, error } = await supabase
    .from("losses")
    .select("*")
    .eq("user_id", userId)
    .eq("is_win", true)
    .order("amount", { ascending: false })
    .limit(1)
    .single()

  if (error && error.code !== "PGRST116") throw error
  return data
}

/**
 * Get biggest single deposit
 */
// eslint-disable-next-line @typescript-eslint/no-explicit-any
export async function getBiggestDeposit(
  supabase: any,
  userId: string
) {
  const { data, error } = await supabase
    .from("losses")
    .select("*")
    .eq("user_id", userId)
    .eq("is_win", false)
    .order("amount", { ascending: false })
    .limit(1)
    .single()

  if (error && error.code !== "PGRST116") throw error
  return data
}
