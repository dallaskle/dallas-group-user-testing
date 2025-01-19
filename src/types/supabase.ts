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
          full_name: string
          role: 'student' | 'admin'
          created_at: string
        }
        Insert: {
          id?: string
          email: string
          full_name: string
          role?: 'student' | 'admin'
          created_at?: string
        }
        Update: {
          id?: string
          email?: string
          full_name?: string
          role?: 'student' | 'admin'
          created_at?: string
        }
      }
      projects: {
        Row: {
          id: string
          owner_id: string
          title: string
          description: string | null
          created_at: string
        }
        Insert: {
          id?: string
          owner_id: string
          title: string
          description?: string | null
          created_at?: string
        }
        Update: {
          id?: string
          owner_id?: string
          title?: string
          description?: string | null
          created_at?: string
        }
      }
      features: {
        Row: {
          id: string
          project_id: string
          title: string
          description: string | null
          created_at: string
        }
        Insert: {
          id?: string
          project_id: string
          title: string
          description?: string | null
          created_at?: string
        }
        Update: {
          id?: string
          project_id?: string
          title?: string
          description?: string | null
          created_at?: string
        }
      }
      feature_statuses: {
        Row: {
          id: string
          feature_id: string
          user_id: string
          video_url: string
          status: 'working' | 'not_working'
          notes: string | null
          created_at: string
        }
        Insert: {
          id?: string
          feature_id: string
          user_id: string
          video_url: string
          status: 'working' | 'not_working'
          notes?: string | null
          created_at?: string
        }
        Update: {
          id?: string
          feature_id?: string
          user_id?: string
          video_url?: string
          status?: 'working' | 'not_working'
          notes?: string | null
          created_at?: string
        }
      }
      feature_comments: {
        Row: {
          id: string
          feature_id: string
          user_id: string
          comment_text: string
          created_at: string
        }
        Insert: {
          id?: string
          feature_id: string
          user_id: string
          comment_text: string
          created_at?: string
        }
        Update: {
          id?: string
          feature_id?: string
          user_id?: string
          comment_text?: string
          created_at?: string
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
      [_ in never]: never
    }
  }
} 