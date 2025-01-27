import { SupabaseClient } from '../_shared/deps.ts'

export class AdminTestersService {
  constructor(private supabaseClient: SupabaseClient) {}

  async getTesterPerformance() {
    // Get all testers
    const { data: testers, error: testersError } = await this.supabaseClient
      .from('users')
      .select('id, name, email')
      .eq('is_tester', true)

    if (testersError) throw testersError
    if (!testers) return []

    // For each tester, get their stats
    const testerStats = await Promise.all(testers.map(async (tester) => {
      const [
        pendingTickets,
        completedTickets,
        lastCompletedTicket,
        validations
      ] = await Promise.all([
        // Get pending tickets count
        this.supabaseClient
          .from('tickets')
          .select('*', { count: 'exact', head: true })
          .eq('type', 'testing')
          .eq('assigned_to', tester.id)
          .in('status', ['open', 'in_progress']),

        // Get completed tickets count
        this.supabaseClient
          .from('tickets')
          .select('*', { count: 'exact', head: true })
          .eq('type', 'testing')
          .eq('assigned_to', tester.id)
          .in('status', ['resolved', 'closed']),

        // Get last completed ticket
        this.supabaseClient
          .from('tickets')
          .select('updated_at')
          .eq('type', 'testing')
          .eq('assigned_to', tester.id)
          .in('status', ['resolved', 'closed'])
          .order('updated_at', { ascending: false })
          .limit(1),

        // Get validations for accuracy rate
        this.supabaseClient
          .from('validations')
          .select('status, created_at')
          .eq('validated_by', tester.id)
      ])

      // Calculate accuracy rate
      const totalValidations = validations.data?.length || 0
      const successfulValidations = validations.data?.filter(v => v.status === 'Working').length || 0
      const accuracyRate = totalValidations > 0 ? (successfulValidations / totalValidations) * 100 : 0

      // Calculate average response time
      const responseTimesSum = validations.data?.reduce((sum, validation) => {
        const validationDate = new Date(validation.created_at)
        return sum + validationDate.getTime()
      }, 0)

      const avgResponseTime = responseTimesSum && validations.data 
        ? responseTimesSum / validations.data.length 
        : 0

      return {
        id: tester.id,
        name: tester.name,
        email: tester.email,
        testsPending: pendingTickets.count || 0,
        testsCompleted: completedTickets.count || 0,
        lastTestCompleted: lastCompletedTicket.data?.[0]?.updated_at || null,
        accuracyRate,
        avgResponseTime
      }
    }))

    console.log('Tester performance response:', testerStats)
    return testerStats
  }

  async getTestHistory() {
    // First get all testing tickets with their related data
    const { data: testingTickets, error: ticketsError } = await this.supabaseClient
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

    // Get all validations for the features in these testing tickets
    const featureIds = filteredTestingTickets
      .map(ticket => ticket.feature_id)
      .filter((id): id is string => Boolean(id))
    
    if (featureIds.length === 0) {
      console.log('No feature IDs found')
      return []
    }

    const { data: validations, error: validationsError } = await this.supabaseClient
      .from('validations')
      .select('*')
      .in('feature_id', featureIds)
      .order('created_at', { ascending: false })

    if (validationsError) {
      console.error('Error fetching validations:', validationsError)
      throw validationsError
    }

    // Map the data together
    const response = filteredTestingTickets.map(testingTicket => ({
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
            student: testingTicket.feature.project.student
          }
        },
        validations: validations
          ?.filter(v => v.feature_id === testingTicket.feature_id)
          .map(v => ({
            id: v.id,
            status: v.status as 'Working' | 'Needs Fixing',
            video_url: v.video_url,
            notes: v.notes,
            created_at: v.created_at
          })) || []
      }
    }))

    console.log('Test history response:', response)
    return response
  }
} 