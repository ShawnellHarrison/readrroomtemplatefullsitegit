export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type VoteRoomType = 'yes-no' | 'multiple-choice' | 'scale' | 'ranked-choice'

export interface Database {
  public: {
    Tables: {
      user_profiles: {
        Row: {
          id: string
          username: string | null
          display_name: string | null
          avatar_url: string | null
          bio: string | null
          total_votes: number
          total_battles_created: number
          total_arguments: number
          reputation_score: number
          created_at: string
          updated_at: string
          last_seen_at: string
          is_active: boolean
        }
        Insert: {
          id: string
          username?: string | null
          display_name?: string | null
          avatar_url?: string | null
          bio?: string | null
          total_votes?: number
          total_battles_created?: number
          total_arguments?: number
          reputation_score?: number
          created_at?: string
          updated_at?: string
          last_seen_at?: string
          is_active?: boolean
        }
        Update: {
          id?: string
          username?: string | null
          display_name?: string | null
          avatar_url?: string | null
          bio?: string | null
          total_votes?: number
          total_battles_created?: number
          total_arguments?: number
          reputation_score?: number
          created_at?: string
          updated_at?: string
          last_seen_at?: string
          is_active?: boolean
        }
      }
      user_sessions: {
        Row: {
          id: string
          user_id: string | null
          session_token: string
          ip_address: string | null
          user_agent: string | null
          created_at: string
          expires_at: string
          is_active: boolean
        }
        Insert: {
          id?: string
          user_id?: string | null
          session_token: string
          ip_address?: string | null
          user_agent?: string | null
          created_at?: string
          expires_at?: string
          is_active?: boolean
        }
        Update: {
          id?: string
          user_id?: string | null
          session_token?: string
          ip_address?: string | null
          user_agent?: string | null
          created_at?: string
          expires_at?: string
          is_active?: boolean
        }
      }
      user_preferences: {
        Row: {
          id: string
          user_id: string
          theme: string
          notifications_enabled: boolean
          email_notifications: boolean
          auto_share_votes: boolean
          preferred_genres: Json
          privacy_level: string
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          user_id: string
          theme?: string
          notifications_enabled?: boolean
          email_notifications?: boolean
          auto_share_votes?: boolean
          preferred_genres?: Json
          privacy_level?: string
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          theme?: string
          notifications_enabled?: boolean
          email_notifications?: boolean
          auto_share_votes?: boolean
          preferred_genres?: Json
          privacy_level?: string
          created_at?: string
          updated_at?: string
        }
      }
      vote_rooms: {
        Row: {
          id: string
          title: string
          description: string | null
          category: string | null
          type: VoteRoomType
          items: Json | null
          scale_min: number | null
          scale_max: number | null
          deadline: string | null
          is_active: boolean
          created_at: string
          expires_at: string
          created_by: string | null
          user_id: string | null
        }
        Insert: {
          id?: string
          title: string
          description?: string | null
          category?: string | null
          type: VoteRoomType
          items?: Json | null
          scale_min?: number | null
          scale_max?: number | null
          deadline?: string | null
          is_active?: boolean
          created_at?: string
          expires_at?: string
          created_by?: string | null
          user_id?: string | null
        }
        Update: {
          id?: string
          title?: string
          description?: string | null
          category?: string | null
          type?: VoteRoomType
          items?: Json | null
          scale_min?: number | null
          scale_max?: number | null
          deadline?: string | null
          is_active?: boolean
          created_at?: string
          expires_at?: string
          created_by?: string | null
          user_id?: string | null
        }
      }
      votes: {
        Row: {
          id: string
          room_id: string
          value: Json
          session_id: string
          created_at: string
          user_id_auth: string | null
        }
        Insert: {
          id?: string
          room_id: string
          value: Json
          session_id: string
          created_at?: string
          user_id_auth?: string | null
        }
        Update: {
          id?: string
          room_id?: string
          value?: Json
          session_id?: string
          created_at?: string
          user_id_auth?: string | null
        }
      }
      movie_battles: {
        Row: {
          id: string
          title: string
          description: string | null
          movie_a_id: number
          movie_a_data: Json
          movie_b_id: number
          movie_b_data: Json
          created_at: string
          ends_at: string
          is_active: boolean
          created_by: string
          total_votes: number
          user_id: string | null
        }
        Insert: {
          id?: string
          title: string
          description?: string | null
          movie_a_id: number
          movie_a_data: Json
          movie_b_id: number
          movie_b_data: Json
          created_at?: string
          ends_at: string
          is_active?: boolean
          created_by: string
          total_votes?: number
          user_id?: string | null
        }
        Update: {
          id?: string
          title?: string
          description?: string | null
          movie_a_id?: number
          movie_a_data?: Json
          movie_b_id?: number
          movie_b_data?: Json
          created_at?: string
          ends_at?: string
          is_active?: boolean
          created_by?: string
          total_votes?: number
          user_id?: string | null
        }
      }
      battle_votes: {
        Row: {
          id: string
          battle_id: string
          movie_id: number
          session_id: string
          created_at: string
          user_id_auth: string | null
        }
        Insert: {
          id?: string
          battle_id: string
          movie_id: number
          session_id: string
          created_at?: string
          user_id_auth?: string | null
        }
        Update: {
          id?: string
          battle_id?: string
          movie_id?: number
          session_id?: string
          created_at?: string
          user_id_auth?: string | null
        }
      }
      battle_arguments: {
        Row: {
          id: string
          battle_id: string
          movie_id: number
          user_id: string
          username: string
          content: string
          likes: number
          created_at: string
          user_id_auth: string | null
        }
        Insert: {
          id?: string
          battle_id: string
          movie_id: number
          user_id: string
          username: string
          content: string
          likes?: number
          created_at?: string
          user_id_auth?: string | null
        }
        Update: {
          id?: string
          battle_id?: string
          movie_id?: number
          user_id?: string
          username?: string
          content?: string
          likes?: number
          created_at?: string
          user_id_auth?: string | null
        }
      }
      argument_likes: {
        Row: {
          id: string
          argument_id: string
          user_id: string
          created_at: string
          user_id_auth: string | null
        }
        Insert: {
          id?: string
          argument_id: string
          user_id: string
          created_at?: string
          user_id_auth?: string | null
        }
        Update: {
          id?: string
          argument_id?: string
          user_id?: string
          created_at?: string
          user_id_auth?: string | null
        }
      }
    }
    Views: {
      v_room_vote_counts: {
        Row: {
          room_id: string
          title: string
          votes_count: number
        }
      }
      v_battle_vote_breakdown: {
        Row: {
          battle_id: string
          title: string
          movie_a_id: number
          movie_b_id: number
          votes_a: number
          votes_b: number
          total_votes: number
        }
      }
    }
    Functions: {
      ensure_profile: {
        Args: {
          p_display_name?: string
          p_avatar_url?: string
          p_bio?: string
        }
        Returns: Database['public']['Tables']['user_profiles']['Row']
      }
    }
    Enums: {
      vote_room_type: VoteRoomType
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}