import { createHandler } from '../_shared/handler.ts'
import { corsHeaders } from '../_shared/cors.ts'
import { ProjectsListService } from './projects-list.service.ts'

console.log('Hello from projects-list!')

export default createHandler(async (_req, supabaseClient, user) => {
  const service = new ProjectsListService(supabaseClient)
  
  try {
    const projects = await service.getProjects(user.id)

    console.log('Projects:', projects)
    
    return new Response(
      JSON.stringify(projects),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200,
      }
    )
  } catch (error) {
    console.error('Error fetching projects:', error)
    return new Response(
      JSON.stringify({ error: error.message }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 500,
      }
    )
  }
}) 