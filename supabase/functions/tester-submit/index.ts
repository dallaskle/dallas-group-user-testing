import { serve, createClient } from '../_shared/deps.ts'
import { corsHeaders } from '../_shared/cors.ts'

console.log('Hello from tester-submit!')

serve(async (req) => {
  console.log('Request received:', {
    method: req.method,
    url: req.url,
    headers: Object.fromEntries(req.headers.entries())
  })

  if (req.method === 'OPTIONS') {
    console.log('Handling CORS preflight request')
    return new Response(null, {
      status: 204,
      headers: corsHeaders
    })
  }

  try {
    // Get the auth header
    const authHeader = req.headers.get('Authorization')?.split('Bearer ')[1]
    console.log('Auth header present:', !!authHeader)
    if (!authHeader) {
      console.log('Request rejected: Missing authorization header')
      return new Response(
        JSON.stringify({ error: 'No authorization header' }),
        { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    // Create Supabase client
    console.log('Initializing Supabase client')
    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_ANON_KEY') ?? '',
      {
        global: {
          headers: { Authorization: authHeader },
        },
      }
    )

    // Get user from auth header
    console.log('Attempting to get user from auth token')
    const { data: { user }, error: userError } = await supabaseClient.auth.getUser(authHeader)
    if (userError || !user) {
      console.log('User authentication failed:', userError)
      return new Response(
        JSON.stringify({ error: 'Invalid token' }),
        { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }
    
    console.log('User authenticated successfully:', { userId: user?.id })

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

  } catch (error) {
    console.log('Error occurred:', error.message)
    return new Response(
      JSON.stringify({ error: error.message }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 400,
      }
    )
  }
}) 