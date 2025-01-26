import { SupabaseClient } from '../_shared/deps.ts'

export class CommentsDeleteService {
  constructor(private supabaseClient: SupabaseClient) {}

  async deleteComment(id: string) {
    const { error } = await this.supabaseClient
      .from('comments')
      .delete()
      .eq('id', id)

    if (error) throw error
  }
} 