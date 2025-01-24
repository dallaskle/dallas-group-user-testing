import { supabase } from '@/lib/supabase'
import type { ProjectProgress } from '../store/adminDashboard.store'

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

export const getProjectRegistriesCount = async () => {
  const { count, error } = await supabase
    .from('project_registry')
    .select('*', { count: 'exact', head: true })
  
  if (error) throw error
  return count || 0
}

export const getTotalProjectsCount = async () => {
  const { count, error } = await supabase
    .from('projects')
    .select('*', { count: 'exact', head: true })
  
  if (error) throw error
  return count || 0
}

export const getPendingValidationsCount = async () => {
  const { data, error } = await supabase
    .from('features')
    .select('required_validations, current_validations')
  
  if (error) throw error
  
  return data.reduce((acc, feature) => {
    const pending = feature.required_validations - feature.current_validations
    return acc + (pending > 0 ? pending : 0)
  }, 0)
}

export const getPendingTestsCount = async () => {
  const { count, error } = await supabase
    .from('tickets')
    .select('*', { count: 'exact', head: true })
    .eq('type', 'testing')
    .in('status', ['open', 'in_progress'])
  
  if (error) throw error
  return count || 0
}

export const getTotalTestersCount = async () => {
  const { count, error } = await supabase
    .from('users')
    .select('*', { count: 'exact', head: true })
    .eq('is_tester', true)
  
  if (error) throw error
  return count || 0
}

export const getProjectProgress = async (): Promise<ProjectProgress[]> => {
  const { data, error } = await supabase
    .from('features')
    .select(`
      status,
      projects (
        name
      )
    `)
    .returns<Array<{ status: ProjectProgress['status']; projects: { name: string } | null }>>()
  
  if (error) throw error
  
  return data.map(feature => ({
    status: feature.status,
    project: feature.projects ? { name: feature.projects.name } : null
  }))
}

