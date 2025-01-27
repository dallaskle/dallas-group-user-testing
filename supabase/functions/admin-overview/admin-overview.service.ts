import { SupabaseClient } from '../_shared/deps.ts'

export class AdminOverviewService {
  constructor(private supabaseClient: SupabaseClient) {}

  async getOverviewData(userId: string) {
    const [
      projectRegistriesCount,
      totalProjectsCount,
      pendingValidationsCount,
      pendingTestsCount,
      totalTestersCount,
      projectProgress,
      testerPerformance
    ] = await Promise.all([
      this.getProjectRegistriesCount(),
      this.getTotalProjectsCount(),
      this.getPendingValidationsCount(),
      this.getPendingTestsCount(),
      this.getTotalTestersCount(),
      this.getProjectProgress(),
      this.getTesterPerformance()
    ])

    const response = {
      projectRegistriesCount,
      totalProjectsCount,
      pendingValidationsCount,
      pendingTestsCount,
      totalTestersCount,
      projectProgress,
      testerPerformance
    }

    console.log('Overview data response:', response)
    return response
  }

  private async getProjectRegistriesCount() {
    const { count, error } = await this.supabaseClient
      .from('project_registry')
      .select('*', { count: 'exact', head: true })
    
    if (error) throw error
    return count || 0
  }

  private async getTotalProjectsCount() {
    const { count, error } = await this.supabaseClient
      .from('projects')
      .select('*', { count: 'exact', head: true })
    
    if (error) throw error
    return count || 0
  }

  private async getPendingValidationsCount() {
    const { data, error } = await this.supabaseClient
      .from('features')
      .select('required_validations, current_validations')
    
    if (error) throw error
    
    return data.reduce((acc, feature) => {
      const pending = feature.required_validations - feature.current_validations
      return acc + (pending > 0 ? pending : 0)
    }, 0)
  }

  private async getPendingTestsCount() {
    const { count, error } = await this.supabaseClient
      .from('tickets')
      .select('*', { count: 'exact', head: true })
      .eq('type', 'testing')
      .in('status', ['open', 'in_progress'])
    
    if (error) throw error
    return count || 0
  }

  private async getTotalTestersCount() {
    const { count, error } = await this.supabaseClient
      .from('users')
      .select('*', { count: 'exact', head: true })
      .eq('is_tester', true)
    
    if (error) throw error
    return count || 0
  }

  private async getProjectProgress() {
    const { data, error } = await this.supabaseClient
      .from('features')
      .select(`
        status,
        project:projects (
          id,
          name,
          student:users!projects_student_id_fkey (
            id,
            name
          )
        )
      `)
    
    if (error) throw error
    
    return data.map(feature => ({
      status: feature.status,
      project: feature.project ? { 
        name: feature.project.name,
        student: feature.project.student
      } : null
    }))
  }

  private async getTesterPerformance() {
    // Get all testers
    const { data: testers, error: testersError } = await this.supabaseClient
      .from('users')
      .select('id, name, email')
      .eq('is_tester', true)

    if (testersError) throw testersError

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

    return testerStats
  }
} 