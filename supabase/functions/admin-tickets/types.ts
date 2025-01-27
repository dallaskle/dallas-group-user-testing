export type TicketType = 'testing' | 'support' | 'question'
export type TicketStatus = 'open' | 'in_progress' | 'resolved' | 'closed'
export type TicketPriority = 'low' | 'medium' | 'high'
export type SupportCategory = 'project' | 'feature' | 'testing' | 'other'

export interface ListTicketsRequest {
  type?: TicketType
  status?: TicketStatus
  priority?: TicketPriority
  assignedTo?: string
  createdBy?: string
  projectId?: string
  page?: number
  limit?: number
}

export interface CreateTicketRequest {
  type: TicketType
  title: string
  description: string
  priority?: TicketPriority
  assignedTo?: string | null
  featureId?: string
  deadline?: string
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