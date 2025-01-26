import { createHandler } from '../_shared/handler.ts'
import { corsHeaders } from '../_shared/cors.ts'
import { ProjectRegistryListService } from './project-registry-list.service.ts'
import { z } from '../_shared/deps.ts'

console.log('Hello from project-registry-list!')

const listFeaturesSchema = z.object({
  registryId: z.string().optional()
})

export default createHandler(async (req, supabaseClient, _user) => {
  const service = new ProjectRegistryListService(supabaseClient)
  
  try {
    let params
    if (req.method === 'POST') {
      const body = await req.json().catch(() => ({}))
      params = listFeaturesSchema.parse(body)
    } else {
      params = listFeaturesSchema.parse({})
    }

    let data
    if (params.registryId) {
      data = await service.getFeaturesByRegistry(params.registryId)
    } else {
      data = await service.getProjectRegistries()
    }

    if (!data) {
      data = []
    }

    console.log('Data fetched:', data)
    
    return new Response(
      JSON.stringify({ data, success: true }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200,
      }
    )
  } catch (error) {
    console.error('Error in project-registry-list:', error)
    return new Response(
      JSON.stringify({ 
        error: error.message || 'An unexpected error occurred',
        success: false 
      }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: error.status || 500,
      }
    )
  }
}) 