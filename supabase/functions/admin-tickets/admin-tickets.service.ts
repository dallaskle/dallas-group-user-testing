import { SupabaseClient } from '../_shared/deps.ts'
import { 
  TicketType, 
  TicketStatus, 
  TicketPriority, 
  SupportCategory,
  ListTicketsRequest,
  CreateTicketRequest,
  UpdateTicketRequest
} from './types.ts'

export class AdminTicketsService {
  constructor(private supabaseClient: SupabaseClient) {}

  async listTickets(request: ListTicketsRequest) {
    const {
      type,
      status,
      priority,
      assignedTo,
      createdBy,
      projectId,
      page = 1,
      limit = 10
    } = request

    // Start building the query
    let query = this.supabaseClient
      .from('tickets')
      .select(`
        id,
        type,
        title,
        description,
        status,
        priority,
        created_at,
        updated_at,
        created_by,
        assigned_to,
        created_by_user:users!tickets_created_by_fkey (
          id,
          name,
          email,
          is_student,
          is_admin
        ),
        assigned_to_user:users!tickets_assigned_to_fkey (
          id,
          name,
          email,
          is_student,
          is_admin
        ),
        testing_ticket:testing_tickets (
          id,
          feature_id,
          validation_id,
          deadline
        ),
        support_ticket:support_tickets (
          id,
          category,
          project_id,
          feature_id,
          ai_response,
          resolution_notes
        )
      `, { count: 'exact' })

    // Apply filters
    if (type) {
      query = query.eq('type', type)
    }
    if (status) {
      query = query.eq('status', status)
    }
    if (priority) {
      query = query.eq('priority', priority)
    }
    if (assignedTo) {
      query = query.eq('assigned_to', assignedTo)
    }
    if (createdBy) {
      query = query.eq('created_by', createdBy)
    }
    if (projectId) {
      query = query.eq('project_id', projectId)
    }

    // Add pagination
    const from = (page - 1) * limit
    const to = from + limit - 1
    query = query
      .order('created_at', { ascending: false })
      .range(from, to)

    const { data, error, count } = await query

    if (error) throw error
    if (!data) return { tickets: [], total: 0, page, limit }

    // Transform the data
    const tickets = data.map(ticket => ({
      ticket_data: {
        ticket: {
          id: ticket.id,
          type: ticket.type as TicketType,
          title: ticket.title,
          description: ticket.description,
          status: ticket.status as TicketStatus,
          priority: ticket.priority as TicketPriority,
          assigned_to: ticket.assigned_to,
          created_by: ticket.created_by,
          created_at: ticket.created_at,
          updated_at: ticket.updated_at
        },
        testingDetails: ticket.testing_ticket?.[0],
        supportDetails: ticket.support_ticket?.[0],
        assignedToUser: ticket.assigned_to_user,
        createdByUser: ticket.created_by_user
      },
      total_count: count || 0
    }))

    return {
      tickets,
      total: count || 0,
      page,
      limit
    }
  }

  async getTicketById(id: string) {
    const { data, error } = await this.supabaseClient
      .from('tickets')
      .select(`
        id,
        type,
        title,
        description,
        status,
        priority,
        created_at,
        updated_at,
        created_by,
        assigned_to,
        created_by_user:users!tickets_created_by_fkey (
          id,
          name,
          email,
          is_student,
          is_admin
        ),
        assigned_to_user:users!tickets_assigned_to_fkey (
          id,
          name,
          email,
          is_student,
          is_admin
        ),
        testing_ticket:testing_tickets (
          id,
          feature_id,
          validation_id,
          deadline
        ),
        support_ticket:support_tickets (
          id,
          category,
          project_id,
          feature_id,
          ai_response,
          resolution_notes
        )
      `)
      .eq('id', id)
      .single()

    if (error) throw error
    if (!data) throw new Error('Ticket not found')

    return {
      ticket_data: {
        ticket: {
          id: data.id,
          type: data.type as TicketType,
          title: data.title,
          description: data.description,
          status: data.status as TicketStatus,
          priority: data.priority as TicketPriority,
          assigned_to: data.assigned_to,
          created_by: data.created_by,
          created_at: data.created_at,
          updated_at: data.updated_at
        },
        testingDetails: data.testing_ticket?.[0],
        supportDetails: data.support_ticket?.[0],
        assignedToUser: data.assigned_to_user,
        createdByUser: data.created_by_user
      },
      total_count: 1
    }
  }

