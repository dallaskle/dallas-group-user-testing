import { createHandler } from '../_shared/handler.ts'
import { corsHeaders } from '../_shared/cors.ts'
import { AdminOverviewService } from './admin-overview.service.ts'

console.log('Hello from admin-overview!')

export default createHandler(async (_req, supabaseClient, user) => {
  const service = new AdminOverviewService(supabaseClient)
  
  try {
    const overviewData = await service.getOverviewData(user.id)

    console.log('Overview data:', overviewData)
    
    return new Response(
      JSON.stringify(overviewData),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200,
      }
    )
  } catch (error) {
    console.error('Error fetching overview data:', error)
    return new Response(
      JSON.stringify({ error: error.message }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 500,
      }
    )
  }
}) 