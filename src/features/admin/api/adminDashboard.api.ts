import { supabase } from '@/lib/supabase'
import type { ProjectProgress } from '../store/adminDashboard.store'
import { useAuthStore } from '@/features/auth/store/auth.store'

const FUNCTION_PREFIX = import.meta.env.VITE_SUPABASE_FUNCTION_PREFIX || ''

// Recent Activity Types
interface UserActivity {
  id: string
  name: string
  created_at: string
}

interface ProjectActivity {
  id: string
  name: string
  created_at: string
  users: {
    id: string
    name: string
  } | null
}

interface FeatureActivity {
  id: string
  name: string
  created_at: string
  project: {
    id: string
    name: string
    student: {
      id: string
      name: string
    } | null
  } | null
}

interface CommentActivity {
  id: string
  content: string
  created_at: string
  author: {
    id: string
    name: string
  } | null
  feature: {
    id: string
    name: string
    project: {
      id: string
      name: string
    } | null
  } | null
}

interface ValidationActivity {
  id: string
  status: string
  created_at: string
  validator: {
    id: string
    name: string
  } | null
  feature: {
    id: string
    name: string
    project: {
      id: string
      name: string
    } | null
  } | null
}

interface TicketActivity {
  id: string
  type: string
  title: string
  created_at: string
  creator: {
    id: string
    name: string
  } | null
  assignee: {
    id: string
    name: string
  } | null
}

interface ProjectRegistryActivity {
  id: string
  name: string
  created_at: string
  creator: {
    id: string
    name: string
  } | null
}

interface FeatureRegistryActivity {
  id: string
  name: string
  created_at: string
  registry: {
    id: string
    name: string
    creator: {
      id: string
      name: string
    } | null
  } | null
}

export type AdminRecentActivity = {
  users: UserActivity[]
  projects: ProjectActivity[]
  features: FeatureActivity[]
  comments: CommentActivity[]
  validations: ValidationActivity[]
  tickets: TicketActivity[]
  projectRegistries: ProjectRegistryActivity[]
  featureRegistries: FeatureRegistryActivity[]
}

export type ActivityType = 'user' | 'project_registry' | 'feature_registry' | 'project' | 'feature' | 'comment' | 'ticket' | 'validation'

export interface ActivityItem {
  id: string
  type: ActivityType
  created_at: string
  actor: {
    id: string
    name: string
  }
  data: {
    title?: string
    name?: string
    content?: string
    status?: string
    project_name?: string
    feature_name?: string
    assigned_to?: {
      id: string
      name: string
    }
    ticket_type?: string
  }
}

export interface ProjectDetails {
  id: string
  name: string
  registry: {
    id: string
    name: string
  }
  user: {
    id: string
    name: string
  }
  features: {
    id: string
    name: string
    status: string
    project_id: string
    required_validations: number
    current_validations: number
  }[]
  features_count: number
  validations: {
    completed: number
    required: number
  }
  status_counts: {
    not_started: number
    in_progress: number
    successful_test: number
    failed_test: number
  }
}

export interface ProjectRegistryDetails {
  id: string
  name: string
  description: string
  created_at: string
  created_by: {
    id: string
    name: string
  }
  feature_count: number
  projects_count: number
  features: {
    id: string
    name: string
    description: string
    is_required: boolean
  }[]
}

export const getProjectRegistriesCount = async () => {
  const session = useAuthStore.getState().session
  if (!session?.access_token) throw new Error('No active session')

  const { data, error } = await supabase.functions.invoke('admin-overview', {
    headers: {
      Authorization: `Bearer ${session.access_token}`
    }
  })

  if (error) throw error
  return data.projectRegistriesCount
}

export const getTotalProjectsCount = async () => {
  const session = useAuthStore.getState().session
  if (!session?.access_token) throw new Error('No active session')

  const { data, error } = await supabase.functions.invoke('admin-overview', {
    headers: {
      Authorization: `Bearer ${session.access_token}`
    }
  })

  if (error) throw error
  return data.totalProjectsCount
}

