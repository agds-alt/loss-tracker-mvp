"use client"

import { createClient } from '@/lib/supabase/client'
import {
  getSyncQueue,
  markAsSynced,
  clearSyncQueueItem,
  syncLossesFromServer,
} from '@/lib/db/offline-storage'

interface LossData {
  id?: string
  user_id: string
  type: 'judol' | 'crypto'
  site_coin_name: string
  amount: number
  date: string
  notes: string | null
  is_win: boolean
  created_at?: string
  temp_id?: string
}

export class BackgroundSyncService {
  private isSyncing = false
  private syncInterval: NodeJS.Timeout | null = null

  constructor() {
    if (typeof window !== 'undefined') {
      // Listen for online events
      window.addEventListener('online', () => this.syncNow())

      // Periodic sync every 30 seconds when online
      this.syncInterval = setInterval(() => {
        if (navigator.onLine && !this.isSyncing) {
          this.syncNow()
        }
      }, 30000)
    }
  }

  async syncNow(): Promise<{ success: boolean; synced: number; errors: number }> {
    if (this.isSyncing) {
      console.log('Sync already in progress, skipping...')
      return { success: false, synced: 0, errors: 0 }
    }

    this.isSyncing = true
    let syncedCount = 0
    let errorCount = 0

    try {
      const supabase = createClient()

      // Get current user
      const {
        data: { user },
      } = await supabase.auth.getUser()

      if (!user) {
        console.log('No user logged in, skipping sync')
        return { success: false, synced: 0, errors: 0 }
      }

      // First, sync from server to local
      await this.syncFromServer(user.id)

      // Then, sync local changes to server
      const queue = await getSyncQueue()

      console.log(`Syncing ${queue.length} items...`)

      for (const item of queue) {
        try {
          switch (item.action) {
            case 'create':
              await this.syncCreate(item.data, item.id)
              syncedCount++
              break
            case 'update':
              await this.syncUpdate(item.data, item.id)
              syncedCount++
              break
            case 'delete':
              await this.syncDelete(item.data, item.id)
              syncedCount++
              break
          }
        } catch (error) {
          console.error('Sync error for item:', item, error)
          errorCount++
        }
      }

      console.log(`Sync complete: ${syncedCount} synced, ${errorCount} errors`)

      return { success: true, synced: syncedCount, errors: errorCount }
    } catch (error) {
      console.error('Sync failed:', error)
      return { success: false, synced: syncedCount, errors: errorCount + 1 }
    } finally {
      this.isSyncing = false
    }
  }

  private async syncFromServer(userId: string): Promise<void> {
    const supabase = createClient()

    // Fetch all losses from server
    const { data: serverLosses, error } = await supabase
      .from('losses')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: false })

    if (error) {
      console.error('Error fetching from server:', error)
      return
    }

    if (serverLosses && serverLosses.length > 0) {
      // Sync to offline storage
      await syncLossesFromServer(serverLosses)
      console.log(`Synced ${serverLosses.length} losses from server`)
    }
  }

  private async syncCreate(data: LossData, queueId: string): Promise<void> {
    const supabase = createClient()

    // Create on server
    const { data: newLoss, error } = await supabase
      .from('losses')
      .insert({
        user_id: data.user_id,
        type: data.type,
        site_coin_name: data.site_coin_name,
        amount: data.amount,
        date: data.date,
        notes: data.notes,
        is_win: data.is_win,
      })
      .select()
      .single()

    if (error) {
      throw error
    }

    // Mark as synced in local DB
    if (newLoss && data.temp_id) {
      await markAsSynced(data.temp_id, newLoss.id)
    }

    // Clear from sync queue
    await clearSyncQueueItem(queueId)
  }

  private async syncUpdate(data: LossData, queueId: string): Promise<void> {
    const supabase = createClient()

    // Update on server
    const { error } = await supabase
      .from('losses')
      .update({
        type: data.type,
        site_coin_name: data.site_coin_name,
        amount: data.amount,
        date: data.date,
        notes: data.notes,
        is_win: data.is_win,
      })
      .eq('id', data.id)

    if (error) {
      throw error
    }

    // Mark as synced
    await markAsSynced(data.id, data.id)

    // Clear from sync queue
    await clearSyncQueueItem(queueId)
  }

  private async syncDelete(data: LossData, queueId: string): Promise<void> {
    const supabase = createClient()

    // Delete from server
    const { error } = await supabase.from('losses').delete().eq('id', data.id)

    if (error) {
      throw error
    }

    // Clear from sync queue
    await clearSyncQueueItem(queueId)
  }

  destroy() {
    if (this.syncInterval) {
      clearInterval(this.syncInterval)
    }
  }
}

// Singleton instance
let syncService: BackgroundSyncService | null = null

export function getBackgroundSyncService(): BackgroundSyncService {
  if (typeof window === 'undefined') {
    throw new Error('BackgroundSyncService can only be used in the browser')
  }

  if (!syncService) {
    syncService = new BackgroundSyncService()
  }

  return syncService
}
