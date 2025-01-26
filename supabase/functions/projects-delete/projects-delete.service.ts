import { SupabaseClient } from '../_shared/deps.ts'

export class ProjectsDeleteService {
  constructor(private supabaseClient: SupabaseClient) {}

  async deleteProject(id: string) {
    // Get all features for this project
    const { data: features, error: featuresError } = await this.supabaseClient
      .from('features')
      .select('id')
      .eq('project_id', id)

    if (featuresError) throw featuresError

    const featureIds = features.map(f => f.id)

    // Delete all validations for the features
    if (featureIds.length > 0) {
      const { error: validationsError } = await this.supabaseClient
        .from('validations')
        .delete()
        .in('feature_id', featureIds)

      if (validationsError) throw validationsError
    }

    // Delete all comments for the features
    if (featureIds.length > 0) {
      const { error: commentsError } = await this.supabaseClient
        .from('comments')
        .delete()
        .in('feature_id', featureIds)

      if (commentsError) throw commentsError
    }

    // Get and delete testing tickets
    if (featureIds.length > 0) {
      const { data: testingTickets, error: testingTicketsQueryError } = await this.supabaseClient
        .from('testing_tickets')
        .select('id')
        .in('feature_id', featureIds)

      if (testingTicketsQueryError) throw testingTicketsQueryError

      const testingTicketIds = testingTickets.map(t => t.id)

      if (testingTicketIds.length > 0) {
        const { error: testingTicketsError } = await this.supabaseClient
          .from('tickets')
          .delete()
          .in('id', testingTicketIds)

        if (testingTicketsError) throw testingTicketsError

        const { error: testingTicketsDeleteError } = await this.supabaseClient
          .from('testing_tickets')
          .delete()
          .in('id', testingTicketIds)

        if (testingTicketsDeleteError) throw testingTicketsDeleteError
      }
    }

    // Get and delete support tickets
    const { data: supportTickets, error: supportTicketsQueryError } = await this.supabaseClient
      .from('support_tickets')
      .select('id')
      .eq('project_id', id)
      .or(`feature_id.in.(${featureIds.join(',')})`)

    if (supportTicketsQueryError) throw supportTicketsQueryError

    const supportTicketIds = supportTickets.map(t => t.id)

    if (supportTicketIds.length > 0) {
      const { error: supportTicketsError } = await this.supabaseClient
        .from('tickets')
        .delete()
        .in('id', supportTicketIds)

      if (supportTicketsError) throw supportTicketsError

      const { error: supportTicketsDeleteError } = await this.supabaseClient
        .from('support_tickets')
        .delete()
        .in('id', supportTicketIds)

      if (supportTicketsDeleteError) throw supportTicketsDeleteError
    }

    // Delete all features
    const { error: featuresDeleteError } = await this.supabaseClient
      .from('features')
      .delete()
      .eq('project_id', id)

    if (featuresDeleteError) throw featuresDeleteError

    // Finally delete the project
    const { error: projectError } = await this.supabaseClient
      .from('projects')
      .delete()
      .eq('id', id)

    if (projectError) throw projectError

    console.log('Project deleted:', id)
  }

  async deleteFeature(id: string) {
    const { error } = await this.supabaseClient
      .from('features')
      .delete()
      .eq('id', id)

    if (error) throw error

    console.log('Feature deleted:', id)
  }
} 