export const getPendingValidationsCount = async () => {
  const session = useAuthStore.getState().session
  if (!session?.access_token) throw new Error('No active session')

  const { data, error } = await supabase.functions.invoke('admin-overview', {
    headers: {
      Authorization: `Bearer ${session.access_token}`
    }
  })

  if (error) throw error
  return data.pendingValidationsCount
}

export const getPendingTestsCount = async () => {
  const session = useAuthStore.getState().session
  if (!session?.access_token) throw new Error('No active session')

  const { data, error } = await supabase.functions.invoke('admin-overview', {
    headers: {
      Authorization: `Bearer ${session.access_token}`
    }
  })

  if (error) throw error
  return data.pendingTestsCount
}

export const getTotalTestersCount = async () => {
  const session = useAuthStore.getState().session
  if (!session?.access_token) throw new Error('No active session')

  const { data, error } = await supabase.functions.invoke('admin-overview', {
    headers: {
      Authorization: `Bearer ${session.access_token}`
    }
  })

  if (error) throw error
  return data.totalTestersCount
}

interface ProjectProgressResponse {
  status: 'Not Started' | 'In Progress' | 'Successful Test' | 'Failed Test'
  project: {
    id: string
    name: string
    student: {
      id: string
      name: string
    } | null
  } | null
}

export const getProjectProgress = async (): Promise<ProjectProgress[]> => {
  const session = useAuthStore.getState().session
  if (!session?.access_token) throw new Error('No active session')

  const { data, error } = await supabase.functions.invoke('admin-overview', {
    headers: {
      Authorization: `Bearer ${session.access_token}`
    }
  })

  if (error) throw error
  return data.projectProgress
}

export type TesterPerformanceData = {
  id: string
  name: string
  email: string
  testsPending: number
  testsCompleted: number
  lastTestCompleted: string | null
  accuracyRate: number
  avgResponseTime: number
}

export interface TestHistoryItem {
  id: string
  type: 'testing'
  status: 'resolved' | 'closed'
  title: string
  description: string
  priority: 'low' | 'medium' | 'high'
  created_at: string
  updated_at: string
  created_by: {
    id: string
    name: string
  }
  assigned_to: {
    id: string
    name: string
  }
  testing_ticket: {
    id: string
    feature_id: string
    deadline: string
    feature: {
      id: string
      name: string
      project: {
        id: string
        name: string
        student: {
          id: string
          name: string
        } | null
      }
    }
    validations: {
      id: string
      status: 'Working' | 'Needs Fixing'
      video_url: string
      notes: string | null
      created_at: string
    }[]
  }
}

interface TestingTicketResponse {
  id: string
  feature_id: string
  deadline: string
  ticket: {
    id: string
    type: string
    status: string
    title: string
    description: string
    priority: string
    created_at: string
    updated_at: string
    created_by_user: {
      id: string
      name: string
    }
    assigned_to_user: {
      id: string
      name: string
    }
  }
  feature: {
    id: string
    name: string
    project: {
      id: string
      name: string
      student: {
        id: string
        name: string
      }
    }
  }
}

export const getTesterPerformance = async (): Promise<TesterPerformanceData[]> => {
  const session = useAuthStore.getState().session
  if (!session?.access_token) throw new Error('No active session')

  const { data, error } = await supabase.functions.invoke('admin-overview', {
    headers: {
      Authorization: `Bearer ${session.access_token}`
    }
  })

  if (error) throw error
  return data.testerPerformance
}

