import { createHandler } from '../_shared/handler.ts'
import { corsHeaders } from '../_shared/cors.ts'
import { ProjectsCreateSimpleService } from './projects-create-simple.service.ts'
import { z } from '../_shared/deps.ts'

console.log('Hello from projects-create-simple!')

const createProjectSchema = z.object({
  name: z.string(),
  project_registry_id: z.string()
})

export default createHandler(async (req, supabaseClient, user) => {
  const service = new ProjectsCreateSimpleService(supabaseClient)
  
  try {
    const body = await req.json()
    const params = createProjectSchema.parse(body)
    const project = await service.createProject({
      ...params,
      student_id: user.id
    })

    console.log('Project created:', project)
    
    return new Response(
      JSON.stringify(project),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200,
      }
    )
  } catch (error) {
    console.error('Error creating project:', error)
    return new Response(
      JSON.stringify({ error: error.message }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 500,
      }
    )
  }
}) 