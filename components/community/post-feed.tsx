"use client"

import { useState } from "react"
import { PostCard } from "./post-card"
import { Button } from "@/components/ui/button"
import { Loader2 } from "lucide-react"

interface PostFeedProps {
  userId: string
  username: string
}

// Mock data for posts
const mockPosts = [
  {
    id: "1",
    user_id: "user1",
    username: "progress_champ",
    type: "milestone" as const,
    content: "Akhirnya clean 30 hari! Dari yang dulu loss jutaan setiap minggu, sekarang udah bisa tahan. Terima kasih support dari temen-temen di sini! 💪",
    image_url: null,
    is_anonymous: false,
    hashtags: ["clean30days", "milestone", "grateful"],
    created_at: "2024-01-02T10:30:00Z",
    reactions: {
      support: 24,
      love: 15,
      congrats: 31,
    },
    comments_count: 12,
    user_reaction: "congrats" as const,
  },
  {
    id: "2",
    user_id: "user2",
    username: "Anonymous",
    type: "support" as const,
    content: "Hari ini gw kena trigger lagi liat temen menang besar. Gimana cara kalian handle FOMO kayak gini? Butuh saran soalnya gw hampir relapse...",
    image_url: null,
    is_anonymous: true,
    hashtags: ["needhelp", "fomo"],
    created_at: "2024-01-02T09:15:00Z",
    reactions: {
      support: 18,
      love: 8,
      congrats: 0,
    },
    comments_count: 23,
    user_reaction: "support" as const,
  },
  {
    id: "3",
    user_id: "user3",
    username: "comeback_king",
    type: "story" as const,
    content: "Cerita gw dari -50 juta jadi break even dalam 8 bulan. Kunci utama: konsisten tracking, gabung support group, dan fokus improve diri. Sekarang malah bisa nabung buat usaha. Recovery itu nyata guys! 🚀",
    image_url: null,
    is_anonymous: false,
    hashtags: ["recoveryjourney", "inspiration"],
    created_at: "2024-01-02T08:00:00Z",
    reactions: {
      support: 42,
      love: 28,
      congrats: 35,
    },
    comments_count: 34,
    user_reaction: null,
  },
  {
    id: "4",
    user_id: "user4",
    username: "smart_saver",
    type: "tips" as const,
    content: "Tips dari gw buat yang baru mulai clean:\n1. Block semua akses ke platform judi/trading\n2. Kasih duit ke orang terdekat yang bisa dipercaya\n3. Isi waktu luang dengan hobi baru\n4. Join komunitas support\n5. Tracking progress setiap hari\n\nYang penting konsisten! 💡",
    image_url: null,
    is_anonymous: false,
    hashtags: ["tips", "recovery", "newbie"],
    created_at: "2024-01-01T20:30:00Z",
    reactions: {
      support: 56,
      love: 12,
      congrats: 8,
    },
    comments_count: 18,
    user_reaction: "support" as const,
  },
]

export function PostFeed({ userId, username }: PostFeedProps) {
  const [posts] = useState(mockPosts)
  const [isLoading, setIsLoading] = useState(false)
  const [hasMore, setHasMore] = useState(true)

  const loadMore = async () => {
    setIsLoading(true)
    // Simulate API call
    await new Promise((resolve) => setTimeout(resolve, 1000))
    // In real implementation, load more posts from API
    setHasMore(false)
    setIsLoading(false)
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
          post={post}
          currentUserId={userId}
          currentUsername={username}
        />
      ))}

      {hasMore && (
        <div className="flex justify-center pt-4">
          <Button
            variant="outline"
            onClick={loadMore}
            disabled={isLoading}
            className="w-full sm:w-auto"
          >
            {isLoading ? (
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