export const getTestHistory = async (): Promise<TestHistoryItem[]> => {
  console.log('getTestHistory called')
  // First get all testing tickets with their related data
  const { data: testingTickets, error: ticketsError } = await supabase
    .from('testing_tickets')
    .select(`
      id,
      feature_id,
      deadline,
      ticket:tickets!inner(
        id,
        type,
        status,
        title,
        description,
        priority,
        created_at,
        updated_at,
        created_by_user:users!tickets_created_by_fkey (
          id,
          name
        ),
        assigned_to_user:users!tickets_assigned_to_fkey (
          id,
          name
        )
      ),
      feature:features!inner(
        id,
        name,
        project:projects!inner(
          id,
          name,
          student:users!projects_student_id_fkey (
            id,
            name
          )
        )
      )
    `)
    .returns<TestingTicketResponse[]>()
    .order('created_at', { ascending: false })

  if (ticketsError) {
    console.error('Error fetching testing tickets:', ticketsError)
    throw ticketsError
  }

  if (!testingTickets || testingTickets.length === 0) {
    console.log('No testing tickets found')
    return []
  }

  // Filter testing tickets to only include resolved or closed testing tickets
  const filteredTestingTickets = testingTickets.filter(ticket => 
    ticket.ticket.type === 'testing' && 
    (ticket.ticket.status === 'resolved' || ticket.ticket.status === 'closed')
  )

  if (filteredTestingTickets.length === 0) {
    console.log('No resolved or closed testing tickets found')
    return []
  }

  console.log('Fetched testing tickets:', filteredTestingTickets)

  // Get all validations for the features in these testing tickets
  const featureIds = filteredTestingTickets
    .map((ticket: TestingTicketResponse) => ticket.feature_id)
    .filter((id: string | null): id is string => Boolean(id))
  
  if (featureIds.length === 0) {
    console.log('No feature IDs found')
    return []
  }

  const { data: validations, error: validationsError } = await supabase
    .from('validations')
    .select('*')
    .in('feature_id', featureIds)
    .order('created_at', { ascending: false })

  if (validationsError) {
    console.error('Error fetching validations:', validationsError)
    throw validationsError
  }

  console.log('Fetched validations:', validations)

  // Map the data together, filtering out any tickets with missing required data
  return filteredTestingTickets
    .filter((testingTicket: TestingTicketResponse) => 
      testingTicket?.ticket?.id &&
      testingTicket?.ticket?.created_by_user?.id &&
      testingTicket?.ticket?.assigned_to_user?.id &&
      testingTicket?.feature?.id
    )
    .map((testingTicket: TestingTicketResponse) => ({
      id: testingTicket.ticket.id,
      type: testingTicket.ticket.type as 'testing',
      status: testingTicket.ticket.status as 'resolved' | 'closed',
      title: testingTicket.ticket.title,
      description: testingTicket.ticket.description,
      priority: testingTicket.ticket.priority as 'low' | 'medium' | 'high',
      created_at: testingTicket.ticket.created_at,
      updated_at: testingTicket.ticket.updated_at,
      created_by: {
        id: testingTicket.ticket.created_by_user.id,
        name: testingTicket.ticket.created_by_user.name
      },
      assigned_to: {
        id: testingTicket.ticket.assigned_to_user.id,
        name: testingTicket.ticket.assigned_to_user.name
      },
      testing_ticket: {
        id: testingTicket.id,
        feature_id: testingTicket.feature_id,
        deadline: testingTicket.deadline,
        feature: {
          id: testingTicket.feature.id,
          name: testingTicket.feature.name,
          project: {
            id: testingTicket.feature.project.id,
            name: testingTicket.feature.project.name,
            student: testingTicket.feature.project.student ? {
              id: testingTicket.feature.project.student.id,
              name: testingTicket.feature.project.student.name
            } : null
          }
        },
        validations: validations?.filter(v => v.feature_id === testingTicket.feature_id) || []
      }
    }))
}

