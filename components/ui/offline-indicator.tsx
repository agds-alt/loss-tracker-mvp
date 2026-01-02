"use client"

import { useOnlineStatus } from '@/hooks/use-online-status'
import { WifiOff, Wifi, CheckCircle2 } from 'lucide-react'
import { cn } from '@/lib/utils'

export function OfflineIndicator() {
  const { isOnline, wasOffline } = useOnlineStatus()

  // Show reconnected message briefly
  if (wasOffline && isOnline) {
    return (
      <div className="fixed bottom-4 right-4 z-50 animate-in slide-in-from-bottom-5">
        <div className="flex items-center gap-2 bg-clean text-clean-foreground px-4 py-3 rounded-lg shadow-lg">
          <CheckCircle2 className="h-5 w-5" />
          <div>
            <p className="font-semibold text-sm">Back Online!</p>
            <p className="text-xs opacity-90">Syncing your data...</p>
          </div>
        </div>
      </div>
    )
  }

  // Show offline indicator
  if (!isOnline) {
    return (
      <div className="fixed bottom-4 right-4 z-50 animate-in slide-in-from-bottom-5">
        <div className="flex items-center gap-2 bg-destructive text-destructive-foreground px-4 py-3 rounded-lg shadow-lg">
          <WifiOff className="h-5 w-5" />
          <div>
            <p className="font-semibold text-sm">Offline Mode</p>
            <p className="text-xs opacity-90">Your data will sync when online</p>
          </div>
        </div>
      </div>
    )
  }

  // Show subtle online indicator in header
  return (
    <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
      <Wifi className={cn("h-3.5 w-3.5", isOnline && "text-clean")} />
      <span className="hidden sm:inline">
        {isOnline ? 'Online' : 'Offline'}
      </span>
    </div>
  )
}
