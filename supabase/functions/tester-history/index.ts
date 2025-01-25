import { createHandler } from '../_shared/handler.ts'
import { corsHeaders } from '../_shared/cors.ts'
import { getTesterHistory } from './tester-history.service.ts'

console.log('Hello from tester-history!')

export default createHandler(async (req, supabaseClient, user) => {
  const tickets = await getTesterHistory(supabaseClient, user.id)
  console.log('Tickets found:', tickets?.length ?? 0)

  return new Response(
    JSON.stringify(tickets),
    {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: 200,
    }
  )
}) 