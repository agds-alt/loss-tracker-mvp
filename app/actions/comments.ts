"use server"

import { createClient } from "@/lib/supabase/server"
import { revalidatePath } from "next/cache"
import { Database } from "@/types/database.types"

type CommentInsert = Database["public"]["Tables"]["comments"]["Insert"]

export interface CreateCommentInput {
  post_id: string
  content: string
  parent_comment_id?: string | null
}

/**
 * Create a new comment
 */
export async function createComment(input: CreateCommentInput) {
  try {
    const supabase = await createClient()

    // Get current user
    const { data: { user }, error: userError } = await supabase.auth.getUser()
    if (userError || !user) {
      return { success: false, error: "Unauthorized" }
    }

    // Prepare comment data
    const commentData: CommentInsert = {
      post_id: input.post_id,
      user_id: user.id,
      content: input.content,
      parent_comment_id: input.parent_comment_id || null,
    }

    // Insert comment
    const { data: comment, error } = await supabase
      .from("comments")
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      .insert(commentData as any)
      .select(`
        *,
        users:user_id (
          id,
          username,
          avatar_url
        )
      `)
      .single()

    if (error) {
      console.error("Error creating comment:", error)
      return { success: false, error: error.message }
    }

    revalidatePath("/community")

    return { success: true, data: comment }
  } catch (error) {
    console.error("Error in createComment:", error)
    return { success: false, error: "Failed to create comment" }
  }
}

/**
 * Get comments for a post with nested replies
 */
export async function getComments(postId: string) {
  try {
    const supabase = await createClient()

    // Get all comments for the post
    const { data: comments, error } = await supabase
      .from("comments")
      .select(`
        *,
        users:user_id (
          id,
          username,
          avatar_url
        )
      `)
      .eq("post_id", postId)
      .order("created_at", { ascending: true })

    if (error) {
      console.error("Error fetching comments:", error)
      return { success: false, error: error.message }
    }

    // Get current user for like status
    const { data: { user } } = await supabase.auth.getUser()

    // Get like counts and user's like status for each comment
    const commentsWithLikes = await Promise.all(
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      ((comments as any[]) || []).map(async (comment) => {
        // Get like count
        const { count: likesCount } = await supabase
          .from("comment_likes")
          .select("*", { count: "exact", head: true })
          .eq("comment_id", comment.id)

        // Check if user liked this comment
        let isLiked = false
        if (user) {
          const { data: userLike } = await supabase
            .from("comment_likes")
            .select("id")
            .eq("comment_id", comment.id)
            .eq("user_id", user.id)
            .single()

          isLiked = !!userLike
        }

        return {
          ...comment,
          likes_count: likesCount || 0,
          is_liked: isLiked,
        }
      })
    )

    // Organize into nested structure
    const topLevelComments = commentsWithLikes.filter((c) => !c.parent_comment_id)
    const repliesMap = new Map<string, typeof commentsWithLikes>()

    commentsWithLikes.forEach((comment) => {
      if (comment.parent_comment_id) {
        const replies = repliesMap.get(comment.parent_comment_id) || []
        replies.push(comment)
        repliesMap.set(comment.parent_comment_id, replies)
      }
    })

    const nestedComments = topLevelComments.map((comment) => ({
      ...comment,
      replies: repliesMap.get(comment.id) || [],
    }))

    return { success: true, data: nestedComments }
  } catch (error) {
    console.error("Error in getComments:", error)
    return { success: false, error: "Failed to fetch comments" }
  }
}

/**
 * Toggle like on a comment
 */
export async function toggleCommentLike(commentId: string) {
  try {
    const supabase = await createClient()

    // Get current user
    const { data: { user }, error: userError } = await supabase.auth.getUser()
    if (userError || !user) {
      return { success: false, error: "Unauthorized" }
    }

    // Check if user already liked this comment
    const { data: existingLike } = await supabase
      .from("comment_likes")
      .select("id")
      .eq("comment_id", commentId)
      .eq("user_id", user.id)
      .single()

    if (existingLike) {
      // Unlike
      const { error } = await supabase
        .from("comment_likes")
        .delete()
        .eq("comment_id", commentId)
        .eq("user_id", user.id)

      if (error) {
        console.error("Error removing like:", error)
        return { success: false, error: error.message }
      }

      revalidatePath("/community")
      return { success: true, action: "unliked" }
    } else {
      // Like
      const { error } = await supabase
        .from("comment_likes")
        .insert({
          comment_id: commentId,
          user_id: user.id,
        } as any) // eslint-disable-line @typescript-eslint/no-explicit-any

      if (error) {
        console.error("Error adding like:", error)
        return { success: false, error: error.message }
      }

      revalidatePath("/community")
      return { success: true, action: "liked" }
    }
  } catch (error) {
    console.error("Error in toggleCommentLike:", error)
    return { success: false, error: "Failed to toggle like" }
  }
}

/**
 * Delete a comment
 */
export async function deleteComment(commentId: string) {
  try {
    const supabase = await createClient()

    // Get current user
    const { data: { user }, error: userError } = await supabase.auth.getUser()
    if (userError || !user) {
      return { success: false, error: "Unauthorized" }
    }

    // Check if user owns the comment
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const { data: existingComment } = await supabase
      .from("comments")
      .select("user_id")
      .eq("id", commentId)
      .single()

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    if (!existingComment || (existingComment as any).user_id !== user.id) {
      return { success: false, error: "Unauthorized" }
    }

    // Delete comment (cascade will handle likes and replies)
    const { error } = await supabase
      .from("comments")
      .delete()
      .eq("id", commentId)

    if (error) {
      console.error("Error deleting comment:", error)
      return { success: false, error: error.message }
    }

    revalidatePath("/community")

    return { success: true }
  } catch (error) {
    console.error("Error in deleteComment:", error)
    return { success: false, error: "Failed to delete comment" }
  }
}
