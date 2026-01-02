"use client"

import { useState } from "react"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { useToast } from "@/components/ui/use-toast"
import { Heart, Reply, MoreVertical, Trash2, Flag } from "lucide-react"
import { cn } from "@/lib/utils"
import { formatDistanceToNow } from "date-fns"
import { id } from "date-fns/locale"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"

interface Comment {
  id: string
  user_id: string
  username: string
  content: string
  created_at: string
  likes_count: number
  is_liked: boolean
  parent_comment_id: string | null
  replies?: Comment[]
}

interface CommentsSectionProps {
  postId: string
  currentUserId: string
  currentUsername: string
}

// Mock comments data
const mockComments: Comment[] = [
  {
    id: "c1",
    user_id: "user5",
    username: "supporter_123",
    content: "Mantap bro! Keep it up! Gw juga lagi di hari ke-25, semoga bisa kayak lu 💪",
    created_at: "2024-01-02T10:45:00Z",
    likes_count: 5,
    is_liked: true,
    parent_comment_id: null,
    replies: [
      {
        id: "c1-r1",
        user_id: "user1",
        username: "progress_champ",
        content: "Thanks bro! Lu pasti bisa, yang penting konsisten!",
        created_at: "2024-01-02T11:00:00Z",
        likes_count: 2,
        is_liked: false,
        parent_comment_id: "c1",
      },
    ],
  },
  {
    id: "c2",
    user_id: "user6",
    username: "motivator_daily",
    content: "Inspiring banget! Bukti nyata kalo recovery itu possible. Thanks for sharing!",
    created_at: "2024-01-02T11:30:00Z",
    likes_count: 8,
    is_liked: false,
    parent_comment_id: null,
  },
]

