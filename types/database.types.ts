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
      leaderboard_cache: {
        Row: {
          id: string
          user_id: string
          category: 'clean_days' | 'turnaround' | 'improved'
          rank: number
          stats_json: Json
          updated_at: string
        }
        Insert: {
          id?: string
          user_id: string
          category: 'clean_days' | 'turnaround' | 'improved'
          rank: number
          stats_json?: Json
          updated_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          category?: 'clean_days' | 'turnaround' | 'improved'
          rank?: number
          stats_json?: Json
          updated_at?: string
        }
      }
      posts: {
        Row: {
          id: string
          user_id: string | null
          type: 'story' | 'milestone' | 'support' | 'tips'
          content: string
          image_url: string | null
          is_anonymous: boolean
          hashtags: string[]
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          user_id?: string | null
          type: 'story' | 'milestone' | 'support' | 'tips'
          content: string
          image_url?: string | null
          is_anonymous?: boolean
          hashtags?: string[]
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          user_id?: string | null
          type?: 'story' | 'milestone' | 'support' | 'tips'
          content?: string
          image_url?: string | null
          is_anonymous?: boolean
          hashtags?: string[]
          created_at?: string
          updated_at?: string
        }
      }
      post_reactions: {
        Row: {
          id: string
          post_id: string
          user_id: string
          reaction_type: 'support' | 'love' | 'congrats'
          created_at: string
        }
        Insert: {
          id?: string
          post_id: string
          user_id: string
          reaction_type: 'support' | 'love' | 'congrats'
          created_at?: string
        }
        Update: {
          id?: string
          post_id?: string
          user_id?: string
          reaction_type?: 'support' | 'love' | 'congrats'
          created_at?: string
        }
      }
      comments: {
        Row: {
          id: string
          post_id: string
          user_id: string
          parent_comment_id: string | null
          content: string
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          post_id: string
          user_id: string
          parent_comment_id?: string | null
          content: string
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          post_id?: string
          user_id?: string
          parent_comment_id?: string | null
          content?: string
          created_at?: string
          updated_at?: string
        }
      }
      comment_likes: {
        Row: {
          id: string
          comment_id: string
          user_id: string
          created_at: string
        }
        Insert: {
          id?: string
          comment_id: string
          user_id: string
          created_at?: string
        }
        Update: {
          id?: string
          comment_id?: string
          user_id?: string
          created_at?: string
        }
      }
      notifications: {
        Row: {
          id: string
          user_id: string
          type: 'comment' | 'reaction' | 'rank_up' | 'milestone' | 'encouragement' | 'summary'
          content: string
          link: string | null
          is_read: boolean
          created_at: string
        }
        Insert: {
          id?: string
          user_id: string
          type: 'comment' | 'reaction' | 'rank_up' | 'milestone' | 'encouragement' | 'summary'
          content: string
          link?: string | null
          is_read?: boolean
          created_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          type?: 'comment' | 'reaction' | 'rank_up' | 'milestone' | 'encouragement' | 'summary'
          content?: string
          link?: string | null
          is_read?: boolean
          created_at?: string
        }
      }
      user_badges: {
        Row: {
          id: string
          user_id: string
          badge_type: 'fire_streak' | 'champion' | 'diamond_hands' | 'comeback_king' | 'rising_star' | 'on_track'
          earned_at: string
        }
        Insert: {
          id?: string
          user_id: string
          badge_type: 'fire_streak' | 'champion' | 'diamond_hands' | 'comeback_king' | 'rising_star' | 'on_track'
          earned_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          badge_type?: 'fire_streak' | 'champion' | 'diamond_hands' | 'comeback_king' | 'rising_star' | 'on_track'
          earned_at?: string
        }
      }
      reports: {
        Row: {
          id: string
          reporter_id: string
          reported_user_id: string | null
          post_id: string | null
          comment_id: string | null
          reason: string
          status: 'pending' | 'reviewed' | 'resolved' | 'dismissed'
          created_at: string
        }
        Insert: {
          id?: string
          reporter_id: string
          reported_user_id?: string | null
          post_id?: string | null
          comment_id?: string | null
          reason: string
          status?: 'pending' | 'reviewed' | 'resolved' | 'dismissed'
          created_at?: string
        }
        Update: {
          id?: string
          reporter_id?: string
          reported_user_id?: string | null
          post_id?: string | null
          comment_id?: string | null
          reason?: string
          status?: 'pending' | 'reviewed' | 'resolved' | 'dismissed'
          created_at?: string
        }
      }
      user_privacy_settings: {
        Row: {
          id: string
          user_id: string
          public_profile: boolean
          show_stats_in_leaderboard: boolean
          allow_activity_view: boolean
          email_notifications: boolean
          push_notifications: boolean
          in_app_notifications: boolean
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          user_id: string
          public_profile?: boolean
          show_stats_in_leaderboard?: boolean
          allow_activity_view?: boolean
          email_notifications?: boolean
          push_notifications?: boolean
          in_app_notifications?: boolean
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          public_profile?: boolean
          show_stats_in_leaderboard?: boolean
          allow_activity_view?: boolean
          email_notifications?: boolean
          push_notifications?: boolean
          in_app_notifications?: boolean
          created_at?: string
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
      post_type: 'story' | 'milestone' | 'support' | 'tips'
      reaction_type: 'support' | 'love' | 'congrats'
      notification_type: 'comment' | 'reaction' | 'rank_up' | 'milestone' | 'encouragement' | 'summary'
      badge_type: 'fire_streak' | 'champion' | 'diamond_hands' | 'comeback_king' | 'rising_star' | 'on_track'
      report_status: 'pending' | 'reviewed' | 'resolved' | 'dismissed'
    }
  }
}
