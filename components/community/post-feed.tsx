"use client"

import { useState, useEffect, useCallback } from "react"
import { PostCard } from "./post-card"
import { Button } from "@/components/ui/button"
import { Loader2 } from "lucide-react"
import { getPosts } from "@/app/actions/posts"

interface PostFeedProps {
  userId: string
  username: string
}

interface Post {
  id: string
  user_id: string
  type: "story" | "milestone" | "support" | "tips"
  content: string
  image_url: string | null
  is_anonymous: boolean
  hashtags: string[]
  created_at: string
  users: {
    id: string
    username: string
    avatar_url: string | null
  } | null
  reactions: {
    support: number
    love: number
    congrats: number
  }
  user_reaction: "support" | "love" | "congrats" | null
  comments_count: number
  username: string
}

export function PostFeed({ userId, username }: PostFeedProps) {
  const [posts, setPosts] = useState<Post[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [isLoadingMore, setIsLoadingMore] = useState(false)
  const [hasMore, setHasMore] = useState(true)
  const [offset, setOffset] = useState(0)
  const LIMIT = 10

  const fetchPosts = useCallback(async (isInitial = false) => {
    if (isInitial) {
      setIsLoading(true)
    } else {
      setIsLoadingMore(true)
    }

    try {
      const result = await getPosts({
        limit: LIMIT,
        offset: isInitial ? 0 : offset,
      })

      if (result.success && result.data) {
        if (isInitial) {
          setPosts(result.data as Post[])
          setOffset(LIMIT)
        } else {
          setPosts((prev) => [...prev, ...(result.data as Post[])])
          setOffset((prev) => prev + LIMIT)
        }

        // Check if there are more posts
        if (result.data.length < LIMIT) {
          setHasMore(false)
        }
      }
    } catch (error) {
      console.error("Error fetching posts:", error)
    } finally {
      setIsLoading(false)
      setIsLoadingMore(false)
    }
  }, [offset])

  // Fetch initial posts
  useEffect(() => {
    fetchPosts(true)
  }, [fetchPosts])

  const loadMore = () => {
    fetchPosts(false)
  }

  if (isLoading) {
    return (
      <div className="flex justify-center py-12">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    )
  }

  if (posts.length === 0) {
    return (
      <div className="text-center py-12">
        <p className="text-muted-foreground">
          Belum ada post di komunitas. Jadilah yang pertama!
        </p>
      </div>
    )
  }

  return (
    <div className="space-y-4">
      {posts.map((post) => (
        <PostCard
          key={post.id}
          post={{
            ...post,
            username: post.is_anonymous ? "Anonymous" : (post.users?.username || "User"),
          }}
          currentUserId={userId}
          currentUsername={username}
        />
      ))}

      {hasMore && (
        <div className="flex justify-center pt-4">
          <Button
            variant="outline"
            onClick={loadMore}
            disabled={isLoadingMore}
            className="w-full sm:w-auto"
          >
            {isLoadingMore ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Memuat...
              </>
            ) : (
              "Muat Lebih Banyak"
            )}
          </Button>
        </div>
      )}
    </div>
  )
}
