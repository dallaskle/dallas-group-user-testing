import { supabase } from '@/lib/supabase'
import type { Database } from '@/shared/types/database.types'

type Ticket = Database['public']['Tables']['tickets']['Row']
type User = Database['public']['Tables']['users']['Row']

export interface TicketWithDetails extends Ticket {
  created_by_user: Pick<User, 'id' | 'name' | 'email'>
  assigned_to_user: Pick<User, 'id' | 'name' | 'email'> | null
}

export interface TicketStats {
  total: number
  open: number
  inProgress: number
  resolved: number
  closed: number
  unassigned: number
  highPriority: number
}

export const ticketManagementApi = {
  async getTickets(filters?: {
    status?: string[]
    priority?: string[]
    type?: string[]
    assignedTo?: string
  }): Promise<TicketWithDetails[]> {
    let query = supabase
      .from('tickets')
      .select(`
        *,
        created_by_user:created_by(id, name, email),
        assigned_to_user:assigned_to(id, name, email)
      `)
      .order('created_at', { ascending: false })

    if (filters?.status?.length) {
      query = query.in('status', filters.status)
    }
    if (filters?.priority?.length) {
      query = query.in('priority', filters.priority)
    }
    if (filters?.type?.length) {
      query = query.in('type', filters.type)
    }
    if (filters?.assignedTo) {
      query = query.eq('assigned_to', filters.assignedTo)
    }

    const { data: tickets, error } = await query

    if (error) {
      console.error('Error fetching tickets:', error)
      throw error
    }

    return tickets || []
  },

  async getTicketStats(): Promise<TicketStats> {
    const { data: stats, error } = await supabase
      .from('tickets')
      .select('status, priority, assigned_to')

    if (error) {
      console.error('Error fetching ticket stats:', error)
      throw error
    }

    return {
      total: stats.length,
      open: stats.filter(t => t.status === 'open').length,
      inProgress: stats.filter(t => t.status === 'in_progress').length,
      resolved: stats.filter(t => t.status === 'resolved').length,
      closed: stats.filter(t => t.status === 'closed').length,
      unassigned: stats.filter(t => !t.assigned_to).length,
      highPriority: stats.filter(t => t.priority === 'high' && t.status !== 'closed').length
    }
  },

  async updateTicket(id: string, data: Partial<{
    status: 'open' | 'in_progress' | 'resolved' | 'closed'
    priority: 'low' | 'medium' | 'high'
    assigned_to: string | null
    title: string
    description: string
  }>): Promise<void> {
    const { error } = await supabase
      .from('tickets')
      .update(data)
      .eq('id', id)

    if (error) {
      console.error('Error updating ticket:', error)
      throw error
    }
  },

  async deleteTicket(id: string): Promise<void> {
    const { error } = await supabase
      .from('tickets')
      .delete()
      .eq('id', id)

    if (error) {
      console.error('Error deleting ticket:', error)
      throw error
    }
  },

  async bulkUpdateTickets(ids: string[], data: Partial<{
    status: 'open' | 'in_progress' | 'resolved' | 'closed'
    priority: 'low' | 'medium' | 'high'
    assigned_to: string | null
  }>): Promise<void> {
    const { error } = await supabase
      .from('tickets')
      .update(data)
      .in('id', ids)

    if (error) {
      console.error('Error bulk updating tickets:', error)
      throw error
    }
  }
} 