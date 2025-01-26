import { SupabaseClient } from '../_shared/deps.ts'

export class ValidationsListService {
  constructor(private supabaseClient: SupabaseClient) {}

  async getValidationsByFeatureIds(featureIds: string[], featureNames: Record<string, string>, ascending: boolean = false) {
    console.log('Getting validations for features:', { featureIds, ascending })

    if (!featureIds.length) return []

    const { data, error } = await this.supabaseClient
      .from('validations')
      .select(`
        *,
        validator:validated_by(name)
      `)
      .in('feature_id', featureIds)
      .order('created_at', { ascending })

    if (error) {
      throw error
    }

    const validations = (data || []).map(validation => ({
      ...validation,
      feature: {
        name: featureNames[validation.feature_id] || 'Unknown Feature'
      }
    }))

    console.log('Validations retrieved:', validations)
    return validations
  }

  async getFeatureValidationsWithValidator(featureId: string) {
    console.log('Getting validations with validator for feature:', featureId)

    const { data, error } = await this.supabaseClient
      .from('validations')
      .select(`
        *,
        validator:users!validations_validated_by_fkey (
          name
        )
      `)
      .eq('feature_id', featureId)
      .order('created_at', { ascending: false })

    if (error) {
      throw error
    }

    console.log('Validations with validator retrieved:', data)
    return data
  }

  async getFeatureValidations(featureId: string) {
    console.log('Getting validations for feature:', featureId)

    const { data, error } = await this.supabaseClient
      .from('validations')
      .select('*')
      .eq('feature_id', featureId)
      .order('created_at', { ascending: false })

    if (error) {
      throw error
    }

    console.log('Validations retrieved:', data)
    return data
  }
} 