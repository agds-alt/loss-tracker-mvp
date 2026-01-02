// Helper functions to work around Supabase type inference issues

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export function insertLoss(
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  supabase: any,
  data: {
    user_id: string
    type: 'judol' | 'crypto'
    site_coin_name: string
    amount: number
    date: string
    notes?: string | null
    is_win: boolean
  }
) {
  return supabase.from('losses').insert(data)
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export function updateLoss(
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  supabase: any,
  id: string,
  data: {
    type: 'judol' | 'crypto'
    site_coin_name: string
    amount: number
    date: string
    notes?: string | null
    is_win: boolean
  }
) {
  return supabase.from('losses').update(data).eq('id', id)
}
