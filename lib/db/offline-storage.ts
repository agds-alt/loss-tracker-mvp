import { openDB, DBSchema, IDBPDatabase } from 'idb'
import { Database } from '@/types/database.types'

type Loss = Database["public"]["Tables"]["losses"]["Row"]

interface LossTrackerDB extends DBSchema {
  losses: {
    key: string
    value: Loss
    indexes: { 'by-user': string }
  }
  sync_queue: {
    key: string
    value: {
      id: string
      loss?: Loss
      data?: any
      action?: 'create' | 'update' | 'delete'
      timestamp: number
    }
  }
}

let dbPromise: Promise<IDBPDatabase<LossTrackerDB>> | null = null

export function getDB() {
  if (!dbPromise) {
    dbPromise = openDB<LossTrackerDB>('loss-tracker-db', 1, {
      upgrade(db) {
        // Create losses store
        if (!db.objectStoreNames.contains('losses')) {
          const lossStore = db.createObjectStore('losses', { keyPath: 'id' })
          lossStore.createIndex('by-user', 'user_id')
        }

        // Create sync queue store
        if (!db.objectStoreNames.contains('sync_queue')) {
          db.createObjectStore('sync_queue', { keyPath: 'id' })
        }
      },
    })
  }
  return dbPromise
}

export async function saveLossOffline(loss: Loss) {
  const db = await getDB()
  const tx = db.transaction(['losses', 'sync_queue'], 'readwrite')

  // Save to losses store
  await tx.objectStore('losses').put(loss)

  // Add to sync queue
  await tx.objectStore('sync_queue').put({
    id: `sync_${Date.now()}_${Math.random()}`,
    loss,
    timestamp: Date.now(),
  })

  await tx.done
}

export async function getOfflineLosses(userId: string): Promise<Loss[]> {
  const db = await getDB()
  const allLosses = await db.getAllFromIndex('losses', 'by-user', userId)
  return allLosses
}

export async function getSyncQueue() {
  const db = await getDB()
  return await db.getAll('sync_queue')
}

export async function clearSyncQueue() {
  const db = await getDB()
  const tx = db.transaction('sync_queue', 'readwrite')
  await tx.objectStore('sync_queue').clear()
  await tx.done
}

export async function removeSyncedLoss(syncId: string) {
  const db = await getDB()
  await db.delete('sync_queue', syncId)
}

export async function markAsSynced(tempId: string, serverId: string) {
  const db = await getDB()
  const tx = db.transaction('losses', 'readwrite')
  
  // Get the loss with temp ID
  const loss = await tx.objectStore('losses').get(tempId)
  
  if (loss) {
    // Delete old entry with temp ID
    await tx.objectStore('losses').delete(tempId)
    
    // Add new entry with server ID
    loss.id = serverId
    await tx.objectStore('losses').put(loss)
  }
  
  await tx.done
}

export async function clearSyncQueueItem(queueId: string) {
  const db = await getDB()
  await db.delete('sync_queue', queueId)
}

export async function syncLossesFromServer(serverLosses: Loss[]) {
  const db = await getDB()
  const tx = db.transaction('losses', 'readwrite')
  
  for (const loss of serverLosses) {
    await tx.objectStore('losses').put(loss)
  }
  
  await tx.done
}
