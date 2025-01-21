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
    const { data: validation, error: validationError } = await supabase
      .from('validations')
      .insert([
        {
          feature_id: featureId,
          status,
          notes,
          video_url: videoUrl,
          validated_by: (await supabase.auth.getUser()).data.user?.id,
        },
      ])
      .select()
      .single()

    if (validationError) {
      throw new Error(validationError.message)
    }

    // Update the feature's validation count
    const { error: updateError } = await supabase.rpc('increment_feature_validations', {
      p_feature_id: featureId,
    })

    if (updateError) {
      throw new Error(updateError.message)
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