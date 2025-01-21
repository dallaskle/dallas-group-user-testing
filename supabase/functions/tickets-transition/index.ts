// @ts-nocheck
import { serve } from 'std/http/server.ts'
import { createClient } from '@supabase/supabase-js'
import { corsHeaders } from '../_shared/cors.ts'
import { Database } from '../_shared/database.types.ts'
import { TicketResponse } from '../_shared/api.types.ts'

console.log("Loading tickets-transition function...")

const validTransitions = {
  open: ['in_progress'],
  in_progress: ['resolved'],
  resolved: ['closed', 'in_progress'],
  closed: ['in_progress'],
}

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
    const { id, status } = await req.json()

    if (!id || !status) {
      throw new Error('Ticket ID and status are required')
    }

    // Get current ticket status
    const { data: currentTicket, error: currentError } = await supabase
      .from('tickets')
      .select('status')
      .eq('id', id)
      .single()

    if (currentError || !currentTicket) {
      throw currentError || new Error('Ticket not found')
    }

    // Validate transition
    const allowedTransitions = validTransitions[currentTicket.status]
    if (!allowedTransitions?.includes(status)) {
      throw new Error(
        `Invalid status transition from ${currentTicket.status} to ${status}`
      )
    }

    // Update ticket status
    const { error: updateError } = await supabase
      .from('tickets')
      .update({ status })
      .eq('id', id)

    if (updateError) {
      throw updateError
    }

    // Get updated ticket
    const { data: ticket, error: ticketError } = await supabase
      .rpc('get_ticket_by_id', { p_ticket_id: id })
      .single()

    if (ticketError || !ticket) {
      throw ticketError || new Error('Failed to get updated ticket')
    }

    return new Response(JSON.stringify(ticket as TicketResponse), {
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