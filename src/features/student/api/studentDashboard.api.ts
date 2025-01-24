import { supabase } from '@/lib/supabase'
import { Database } from '@/shared/types/database.types'

type Project = Database['public']['Tables']['projects']['Row']
type Feature = Database['public']['Tables']['features']['Row']

interface DashboardProject extends Project {
  registry: {
    name: string
  }
  features: Feature[]
  feature_count: number
  validation_count: number
  required_validation_count: number
}

interface DashboardStats {
  total_projects: number
  total_features: number
  total_validations: number
  required_validations: number
  validation_completion: number
  projects_by_status: {
    not_started: number
    in_progress: number
    successful: number
    failed: number
  }
}

interface RecentActivity {
  type: 'validation' | 'comment' | 'ticket'
  id: string
  created_at: string
  project_name: string
  feature_name: string
  details: {
    status?: string
    content?: string
    title?: string
  }
}

interface ValidationWithFeature {
  id: string
  created_at: string
  status: string
  feature: {
    name: string
    project: {
      name: string
    }
  }
}

interface TestingTicketWithFeature {
  id: string
  feature: {
    name: string
    project: {
      name: string
    }
  }
  ticket: {
    created_at: string
    title: string
    status: string
  }
}

interface CommentWithFeature {
  id: string
  created_at: string
  content: string
  feature: {
    name: string
    project: {
      name: string
    }
  }
}

interface OutstandingTestingTicket {
  id: string
  deadline: string
  feature: {
    name: string
    project: {
      name: string
    }
    current_validations: number
    required_validations: number
  }
  ticket: {
    title: string
    status: string
    priority: string
    assignedTo?: {
      name: string
    }
  }
  validation?: {
    status: string
    notes?: string
  }
}

