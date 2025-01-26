import { createHandler } from '../_shared/handler.ts'
import { corsHeaders } from '../_shared/cors.ts'
import { ProjectsGetService } from './projects-get.service.ts'
import { z } from '../_shared/deps.ts'

console.log('Hello from projects-get!')

const getProjectSchema = z.object({
  id: z.string(),
  type: z.enum(['project', 'feature'])
})

export default createHandler(async (req, supabaseClient, _user) => {
  const service = new ProjectsGetService(supabaseClient)
  
  try {
    const body = await req.json()
    const params = getProjectSchema.parse(body)

    let data
    if (params.type === 'project') {
      data = await service.getProjectById(params.id)
    } else {
      data = await service.getFeatureById(params.id)
    }

    console.log(`${params.type} fetched:`, data)
    
    return new Response(
      JSON.stringify(data),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200,
      }
    )
  } catch (error) {
    console.error('Error fetching project/feature:', error)
    return new Response(
      JSON.stringify({ error: error.message }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 500,
      }
    )
  }
}) 