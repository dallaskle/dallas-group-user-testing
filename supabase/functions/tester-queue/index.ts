import { createHandler } from '../_shared/handler.ts'
import { corsHeaders } from '../_shared/cors.ts'
import { TesterQueueService } from './tester-queue.service.ts'

console.log('Hello from tester-queue!')

export default createHandler(async (_req, supabaseClient, user) => {
  const service = new TesterQueueService(supabaseClient)
  
  try {
    const queue = await service.getQueue(user.id)

    console.log('Queue:', queue)
    
    return new Response(
      JSON.stringify(queue),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200,
      }
    )
  } catch (error) {
    console.error('Error fetching queue:', error)
    return new Response(
      JSON.stringify({ error: error.message }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 500,
      }
    )
  }
}) 