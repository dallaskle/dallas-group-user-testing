import { createHandler } from '../_shared/handler.ts'
import { corsHeaders } from '../_shared/cors.ts'
import { AdminTicketsService } from './admin-tickets.service.ts'

console.log('Hello from admin-tickets!')

export default createHandler(async (req, supabaseClient, user) => {
  const service = new AdminTicketsService(supabaseClient)
  
  try {
    // Parse request body to determine which action to take
    const { action, ...params } = await req.json()
    console.log('Request action:', action, 'params:', params)

    let data
    switch (action) {
      case 'list':
        data = await service.listTickets(params)
        break
      case 'get':
        data = await service.getTicketById(params.id)
        break
      case 'create':
        data = await service.createTicket(params, user.id)
        break
      case 'update':
        data = await service.updateTicket(params, user.id)
        break
      case 'assign':
        data = await service.assignTicket(params.id, params.assignedTo, user.id)
        break
      case 'transition':
        data = await service.transitionTicket(params.id, params.status, user.id)
        break
      case 'delete':
        await service.deleteTicket(params.id)
        data = { success: true }
        break
      case 'audit-log':
        data = await service.getTicketAuditLog(params.ticketId)
        break
      default:
        throw new Error(`Unknown action: ${action}`)
    }

    console.log('Response data:', data)
    
    return new Response(
      JSON.stringify(data),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200,
      }
    )
  } catch (error) {
    console.error('Error in admin-tickets:', error)
    return new Response(
      JSON.stringify({ error: error.message }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 500,
      }
    )
  }
}) 