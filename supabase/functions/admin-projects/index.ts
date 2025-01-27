import { createHandler } from '../_shared/handler.ts'
import { corsHeaders } from '../_shared/cors.ts'
import { AdminProjectsService } from './admin-projects.service.ts'

console.log('Hello from admin-projects!')

export default createHandler(async (req, supabaseClient, user) => {
  const service = new AdminProjectsService(supabaseClient)
  
  try {
    // Parse request body to determine which data to fetch
    const { type } = await req.json()
    console.log('Request type:', type)

    let data
    if (type === 'registries') {
      const registries = await service.getProjectRegistriesWithDetails()
      data = registries || [] // Ensure array response
    } else if (type === 'projects') {
      const projects = await service.getProjectsWithDetails()
      data = projects || [] // Ensure array response
    } else {
      // If no type specified, fetch both
      const [projects, registries] = await Promise.all([
        service.getProjectsWithDetails(),
        service.getProjectRegistriesWithDetails()
      ])
      data = { 
        projects: projects || [], 
        registries: registries || []
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
    console.error('Error in admin-projects:', error)
    return new Response(
      JSON.stringify({ error: error.message }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 500,
      }
    )
  }
}) 