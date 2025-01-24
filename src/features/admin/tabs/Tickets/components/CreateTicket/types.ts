import type { CreateTicketRequest } from '../../../../api/adminDashboard.api'

export interface ProjectFeature {
  id: string
  name: string
}

export interface ProjectWithFeatures {
  id: string
  name: string
  features: ProjectFeature[]
}

export type TicketType = 'testing' | 'support' | 'question'
export type TicketPriority = 'low' | 'medium' | 'high'
export type TicketCategory = 'project' | 'feature' | 'testing' | 'other'

export interface CreateTicketFormData extends Partial<CreateTicketRequest> {
  // Base ticket fields
  ticketType?: TicketType
  title: string
  description: string
  priority: TicketPriority
  assignedTo?: string | undefined
  status?: 'open' | 'in_progress' | 'resolved' | 'closed'
  
  // Support ticket specific fields
  category?: TicketCategory
  projectId?: string | undefined
  featureId?: string | undefined
  aiResponse?: string | undefined
  resolutionNotes?: string | undefined
  
  // Testing ticket specific fields
  deadline?: Date
  validationId?: string | undefined
  selectedTime: number // Unix timestamp in milliseconds
}

export interface StepProps {
  formData: CreateTicketFormData
  onFormDataChange: (updates: Partial<CreateTicketFormData>) => void
  projects?: ProjectWithFeatures[]
  testers?: Array<{ id: string; name: string }>
} 