import { SupabaseClient } from '../_shared/deps.ts'

export class CommentsCreateService {
  constructor(private supabaseClient: SupabaseClient) {}

  async createComment(comment: {
    feature_id: string
    content: string
    author_id: string
  }) {
    const { data, error } = await this.supabaseClient
      .from('comments')
      .insert([comment])
      .select(`
        *,
        author:users!comments_author_id_fkey (
          name
        )
      `)
      .single()

    if (error) throw error
    return data
  }
} 