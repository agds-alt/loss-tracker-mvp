"use server"

import { createClient } from "@/lib/supabase/server"
import { revalidatePath } from "next/cache"

export type ReactionType = "support" | "love" | "congrats"

/**
 * Toggle a reaction on a post
 * If reaction exists, remove it. If not, add it.
 * If different reaction exists, replace it.
 */
export async function togglePostReaction(postId: string, reactionType: ReactionType) {
  try {
    const supabase = await createClient()

    // Get current user
    const { data: { user }, error: userError } = await supabase.auth.getUser()
    if (userError || !user) {
      return { success: false, error: "Unauthorized" }
    }

    // Check if user already reacted to this post
    const { data: existingReaction } = await supabase
      .from("post_reactions")
      .select("*")
      .eq("post_id", postId)
      .eq("user_id", user.id)
      .single()

    if (existingReaction) {
      // If same reaction, remove it
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      if ((existingReaction as any).reaction_type === reactionType) {
        const { error } = await supabase
          .from("post_reactions")
          .delete()
          .eq("post_id", postId)
          .eq("user_id", user.id)

        if (error) {
          console.error("Error removing reaction:", error)
          return { success: false, error: error.message }
        }

        revalidatePath("/community")
        return { success: true, action: "removed", reactionType: null }
      } else {
        // Different reaction, update it
        const { error } = await supabase
          .from("post_reactions")
          // @ts-expect-error - Database types not regenerated after migration
          .update({ reaction_type: reactionType })
          .eq("post_id", postId)
          .eq("user_id", user.id)

        if (error) {
          console.error("Error updating reaction:", error)
          return { success: false, error: error.message }
        }

        revalidatePath("/community")
        return { success: true, action: "updated", reactionType }
      }
    } else {
      // No existing reaction, add new one
      const { error } = await supabase
        .from("post_reactions")
        .insert({
          post_id: postId,
          user_id: user.id,
          reaction_type: reactionType,
        } as any) // eslint-disable-line @typescript-eslint/no-explicit-any

      if (error) {
        console.error("Error adding reaction:", error)
        return { success: false, error: error.message }
      }

      revalidatePath("/community")
      return { success: true, action: "added", reactionType }
    }
  } catch (error) {
    console.error("Error in togglePostReaction:", error)
    return { success: false, error: "Failed to toggle reaction" }
  }
}

/**
 * Get reaction counts for a post
 */
export async function getPostReactions(postId: string) {
  try {
    const supabase = await createClient()

    const { data: reactions, error } = await supabase
      .from("post_reactions")
      .select("reaction_type, user_id")
      .eq("post_id", postId)

    if (error) {
      console.error("Error fetching reactions:", error)
      return { success: false, error: error.message }
    }

    // Count reactions by type
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const counts = {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      support: (reactions as any[])?.filter((r: any) => r.reaction_type === "support").length || 0,
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      love: (reactions as any[])?.filter((r: any) => r.reaction_type === "love").length || 0,
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      congrats: (reactions as any[])?.filter((r: any) => r.reaction_type === "congrats").length || 0,
    }

    // Get current user's reaction
    const { data: { user } } = await supabase.auth.getUser()
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const userReaction = user
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      ? (reactions as any[])?.find((r: any) => r.user_id === user.id)?.reaction_type || null
      : null

    return {
      success: true,
      data: {
        counts,
        userReaction,
      },
    }
  } catch (error) {
    console.error("Error in getPostReactions:", error)
    return { success: false, error: "Failed to fetch reactions" }
  }
}