export const getRecentActivity = async (days: number = 7): Promise<ActivityItem[]> => {
  const now = new Date()
  const startDate = new Date(now.setDate(now.getDate() - days)).toISOString()
  
  const [
    newUsers,
    newProjects,
    newFeatures,
    newComments,
    newValidations,
    newTickets,
    newProjectRegistries,
    newFeatureRegistries
  ] = await Promise.all([
    // New Users
    supabase
      .from('users')
      .select('id, name, created_at')
      .gte('created_at', startDate)
      .order('created_at', { ascending: false })
      .returns<UserActivity[]>(),

    // New Projects
    supabase
      .from('projects')
      .select(`
        id,
        name,
        created_at,
        users:users!projects_student_id_fkey (
          id,
          name
        )
      `)
      .gte('created_at', startDate)
      .order('created_at', { ascending: false })
      .returns<ProjectActivity[]>(),

    // New Features
    supabase
      .from('features')
      .select(`
        id,
        name,
        created_at,
        project:projects (
          id,
          name,
          student:users!projects_student_id_fkey (
            id,
            name
          )
        )
      `)
      .gte('created_at', startDate)
      .order('created_at', { ascending: false })
      .returns<FeatureActivity[]>(),

    // New Comments
    supabase
      .from('comments')
      .select(`
        id,
        content,
        created_at,
        author:users!comments_author_id_fkey (
          id,
          name
        ),
        feature:features (
          id,
          name,
          project:projects (
            id,
            name
          )
        )
      `)
      .gte('created_at', startDate)
      .order('created_at', { ascending: false })
      .returns<CommentActivity[]>(),

    // New Validations
    supabase
      .from('validations')
      .select(`
        id,
        status,
        created_at,
        validator:users!validations_validated_by_fkey (
          id,
          name
        ),
        feature:features (
          id,
          name,
          project:projects (
            id,
            name
          )
        )
      `)
      .gte('created_at', startDate)
      .order('created_at', { ascending: false })
      .returns<ValidationActivity[]>(),

    // New Tickets
    supabase
      .from('tickets')
      .select(`
        id,
        type,
        title,
        created_at,
        creator:users!tickets_created_by_fkey (
          id,
          name
        ),
        assignee:users!tickets_assigned_to_fkey (
          id,
          name
        )
      `)
      .gte('created_at', startDate)
      .order('created_at', { ascending: false })
      .returns<TicketActivity[]>(),

    // New Project Registries
    supabase
      .from('project_registry')
      .select(`
        id,
        name,
        created_at,
        creator:users!project_registry_created_by_fkey (
          id,
          name
        )
      `)
      .gte('created_at', startDate)
      .order('created_at', { ascending: false })
      .returns<ProjectRegistryActivity[]>(),

    // New Feature Registries
    supabase
      .from('feature_registry')
      .select(`
        id,
        name,
        created_at,
        registry:project_registry (
          id,
          name,
          creator:users!project_registry_created_by_fkey (
            id,
            name
          )
        )
      `)
      .gte('created_at', startDate)
      .order('created_at', { ascending: false })
      .returns<FeatureRegistryActivity[]>()
  ])

  const activities: ActivityItem[] = []

  // Transform the data into ActivityItems
  if (!newUsers.error && newUsers.data) {
    activities.push(...newUsers.data.map(user => ({
      id: `user-${user.id}`,
      type: 'user' as ActivityType,
      created_at: user.created_at,
      actor: { id: user.id, name: user.name },
      data: { }
    })))
  }

  if (!newProjects.error && newProjects.data) {
    activities.push(...newProjects.data.map(project => ({
      id: `project-${project.id}`,
      type: 'project' as ActivityType,
      created_at: project.created_at,
      actor: { 
        id: project.users?.id ?? 'unknown',
        name: project.users?.name ?? 'Unknown User'
      },
      data: { name: project.name }
    })))
  }

  if (!newFeatures.error && newFeatures.data) {
    activities.push(...newFeatures.data.map(feature => ({
      id: `feature-${feature.id}`,
      type: 'feature' as ActivityType,
      created_at: feature.created_at,
      actor: { 
        id: feature.project?.student?.id ?? 'unknown',
        name: feature.project?.student?.name ?? 'Unknown User'
      },
      data: {
        name: feature.name,
        project_name: feature.project?.name
      }
    })))
  }

  if (!newComments.error && newComments.data) {
    activities.push(...newComments.data.map(comment => ({
      id: `comment-${comment.id}`,
      type: 'comment' as ActivityType,
      created_at: comment.created_at,
      actor: { 
        id: comment.author?.id ?? 'unknown',
        name: comment.author?.name ?? 'Unknown User'
      },
      data: {
        content: comment.content,
        feature_name: comment.feature?.name,
        project_name: comment.feature?.project?.name
      }
    })))
  }

  if (!newValidations.error && newValidations.data) {
    activities.push(...newValidations.data.map(validation => ({
      id: `validation-${validation.id}`,
      type: 'validation' as ActivityType,
      created_at: validation.created_at,
      actor: { 
        id: validation.validator?.id ?? 'unknown',
        name: validation.validator?.name ?? 'Unknown User'
      },
      data: {
        status: validation.status,
        feature_name: validation.feature?.name,
        project_name: validation.feature?.project?.name
      }
    })))
  }

  if (!newTickets.error && newTickets.data) {
    activities.push(...newTickets.data.map(ticket => ({
      id: `ticket-${ticket.id}`,
      type: 'ticket' as ActivityType,
      created_at: ticket.created_at,
      actor: { 
        id: ticket.creator?.id ?? 'unknown',
        name: ticket.creator?.name ?? 'Unknown User'
      },
      data: {
        title: ticket.title,
        ticket_type: ticket.type,
        assigned_to: ticket.assignee ? {
          id: ticket.assignee.id,
          name: ticket.assignee.name
        } : undefined
      }
    })))
  }

  if (!newProjectRegistries.error && newProjectRegistries.data) {
    activities.push(...newProjectRegistries.data.map(registry => ({
      id: `project-registry-${registry.id}`,
      type: 'project_registry' as ActivityType,
      created_at: registry.created_at,
      actor: { 
        id: registry.creator?.id ?? 'unknown',
        name: registry.creator?.name ?? 'Unknown User'
      },
      data: { name: registry.name }
    })))
  }

  if (!newFeatureRegistries.error && newFeatureRegistries.data) {
    activities.push(...newFeatureRegistries.data.map(registry => ({
      id: `feature-registry-${registry.id}`,
      type: 'feature_registry' as ActivityType,
      created_at: registry.created_at,
      actor: { 
        id: registry.registry?.creator?.id ?? 'unknown',
        name: registry.registry?.creator?.name ?? 'Unknown User'
      },
      data: {
        name: registry.name,
        project_name: registry.registry?.name
      }
    })))
  }

  // Sort all activities by created_at
  return activities.sort((a, b) => 
    new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
  )
}

