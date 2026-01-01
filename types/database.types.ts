export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export interface Database {
  public: {
    Tables: {
      users: {
        Row: {
          id: string
          email: string
          username: string
          created_at: string
          avatar_url: string | null
        }
        Insert: {
          id: string
          email: string
          username: string
          created_at?: string
          avatar_url?: string | null
        }
        Update: {
          id?: string
          email?: string
          username?: string
          created_at?: string
          avatar_url?: string | null
        }
      }
      losses: {
        Row: {
          id: string
          user_id: string
          type: 'judol' | 'crypto'
          site_coin_name: string
          amount: number
          date: string
          notes: string | null
          is_win: boolean
          created_at: string
        }
        Insert: {
          id?: string
          user_id: string
          type: 'judol' | 'crypto'
          site_coin_name: string
          amount: number
          date: string
          notes?: string | null
          is_win?: boolean
          created_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          type?: 'judol' | 'crypto'
          site_coin_name?: string
          amount?: number
          date?: string
          notes?: string | null
          is_win?: boolean
          created_at?: string
        }
      }
      user_stats: {
        Row: {
          id: string
          user_id: string
          last_judol_date: string | null
          clean_days: number
          total_judol_loss: number
          total_crypto_loss: number
          total_judol_win: number
          total_crypto_win: number
          net_judol: number
          net_crypto: number
          updated_at: string
        }
        Insert: {
          id?: string
          user_id: string
          last_judol_date?: string | null
          clean_days?: number
          total_judol_loss?: number
          total_crypto_loss?: number
          total_judol_win?: number
          total_crypto_win?: number
          net_judol?: number
          net_crypto?: number
          updated_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          last_judol_date?: string | null
          clean_days?: number
          total_judol_loss?: number
          total_crypto_loss?: number
          total_judol_win?: number
          total_crypto_win?: number
          net_judol?: number
          net_crypto?: number
          updated_at?: string
        }
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      [_ in never]: never
    }
    Enums: {
      loss_type: 'judol' | 'crypto'
    }
  }
}
