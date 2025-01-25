import { createHandler } from '../_shared/handler.ts'
import { corsHeaders } from '../_shared/cors.ts'

console.log('Hello from tester-submit!')

export default createHandler(async (req, supabaseClient, user) => {
  // Get the request body
  console.log('Parsing request body')
  const { ticketId, featureId, status, videoUrl, notes } = await req.json()
  console.log('Request body parsed:', { ticketId, featureId, status, videoUrl, notes })

  if (!ticketId || !featureId || !status || !videoUrl) {
    console.log('Request rejected: Missing required fields')
    throw new Error('Missing required fields')
  }

  // Start a transaction
  console.log('Starting transaction with Supabase RPC')
  const { data, error } = await supabaseClient.rpc('submit_validation', {
    p_ticket_id: ticketId,
    p_feature_id: featureId,
    p_tester_id: user.id,
    p_status: status,
    p_video_url: videoUrl,
    p_notes: notes || null
  })

  if (error) {
    console.log('Transaction failed:', error)
    throw error
  }

  console.log('Transaction successful:', data)

  // Return the result
  return new Response(
    JSON.stringify(data),
    {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: 200,
    }
  )
}) 