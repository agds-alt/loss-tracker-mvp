"use client"

import { useState } from "react"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"
import { Switch } from "@/components/ui/switch"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { useToast } from "@/components/ui/use-toast"
import { Image, X, Hash } from "lucide-react"
import { cn } from "@/lib/utils"
import { createPost } from "@/app/actions/posts"
import { useRouter } from "next/navigation"

interface CreatePostModalProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  username: string
}

const postTypes = [
  { value: "story", label: "Cerita", icon: "📖", description: "Bagikan pengalamanmu" },
  { value: "milestone", label: "Milestone", icon: "🎉", description: "Rayakan pencapaian" },
  { value: "support", label: "Dukungan", icon: "💪", description: "Cari atau beri dukungan" },
  { value: "tips", label: "Tips", icon: "💡", description: "Bagikan tips & trik" },
] as const

export function CreatePostModal({ open, onOpenChange, username }: CreatePostModalProps) {
  const [postType, setPostType] = useState<"story" | "milestone" | "support" | "tips">("story")
  const [content, setContent] = useState("")
  const [isAnonymous, setIsAnonymous] = useState(false)
  const [imagePreview, setImagePreview] = useState<string | null>(null)
  const [hashtags, setHashtags] = useState<string[]>([])
  const [hashtagInput, setHashtagInput] = useState("")
  const [isSubmitting, setIsSubmitting] = useState(false)
  const { toast } = useToast()
  const router = useRouter()

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      const reader = new FileReader()
      reader.onloadend = () => {
        setImagePreview(reader.result as string)
      }
      reader.readAsDataURL(file)
    }
  }

  const removeImage = () => {
    setImagePreview(null)
  }

  const addHashtag = () => {
    const tag = hashtagInput.trim().toLowerCase().replace(/^#/, "")
    if (tag && !hashtags.includes(tag) && hashtags.length < 5) {
      setHashtags([...hashtags, tag])
      setHashtagInput("")
    }
  }

  const removeHashtag = (tag: string) => {
    setHashtags(hashtags.filter((t) => t !== tag))
  }

  const handleSubmit = async () => {
    if (!content.trim()) {
      toast({
        title: "Konten kosong",
        description: "Silakan tulis sesuatu sebelum memposting",
        variant: "destructive",
      })
      return
    }

    setIsSubmitting(true)

    try {
      // Create post using server action
      const result = await createPost({
        type: postType,
        content: content.trim(),
        image_url: imagePreview,
        is_anonymous: isAnonymous,
        hashtags: hashtags,
      })

      if (!result.success) {
        throw new Error(result.error)
      }

      toast({
        title: "Post berhasil dibuat!",
        description: "Post kamu telah dipublikasikan ke komunitas",
      })

      // Reset form
      setContent("")
      setPostType("story")
      setIsAnonymous(false)
      setImagePreview(null)
      setHashtags([])
      onOpenChange(false)

      // Refresh the page to show new post
      router.refresh()
    } catch (error) {
      toast({
        title: "Gagal membuat post",
        description: error instanceof Error ? error.message : "Terjadi kesalahan, silakan coba lagi",
        variant: "destructive",
      })
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[600px] max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Buat Post Baru</DialogTitle>
          <DialogDescription>
            Bagikan cerita, pencapaian, atau dukunganmu dengan komunitas
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-4">
          {/* User Info */}
          <div className="flex items-center gap-3">
            <Avatar className="h-10 w-10">
              <AvatarFallback className="bg-primary/10 text-primary font-semibold">
                {isAnonymous ? "?" : username[0]?.toUpperCase() || "U"}
              </AvatarFallback>
            </Avatar>
            <div>
              <p className="font-medium text-sm">
                {isAnonymous ? "Anonymous" : username}
              </p>
              <p className="text-xs text-muted-foreground">
                Posting sebagai {isAnonymous ? "anonim" : "publik"}
              </p>
            </div>
          </div>

          {/* Post Type Selector */}
          <div className="space-y-2">
            <Label>Tipe Post</Label>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
              {postTypes.map((type) => (
                <button
                  key={type.value}
                  onClick={() => setPostType(type.value)}
                  className={cn(
                    "p-3 rounded-lg border-2 transition-all text-left hover:border-primary/50",
                    postType === type.value
                      ? "border-primary bg-primary/5"
                      : "border-border"
                  )}
                >
                  <div className="text-xl mb-1">{type.icon}</div>
                  <div className="text-xs font-medium">{type.label}</div>
                </button>
              ))}
            </div>
          </div>

          {/* Content */}
          <div className="space-y-2">
            <Label htmlFor="content">Konten</Label>
            <Textarea
              id="content"
              placeholder="Bagikan ceritamu di sini..."
              value={content}
              onChange={(e) => setContent(e.target.value)}
              rows={6}
              className="resize-none"
            />
            <p className="text-xs text-muted-foreground text-right">
              {content.length}/2000 karakter
            </p>
          </div>

          {/* Image Upload */}
          <div className="space-y-2">
            <Label>Gambar (Opsional)</Label>
            {imagePreview ? (
              <div className="relative">
                <img
                  src={imagePreview}
                  alt="Preview"
                  className="w-full h-48 object-cover rounded-lg"
                />
                <Button
                  type="button"
                  variant="destructive"
                  size="icon"
                  className="absolute top-2 right-2"
                  onClick={removeImage}
                >
                  <X className="h-4 w-4" />
                </Button>
              </div>
            ) : (
              <label className="flex flex-col items-center justify-center w-full h-32 border-2 border-dashed rounded-lg cursor-pointer hover:bg-accent transition-colors">
                <div className="flex flex-col items-center justify-center pt-5 pb-6">
                  <Image className="h-8 w-8 text-muted-foreground mb-2" />
                  <p className="text-xs text-muted-foreground">
                    Klik untuk upload gambar
                  </p>
                </div>
                <input
                  type="file"
                  className="hidden"
                  accept="image/*"
                  onChange={handleImageUpload}
                />
              </label>
            )}
          </div>

          {/* Hashtags */}
          <div className="space-y-2">
            <Label>Hashtags (Opsional, max 5)</Label>
            <div className="flex gap-2">
              <div className="relative flex-1">
                <Hash className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <input
                  type="text"
                  placeholder="tambah hashtag"
                  value={hashtagInput}
                  onChange={(e) => setHashtagInput(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === "Enter") {
                      e.preventDefault()
                      addHashtag()
                    }
                  }}
                  className="w-full pl-9 pr-3 py-2 text-sm border rounded-md focus:outline-none focus:ring-2 focus:ring-ring"
                  disabled={hashtags.length >= 5}
                />
              </div>
              <Button
                type="button"
                variant="outline"
                onClick={addHashtag}
                disabled={hashtags.length >= 5 || !hashtagInput.trim()}
              >
                Tambah
              </Button>
            </div>
            {hashtags.length > 0 && (
              <div className="flex flex-wrap gap-2">
                {hashtags.map((tag) => (
                  <Badge
                    key={tag}
                    variant="secondary"
                    className="cursor-pointer hover:bg-destructive/10"
                    onClick={() => removeHashtag(tag)}
                  >
                    #{tag}
                    <X className="ml-1 h-3 w-3" />
                  </Badge>
                ))}
              </div>
            )}
          </div>

          {/* Anonymous Toggle */}
          <div className="flex items-center justify-between p-3 rounded-lg border">
            <div className="space-y-0.5">
              <Label htmlFor="anonymous">Post Anonim</Label>
              <p className="text-xs text-muted-foreground">
                Username kamu akan disembunyikan
              </p>
            </div>
            <Switch
              id="anonymous"
              checked={isAnonymous}
              onCheckedChange={setIsAnonymous}
            />
          </div>

          {/* Submit Button */}
          <div className="flex gap-2 pt-4">
            <Button
              type="button"
              variant="outline"
              className="flex-1"
              onClick={() => onOpenChange(false)}
              disabled={isSubmitting}
            >
              Batal
            </Button>
            <Button
              type="button"
              className="flex-1"
              onClick={handleSubmit}
              disabled={isSubmitting || !content.trim()}
            >
              {isSubmitting ? "Memposting..." : "Posting"}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}
