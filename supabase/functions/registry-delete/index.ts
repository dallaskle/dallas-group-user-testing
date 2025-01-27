import { createHandler } from '../_shared/handler.ts'
import { corsHeaders } from '../_shared/cors.ts'
import { RegistryDeleteService } from './registry-delete.service.ts'

console.log('Hello from registry-delete!')

export default createHandler(async (req, supabaseClient, user) => {
  const service = new RegistryDeleteService(supabaseClient)
  
  try {
    const { id, type } = await req.json()
    
    if (!id || !type) {
      throw new Error('Missing required parameters: id, type')
    }

    let result
    if (type === 'project') {
      result = await service.deleteProjectRegistry(id)
    } else if (type === 'feature') {
      result = await service.deleteFeatureRegistry(id)
    } else {
      throw new Error('Invalid type. Must be either "project" or "feature"')
    }

    return new Response(
      JSON.stringify(result),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200,
      }
    )
  } catch (error) {
    console.error('Error deleting registry:', error)
    return new Response(
      JSON.stringify({ error: error.message }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 400,
      }
    )
  }
}) 