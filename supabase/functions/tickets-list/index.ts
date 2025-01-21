// @ts-nocheck
import { serve } from 'std/http/server.ts'
import { createClient } from '@supabase/supabase-js'
import { corsHeaders } from '../_shared/cors.ts'
import { Database } from '../_shared/database.types.ts'
import { ListTicketsRequest, ListTicketsResponse } from '../_shared/api.types.ts'

console.log("Loading tickets-list function...")

serve(async (req) => {
  // Handle CORS
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    // Create Supabase client
    const authHeader = req.headers.get('Authorization')!
    const supabase = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_ANON_KEY') ?? '',
      {
        global: {
          headers: { Authorization: authHeader },
        },
      }
    )

    // Get the current user
    const {
      data: { user },
      error: userError,
    } = await supabase.auth.getUser()

    if (userError || !user) {
      throw new Error('Unauthorized')
    }

    // Get request body
    const request: ListTicketsRequest = await req.json()
    const {
      type,
      status,
      priority,
      assignedTo,
      createdBy,
      page = 1,
      limit = 10,
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
    const { data: tickets, error: ticketsError, count } = await query

    if (ticketsError) {
      throw ticketsError
    }

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
    return new Response(JSON.stringify({ error: error.message }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: error.message === 'Unauthorized' ? 401 : 400,
    })
  }
}) 