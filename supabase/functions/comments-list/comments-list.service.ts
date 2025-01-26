import { SupabaseClient } from '../_shared/deps.ts'

export class CommentsListService {
  constructor(private supabaseClient: SupabaseClient) {}

  async getFeatureComments(featureId: string) {
    const { data, error } = await this.supabaseClient
      .from('comments')
      .select(`
        *,
        author:users!comments_author_id_fkey (
          name
        )
      `)
      .eq('feature_id', featureId)
      .order('created_at', { ascending: true })

    if (error) throw error
    return data || []
  }
} 