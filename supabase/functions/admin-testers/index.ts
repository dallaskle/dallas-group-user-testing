import { createHandler } from '../_shared/handler.ts'
import { corsHeaders } from '../_shared/cors.ts'
import { AdminTestersService } from './admin-testers.service.ts'

console.log('Hello from admin-testers!')

export default createHandler(async (req, supabaseClient, user) => {
  const service = new AdminTestersService(supabaseClient)
  
  try {
    // Parse request body to determine which data to fetch
    const { type } = await req.json()
    console.log('Request type:', type)

    let data
    if (type === 'performance') {
      const performance = await service.getTesterPerformance()
      data = performance || [] // Ensure array response
    } else if (type === 'history') {
      const history = await service.getTestHistory()
      data = history || [] // Ensure array response
    } else {
      // If no type specified, fetch both
      const [performance, history] = await Promise.all([
        service.getTesterPerformance(),
        service.getTestHistory()
      ])
      data = { 
        performance: performance || [], 
        history: history || []
      }
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
    console.error('Error in admin-testers:', error)
    return new Response(
      JSON.stringify({ error: error.message }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 500,
      }
    )
  }
}) 