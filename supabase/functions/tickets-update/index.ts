// @ts-nocheck
import { serve } from 'std/http/server.ts'
import { createClient } from '@supabase/supabase-js'
import { corsHeaders } from '../_shared/cors.ts'
import { Database } from '../_shared/database.types.ts'
import { UpdateTicketRequest, TicketResponse } from '../_shared/api.types.ts'

console.log("Loading tickets-update function...")

serve(async (req) => {
  console.log('Received request:', req.method, req.url)
  
  // Handle CORS
  if (req.method === 'OPTIONS') {
    console.log('Handling CORS preflight request')
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    // Get the auth token from header
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
    console.log('Creating Supabase client with auth header:', authHeader.substring(0, 20) + '...')
    const supabase = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_ANON_KEY') ?? '',
      {
        global: {
          headers: { Authorization: `Bearer ${authHeader}` },
        },
      }
    )

    // Get the current user
    console.log('Attempting to get user from auth token')
    const { data: { user }, error: userError } = await supabase.auth.getUser(authHeader)
    
    if (userError || !user) {
      console.error('User authentication error:', userError)
      return new Response(
        JSON.stringify({ error: 'Invalid token' }),
        { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }
    console.log('Authenticated user:', user.id)

    // Get request body
    const request: UpdateTicketRequest = await req.json()
    console.log('Request body:', request)

    // Update ticket
    const { data: ticket, error: ticketError } = await supabase
      .from('tickets')
      .update(request)
      .eq('id', request.id)
      .select()
      .single()

    if (ticketError) {
      console.error('Error updating ticket:', ticketError)
      throw ticketError
    }

    console.log('Ticket updated successfully:', ticket.id)

    return new Response(JSON.stringify(ticket as TicketResponse), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: 200,
    })
  } catch (error) {
    console.error('Error processing request:', error)
    return new Response(JSON.stringify({ error: error.message }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: error.message === 'Unauthorized' ? 401 : 400,
    })
  }
}) 