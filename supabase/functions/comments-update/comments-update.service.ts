import { SupabaseClient } from '../_shared/deps.ts'

export class CommentsUpdateService {
  constructor(private supabaseClient: SupabaseClient) {}

  async updateComment(id: string, content: string) {
    const { data, error } = await this.supabaseClient
      .from('comments')
      .update({ content, updated_at: new Date().toISOString() })
      .eq('id', id)
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