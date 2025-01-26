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
    const url = new URL(req.url)
    const registryId = url.searchParams.get('registryId')
    const params = listFeaturesSchema.parse({ registryId })

    let data
    if (params.registryId) {
      data = await service.getFeaturesByRegistry(params.registryId)
    } else {
      data = await service.getProjectRegistries()
    }

    console.log('Data fetched:', data)
    
    return new Response(
      JSON.stringify(data),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200,
      }
    )
  } catch (error) {
    console.error('Error fetching registry data:', error)
    return new Response(
      JSON.stringify({ error: error.message }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 500,
      }
    )
  }
}) 