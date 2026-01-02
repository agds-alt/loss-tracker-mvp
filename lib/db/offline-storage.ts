import { openDB, DBSchema, IDBPDatabase } from 'idb'

interface Loss {
  id: string
  user_id: string
  type: 'judol' | 'crypto'
  site_coin_name: string
  amount: number
  date: string
  notes: string | null
  is_win: boolean
  created_at: string
  synced: boolean
  temp_id?: string // For offline-created entries
}

interface LossTrackerDB extends DBSchema {
  losses: {
    key: string
    value: Loss
    indexes: {
      'by-synced': boolean
      'by-user': string
      'by-date': string
    }
  }
  sync_queue: {
    key: string
    value: {
      id: string
      action: 'create' | 'update' | 'delete'
      data: Loss
      timestamp: number
    }
    indexes: {
      'by-timestamp': number
    }
  }
}

let dbInstance: IDBPDatabase<LossTrackerDB> | null = null

export async function initDB(): Promise<IDBPDatabase<LossTrackerDB>> {
  if (dbInstance) {
    return dbInstance
  }

  dbInstance = await openDB<LossTrackerDB>('loss-tracker-db', 1, {
    upgrade(db) {
      // Create losses store
      if (!db.objectStoreNames.contains('losses')) {
        const lossStore = db.createObjectStore('losses', { keyPath: 'id' })
        lossStore.createIndex('by-synced', 'synced')
        lossStore.createIndex('by-user', 'user_id')
        lossStore.createIndex('by-date', 'date')
      }

      // Create sync queue store
      if (!db.objectStoreNames.contains('sync_queue')) {
        const syncStore = db.createObjectStore('sync_queue', { keyPath: 'id' })
        syncStore.createIndex('by-timestamp', 'timestamp')
      }
    },
  })

  return dbInstance
}

// Save loss to offline storage
export async function saveLossOffline(loss: Omit<Loss, 'synced' | 'temp_id'>): Promise<string> {
  const db = await initDB()
  const tempId = `temp_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`

  const lossWithSync: Loss = {
    ...loss,
    synced: false,
    temp_id: tempId,
  }

  await db.put('losses', lossWithSync)

  // Add to sync queue
  await db.put('sync_queue', {
    id: tempId,
    action: 'create',
    data: lossWithSync,
    timestamp: Date.now(),
  })

  return tempId
}

// Update loss in offline storage
export async function updateLossOffline(id: string, updates: Partial<Loss>): Promise<void> {
  const db = await initDB()
  const existingLoss = await db.get('losses', id)

  if (!existingLoss) {
    throw new Error('Loss not found in offline storage')
  }

  const updatedLoss: Loss = {
    ...existingLoss,
    ...updates,
    synced: false,
  }

  await db.put('losses', updatedLoss)

  // Add to sync queue
  await db.put('sync_queue', {
    id: `update_${Date.now()}_${id}`,
    action: 'update',
    data: updatedLoss,
    timestamp: Date.now(),
  })
}

// Delete loss from offline storage
export async function deleteLossOffline(id: string): Promise<void> {
  const db = await initDB()
  const existingLoss = await db.get('losses', id)

  if (!existingLoss) {
    throw new Error('Loss not found in offline storage')
  }

  await db.delete('losses', id)

  // Add to sync queue
  await db.put('sync_queue', {
    id: `delete_${Date.now()}_${id}`,
    action: 'delete',
    data: existingLoss,
    timestamp: Date.now(),
  })
}

// Get all losses from offline storage
export async function getAllLossesOffline(userId: string): Promise<Loss[]> {
  const db = await initDB()
  const allLosses = await db.getAllFromIndex('losses', 'by-user', userId)
  return allLosses.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
}

// Get unsynced losses
export async function getUnsyncedLosses(): Promise<Loss[]> {
  const db = await initDB()
  return db.getAllFromIndex('losses', 'by-synced', false)
}

// Get sync queue
export async function getSyncQueue() {
  const db = await initDB()
  const queue = await db.getAllFromIndex('sync_queue', 'by-timestamp')
  return queue.sort((a, b) => a.timestamp - b.timestamp)
}

// Mark loss as synced
export async function markAsSynced(tempId: string, realId: string): Promise<void> {
  const db = await initDB()
  const loss = await db.get('losses', tempId)

  if (loss) {
    // Update with real ID from server
    await db.delete('losses', tempId)
    await db.put('losses', {
      ...loss,
      id: realId,
      synced: true,
      temp_id: undefined,
    })
  }

  // Remove from sync queue
  await db.delete('sync_queue', tempId)
}

// Clear sync queue item
export async function clearSyncQueueItem(queueId: string): Promise<void> {
  const db = await initDB()
  await db.delete('sync_queue', queueId)
}

// Sync all losses from server to offline storage
export async function syncLossesFromServer(losses: Omit<Loss, 'synced'>[]): Promise<void> {
  const db = await initDB()
  const tx = db.transaction('losses', 'readwrite')

  for (const loss of losses) {
    await tx.store.put({
      ...loss,
      synced: true,
    })
  }

  await tx.done
}

// Clear all offline data (for logout)
export async function clearOfflineData(): Promise<void> {
  const db = await initDB()
  await db.clear('losses')
  await db.clear('sync_queue')
}

// Check if offline storage has data
export async function hasOfflineData(): Promise<boolean> {
  const db = await initDB()
  const count = await db.count('losses')
  return count > 0
}