// Add these interfaces near the top with other interfaces
interface ProjectWithDetailsResponse {
  id: string
  name: string
  registry: {
    id: string
    name: string
    created_by: string
    creator: {
      id: string
      name: string
    }
  }[]
  student: {
    id: string
    name: string
  }
}

interface ProjectFeaturesResponse {
  id: string
  name: string
  status: string
  project_id: string
  required_validations: number
  current_validations: number
  project: {
    id: string
    student: {
      id: string
      name: string
    }
  }
}

interface ProjectRegistryWithDetailsResponse {
  id: string
  name: string
  description: string
  created_at: string
  creator: {
    id: string
    name: string
  }
  features: {
    id: string
    name: string
    description: string
    is_required: boolean
  }[]
  projects: {
    id: string
    student: {
      id: string
      name: string
    }
  }[]
}

// Update the function signatures to use these types
export const getProjectsWithDetails = async (): Promise<ProjectDetails[]> => {
  // First get all projects with their basic info
  const { data: projects, error } = await supabase
    .from('projects')
    .select(`
      id,
      name,
      registry:project_registry (
        id,
        name,
        created_by,
        creator:users!project_registry_created_by_fkey (
          id,
          name
        )
      ),
      student:users!projects_student_id_fkey (
        id,
        name
      )
    `)
    .returns<ProjectWithDetailsResponse[]>()

  if (error) throw error

  // Then get all features for these projects
  const { data: projectFeatures, error: featuresError } = await supabase
    .from('features')
    .select(`
      id,
      name,
      status,
      project_id,
      required_validations,
      current_validations,
      project:projects (
        id,
        student:users!projects_student_id_fkey (
          id,
          name
        )
      )
    `)
    .in('project_id', projects.map(p => p.id))
    .returns<ProjectFeaturesResponse[]>()

  if (featuresError) throw featuresError

  // Map the data together
  return projects.map(project => {
    const projectFeatureList = projectFeatures?.filter(f => f.project_id === project.id) || [];
    
    return {
      id: project.id,
      name: project.name,
      registry: {
        id: project.registry?.[0]?.id,
        name: project.registry?.[0]?.name
      },
      user: {
        id: project.student?.id,
        name: project.student?.name
      },
      features: projectFeatureList,
      features_count: projectFeatureList.length,
      validations: {
        completed: projectFeatureList.reduce((sum: number, f) => sum + (f.current_validations || 0), 0),
        required: projectFeatureList.reduce((sum: number, f) => sum + (f.required_validations || 0), 0)
      },
      status_counts: {
        not_started: projectFeatureList.filter(f => f.status === 'Not Started').length,
        in_progress: projectFeatureList.filter(f => f.status === 'In Progress').length,
        successful_test: projectFeatureList.filter(f => f.status === 'Successful Test').length,
        failed_test: projectFeatureList.filter(f => f.status === 'Failed Test').length
      }
    }
  })
}

