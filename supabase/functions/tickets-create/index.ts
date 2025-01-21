// @ts-nocheck
import { serve } from 'std/http/server.ts'
import { createClient } from '@supabase/supabase-js'
import { corsHeaders } from '../_shared/cors.ts'
import { Database } from '../_shared/database.types.ts'
import { CreateTicketRequest, TicketResponse } from '../_shared/api.types.ts'

console.log("Loading tickets-create function...")

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
    const request: CreateTicketRequest = await req.json()

    // Start a transaction
    const { data: ticket, error: ticketError } = await supabase
      .from('tickets')
      .insert({
        type: request.type,
        title: request.title,
        description: request.description,
        priority: request.priority || 'medium',
        created_by: user.id,
      })
      .select()
      .single()

    if (ticketError || !ticket) {
      throw ticketError || new Error('Failed to create ticket')
    }

    // Handle type-specific details
    if (request.type === 'testing' && request.featureId && request.deadline) {
      const { error: testingError } = await supabase
        .from('testing_tickets')
        .insert({
          id: ticket.id,
          feature_id: request.featureId,
          deadline: request.deadline,
        })

      if (testingError) {
        // Rollback ticket creation
        await supabase.from('tickets').delete().eq('id', ticket.id)
        throw testingError
      }
    }

    if (request.type === 'support' && request.category) {
      const { error: supportError } = await supabase
        .from('support_tickets')
        .insert({
          id: ticket.id,
          category: request.category,
          project_id: request.projectId,
        })

      if (supportError) {
        // Rollback ticket creation
        await supabase.from('tickets').delete().eq('id', ticket.id)
        throw supportError
      }
    }

    // Get the complete ticket response
    const { data: completeTicket, error: completeError } = await supabase
      .rpc('get_ticket_by_id', { p_ticket_id: ticket.id })
      .single()

    if (completeError || !completeTicket) {
      throw completeError || new Error('Failed to get complete ticket')
    }

    return new Response(JSON.stringify(completeTicket as TicketResponse), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: 201,
    })
  } catch (error) {
    return new Response(JSON.stringify({ error: error.message }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: error.message === 'Unauthorized' ? 401 : 400,
    })
  }
}) 