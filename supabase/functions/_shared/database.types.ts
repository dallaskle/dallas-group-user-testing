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
          name: string
          email: string
          is_student: boolean
          is_admin: boolean
          is_tester: boolean
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          name: string
          email: string
          is_student?: boolean
          is_admin?: boolean
          is_tester?: boolean
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          name?: string
          email?: string
          is_student?: boolean
          is_admin?: boolean
          is_tester?: boolean
          created_at?: string
          updated_at?: string
        }
      }
      tickets: {
        Row: {
          id: string
          type: 'testing' | 'support' | 'question'
          status: 'open' | 'in_progress' | 'resolved' | 'closed'
          title: string
          description: string
          priority: 'low' | 'medium' | 'high'
          created_by: string
          assigned_to: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          type: 'testing' | 'support' | 'question'
          status?: 'open' | 'in_progress' | 'resolved' | 'closed'
          title: string
          description: string
          priority?: 'low' | 'medium' | 'high'
          created_by: string
          assigned_to?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          type?: 'testing' | 'support' | 'question'
          status?: 'open' | 'in_progress' | 'resolved' | 'closed'
          title?: string
          description?: string
          priority?: 'low' | 'medium' | 'high'
          created_by?: string
          assigned_to?: string | null
          created_at?: string
          updated_at?: string
        }
      }
      testing_tickets: {
        Row: {
          id: string
          feature_id: string
          validation_id: string | null
          deadline: string
          created_at: string
          updated_at: string
        }
        Insert: {
          id: string
          feature_id: string
          validation_id?: string | null
          deadline: string
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          feature_id?: string
          validation_id?: string | null
          deadline?: string
          created_at?: string
          updated_at?: string
        }
      }
      support_tickets: {
        Row: {
          id: string
          category: 'project' | 'feature' | 'testing' | 'other'
          project_id: string | null
          feature_id: string | null
          ai_response: string | null
          resolution_notes: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id: string
          category: 'project' | 'feature' | 'testing' | 'other'
          project_id?: string | null
          feature_id?: string | null
          ai_response?: string | null
          resolution_notes?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          category?: 'project' | 'feature' | 'testing' | 'other'
          project_id?: string | null
          feature_id?: string | null
          ai_response?: string | null
          resolution_notes?: string | null
          created_at?: string
          updated_at?: string
        }
      }
      ticket_audit_log: {
        Row: {
          id: string
          ticket_id: string
          changed_by: string
          field_name: string
          old_value: string | null
          new_value: string | null
          created_at: string
        }
        Insert: {
          id?: string
          ticket_id: string
          changed_by: string
          field_name: string
          old_value?: string | null
          new_value?: string | null
          created_at?: string
        }
        Update: {
          id?: string
          ticket_id?: string
          changed_by?: string
          field_name?: string
          old_value?: string | null
          new_value?: string | null
          created_at?: string
        }
      }
      ai_docs: {
        Row: {
          id: string
          embedding: number[]
          doc_type: string
          content: string
          project_id: string | null
          feature_id: string | null
          ticket_id: string | null
          validation_id: string | null
          metadata: Json | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          embedding: number[]
          doc_type: string
          content: string
          project_id?: string | null
          feature_id?: string | null
          ticket_id?: string | null
          validation_id?: string | null
          metadata?: Json | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          embedding?: number[]
          doc_type?: string
          content?: string
          project_id?: string | null
          feature_id?: string | null
          ticket_id?: string | null
          validation_id?: string | null
          metadata?: Json | null
          created_at?: string
          updated_at?: string
        }
      }
      agent_audit_log: {
        Row: {
          id: string
          agent_name: string
          user_input: string
          agent_response: string
          user_id: string
          additional_metadata: Json | null
          created_at: string
        }
        Insert: {
          id?: string
          agent_name: string
          user_input: string
          agent_response: string
          user_id: string
          additional_metadata?: Json | null
          created_at?: string
        }
        Update: {
          id?: string
          agent_name?: string
          user_input?: string
          agent_response?: string
          user_id?: string
          additional_metadata?: Json | null
          created_at?: string
        }
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      get_ticket_by_id: {
        Args: { p_ticket_id: string }
        Returns: Json
      }
      list_tickets: {
        Args: {
          p_type?: 'testing' | 'support' | 'question'
          p_status?: 'open' | 'in_progress' | 'resolved' | 'closed'
          p_priority?: 'low' | 'medium' | 'high'
          p_assigned_to?: string
          p_created_by?: string
          p_page?: number
          p_limit?: number
        }
        Returns: {
          ticket_data: Json
          total_count: number
        }[]
      }
    }
    Enums: {
      ticket_type: 'testing' | 'support' | 'question'
      ticket_status: 'open' | 'in_progress' | 'resolved' | 'closed'
      ticket_priority: 'low' | 'medium' | 'high'
      support_category: 'project' | 'feature' | 'testing' | 'other'
    }
  }
} 