import { createHandler } from '../_shared/handler.ts'
import { corsHeaders } from '../_shared/cors.ts'
import { StudentDashboardService } from './student-dashboard.service.ts'

console.log('Hello from student-dashboard!')

export default createHandler(async (req, supabaseClient, user) => {
  const service = new StudentDashboardService(supabaseClient)
  
  try {
    let data
    const url = new URL(req.url)
    const endpoint = url.pathname.split('/').pop()

    switch (endpoint) {
      case 'outstanding-tickets':
        data = await service.getOutstandingTestingTickets(user.id)
        break
      case 'dashboard-data':
        data = await service.getDashboardData(user.id)
        break
      default:
        throw new Error('Invalid endpoint')
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
    console.error('Error in student-dashboard:', error)
    return new Response(
      JSON.stringify({ error: error.message }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 500,
      }
    )
  }
}) 