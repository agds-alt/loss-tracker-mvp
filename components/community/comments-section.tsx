"use client"

import { useState, useEffect } from "react"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { useToast } from "@/components/ui/use-toast"
import { Heart, Reply, MoreVertical, Trash2, Flag, Loader2 } from "lucide-react"
import { cn } from "@/lib/utils"
import { formatDistanceToNow } from "date-fns"
import { id } from "date-fns/locale"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { createComment, getComments, toggleCommentLike, deleteComment } from "@/app/actions/comments"

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

function CommentItem({
  comment,
  currentUserId,
  currentUsername,
  onReply,
  onDelete,
  isReply = false,
}: {
  comment: Comment
  currentUserId: string
  currentUsername: string
  onReply: (commentId: string, username: string) => void
  onDelete: (commentId: string) => void
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

  const handleLike = async () => {
    // Optimistic update
    const previousLiked = isLiked
    const previousCount = likesCount

    if (isLiked) {
      setIsLiked(false)
      setLikesCount(likesCount - 1)
    } else {
      setIsLiked(true)
      setLikesCount(likesCount + 1)
    }

    try {
      const result = await toggleCommentLike(comment.id)
      if (!result.success) {
        // Revert on error
        setIsLiked(previousLiked)
        setLikesCount(previousCount)
        toast({
          title: "Gagal update like",
          description: result.error,
          variant: "destructive",
        })
      }
    } catch {
      // Revert on error
      setIsLiked(previousLiked)
      setLikesCount(previousCount)
      toast({
        title: "Gagal update like",
        description: "Silakan coba lagi",
        variant: "destructive",
      })
    }
  }

  const handleDelete = async () => {
    if (!confirm("Yakin mau hapus komentar ini?")) return

    try {
      const result = await deleteComment(comment.id)
      if (result.success) {
        toast({
          title: "Komentar berhasil dihapus",
        })
        onDelete(comment.id)
      } else {
        toast({
          title: "Gagal hapus komentar",
          description: result.error,
          variant: "destructive",
        })
      }
    } catch {
      toast({
        title: "Gagal hapus komentar",
        description: "Silakan coba lagi",
        variant: "destructive",
      })
    }
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
                onDelete={onDelete}
                isReply={true}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  )
}

export function CommentsSection({ postId, currentUserId, currentUsername }: CommentsSectionProps) {
  const [comments, setComments] = useState<Comment[]>([])
  const [newComment, setNewComment] = useState("")
  const [replyingTo, setReplyingTo] = useState<{ id: string; username: string } | null>(null)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [isLoading, setIsLoading] = useState(true)
  const { toast } = useToast()

  // Fetch comments on mount
  useEffect(() => {
    const fetchComments = async () => {
      setIsLoading(true)
      try {
        const result = await getComments(postId)
        if (result.success && result.data) {
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          setComments(result.data as any[])
        }
      } catch (error) {
        console.error("Error fetching comments:", error)
      } finally {
        setIsLoading(false)
      }
    }

    fetchComments()
  }, [postId])

  const handleSubmit = async () => {
    if (!newComment.trim()) return

    setIsSubmitting(true)

    try {
      const result = await createComment({
        post_id: postId,
        content: newComment.trim(),
        parent_comment_id: replyingTo?.id || null,
      })

      if (result.success) {
        toast({
          title: "Komentar berhasil",
          description: replyingTo ? "Balasan kamu telah ditambahkan" : "Komentar kamu telah ditambahkan",
        })

        setNewComment("")
        setReplyingTo(null)

        // Refetch comments
        const refreshResult = await getComments(postId)
        if (refreshResult.success && refreshResult.data) {
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          setComments(refreshResult.data as any[])
        }
      } else {
        toast({
          title: "Gagal menambah komentar",
          description: result.error,
          variant: "destructive",
        })
      }
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

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const handleCommentDelete = async (_commentId: string) => {
    // Refetch comments after delete
    const result = await getComments(postId)
    if (result.success && result.data) {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      setComments(result.data as any[])
    }
  }

  const handleReply = (commentId: string, username: string) => {
    setReplyingTo({ id: commentId, username })
    // Focus on textarea
    const textarea = document.querySelector('textarea[placeholder*="Tambahkan komentar"]') as HTMLTextAreaElement
    textarea?.focus()
  }

  if (isLoading) {
    return (
      <div className="flex justify-center py-8">
        <Loader2 className="h-6 w-6 animate-spin text-primary" />
      </div>
    )
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
              onDelete={handleCommentDelete}
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
