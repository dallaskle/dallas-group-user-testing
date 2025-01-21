import { serve } from 'https://deno.land/std@0.168.0/http/server.ts'
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'
import { corsHeaders } from '../_shared/cors.ts'

console.log('Hello from tester-submit!')

serve(async (req) => {
  // Handle CORS
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    // Create Supabase client
    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_ANON_KEY') ?? ''
    )

    // Get the JWT from the request
    const authHeader = req.headers.get('Authorization')
    if (!authHeader) {
      throw new Error('No authorization header')
    }

    // Get the request body
    const { ticketId, featureId, status, videoUrl, notes } = await req.json()
    if (!ticketId || !featureId || !status || !videoUrl) {
      throw new Error('Missing required fields')
    }

    // Get the user from the JWT
    const { data: { user }, error: userError } = await supabaseClient.auth.getUser(
      authHeader.replace('Bearer ', '')
    )
    if (userError || !user) {
      throw userError || new Error('User not found')
    }

    // Start a transaction
    const { data, error } = await supabaseClient.rpc('submit_validation', {
      p_ticket_id: ticketId,
      p_feature_id: featureId,
      p_tester_id: user.id,
      p_status: status,
      p_video_url: videoUrl,
      p_notes: notes || null
    })

    if (error) throw error

    // Return the result
    return new Response(
      JSON.stringify(data),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200,
      }
    )

  } catch (error) {
    return new Response(
      JSON.stringify({ error: error.message }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 400,
      }
    )
  }
}) 