export const studentDashboardApi = {
  async getOutstandingTestingTickets(studentId: string): Promise<OutstandingTestingTicket[]> {
    // First, get all features for the student's projects
    const { data: features, error: featuresError } = await supabase
      .from('features')
      .select(`
        id,
        name,
        current_validations,
        required_validations,
        project:projects!inner(
          name,
          student_id
        )
      `)
      .eq('project.student_id', studentId)

    if (featuresError) throw featuresError

    if (!features || features.length === 0) {
      return []
    }

    // Get testing tickets for these features
    const featureIds = features.map(f => f.id)
    const { data: testingTickets, error: ticketsError } = await supabase
      .from('testing_tickets')
      .select(`
        id,
        deadline,
        feature_id,
        validation_id,
        validation:validations(
          status,
          notes
        ),
        ticket:tickets!inner(
          title,
          status,
          priority,
          assigned_to,
          assignedToUser:users!tickets_assigned_to_fkey(
            name
          )
        )
      `)
      .in('feature_id', featureIds)
      .eq('ticket.status', 'open')
      .order('deadline', { ascending: true })

    if (ticketsError) throw ticketsError

    // Map the data to include feature and project information
    return (testingTickets || []).map(testingTicket => {
      const feature = features.find(f => f.id === testingTicket.feature_id)
      if (!feature || !feature.project || !testingTicket.ticket) {
        throw new Error('Invalid data structure in testing ticket response')
      }

      return {
        id: testingTicket.id,
        deadline: testingTicket.deadline,
        feature: {
          name: feature.name,
          project: {
            name: feature.project.name
          },
          current_validations: feature.current_validations,
          required_validations: feature.required_validations
        },
        ticket: {
          title: testingTicket.ticket.title,
          status: testingTicket.ticket.status,
          priority: testingTicket.ticket.priority,
          assignedTo: testingTicket.ticket.assignedToUser
        },
        validation: testingTicket.validation?.[0]
      }
    })
  },

  async getDashboardData(studentId: string) {
    // Get projects with their registries and features
    const { data: projects, error: projectsError } = await supabase
      .from('projects')
      .select(`
        *,
        registry:project_registry(
          name
        ),
        features(*)
      `)
      .eq('student_id', studentId)
      .order('created_at', { ascending: false })

    if (projectsError) throw projectsError

    // Calculate dashboard stats
    const stats: DashboardStats = {
      total_projects: 0,
      total_features: 0,
      total_validations: 0,
      required_validations: 0,
      validation_completion: 0,
      projects_by_status: {
        not_started: 0,
        in_progress: 0,
        successful: 0,
        failed: 0
      }
    }

    const dashboardProjects: DashboardProject[] = projects.map(project => {
      const features = project.features || []
      const validation_count = features.reduce((sum: number, f: Feature) => sum + (f.current_validations || 0), 0)
      const required_validation_count = features.reduce((sum: number, f: Feature) => sum + (f.required_validations || 0), 0)

      // Update stats
      stats.total_features += features.length
      stats.total_validations += validation_count
      stats.required_validations += required_validation_count

      // Count features by status
      features.forEach((feature: Feature) => {
        switch (feature.status) {
          case 'Not Started':
            stats.projects_by_status.not_started++
            break
          case 'In Progress':
            stats.projects_by_status.in_progress++
            break
          case 'Successful Test':
            stats.projects_by_status.successful++
            break
          case 'Failed Test':
            stats.projects_by_status.failed++
            break
        }
      })

      return {
        ...project,
        features,
        feature_count: features.length,
        validation_count,
        required_validation_count
      }
    })

    stats.total_projects = dashboardProjects.length
    stats.validation_completion = stats.required_validations > 0
      ? (stats.total_validations / stats.required_validations) * 100
      : 0

    // Get recent activity (last 30 days)
    const thirtyDaysAgo = new Date()
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30)

    // Get recent validations
    const { data: recentValidations, error: validationsError } = await supabase
      .from('validations')
      .select(`
        id,
        created_at,
        status,
        feature:features!validations_feature_id_fkey(
          name,
          project:projects!features_project_id_fkey(
            name
          )
        )
      `)
      .gt('created_at', thirtyDaysAgo.toISOString())
      .order('created_at', { ascending: false })
      .limit(10)

    if (validationsError) throw validationsError

    // Get recent testing tickets
    const { data: recentTestingTickets, error: testingTicketsError } = await supabase
      .from('testing_tickets')
      .select(`
        id,
        feature:features!testing_tickets_feature_id_fkey(
          name,
          project:projects!features_project_id_fkey(
            name
          )
        ),
        ticket:tickets!testing_tickets_id_fkey(
          created_at,
          title,
          status
        )
      `)
      .gt('created_at', thirtyDaysAgo.toISOString())
      .order('created_at', { ascending: false })
      .limit(10)

    if (testingTicketsError) throw testingTicketsError

    // Get recent comments
    const { data: recentComments, error: commentsError } = await supabase
      .from('comments')
      .select(`
        id,
        created_at,
        content,
        feature:features!comments_feature_id_fkey(
          name,
          project:projects!features_project_id_fkey(
            name
          )
        )
      `)
      .eq('author_id', studentId)
      .gt('created_at', thirtyDaysAgo.toISOString())
      .order('created_at', { ascending: false })
      .limit(10)

    if (commentsError) throw commentsError

    // Combine and sort recent activity
    const recentActivity: RecentActivity[] = [
      ...((recentValidations || []) as unknown as ValidationWithFeature[]).map(v => ({
        type: 'validation' as const,
        id: v.id,
        created_at: v.created_at,
        project_name: v.feature.project.name,
        feature_name: v.feature.name,
        details: { status: v.status }
      })),
      ...((recentTestingTickets || []) as unknown as TestingTicketWithFeature[]).map(t => ({
        type: 'ticket' as const,
        id: t.id,
        created_at: t.ticket.created_at,
        project_name: t.feature.project.name,
        feature_name: t.feature.name,
        details: { 
          title: t.ticket.title,
          status: t.ticket.status
        }
      })),
      ...((recentComments || []) as unknown as CommentWithFeature[]).map(c => ({
        type: 'comment' as const,
        id: c.id,
        created_at: c.created_at,
        project_name: c.feature.project.name,
        feature_name: c.feature.name,
        details: { content: c.content }
      }))
    ].sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime())
      .slice(0, 10)

    return {
      projects: dashboardProjects,
      stats,
      recentActivity
    }
  }
} 