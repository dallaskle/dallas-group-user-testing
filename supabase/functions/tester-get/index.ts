import { createHandler } from '../_shared/handler.ts'
import { corsHeaders } from '../_shared/cors.ts'
import { TesterGetService } from './tester-get.service.ts'

console.log('Hello from tester-get!')

export default createHandler(async (_req, supabaseClient, _user) => {
  const service = new TesterGetService(supabaseClient)
  
  try {
    const testers = await service.getTesters()

    console.log('Testers:', testers)
    
    return new Response(
      JSON.stringify(testers),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200,
      }
    )
  } catch (error) {
    console.error('Error fetching testers:', error)
    return new Response(
      JSON.stringify({ error: error.message }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 500,
      }
    )
  }
}) 