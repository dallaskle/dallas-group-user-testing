import { Database } from './database.types.ts'

type Tables = Database['public']['Tables']
type Enums = Database['public']['Enums']

// Base ticket types from database
export type Ticket = Tables['tickets']['Row']
export type TestingTicket = Tables['testing_tickets']['Row']
export type SupportTicket = Tables['support_tickets']['Row']

// Enums
export type TicketType = Enums['ticket_type']
export type TicketStatus = Enums['ticket_status']
export type TicketPriority = Enums['ticket_priority']
export type SupportCategory = Enums['support_category']

// Request types
export interface CreateTicketRequest {
  type: 'testing' | 'support' | 'question'
  title: string
  description: string
  priority?: 'low' | 'medium' | 'high'
  assignedTo?: string | null
  // Testing ticket specific
  featureId?: string
  deadline?: string
  // Support ticket specific
  category?: 'project' | 'feature' | 'testing' | 'other'
  projectId?: string
}

export interface UpdateTicketRequest {
  id: string
  status?: 'open' | 'in_progress' | 'resolved' | 'closed'
  title?: string
  description?: string
  priority?: 'low' | 'medium' | 'high'
  assignedTo?: string | null
}

export interface ListTicketsRequest {
  type?: 'testing' | 'support' | 'question'
  status?: 'open' | 'in_progress' | 'resolved' | 'closed'
  priority?: 'low' | 'medium' | 'high'
  assignedTo?: string
  createdBy?: string
  page?: number
  limit?: number
}

// Response types
export interface TicketData {
  ticket: {
    id: string
    type: 'testing' | 'support' | 'question'
    title: string
    description: string
    status: 'open' | 'in_progress' | 'resolved' | 'closed'
    priority: 'low' | 'medium' | 'high'
    assigned_to: string | null
    created_by: string
    created_at: string
    updated_at: string
  }
  testingDetails?: {
    id: string
    feature_id: string
    validation_id: string | null
    deadline: string
    created_at: string
    updated_at: string
  }
  supportDetails?: {
    id: string
    category: 'project' | 'feature' | 'testing' | 'other'
    project_id: string | null
    feature_id: string | null
    ai_response: string | null
    resolution_notes: string | null
    created_at: string
    updated_at: string
  }
  assignedToUser?: {
    id: string
    name: string
    email: string
    is_student: boolean
    is_admin: boolean
  }
  createdByUser?: {
    id: string
    name: string
    email: string
    is_student: boolean
    is_admin: boolean
  }
}

export interface TicketResponse {
  ticket_data: TicketData
  total_count: number
}

export interface ListTicketsResponse {
  tickets: TicketResponse[]
  total: number
  page: number
  limit: number
}

export interface TicketAuditLogEntry {
  id: string
  ticket_id: string
  changed_by: string
  field_name: string
  old_value: string | null
  new_value: string | null
  created_at: string
  users: {
    id: string
    name: string
    email: string
  }
  tickets?: {
    title: string
    type: 'testing' | 'support' | 'question'
    status: 'open' | 'in_progress' | 'resolved' | 'closed'
    priority: 'low' | 'medium' | 'high'
  }
}

export interface TicketAuditLogResponse {
  audit_logs: TicketAuditLogEntry[]
} 