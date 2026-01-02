// Helper functions to work around Supabase type inference issues

import type { SupabaseClient } from '@supabase/supabase-js'

export async function insertLoss(
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  supabase: SupabaseClient<any>,
  data: {
    user_id: string
    type: 'judol' | 'crypto'
    site_coin_name: string
    amount: number
    date: string
    notes?: string
    is_win: boolean
  }
) {
  // eslint-disable-next-line @typescript-eslint/ban-ts-comment
  // @ts-ignore - Supabase type inference issue with generated types
  return supabase.from('losses').insert(data)
}

export async function updateLoss(
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  supabase: SupabaseClient<any>,
  id: string,
  data: {
    type: 'judol' | 'crypto'
    site_coin_name: string
    amount: number
    date: string
    notes?: string
    is_win: boolean
  }
) {
  // eslint-disable-next-line @typescript-eslint/ban-ts-comment
  // @ts-ignore - Supabase type inference issue with generated types
  return supabase.from('losses').update(data).eq('id', id)
}
