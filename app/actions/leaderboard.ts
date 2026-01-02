"use server"

import { createClient } from "@/lib/supabase/server"

export type RankingType = "current_streak" | "longest_streak" | "total_days"

export interface LeaderboardUser {
  user_id: string
  username: string
  avatar_url: string | null
  current_streak: number
  longest_streak: number
  total_days_tracked: number
  last_tracked_at: string | null
  rank: number
}

/**
 * Get leaderboard rankings based on specified criteria
 */
export async function getLeaderboard(options?: {
  rankBy?: RankingType
  limit?: number
  offset?: number
}) {
  try {
    const supabase = await createClient()
    const rankBy = options?.rankBy || "current_streak"
    const limit = options?.limit || 50
    const offset = options?.offset || 0

    // Get user stats with user info
    const { data: userStats, error } = await supabase
      .from("user_stats")
      .select(`
        user_id,
        current_streak,
        longest_streak,
        total_days_tracked,
        last_tracked_at,
        users:user_id (
          username,
          avatar_url
        )
      `)
      .order(rankBy, { ascending: false })
      .range(offset, offset + limit - 1)

    if (error) {
      console.error("Error fetching leaderboard:", error)
      return { success: false, error: error.message }
    }

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const rankedUsers: LeaderboardUser[] = ((userStats as any[]) || []).map((stat: any, index: number) => ({
      user_id: stat.user_id,
      username: stat.users?.username || "User",
      avatar_url: stat.users?.avatar_url || null,
      current_streak: stat.current_streak || 0,
      longest_streak: stat.longest_streak || 0,
      total_days_tracked: stat.total_days_tracked || 0,
      last_tracked_at: stat.last_tracked_at,
      rank: offset + index + 1,
    }))

    return { success: true, data: rankedUsers }
  } catch (error) {
    console.error("Error in getLeaderboard:", error)
    return { success: false, error: "Failed to fetch leaderboard" }
  }
}

/**
 * Get current user's rank in the leaderboard
 */
export async function getUserRank(userId: string, rankBy: RankingType = "current_streak") {
  try {
    const supabase = await createClient()

    // Get all user stats ordered by ranking criteria
    const { data: allStats, error } = await supabase
      .from("user_stats")
      .select("user_id, current_streak, longest_streak, total_days_tracked")
      .order(rankBy, { ascending: false })

    if (error) {
      console.error("Error fetching user rank:", error)
      return { success: false, error: error.message }
    }

    // Find user's position
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const userIndex = (allStats as any[])?.findIndex((stat: any) => stat.user_id === userId)
    const rank = userIndex !== -1 ? userIndex + 1 : null

    return { success: true, data: { rank } }
  } catch (error) {
    console.error("Error in getUserRank:", error)
    return { success: false, error: "Failed to fetch user rank" }
  }
}

/**
 * Get leaderboard stats summary
 */
export async function getLeaderboardStats() {
  try {
    const supabase = await createClient()

    // Get aggregate stats
    const { data: stats, error } = await supabase
      .from("user_stats")
      .select("current_streak, longest_streak, total_days_tracked")

    if (error) {
      console.error("Error fetching stats:", error)
      return { success: false, error: error.message }
    }

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const statsArray = stats as any[] || []

    // Calculate totals and averages
    const totalUsers = statsArray.length
    const totalStreakDays = statsArray.reduce((sum, s) => sum + (s.current_streak || 0), 0)
    const totalDaysTracked = statsArray.reduce((sum, s) => sum + (s.total_days_tracked || 0), 0)
    const longestStreak = Math.max(...statsArray.map(s => s.longest_streak || 0), 0)

    return {
      success: true,
      data: {
        totalUsers,
        averageStreak: totalUsers > 0 ? Math.round(totalStreakDays / totalUsers) : 0,
        totalDaysTracked,
        longestStreak,
      },
    }
  } catch (error) {
    console.error("Error in getLeaderboardStats:", error)
    return { success: false, error: "Failed to fetch leaderboard stats" }
  }
}