export const getTesterPerformance = async () => {
  // Get all testers
  const { data: testers, error: testersError } = await supabase
    .from('users')
    .select('id, name')
    .eq('is_tester', true)
  
  if (testersError) throw testersError

  // For each tester, get their tickets
  const testerStats = await Promise.all(testers.map(async (tester) => {
    const { count: pendingCount, error: pendingError } = await supabase
      .from('tickets')
      .select('*', { count: 'exact', head: true })
      .eq('type', 'testing')
      .eq('assigned_to', tester.id)
      .in('status', ['open', 'in_progress'])

    const { count: completedCount, error: completedError } = await supabase
      .from('tickets')
      .select('*', { count: 'exact', head: true })
      .eq('type', 'testing')
      .eq('assigned_to', tester.id)
      .eq('status', 'resolved')

    const { data: lastCompleted, error: lastCompletedError } = await supabase
      .from('tickets')
      .select('created_at')
      .eq('type', 'testing')
      .eq('assigned_to', tester.id)
      .eq('status', 'resolved')
      .order('created_at', { ascending: false })
      .limit(1)

    if (pendingError || completedError || lastCompletedError) {
      throw pendingError || completedError || lastCompletedError
    }

    return {
      name: tester.name,
      testsPending: pendingCount || 0,
      testsCompleted: completedCount || 0,
      lastTestCompleted: lastCompleted?.[0]?.created_at || null
    }
  }))

  return testerStats
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
      .order('created_at', { ascending: false }),

    // New Projects
    supabase
      .from('projects')
      .select(`
        id,
        name,
        created_at,
        student_id,
        users!projects_student_id_fkey (id, name)
      `)
      .gte('created_at', startDate)
      .order('created_at', { ascending: false }),

    // New Features
    supabase
      .from('features')
      .select(`
        id,
        name,
        created_at,
        projects (
          id,
          name,
          users!projects_student_id_fkey (id, name)
        )
      `)
      .gte('created_at', startDate)
      .order('created_at', { ascending: false }),

    // New Comments
    supabase
      .from('comments')
      .select(`
        id,
        content,
        created_at,
        author_id,
        users!comments_author_id_fkey (id, name),
        features (
          id,
          name,
          projects (
            id,
            name
          )
        )
      `)
      .gte('created_at', startDate)
      .order('created_at', { ascending: false }),

    // New Validations
    supabase
      .from('validations')
      .select(`
        id,
        status,
        created_at,
        validated_by,
        users!validations_validated_by_fkey (id, name),
        features (
          id,
          name,
          projects (
            id,
            name
          )
        )
      `)
      .gte('created_at', startDate)
      .order('created_at', { ascending: false }),

    // New Tickets
    supabase
      .from('tickets')
      .select(`
        id,
        type,
        title,
        created_at,
        created_by,
        assigned_to,
        users!tickets_created_by_fkey (id, name),
        assignee:users!tickets_assigned_to_fkey (id, name)
      `)
      .gte('created_at', startDate)
      .order('created_at', { ascending: false }),

    // New Project Registries
    supabase
      .from('project_registry')
      .select(`
        id,
        name,
        created_at,
        created_by,
        users!project_registry_created_by_fkey (id, name)
      `)
      .gte('created_at', startDate)
      .order('created_at', { ascending: false }),

    // New Feature Registries
    supabase
      .from('feature_registry')
      .select(`
        id,
        name,
        created_at,
        project_registry (
          id,
          name,
          created_by,
          users!project_registry_created_by_fkey (id, name)
        )
      `)
      .gte('created_at', startDate)
      .order('created_at', { ascending: false })
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
      actor: { id: project.users.id, name: project.users.name },
      data: { name: project.name }
    })))
  }

  if (!newFeatures.error && newFeatures.data) {
    activities.push(...newFeatures.data.map(feature => ({
      id: `feature-${feature.id}`,
      type: 'feature' as ActivityType,
      created_at: feature.created_at,
      actor: { id: feature.projects.users.id, name: feature.projects.users.name },
      data: {
        name: feature.name,
        project_name: feature.projects.name
      }
    })))
  }

  if (!newComments.error && newComments.data) {
    activities.push(...newComments.data.map(comment => ({
      id: `comment-${comment.id}`,
      type: 'comment' as ActivityType,
      created_at: comment.created_at,
      actor: { id: comment.users.id, name: comment.users.name },
      data: {
        content: comment.content,
        feature_name: comment.features.name,
        project_name: comment.features.projects.name
      }
    })))
  }

  if (!newValidations.error && newValidations.data) {
    activities.push(...newValidations.data.map(validation => ({
      id: `validation-${validation.id}`,
      type: 'validation' as ActivityType,
      created_at: validation.created_at,
      actor: { id: validation.users.id, name: validation.users.name },
      data: {
        status: validation.status,
        feature_name: validation.features.name,
        project_name: validation.features.projects.name
      }
    })))
  }

  if (!newTickets.error && newTickets.data) {
    activities.push(...newTickets.data.map(ticket => ({
      id: `ticket-${ticket.id}`,
      type: 'ticket' as ActivityType,
      created_at: ticket.created_at,
      actor: { id: ticket.users.id, name: ticket.users.name },
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
      actor: { id: registry.users.id, name: registry.users.name },
      data: { name: registry.name }
    })))
  }

  if (!newFeatureRegistries.error && newFeatureRegistries.data) {
    activities.push(...newFeatureRegistries.data.map(registry => ({
      id: `feature-registry-${registry.id}`,
      type: 'feature_registry' as ActivityType,
      created_at: registry.created_at,
      actor: { 
        id: registry.project_registry.users.id, 
        name: registry.project_registry.users.name 
      },
      data: {
        name: registry.name,
        project_name: registry.project_registry.name
      }
    })))
  }

  // Sort all activities by created_at
  return activities.sort((a, b) => 
    new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
  )
}

export const getProjectsWithDetails = async (): Promise<ProjectDetails[]> => {
  const { data, error } = await supabase
    .from('projects')
    .select(`
      id,
      name,
      project_registry:project_registry_id (
        id,
        name
      ),
      users!projects_student_id_fkey (
        id,
        name
      ),
      features (
        id,
        status,
        required_validations,
        current_validations
      )
    `)

  if (error) throw error

  return data.map(project => {
    const features = project.features || []
    return {
      id: project.id,
      name: project.name,
      registry: {
        id: project.project_registry.id,
        name: project.project_registry.name
      },
      user: {
        id: project.users.id,
        name: project.users.name
      },
      features_count: features.length,
      validations: {
        completed: features.reduce((sum, f) => sum + (f.current_validations || 0), 0),
        required: features.reduce((sum, f) => sum + (f.required_validations || 0), 0)
      },
      status_counts: {
        not_started: features.filter(f => f.status === 'Not Started').length,
        in_progress: features.filter(f => f.status === 'In Progress').length,
        successful_test: features.filter(f => f.status === 'Successful Test').length,
        failed_test: features.filter(f => f.status === 'Failed Test').length
      }
    }
  })
}
