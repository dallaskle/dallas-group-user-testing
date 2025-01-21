// @ts-nocheck
import { serve } from 'std/http/server.ts'
import { createClient } from '@supabase/supabase-js'
import { corsHeaders } from '../_shared/cors.ts'
import { Database } from '../_shared/database.types.ts'
import { CreateTicketRequest, TicketResponse } from '../_shared/api.types.ts'

console.log("Loading tickets-create function...")

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
    const request: CreateTicketRequest = await req.json()
    console.log('Request body:', request)

    // Extract base ticket fields
    const baseTicket = {
      type: request.type,
      title: request.title,
      description: request.description,
      priority: request.priority || 'medium',
      created_by: user.id,
      status: 'open',
      assigned_to: request.assignedTo || null
    }

    // Start a transaction
    const { data: ticket, error: ticketError } = await supabase
      .from('tickets')
      .insert(baseTicket)
      .select()
      .single()

    if (ticketError) {
      console.error('Error creating base ticket:', ticketError)
      throw ticketError
    }

    // Create type-specific ticket details
    if (request.type === 'testing' && request.featureId && request.deadline) {
      const { error: testingError } = await supabase
        .from('testing_tickets')
        .insert({
          id: ticket.id,
          feature_id: request.featureId,
          deadline: request.deadline
        })

      if (testingError) {
        console.error('Error creating testing ticket details:', testingError)
        throw testingError
      }
    } else if (request.type === 'support' && request.category) {
      const { error: supportError } = await supabase
        .from('support_tickets')
        .insert({
          id: ticket.id,
          category: request.category,
          project_id: request.projectId || null
        })

      if (supportError) {
        console.error('Error creating support ticket details:', supportError)
        throw supportError
      }
    }

    console.log('Ticket created successfully:', ticket.id)

    // Fetch complete ticket details for response
    const { data: completeTicket, error: fetchError } = await supabase
      .rpc('get_ticket_by_id', { p_ticket_id: ticket.id })
      .single()

    if (fetchError) {
      console.error('Error fetching complete ticket:', fetchError)
      throw fetchError
    }

    return new Response(JSON.stringify(completeTicket as TicketResponse), {
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