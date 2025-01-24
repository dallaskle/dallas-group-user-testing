import type { CreateTicketRequest } from '../../../../api/adminDashboard.api'

export type TicketType = 'support' | 'testing' | 'question'
export type TicketPriority = 'low' | 'medium' | 'high'
export type TicketCategory = 'project' | 'feature' | 'testing' | 'other'

export interface CreateTicketFormData {
  ticketType: TicketType
  title: string
  description: string
  priority: TicketPriority
  projectId?: string
  featureId?: string
  deadline?: string
  category?: TicketCategory
  assignedTo?: string
}

export interface CreateTicketStepProps {
  formData: CreateTicketFormData
  onFormDataChange: (updates: Partial<CreateTicketFormData>) => void
  isLoading: boolean
}