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