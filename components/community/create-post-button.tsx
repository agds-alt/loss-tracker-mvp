"use client"

import { useState } from "react"
import { Card, CardContent } from "@/components/ui/card"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { CreatePostModal } from "./create-post-modal"

interface CreatePostButtonProps {
  username: string
}

export function CreatePostButton({ username }: CreatePostButtonProps) {
  const [showModal, setShowModal] = useState(false)

  return (
    <>
      <Card className="cursor-pointer hover:shadow-md transition-shadow" onClick={() => setShowModal(true)}>
        <CardContent className="p-4">
          <div className="flex items-center gap-3">
            <Avatar className="h-10 w-10 flex-shrink-0">
              <AvatarFallback className="bg-primary/10 text-primary font-semibold">
                {username[0]?.toUpperCase() || "U"}
              </AvatarFallback>
            </Avatar>
            <div className="flex-1 px-4 py-2.5 rounded-full bg-muted text-muted-foreground text-sm">
              Apa yang ingin kamu bagikan hari ini?
            </div>
          </div>
        </CardContent>
      </Card>

      <CreatePostModal
        open={showModal}
        onOpenChange={setShowModal}
        username={username}
      />
    </>
  )
}
