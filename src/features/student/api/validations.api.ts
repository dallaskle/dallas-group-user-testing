import { supabase } from '@/lib/supabase'
import { Database } from '@/shared/types/database.types'

type Validation = Database['public']['Tables']['validations']['Row']

interface CreateValidationParams {
  featureId: string
  status: 'Working' | 'Needs Fixing'
  notes: string
  videoUrl: string
}

export const validationsApi = {
  async getFeatureValidations(featureId: string): Promise<Validation[]> {
    const { data, error } = await supabase
      .from('validations')
      .select('*')
      .eq('feature_id', featureId)
      .order('created_at', { ascending: false })

    if (error) {
      throw new Error(error.message)
    }

    return data
  },

  async createValidation({
    featureId,
    status,
    notes,
    videoUrl,
  }: CreateValidationParams): Promise<Validation> {
    const user = await supabase.auth.getUser()
    const userId = user.data.user?.id

    if (!userId) {
      throw new Error('User not authenticated')
    }

    // First get current validation count
    const { data: feature, error: featureError } = await supabase
      .from('features')
      .select('current_validations')
      .eq('id', featureId)
      .single()

    if (featureError) {
      throw new Error(featureError.message)
    }

    // Start a transaction
    const { data: validation, error: validationError } = await supabase
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
      throw new Error(validationError.message)
    }

    // Update feature validation count and status
    const { error: updateError } = await supabase
      .from('features')
      .update({
        current_validations: (feature?.current_validations || 0) + 1
      })
      .eq('id', featureId)

    if (updateError) {
      throw new Error(updateError.message)
    }

    // Create a testing ticket for self-testing
    const { data: testingTicket, error: testingError } = await supabase
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
      throw new Error(testingError.message)
    }

    // Create testing ticket details
    const { error: testingDetailsError } = await supabase
      .from('testing_tickets')
      .insert([
        {
          id: testingTicket.id,
          feature_id: featureId,
          deadline: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString() // 1 week deadline
        }
      ])

    if (testingDetailsError) {
      throw new Error(testingDetailsError.message)
    }

    return validation
  },

  async uploadVideo(file: File): Promise<string> {
    const fileExt = file.name.split('.').pop()
    const fileName = `${crypto.randomUUID()}.${fileExt}`
    const filePath = `validations/${fileName}`

    const { error: uploadError } = await supabase.storage
      .from('videos')
      .upload(filePath, file)

    if (uploadError) {
      throw new Error(uploadError.message)
    }

    const { data: { publicUrl } } = supabase.storage
      .from('videos')
      .getPublicUrl(filePath)

    return publicUrl
  },
} 