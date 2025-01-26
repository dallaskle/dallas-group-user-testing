import { supabase } from '@/lib/supabase'
import { Database } from '@/database.types'

type Comment = Database['public']['Tables']['comments']['Row'] & {
  author: {
    name: string
  } | null
}

export const commentsApi = {
  getFeatureComments: async (featureId: string): Promise<Comment[]> => {
    const { data, error } = await supabase
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
  },

  createComment: async (comment: {
    feature_id: string
    content: string
    author_id: string
  }) => {
    const { data, error } = await supabase
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
  },

  updateComment: async (id: string, content: string) => {
    const { data, error } = await supabase
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
  },

  deleteComment: async (id: string) => {
    const { error } = await supabase
      .from('comments')
      .delete()
      .eq('id', id)

    if (error) throw error
  }
} 