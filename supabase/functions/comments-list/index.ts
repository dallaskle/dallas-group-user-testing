import { createHandler } from '../_shared/handler.ts'
import { corsHeaders } from '../_shared/cors.ts'
import { CommentsListService } from './comments-list.service.ts'

console.log('Hello from comments-list!')

export default createHandler(async (req, supabaseClient, user) => {
  const service = new CommentsListService(supabaseClient)
  
  try {
    const { featureId } = await req.json()
    console.log('Received request for featureId:', featureId)
    
    if (!featureId) {
      return new Response(
        JSON.stringify({ error: 'featureId is required' }),
        {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          status: 400,
        }
      )
    }

    const comments = await service.getFeatureComments(featureId)
    console.log('Comments:', comments)
    
    return new Response(
      JSON.stringify(comments),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200,
      }
    )
  } catch (error) {
    console.error('Error fetching comments:', error)
    return new Response(
      JSON.stringify({ error: error.message }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 500,
      }
    )
  }
}) 