function CommentItem({
  comment,
  currentUserId,
  currentUsername,
  onReply,
  isReply = false,
}: {
  comment: Comment
  currentUserId: string
  currentUsername: string
  onReply: (commentId: string, username: string) => void
  isReply?: boolean
}) {
  const [isLiked, setIsLiked] = useState(comment.is_liked)
  const [likesCount, setLikesCount] = useState(comment.likes_count)
  const { toast } = useToast()

  const isOwnComment = comment.user_id === currentUserId
  const timeAgo = formatDistanceToNow(new Date(comment.created_at), {
    addSuffix: true,
    locale: id,
  })

  const handleLike = () => {
    if (isLiked) {
      setIsLiked(false)
      setLikesCount(likesCount - 1)
    } else {
      setIsLiked(true)
      setLikesCount(likesCount + 1)
    }
    // TODO: Send API request
  }

  const handleDelete = () => {
    toast({
      title: "Komentar akan dihapus",
      description: "Fitur ini akan segera hadir!",
    })
  }

  const handleReport = () => {
    toast({
      title: "Laporan dikirim",
      description: "Terima kasih, kami akan review komentar ini",
    })
  }

  return (
    <div className={cn("flex gap-3", isReply && "ml-12")}>
      <Avatar className="h-8 w-8 flex-shrink-0">
        <AvatarFallback className="bg-muted text-xs font-semibold">
          {comment.username[0]?.toUpperCase() || "U"}
        </AvatarFallback>
      </Avatar>

      <div className="flex-1 min-w-0">
        <div className="flex items-center justify-between gap-2">
          <div className="flex items-center gap-2 flex-wrap">
            <p className="font-semibold text-sm">{comment.username}</p>
            <p className="text-xs text-muted-foreground">{timeAgo}</p>
          </div>

          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="icon" className="h-6 w-6">
                <MoreVertical className="h-3 w-3" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              {isOwnComment ? (
                <DropdownMenuItem className="text-destructive" onClick={handleDelete}>
                  <Trash2 className="mr-2 h-3 w-3" />
                  Hapus
                </DropdownMenuItem>
              ) : (
                <DropdownMenuItem onClick={handleReport}>
                  <Flag className="mr-2 h-3 w-3" />
                  Laporkan
                </DropdownMenuItem>
              )}
            </DropdownMenuContent>
          </DropdownMenu>
        </div>

        <p className="text-sm mt-1 break-words whitespace-pre-wrap">{comment.content}</p>

        <div className="flex items-center gap-4 mt-2">
          <button
            onClick={handleLike}
            className={cn(
              "flex items-center gap-1 text-xs transition-colors",
              isLiked ? "text-red-500" : "text-muted-foreground hover:text-red-500"
            )}
          >
            <Heart className={cn("h-3 w-3", isLiked && "fill-current")} />
            <span>{likesCount > 0 && likesCount}</span>
          </button>

          {!isReply && (
            <button
              onClick={() => onReply(comment.id, comment.username)}
              className="flex items-center gap-1 text-xs text-muted-foreground hover:text-foreground transition-colors"
            >
              <Reply className="h-3 w-3" />
              <span>Balas</span>
            </button>
          )}
        </div>

        {/* Replies */}
        {!isReply && comment.replies && comment.replies.length > 0 && (
          <div className="mt-3 space-y-3">
            {comment.replies.map((reply) => (
              <CommentItem
                key={reply.id}
                comment={reply}
                currentUserId={currentUserId}
                currentUsername={currentUsername}
                onReply={onReply}
                isReply={true}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  )
}

export function CommentsSection({ currentUserId, currentUsername }: CommentsSectionProps) {
  const [comments] = useState<Comment[]>(mockComments)
  const [newComment, setNewComment] = useState("")
  const [replyingTo, setReplyingTo] = useState<{ id: string; username: string } | null>(null)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const { toast } = useToast()

  const handleSubmit = async () => {
    if (!newComment.trim()) return

    setIsSubmitting(true)

    try {
      // TODO: Send API request to create comment
      await new Promise((resolve) => setTimeout(resolve, 500))

      toast({
        title: "Komentar berhasil",
        description: replyingTo ? "Balasan kamu telah ditambahkan" : "Komentar kamu telah ditambahkan",
      })

      setNewComment("")
      setReplyingTo(null)
    } catch {
      toast({
        title: "Gagal menambah komentar",
        description: "Silakan coba lagi",
        variant: "destructive",
      })
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleReply = (commentId: string, username: string) => {
    setReplyingTo({ id: commentId, username })
    // Focus on textarea
    const textarea = document.querySelector('textarea[placeholder*="Tambahkan komentar"]') as HTMLTextAreaElement
    textarea?.focus()
  }

  return (
    <div className="space-y-4">
      {/* Add Comment */}
      <div className="flex gap-3">
        <Avatar className="h-8 w-8 flex-shrink-0">
          <AvatarFallback className="bg-primary/10 text-primary text-xs font-semibold">
            {currentUsername[0]?.toUpperCase() || "U"}
          </AvatarFallback>
        </Avatar>

        <div className="flex-1 space-y-2">
          {replyingTo && (
            <div className="flex items-center gap-2 text-xs text-muted-foreground">
              <Reply className="h-3 w-3" />
              <span>Membalas @{replyingTo.username}</span>
              <button
                onClick={() => setReplyingTo(null)}
                className="text-destructive hover:underline"
              >
                Batal
              </button>
            </div>
          )}

          <div className="space-y-2">
            <Textarea
              placeholder="Tambahkan komentar..."
              value={newComment}
              onChange={(e) => setNewComment(e.target.value)}
              rows={2}
              className="resize-none text-sm"
            />
            <div className="flex justify-end">
              <Button
                size="sm"
                onClick={handleSubmit}
                disabled={!newComment.trim() || isSubmitting}
              >
                {isSubmitting ? "Mengirim..." : replyingTo ? "Balas" : "Kirim"}
              </Button>
            </div>
          </div>
        </div>
      </div>

      {/* Comments List */}
      {comments.length > 0 ? (
        <div className="space-y-4">
          {comments.map((comment) => (
            <CommentItem
              key={comment.id}
              comment={comment}
              currentUserId={currentUserId}
              currentUsername={currentUsername}
              onReply={handleReply}
            />
          ))}
        </div>
      ) : (
        <p className="text-center text-sm text-muted-foreground py-4">
          Belum ada komentar. Jadilah yang pertama!
        </p>
      )}
    </div>
  )
}
