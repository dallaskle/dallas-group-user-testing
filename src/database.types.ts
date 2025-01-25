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
      project_registry: {
        Row: {
          id: string
          name: string
          description: string
          created_by: string
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          name: string
          description: string
          created_by: string
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          name?: string
          description?: string
          created_by?: string
          created_at?: string
          updated_at?: string
        }
      }
      feature_registry: {
        Row: {
          id: string
          project_registry_id: string
          name: string
          description: string
          is_required: boolean
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          project_registry_id: string
          name: string
          description: string
          is_required?: boolean
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          project_registry_id?: string
          name?: string
          description?: string
          is_required?: boolean
          created_at?: string
          updated_at?: string
        }
      }
      projects: {
        Row: {
          id: string
          name: string
          student_id: string
          project_registry_id: string
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          name: string
          student_id: string
          project_registry_id: string
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          name?: string
          student_id?: string
          project_registry_id?: string
          created_at?: string
          updated_at?: string
        }
      }
      features: {
        Row: {
          id: string
          project_id: string
          name: string
          description: string
          status: 'Not Started' | 'In Progress' | 'Successful Test' | 'Failed Test'
          required_validations: number
          current_validations: number
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          project_id: string
          name: string
          description: string
          status?: 'Not Started' | 'In Progress' | 'Successful Test' | 'Failed Test'
          required_validations?: number
          current_validations?: number
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          project_id?: string
          name?: string
          description?: string
          status?: 'Not Started' | 'In Progress' | 'Successful Test' | 'Failed Test'
          required_validations?: number
          current_validations?: number
          created_at?: string
          updated_at?: string
        }
      }
      validations: {
        Row: {
          id: string
          feature_id: string
          validated_by: string
          status: 'Working' | 'Needs Fixing'
          video_url: string
          notes: string
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          feature_id: string
          validated_by: string
          status: 'Working' | 'Needs Fixing'
          video_url: string
          notes?: string
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          feature_id?: string
          validated_by?: string
          status?: 'Working' | 'Needs Fixing'
          video_url?: string
          notes?: string
          created_at?: string
          updated_at?: string
        }
      }
      comments: {
        Row: {
          id: string
          feature_id: string
          author_id: string
          content: string
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          feature_id: string
          author_id: string
          content: string
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          feature_id?: string
          author_id?: string
          content?: string
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
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      [_ in never]: never
    }
    Enums: {
      ticket_type: 'testing' | 'support' | 'question'
      ticket_status: 'open' | 'in_progress' | 'resolved' | 'closed'
      ticket_priority: 'low' | 'medium' | 'high'
      support_category: 'project' | 'feature' | 'testing' | 'other'
    }
  }
} 