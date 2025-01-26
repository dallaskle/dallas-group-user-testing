import { createHandler } from '../_shared/handler.ts'
import { corsHeaders } from '../_shared/cors.ts'
import { FeatureTestersService } from './feature-testers.service.ts'

console.log('Hello from feature-testers!')

export default createHandler(async (req, supabaseClient, _user) => {
  const service = new FeatureTestersService(supabaseClient)
  
  try {
    const { featureId } = await req.json()
    
    if (!featureId) {
      throw new Error('featureId is required')
    }

    const testers = await service.getFeatureTestingTickets(featureId)

    console.log('Testers:', testers)
    
    return new Response(
      JSON.stringify(testers),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200,
      }
    )
  } catch (error) {
    console.error('Error fetching feature testers:', error)
    return new Response(
      JSON.stringify({ error: error.message }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 500,
      }
    )
  }
}) 