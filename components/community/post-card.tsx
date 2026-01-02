"use client"

import { useState } from "react"
import { Card, CardContent } from "@/components/ui/card"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { useToast } from "@/components/ui/use-toast"
import { MessageCircle, MoreVertical, Flag, Trash2, Edit } from "lucide-react"
import { cn } from "@/lib/utils"
import { formatDistanceToNow } from "date-fns"
import { id } from "date-fns/locale"
import { CommentsSection } from "./comments-section"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"

interface Post {
  id: string
  user_id: string
  username: string
  type: "story" | "milestone" | "support" | "tips"
  content: string
  image_url: string | null
  is_anonymous: boolean
  hashtags: string[]
  created_at: string
  reactions: {
    support: number
    love: number
    congrats: number
  }
  comments_count: number
  user_reaction: "support" | "love" | "congrats" | null
}

interface PostCardProps {
  post: Post
  currentUserId: string
  currentUsername: string
}

const postTypeConfig = {
  story: { label: "Cerita", icon: "📖", color: "bg-blue-500/10 text-blue-700 border-blue-200" },
  milestone: { label: "Milestone", icon: "🎉", color: "bg-green-500/10 text-green-700 border-green-200" },
  support: { label: "Dukungan", icon: "💪", color: "bg-orange-500/10 text-orange-700 border-orange-200" },
  tips: { label: "Tips", icon: "💡", color: "bg-purple-500/10 text-purple-700 border-purple-200" },
}

const reactionConfig = {
  support: { emoji: "💪", label: "Support", color: "hover:bg-orange-50 hover:text-orange-600" },
  love: { emoji: "❤️", label: "Love", color: "hover:bg-red-50 hover:text-red-600" },
  congrats: { emoji: "🎉", label: "Congrats", color: "hover:bg-green-50 hover:text-green-600" },
}

export function PostCard({ post, currentUserId, currentUsername }: PostCardProps) {
  const [showComments, setShowComments] = useState(false)
  const [currentReaction, setCurrentReaction] = useState<"support" | "love" | "congrats" | null>(
    post.user_reaction
  )
  const [reactionCounts, setReactionCounts] = useState(post.reactions)
  const { toast } = useToast()

  const isOwnPost = post.user_id === currentUserId && !post.is_anonymous
  const typeConfig = postTypeConfig[post.type]

  const handleReaction = (type: "support" | "love" | "congrats") => {
    if (currentReaction === type) {
      // Remove reaction
      setCurrentReaction(null)
      setReactionCounts({
        ...reactionCounts,
        [type]: reactionCounts[type] - 1,
      })
    } else {
      // Add or change reaction
      const newCounts = { ...reactionCounts }
      if (currentReaction) {
        newCounts[currentReaction] -= 1
      }
      newCounts[type] += 1
      setCurrentReaction(type)
      setReactionCounts(newCounts)
    }

    // TODO: Send API request to update reaction
  }

  const handleDelete = () => {
    toast({
      title: "Post akan dihapus",
      description: "Fitur ini akan segera hadir!",
    })
  }

  const handleReport = () => {
    toast({
      title: "Laporan dikirim",
      description: "Terima kasih, kami akan review post ini",
    })
  }

  const timeAgo = formatDistanceToNow(new Date(post.created_at), {
    addSuffix: true,
    locale: id,
  })

  return (
    <Card className="hover:shadow-md transition-shadow">
      <CardContent className="p-4 sm:p-6">
        {/* Header */}
        <div className="flex items-start justify-between mb-4">
          <div className="flex items-center gap-3 flex-1 min-w-0">
            <Avatar className="h-10 w-10 flex-shrink-0">
              <AvatarFallback className="bg-primary/10 text-primary font-semibold">
                {post.is_anonymous ? "?" : post.username[0]?.toUpperCase() || "U"}
              </AvatarFallback>
            </Avatar>
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 flex-wrap">
                <p className="font-semibold text-sm truncate">
                  {post.is_anonymous ? "Anonymous" : post.username}
                </p>
                <Badge variant="outline" className={cn("text-xs", typeConfig.color)}>
                  {typeConfig.icon} {typeConfig.label}
                </Badge>
              </div>
              <p className="text-xs text-muted-foreground">{timeAgo}</p>
            </div>
          </div>

          {/* Menu */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="icon" className="h-8 w-8 flex-shrink-0">
                <MoreVertical className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              {isOwnPost ? (
                <>
                  <DropdownMenuItem>
                    <Edit className="mr-2 h-4 w-4" />
                    Edit
                  </DropdownMenuItem>
                  <DropdownMenuItem className="text-destructive" onClick={handleDelete}>
                    <Trash2 className="mr-2 h-4 w-4" />
                    Hapus
                  </DropdownMenuItem>
                </>
              ) : (
                <DropdownMenuItem onClick={handleReport}>
                  <Flag className="mr-2 h-4 w-4" />
                  Laporkan
                </DropdownMenuItem>
              )}
            </DropdownMenuContent>
          </DropdownMenu>
        </div>

        {/* Content */}
        <div className="mb-4">
          <p className="text-sm sm:text-base whitespace-pre-wrap break-words">{post.content}</p>
        </div>

        {/* Image */}
        {post.image_url && (
          <div className="mb-4">
            <img
              src={post.image_url}
              alt="Post image"
              className="w-full rounded-lg max-h-96 object-cover"
            />
          </div>
        )}

        {/* Hashtags */}
        {post.hashtags.length > 0 && (
          <div className="flex flex-wrap gap-2 mb-4">
            {post.hashtags.map((tag) => (
              <Badge key={tag} variant="secondary" className="text-xs cursor-pointer hover:bg-secondary/80">
                #{tag}
              </Badge>
            ))}
          </div>
        )}

        {/* Reactions */}
        <div className="flex items-center gap-2 pb-4 border-b">
          {Object.entries(reactionConfig).map(([type, config]) => {
            const isActive = currentReaction === type
            const count = reactionCounts[type as keyof typeof reactionCounts]

            return (
              <button
                key={type}
                onClick={() => handleReaction(type as "support" | "love" | "congrats")}
                className={cn(
                  "flex items-center gap-1.5 px-3 py-1.5 rounded-full border transition-all text-sm",
                  isActive
                    ? "bg-primary/10 border-primary text-primary font-medium"
                    : "hover:bg-accent border-transparent",
                  config.color
                )}
              >
                <span className="text-base">{config.emoji}</span>
                <span className="text-xs sm:text-sm">{count}</span>
              </button>
            )
          })}
        </div>

        {/* Comments Toggle */}
        <div className="pt-4">
          <Button
            variant="ghost"
            size="sm"
            className="w-full justify-center gap-2 text-muted-foreground hover:text-foreground"
            onClick={() => setShowComments(!showComments)}
          >
            <MessageCircle className="h-4 w-4" />
            <span className="text-sm">
              {post.comments_count} Komentar
            </span>
          </Button>

          {/* Comments Section */}
          {showComments && (
            <div className="mt-4 pt-4 border-t">
              <CommentsSection
                postId={post.id}
                currentUserId={currentUserId}
                currentUsername={currentUsername}
              />
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  )
}