export const getProjectRegistriesWithDetails = async (): Promise<ProjectRegistryDetails[]> => {
  const { data, error } = await supabase
    .from('project_registry')
    .select(`
      id,
      name,
      description,
      created_at,
      creator:users!project_registry_created_by_fkey (
        id,
        name
      ),
      features:feature_registry (
        id,
        name,
        description,
        is_required
      ),
      projects (
        id,
        student:users!projects_student_id_fkey (
          id,
          name
        )
      )
    `)
    .returns<ProjectRegistryWithDetailsResponse[]>()

  if (error) throw error

  return data.map(registry => ({
    id: registry.id,
    name: registry.name,
    description: registry.description,
    created_at: registry.created_at,
    created_by: {
      id: registry.creator?.id,
      name: registry.creator?.name
    },
    feature_count: registry.features?.length || 0,
    projects_count: registry.projects?.length || 0,
    features: registry.features || []
  }))
}

// Ticket types
export type TicketType = 'testing' | 'support' | 'question'
export type TicketStatus = 'open' | 'in_progress' | 'resolved' | 'closed'
export type TicketPriority = 'low' | 'medium' | 'high'
export type SupportCategory = 'project' | 'feature' | 'testing' | 'other'

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
  testingDetails?: {
    id: string
    feature_id: string
    validation_id: string | null
    deadline: string
  }
  supportDetails?: {
    id: string
    category: SupportCategory
    project_id: string | null
    feature_id: string | null
    ai_response: string | null
    resolution_notes: string | null
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
    type: TicketType
    status: TicketStatus
    priority: TicketPriority
  }
}

export interface TicketAuditLogResponse {
  audit_logs: TicketAuditLogEntry[]
}

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

// Add ticket-related API functions
export const getTickets = async (request: ListTicketsRequest): Promise<ListTicketsResponse> => {
  const session = await supabase.auth.getSession()
  if (!session.data.session?.access_token) {
    throw new Error('No active session')
  }

  const response = await fetch(
    `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/${FUNCTION_PREFIX}tickets-list`,
    {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${session.data.session.access_token}`,
      },
      body: JSON.stringify(request),
    }
  )

  if (!response.ok) {
    const error = await response.json()
    throw new Error(error.error || 'Failed to list tickets')
  }

  return await response.json()
}

export const getTicketById = async (id: string): Promise<TicketResponse> => {
  const session = await supabase.auth.getSession()
  if (!session.data.session?.access_token) {
    throw new Error('No active session')
  }

  const response = await fetch(
    `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/${FUNCTION_PREFIX}tickets-get`,
    {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${session.data.session.access_token}`,
      },
      body: JSON.stringify({ id }),
    }
  )

  if (!response.ok) {
    const error = await response.json()
    throw new Error(error.error || 'Failed to get ticket')
  }
  
  const data = await response.json()
  if (!data.ticket_data) {
    throw new Error('Invalid ticket data received from server')
  }

  return data
}

