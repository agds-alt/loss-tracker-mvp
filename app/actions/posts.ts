"use server"

import { createClient } from "@/lib/supabase/server"
import { revalidatePath } from "next/cache"
import { Database } from "@/types/database.types"

type PostInsert = Database["public"]["Tables"]["posts"]["Insert"]

export interface CreatePostInput {
  type: "story" | "milestone" | "support" | "tips"
  content: string
  image_url?: string | null
  is_anonymous?: boolean
  hashtags?: string[]
}

export interface UpdatePostInput {
  id: string
  content?: string
  image_url?: string | null
  hashtags?: string[]
}

/**
 * Create a new post
 */
export async function createPost(input: CreatePostInput) {
  try {
    const supabase = await createClient()

    // Get current user
    const { data: { user }, error: userError } = await supabase.auth.getUser()
    if (userError || !user) {
      return { success: false, error: "Unauthorized" }
    }

    // Prepare post data
    const postData: PostInsert = {
      user_id: input.is_anonymous ? null : user.id,
      type: input.type,
      content: input.content,
      image_url: input.image_url || null,
      is_anonymous: input.is_anonymous || false,
      hashtags: input.hashtags || [],
    }

    // Insert post
    const { data: post, error } = await supabase
      .from("posts")
      .insert(postData as any) // eslint-disable-line @typescript-eslint/no-explicit-any
      .select()
      .single()

    if (error) {
      console.error("Error creating post:", error)
      return { success: false, error: error.message }
    }

    // Revalidate community page
    revalidatePath("/community")

    return { success: true, data: post }
  } catch (error) {
    console.error("Error in createPost:", error)
    return { success: false, error: "Failed to create post" }
  }
}

/**
 * Get posts with pagination
 */
export async function getPosts(options?: {
  limit?: number
  offset?: number
  type?: "story" | "milestone" | "support" | "tips"
  userId?: string
}) {
  try {
    const supabase = await createClient()
    const limit = options?.limit || 10
    const offset = options?.offset || 0

    let query = supabase
      .from("posts")
      .select(`
        *,
        users:user_id (
          id,
          username,
          avatar_url
        )
      `)
      .order("created_at", { ascending: false })
      .range(offset, offset + limit - 1)

    // Filter by type if provided
    if (options?.type) {
      query = query.eq("type", options.type)
    }

    // Filter by user if provided
    if (options?.userId) {
      query = query.eq("user_id", options.userId)
    }

    const { data: posts, error } = await query

    if (error) {
      console.error("Error fetching posts:", error)
      return { success: false, error: error.message }
    }

    // Get reaction counts and user reactions for each post
    const { data: { user } } = await supabase.auth.getUser()

    const postsWithReactions = await Promise.all(
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      ((posts as any[]) || []).map(async (post) => {
        // Get reaction counts
        const { data: reactions } = await supabase
          .from("post_reactions")
          .select("reaction_type")
          .eq("post_id", post.id)

        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const reactionCounts = {
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          support: (reactions as any[])?.filter((r: any) => r.reaction_type === "support").length || 0,
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          love: (reactions as any[])?.filter((r: any) => r.reaction_type === "love").length || 0,
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          congrats: (reactions as any[])?.filter((r: any) => r.reaction_type === "congrats").length || 0,
        }

        // Get user's reaction
        let userReaction = null
        if (user) {
          const { data: userReactionData } = await supabase
            .from("post_reactions")
            .select("reaction_type")
            .eq("post_id", post.id)
            .eq("user_id", user.id)
            .single()

          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          userReaction = (userReactionData as any)?.reaction_type || null
        }

        // Get comment count
        const { count: commentsCount } = await supabase
          .from("comments")
          .select("*", { count: "exact", head: true })
          .eq("post_id", post.id)

        return {
          ...post,
          reactions: reactionCounts,
          user_reaction: userReaction,
          comments_count: commentsCount || 0,
        }
      })
    )

    return { success: true, data: postsWithReactions }
  } catch (error) {
    console.error("Error in getPosts:", error)
    return { success: false, error: "Failed to fetch posts" }
  }
}

/**
 * Get a single post by ID
 */
export async function getPost(postId: string) {
  try {
    const supabase = await createClient()

    const { data: post, error } = await supabase
      .from("posts")
      .select(`
        *,
        users:user_id (
          id,
          username,
          avatar_url
        )
      `)
      .eq("id", postId)
      .single()

    if (error) {
      console.error("Error fetching post:", error)
      return { success: false, error: error.message }
    }

    return { success: true, data: post }
  } catch (error) {
    console.error("Error in getPost:", error)
    return { success: false, error: "Failed to fetch post" }
  }
}

/**
 * Update a post
 */
export async function updatePost(input: UpdatePostInput) {
  try {
    const supabase = await createClient()

    // Get current user
    const { data: { user }, error: userError } = await supabase.auth.getUser()
    if (userError || !user) {
      return { success: false, error: "Unauthorized" }
    }

    // Check if user owns the post
    const { data: existingPost } = await supabase
      .from("posts")
      .select("user_id")
      .eq("id", input.id)
      .single()

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    if (!existingPost || (existingPost as any).user_id !== user.id) {
      return { success: false, error: "Unauthorized" }
    }

    // Update post
    const updateData: Partial<PostInsert> = {}
    if (input.content !== undefined) updateData.content = input.content
    if (input.image_url !== undefined) updateData.image_url = input.image_url
    if (input.hashtags !== undefined) updateData.hashtags = input.hashtags

    const { data: post, error } = await supabase
      .from("posts")
      // @ts-expect-error - Database types not regenerated after migration
      .update(updateData)
      .eq("id", input.id)
      .select()
      .single()

    if (error) {
      console.error("Error updating post:", error)
      return { success: false, error: error.message }
    }

    revalidatePath("/community")

    return { success: true, data: post }
  } catch (error) {
    console.error("Error in updatePost:", error)
    return { success: false, error: "Failed to update post" }
  }
}

/**
 * Delete a post
 */
export async function deletePost(postId: string) {
  try {
    const supabase = await createClient()

    // Get current user
    const { data: { user }, error: userError } = await supabase.auth.getUser()
    if (userError || !user) {
      return { success: false, error: "Unauthorized" }
    }

    // Check if user owns the post
    const { data: existingPost } = await supabase
      .from("posts")
      .select("user_id")
      .eq("id", postId)
      .single()

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    if (!existingPost || (existingPost as any).user_id !== user.id) {
      return { success: false, error: "Unauthorized" }
    }

    // Delete post (cascade will handle reactions and comments)
    const { error } = await supabase
      .from("posts")
      .delete()
      .eq("id", postId)

    if (error) {
      console.error("Error deleting post:", error)
      return { success: false, error: error.message }
    }

    revalidatePath("/community")

    return { success: true }
  } catch (error) {
    console.error("Error in deletePost:", error)
    return { success: false, error: "Failed to delete post" }
  }
}
