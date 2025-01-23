import { supabase } from '@/lib/supabase'
import type { Database } from '@/shared/types/database.types'

type ValidationResponse = {
  id: string
  created_at: string
  status: Database['public']['Tables']['validations']['Row']['status']
  feature: {
    name: string
    project: {
      name: string
    }
  }
}

type TestingTicketResponse = {
  id: string
  feature: {
    name: string
    project: {
      name: string
    }
  }
  ticket: {
    created_at: string
    title: string
    status: Database['public']['Tables']['tickets']['Row']['status']
  }
}

type CommentResponse = {
  id: string
  created_at: string
  content: string
  feature: {
    name: string
    project: {
      name: string
    }
  }
}

export interface ActivityLogEntry {
  type: 'validation' | 'comment' | 'ticket'
  id: string
  created_at: string
  project_name: string
  feature_name: string
  details: {
    status?: string
    content?: string
    title?: string
  }
}

export const activityLogApi = {
  async getRecentActivity(): Promise<ActivityLogEntry[]> {
    try {
      // Get recent validations
      const { data: recentValidations, error: validationsError } = await supabase
        .from('validations')
        .select(`
          id,
          created_at,
          status,
          feature:features!validations_feature_id_fkey(
            name,
            project:projects!features_project_id_fkey(
              name
            )
          )
        `)
        .order('created_at', { ascending: false })
        .limit(10)

      if (validationsError) throw validationsError

      // Get recent testing tickets
      const { data: recentTestingTickets, error: testingTicketsError } = await supabase
        .from('testing_tickets')
        .select(`
          id,
          feature:features!testing_tickets_feature_id_fkey(
            name,
            project:projects!features_project_id_fkey(
              name
            )
          ),
          ticket:tickets!testing_tickets_id_fkey(
            created_at,
            title,
            status
          )
        `)
        .order('created_at', { ascending: false })
        .limit(10)

      if (testingTicketsError) throw testingTicketsError

      // Get recent comments
      const { data: recentComments, error: commentsError } = await supabase
        .from('comments')
        .select(`
          id,
          created_at,
          content,
          feature:features!comments_feature_id_fkey(
            name,
            project:projects!features_project_id_fkey(
              name
            )
          )
        `)
        .order('created_at', { ascending: false })
        .limit(10)

      if (commentsError) throw commentsError

      // Combine and sort recent activity
      const recentActivity: ActivityLogEntry[] = [
        ...(recentValidations || []).map((v: any): ActivityLogEntry => ({
          type: 'validation' as const,
          id: v.id,
          created_at: v.created_at,
          project_name: v.feature.project.name,
          feature_name: v.feature.name,
          details: { status: v.status }
        })),
        ...(recentTestingTickets || []).map((t: any): ActivityLogEntry => ({
          type: 'ticket' as const,
          id: t.id,
          created_at: t.ticket.created_at,
          project_name: t.feature.project.name,
          feature_name: t.feature.name,
          details: { 
            title: t.ticket.title,
            status: t.ticket.status
          }
        })),
        ...(recentComments || []).map((c: any): ActivityLogEntry => ({
          type: 'comment' as const,
          id: c.id,
          created_at: c.created_at,
          project_name: c.feature.project.name,
          feature_name: c.feature.name,
          details: { content: c.content }
        }))
      ].sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime())
        .slice(0, 10)

      return recentActivity
    } catch (error) {
      console.error('Error fetching activity log:', error)
      return []
    }
  },

  async logActivity(data: {
    action: string
    entity_type: string
    entity_id: string
    details?: Record<string, any>
  }): Promise<void> {
    try {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) throw new Error('No authenticated user')

      // Instead of using a separate activity_log table,
      // we'll add the activity to the appropriate table based on the entity_type
      switch (data.entity_type) {
        case 'validation':
          await supabase
            .from('validations')
            .update({ status: data.details?.status })
            .eq('id', data.entity_id)
          break

        case 'comment':
          await supabase
            .from('comments')
            .insert({
              feature_id: data.entity_id,
              content: data.details?.content,
              author_id: user.id
            })
          break

        case 'ticket':
          await supabase
            .from('tickets')
            .update({ status: data.details?.status })
            .eq('id', data.entity_id)
          break
      }
    } catch (error) {
      console.error('Error logging activity:', error)
    }
  }
} 