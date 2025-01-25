import { createHandler } from '../_shared/handler.ts'
import { corsHeaders } from '../_shared/cors.ts'

console.log('Hello from tester-claim!')

export default createHandler(async (req, supabaseClient, user) => {
  // Get the request body
  const { ticketId } = await req.json()
  if (!ticketId) {
    throw new Error('No ticket ID provided')
  }

  // Update the ticket
  const { data: ticket, error: ticketError } = await supabaseClient
    .from('tickets')
    .update({
      status: 'in_progress',
      assigned_to: user.id,
    })
    .eq('id', ticketId)
    .eq('type', 'testing')
    .eq('status', 'open')
    .select('*, testing_ticket:testing_tickets(*), feature:features(*)')
    .single()

  if (ticketError) {
    throw ticketError
  }

  // Return the updated ticket
  return new Response(
    JSON.stringify(ticket),
    {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: 200,
    }
  )
}) 