export const createTicket = async (request: CreateTicketRequest): Promise<TicketResponse> => {
  const session = await supabase.auth.getSession()
  if (!session.data.session?.access_token) {
    throw new Error('No active session')
  }

  const response = await fetch(
    `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/${FUNCTION_PREFIX}tickets-create`,
    {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${session.data.session.access_token}`,
      },
      body: JSON.stringify(request),
    }
  )

  if (!response.ok) {
    const error = await response.json()
    throw new Error(error.error || 'Failed to create ticket')
  }

  return await response.json()
}

export const updateTicket = async (request: UpdateTicketRequest): Promise<TicketResponse> => {
  const session = await supabase.auth.getSession()
  if (!session.data.session?.access_token) {
    throw new Error('No active session')
  }

  const response = await fetch(
    `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/${FUNCTION_PREFIX}tickets-update`,
    {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${session.data.session.access_token}`,
      },
      body: JSON.stringify(request),
    }
  )

  if (!response.ok) {
    const error = await response.json()
    throw new Error(error.error || 'Failed to update ticket')
  }

  return await response.json()
}

export const assignTicket = async (id: string, assignedTo: string | null): Promise<TicketResponse> => {
  const session = await supabase.auth.getSession()
  if (!session.data.session?.access_token) {
    throw new Error('No active session')
  }

  const response = await fetch(
    `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/${FUNCTION_PREFIX}tickets-assign`,
    {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${session.data.session.access_token}`,
      },
      body: JSON.stringify({ id, assignedTo }),
    }
  )

  if (!response.ok) {
    const error = await response.json()
    throw new Error(error.error || 'Failed to assign ticket')
  }

  return await response.json()
}

export const transitionTicket = async (id: string, status: TicketStatus): Promise<TicketResponse> => {
  const session = await supabase.auth.getSession()
  if (!session.data.session?.access_token) {
    throw new Error('No active session')
  }

  const response = await fetch(
    `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/${FUNCTION_PREFIX}tickets-transition`,
    {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${session.data.session.access_token}`,
      },
      body: JSON.stringify({ id, status }),
    }
  )

  if (!response.ok) {
    const error = await response.json()
    throw new Error(error.error || 'Failed to transition ticket')
  }

  return await response.json()
}

export const getTicketAuditLog = async (ticketId?: string): Promise<TicketAuditLogResponse> => {
  const session = await supabase.auth.getSession()
  if (!session.data.session?.access_token) {
    throw new Error('No active session')
  }

  const response = await fetch(
    `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/${FUNCTION_PREFIX}tickets-audit-log`,
    {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${session.data.session.access_token}`,
      },
      body: JSON.stringify({ ticketId }),
    }
  )

  if (!response.ok) {
    const error = await response.json()
    throw new Error(error.error || 'Failed to get ticket audit log')
  }

  return await response.json()
}

export const deleteTicket = async (id: string): Promise<void> => {
  const session = await supabase.auth.getSession()
  if (!session.data.session?.access_token) {
    throw new Error('No active session')
  }

  const response = await fetch(
    `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/${FUNCTION_PREFIX}tickets-delete`,
    {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${session.data.session.access_token}`,
      },
      body: JSON.stringify({ id }),
    }
  )

  if (!response.ok) {
    const error = await response.json()
    throw new Error(error.error || 'Failed to delete ticket')
  }
}

export interface TesterUser {
  id: string
  name: string
  email: string
  is_tester: boolean
}

export const getTesters = async (): Promise<TesterUser[]> => {
  const { data, error } = await supabase
    .from('users')
    .select('id, name, email, is_tester')
    .eq('is_tester', true)
    .order('name')

  if (error) throw error
  return data
}
