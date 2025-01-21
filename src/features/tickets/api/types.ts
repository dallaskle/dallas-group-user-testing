// Base types
type Tables = {
  tickets: {
    Row: {
      id: string
      type: TicketType
      title: string
      description: string
      status: TicketStatus
      priority: TicketPriority
      assigned_to: string | null
      created_by: string
      created_at: string
      updated_at: string
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
  }
  support_tickets: {
    Row: {
      id: string
      category: SupportCategory
      project_id: string | null
      feature_id: string | null
      ai_response: string | null
      resolution_notes: string | null
      created_at: string
      updated_at: string
    }
  }
}

// Enums
export type TicketType = 'testing' | 'support' | 'question'
export type TicketStatus = 'open' | 'in_progress' | 'resolved' | 'closed'
export type TicketPriority = 'low' | 'medium' | 'high'
export type SupportCategory = 'project' | 'feature' | 'testing' | 'other'

// Base ticket types
export type Ticket = Tables['tickets']['Row']
export type TestingTicket = Tables['testing_tickets']['Row']
export type SupportTicket = Tables['support_tickets']['Row']

// Request types
export interface CreateTicketRequest {
  type: TicketType
  title: string
  description: string
  priority?: TicketPriority
  // Testing ticket specific
  featureId?: string
  deadline?: string
  // Support ticket specific
  category?: SupportCategory
  projectId?: string
}

export interface UpdateTicketRequest {
  id: string
  status?: TicketStatus
  title?: string
  description?: string
  priority?: TicketPriority
  assignedTo?: string | null
}

export interface ListTicketsRequest {
  type?: TicketType
  status?: TicketStatus
  priority?: TicketPriority
  assignedTo?: string
  createdBy?: string
  page?: number
  limit?: number
}

// Response types
export interface TicketData {
  ticket: {
    id: string
    type: TicketType
    title: string
    description: string
    status: TicketStatus
    priority: TicketPriority
    assigned_to: string | null
    created_by: string
    created_at: string
    updated_at: string
  }
  testingDetails?: TestingTicket
  supportDetails?: SupportTicket
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