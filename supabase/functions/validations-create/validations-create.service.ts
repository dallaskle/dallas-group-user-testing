import { SupabaseClient } from '../_shared/deps.ts'

export class ValidationsCreateService {
  constructor(private supabaseClient: SupabaseClient) {}

  async createValidation(userId: string, {
    featureId,
    status,
    notes,
    videoUrl,
  }: {
    featureId: string
    status: 'Working' | 'Needs Fixing'
    notes: string
    videoUrl: string
  }) {
    console.log('Creating validation:', { featureId, status, notes, videoUrl })

    // First get current validation count
    const { data: feature, error: featureError } = await this.supabaseClient
      .from('features')
      .select('current_validations')
      .eq('id', featureId)
      .single()

    if (featureError) {
      throw featureError
    }

    // Start a transaction
    const { data: validation, error: validationError } = await this.supabaseClient
      .from('validations')
      .insert([
        {
          feature_id: featureId,
          status,
          notes,
          video_url: videoUrl,
          validated_by: userId,
        },
      ])
      .select()
      .single()

    if (validationError) {
      throw validationError
    }

    // Update feature validation count and status if status is 'Working'
    if (status === 'Working') {
      const { error: updateError } = await this.supabaseClient
        .from('features')
        .update({
          current_validations: (feature?.current_validations || 0) + 1
        })
        .eq('id', featureId)

      if (updateError) {
        throw updateError
      }
    }

    // Create a testing ticket for self-testing
    const { data: testingTicket, error: testingError } = await this.supabaseClient
      .from('tickets')
      .insert([
        {
          type: 'testing',
          title: `Validate feature: ${featureId}`,
          description: 'Self-assigned testing ticket for feature validation',
          priority: 'medium',
          status: 'open',
          created_by: userId,
          assigned_to: userId
        }
      ])
      .select()
      .single()

    if (testingError) {
      throw testingError
    }

    // Create testing ticket details
    const { error: testingDetailsError } = await this.supabaseClient
      .from('testing_tickets')
      .insert([
        {
          id: testingTicket.id,
          feature_id: featureId,
          deadline: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString() // 1 week deadline
        }
      ])

    if (testingDetailsError) {
      throw testingDetailsError
    }

    console.log('Validation created successfully:', validation)
    return validation
  }
} 