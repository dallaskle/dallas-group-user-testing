import { serve } from 'https://deno.land/std@0.168.0/http/server.ts'
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'
import { corsHeaders } from '../_shared/cors.ts'

console.log('Hello from tester-claim!')

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
    const { ticketId } = await req.json()
    if (!ticketId) {
      throw new Error('No ticket ID provided')
    }

    // Get the user from the JWT
    const { data: { user }, error: userError } = await supabaseClient.auth.getUser(
      authHeader.replace('Bearer ', '')
    )
    if (userError || !user) {
      throw userError || new Error('User not found')
    }

    // Update the ticket
    const { data: ticket, error: ticketError } = await supabaseClient
      .from('tickets')
      .update({
        status: 'in_progress',
        assigned_to: user.id,
      })
      .eq('id', ticketId)
      .eq('type', 'testing')
      .eq('status', 'open')
      .select('*, testing_ticket:testing_tickets(*), feature:features(*)')
      .single()

    if (ticketError) {
      throw ticketError
    }

    // Return the updated ticket
    return new Response(
      JSON.stringify(ticket),
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