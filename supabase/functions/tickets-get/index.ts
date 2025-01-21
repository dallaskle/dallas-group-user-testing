// @ts-nocheck
import { serve } from 'std/http/server.ts'
import { createClient } from '@supabase/supabase-js'
import { corsHeaders } from '../_shared/cors.ts'
import { Database } from '../_shared/database.types.ts'
import { TicketResponse } from '../_shared/api.types.ts'

console.log("Loading tickets-get function...")

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
    const { id } = await req.json()

    if (!id) {
      throw new Error('Ticket ID is required')
    }

    // Get ticket details
    const { data: ticket, error: ticketError } = await supabase
      .rpc('get_ticket_by_id', { p_ticket_id: id })
      .single()

    if (ticketError || !ticket) {
      throw ticketError || new Error('Ticket not found')
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