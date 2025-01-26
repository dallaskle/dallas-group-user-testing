import { supabase } from '@/lib/supabase'
import { Database } from '@/database.types'
import { useAuthStore } from '@/features/auth/store/auth.store'

type Validation = Database['public']['Tables']['validations']['Row']

type ValidationWithValidator = Database['public']['Tables']['validations']['Row'] & {
  validator: {
    name: string
  } | null
}

type ValidationWithFeature = Validation & {
  validator: {
    name: string
  }
  feature: {
    name: string
  }
}

interface CreateValidationParams {
  featureId: string
  status: 'Working' | 'Needs Fixing'
  notes: string
  videoUrl: string
}

export const validationsApi = {
  async getValidationsByFeatureIds(featureIds: string[], featureNames: Record<string, string>, ascending: boolean = false): Promise<ValidationWithFeature[]> {
    const session = useAuthStore.getState().session
    if (!session?.access_token) throw new Error('No active session')

    const { data, error } = await supabase.functions.invoke('validations-list', {
      body: {
        featureIds,
        featureNames,
        ascending
      },
      headers: {
        Authorization: `Bearer ${session.access_token}`
      }
    })

    if (error) throw error
    return data
  },

  async getFeatureValidationsWithValidator(featureId: string): Promise<ValidationWithValidator[]> {
    const session = useAuthStore.getState().session
    if (!session?.access_token) throw new Error('No active session')

    const { data, error } = await supabase.functions.invoke('validations-list', {
      body: {
        featureId,
        withValidator: true
      },
      headers: {
        Authorization: `Bearer ${session.access_token}`
      }
    })

    if (error) throw error
    return data
  },

  async getFeatureValidations(featureId: string): Promise<Validation[]> {
    const session = useAuthStore.getState().session
    if (!session?.access_token) throw new Error('No active session')

    const { data, error } = await supabase.functions.invoke('validations-list', {
      body: {
        featureId
      },
      headers: {
        Authorization: `Bearer ${session.access_token}`
      }
    })

    if (error) throw error
    return data
  },

  async createValidation({
    featureId,
    status,
    notes,
    videoUrl,
  }: CreateValidationParams): Promise<Validation> {
    const session = useAuthStore.getState().session
    if (!session?.access_token) throw new Error('No active session')

    const { data, error } = await supabase.functions.invoke('validations-create', {
      body: {
        featureId,
        status,
        notes,
        videoUrl,
      },
      headers: {
        Authorization: `Bearer ${session.access_token}`
      }
    })

    if (error) throw error
    return data
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