import { createHandler } from '../_shared/handler.ts'
import { corsHeaders } from '../_shared/cors.ts'
import { ProjectsDeleteService } from './projects-delete.service.ts'
import { z } from '../_shared/deps.ts'

console.log('Hello from projects-delete!')

const deleteProjectSchema = z.object({
  id: z.string(),
  type: z.enum(['project', 'feature'])
})

export default createHandler(async (req, supabaseClient, _user) => {
  const service = new ProjectsDeleteService(supabaseClient)
  
  try {
    const body = await req.json()
    const params = deleteProjectSchema.parse(body)

    if (params.type === 'project') {
      await service.deleteProject(params.id)
    } else {
      await service.deleteFeature(params.id)
    }

    console.log(`${params.type} deleted:`, params.id)
    
    return new Response(
      JSON.stringify({ success: true }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200,
      }
    )
  } catch (error) {
    console.error('Error deleting project/feature:', error)
    return new Response(
      JSON.stringify({ error: error.message }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 500,
      }
    )
  }
}) 