import { createHandler } from '../_shared/handler.ts'
import { corsHeaders } from '../_shared/cors.ts'
import { RegistryUpdateService } from './registry-update.service.ts'

console.log('Hello from registry-update!')

export default createHandler(async (req, supabaseClient, user) => {
  const service = new RegistryUpdateService(supabaseClient)
  
  try {
    const { id, type, updates } = await req.json()
    
    if (!id || !type || !updates) {
      throw new Error('Missing required parameters: id, type, updates')
    }

    let result
    if (type === 'project') {
      result = await service.updateProjectRegistry(id, updates)
    } else if (type === 'feature') {
      result = await service.updateFeatureRegistry(id, updates)
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
    console.error('Error updating registry:', error)
    return new Response(
      JSON.stringify({ error: error.message }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 400,
      }
    )
  }
}) 