  async createTicket(request: CreateTicketRequest, userId: string) {
    const {
      type,
      title,
      description,
      priority = 'medium',
      assignedTo,
      featureId,
      deadline,
      category,
      projectId
    } = request

    // Start a transaction
    const { error: txError } = await this.supabaseClient.rpc('begin_transaction')
    if (txError) throw txError

    try {
      // Create the base ticket
      const { data: ticket, error: ticketError } = await this.supabaseClient
        .from('tickets')
        .insert({
          type,
          title,
          description,
          priority,
          status: 'open',
          created_by: userId,
          assigned_to: assignedTo
        })
        .select()
        .single()

      if (ticketError) throw ticketError

      // Create additional details based on ticket type
      if (type === 'testing' && featureId && deadline) {
        const { error: testingError } = await this.supabaseClient
          .from('testing_tickets')
          .insert({
            ticket_id: ticket.id,
            feature_id: featureId,
            deadline
          })

        if (testingError) throw testingError
      } else if (type === 'support' && category) {
        const { error: supportError } = await this.supabaseClient
          .from('support_tickets')
          .insert({
            ticket_id: ticket.id,
            category,
            project_id: projectId,
            feature_id: featureId
          })

        if (supportError) throw supportError
      }

      // Commit the transaction
      const { error: commitError } = await this.supabaseClient.rpc('commit_transaction')
      if (commitError) throw commitError

      // Return the created ticket
      return this.getTicketById(ticket.id)
    } catch (error) {
      // Rollback on error
      await this.supabaseClient.rpc('rollback_transaction')
      throw error
    }
  }

  async updateTicket(request: UpdateTicketRequest, userId: string) {
    const { id, status, title, description, priority, assignedTo } = request

    // Create update object with only defined fields
    const updates: Record<string, unknown> = {}
    if (status !== undefined) updates.status = status
    if (title !== undefined) updates.title = title
    if (description !== undefined) updates.description = description
    if (priority !== undefined) updates.priority = priority
    if (assignedTo !== undefined) updates.assigned_to = assignedTo

    // Update the ticket
    const { error } = await this.supabaseClient
      .from('tickets')
      .update(updates)
      .eq('id', id)

    if (error) throw error

    // Log the changes in audit log
    for (const [field, value] of Object.entries(updates)) {
      await this.logTicketChange(id, userId, field, value)
    }

    return this.getTicketById(id)
  }

  async assignTicket(id: string, assignedTo: string | null, userId: string) {
    const { error } = await this.supabaseClient
      .from('tickets')
      .update({ assigned_to: assignedTo })
      .eq('id', id)

    if (error) throw error

    await this.logTicketChange(id, userId, 'assigned_to', assignedTo)
    return this.getTicketById(id)
  }

  async transitionTicket(id: string, status: TicketStatus, userId: string) {
    const { error } = await this.supabaseClient
      .from('tickets')
      .update({ status })
      .eq('id', id)

    if (error) throw error

    await this.logTicketChange(id, userId, 'status', status)
    return this.getTicketById(id)
  }

  async deleteTicket(id: string) {
    const { error } = await this.supabaseClient
      .from('tickets')
      .delete()
      .eq('id', id)

    if (error) throw error
  }

  async getTicketAuditLog(ticketId?: string) {
    let query = this.supabaseClient
      .from('ticket_audit_log')
      .select(`
        id,
        ticket_id,
        changed_by,
        field_name,
        old_value,
        new_value,
        created_at,
        users:users!ticket_audit_log_changed_by_fkey (
          id,
          name,
          email
        ),
        tickets (
          title,
          type,
          status,
          priority
        )
      `)
      .order('created_at', { ascending: false })

    if (ticketId) {
      query = query.eq('ticket_id', ticketId)
    }

    const { data, error } = await query
    if (error) throw error
    return { audit_logs: data || [] }
  }

  private async logTicketChange(
    ticketId: string,
    userId: string,
    fieldName: string,
    newValue: unknown
  ) {
    // Get the current ticket to get the old value
    const { data: ticket, error: ticketError } = await this.supabaseClient
      .from('tickets')
      .select(fieldName)
      .eq('id', ticketId)
      .single()

    if (ticketError) throw ticketError

    // Log the change
    const { error: logError } = await this.supabaseClient
      .from('ticket_audit_log')
      .insert({
        ticket_id: ticketId,
        changed_by: userId,
        field_name: fieldName,
        old_value: ticket[fieldName]?.toString() || null,
        new_value: newValue?.toString() || null
      })

    if (logError) throw logError
  }
} 