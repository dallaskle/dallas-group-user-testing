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
export interface TicketResponse {
  ticket: Ticket
  testingDetails?: TestingTicket
  supportDetails?: SupportTicket
  assignedToUser?: Tables['users']['Row']
  createdByUser?: Tables['users']['Row']
}

export interface ListTicketsResponse {
  tickets: TicketResponse[]
  total: number
  page: number
  limit: number
} 