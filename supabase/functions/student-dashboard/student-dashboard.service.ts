import { SupabaseClient } from '../_shared/deps.ts'

export class StudentDashboardService {
  constructor(private supabaseClient: SupabaseClient) {}

  async getOutstandingTestingTickets(studentId: string) {
    console.log('Getting outstanding testing tickets for student:', studentId)

    // First, get all features for the student's projects
    const { data: features, error: featuresError } = await this.supabaseClient
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

    console.log('Features response:', JSON.stringify(features, null, 2))

    if (!features || features.length === 0) {
      console.log('No features found for student')
      return []
    }

    // Get testing tickets for these features
    const featureIds = features.map(f => f.id)
    console.log('Looking for tickets with feature IDs:', featureIds)

    const { data: testingTickets, error: ticketsError } = await this.supabaseClient
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
          id,
          title,
          status,
          priority,
          assigned_to,
          assignedTo:users!tickets_assigned_to_fkey(
            id,
            name,
            email
          )
        )
      `)
      .in('feature_id', featureIds)
      .eq('ticket.status', 'open')
      .order('deadline', { ascending: true })

    if (ticketsError) throw ticketsError

    console.log('Testing tickets response:', JSON.stringify(testingTickets, null, 2))

    if (!testingTickets || testingTickets.length === 0) {
      console.log('No testing tickets found')
      return []
    }

    // Map the data to include feature and project information
    const mappedTickets = testingTickets.map(testingTicket => {
      const feature = features.find(f => f.id === testingTicket.feature_id)
      if (!feature || !feature.project || !testingTicket.ticket) {
        console.warn('Invalid data structure in testing ticket:', testingTicket)
        return null
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
          assignedTo: testingTicket.ticket.assignedTo ? {
            name: testingTicket.ticket.assignedTo.name
          } : undefined
        },
        validation: testingTicket.validation?.[0] ? {
          status: testingTicket.validation[0].status,
          notes: testingTicket.validation[0].notes || undefined
        } : undefined
      }
    }).filter(Boolean)

    console.log('Mapped tickets:', JSON.stringify(mappedTickets, null, 2))
    return mappedTickets
  }

  async getDashboardData(studentId: string) {
    console.log('Getting dashboard data for student:', studentId)

    // Get projects with their registries and features
    const { data: projects, error: projectsError } = await this.supabaseClient
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

    if (!projects) {
      console.log('No projects found')
      return {
        projects: [],
        stats: {
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
        },
        recentActivity: []
      }
    }

    // Calculate dashboard stats
    const stats = {
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

    const dashboardProjects = projects.map(project => {
      const features = project.features || []
      const validation_count = features.reduce((sum: number, f: any) => sum + (f.current_validations || 0), 0)
      const required_validation_count = features.reduce((sum: number, f: any) => sum + (f.required_validations || 0), 0)

      // Update stats
      stats.total_features += features.length
      stats.total_validations += validation_count
      stats.required_validations += required_validation_count

      // Count features by status
      features.forEach((feature: any) => {
        const status = feature.status || 'Not Started'
        switch (status) {
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
    const { data: validations, error: validationsError } = await this.supabaseClient
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
    const { data: testingTickets, error: testingTicketsError } = await this.supabaseClient
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
    const { data: comments, error: commentsError } = await this.supabaseClient
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

    const recentValidations = validations || []
    const recentTestingTickets = testingTickets || []
    const recentComments = comments || []

    console.log('Found dashboard data:', {
      projectsCount: dashboardProjects.length,
      stats,
      recentActivityCount: recentValidations.length + recentTestingTickets.length + recentComments.length
    })

    // Combine and sort recent activity
    const recentActivity = [
      ...recentValidations.map(v => ({
        type: 'validation' as const,
        id: v.id,
        created_at: v.created_at,
        project_name: v.feature?.project?.name || 'Unknown Project',
        feature_name: v.feature?.name || 'Unknown Feature',
        details: { status: v.status }
      })),
      ...recentTestingTickets.map(t => ({
        type: 'ticket' as const,
        id: t.id,
        created_at: t.ticket?.created_at,
        project_name: t.feature?.project?.name || 'Unknown Project',
        feature_name: t.feature?.name || 'Unknown Feature',
        details: { 
          title: t.ticket?.title || 'Unknown Title',
          status: t.ticket?.status || 'Unknown Status'
        }
      })),
      ...recentComments.map(c => ({
        type: 'comment' as const,
        id: c.id,
        created_at: c.created_at,
        project_name: c.feature?.project?.name || 'Unknown Project',
        feature_name: c.feature?.name || 'Unknown Feature',
        details: { content: c.content }
      }))
    ]
      .filter(activity => activity.created_at) // Filter out any activities with missing dates
      .sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime())
      .slice(0, 10)

    return {
      projects: dashboardProjects,
      stats,
      recentActivity
    }
  }
} 