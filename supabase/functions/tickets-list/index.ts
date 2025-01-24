// @ts-nocheck
import { serve } from 'std/http/server.ts'
import { createClient } from '@supabase/supabase-js'
import { corsHeaders } from '../_shared/cors.ts'
import { Database } from '../_shared/database.types.ts'
import { ListTicketsRequest, ListTicketsResponse } from '../_shared/api.types.ts'

console.log("Loading tickets-list function...")

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
    const request: ListTicketsRequest = await req.json()
    console.log('Request parameters:', { ...request, page: request.page || 1, limit: request.limit || 1000 })
    const {
      type,
      status,
      priority,
      assignedTo,
      createdBy,
      page = 1,
      limit = 1000, // Default to high limit
    } = request

    // Build query
    let query = supabase.rpc('list_tickets', {
      p_type: type || null,
      p_status: status || null,
      p_priority: priority || null,
      p_assigned_to: assignedTo || null,
      p_created_by: createdBy || null,
      p_page: page,
      p_limit: limit,
    })

    // Execute query
    console.log('Executing tickets query...')
    const { data: tickets, error: ticketsError, count } = await query

    if (ticketsError) {
      console.error('Error fetching tickets:', ticketsError)
      throw ticketsError
    }

    console.log(`Successfully retrieved ${tickets?.length || 0} tickets. Total count: ${count}`)

    const response: ListTicketsResponse = {
      tickets: tickets || [],
      total: count || 0,
      page,
      limit,
    }

    return new Response(JSON.stringify(response), {
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