import { supabase } from '@/lib/supabase'
import { Database } from '@/database.types'

type Comment = Database['public']['Tables']['comments']['Row'] & {
  author: {
    name: string
  } | null
}

export const commentsApi = {
  getFeatureComments: async (featureId: string): Promise<Comment[]> => {
    const { data, error } = await supabase.functions.invoke('comments-list', {
      body: { featureId }
    })

    if (error) throw error
    return data || []
  },

  createComment: async (comment: {
    feature_id: string
    content: string
    author_id: string
  }) => {
    const { data, error } = await supabase.functions.invoke('comments-create', {
      body: comment
    })

    if (error) throw error
    return data
  },

  updateComment: async (id: string, content: string) => {
    const { data, error } = await supabase.functions.invoke('comments-update', {
      method: 'PUT',
      body: { id, content }
    })

    if (error) throw error
    return data
  },

  deleteComment: async (id: string) => {
    const { error } = await supabase.functions.invoke('comments-delete', {
      method: 'DELETE',
      body: { id }
    })

    if (error) throw error
  }
} 