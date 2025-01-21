import { serve, createClient } from '../_shared/deps.ts'
import { corsHeaders } from '../_shared/cors.ts'
import { Database } from '../_shared/database.types.ts'

console.log('Tickets Audit Log function started')

serve(async (req) => {
  console.log('Request received:', {
    method: req.method,
    url: req.url,
    headers: Object.fromEntries(req.headers.entries())
  })

  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    console.log('Handling CORS preflight request')
    return new Response(null, {
      status: 204,
      headers: corsHeaders
    })
  }

  // Handle actual request
  if (req.method === 'POST') {
    try {
      const requestBody = await req.json()
      console.log('Received request body:', requestBody)
      
      const { ticketId } = requestBody

      // Get the user from the auth header
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
      const supabaseClient = createClient<Database>(
        Deno.env.get('SUPABASE_URL') ?? '',
        Deno.env.get('SUPABASE_ANON_KEY') ?? '',
        {
          global: {
            headers: { Authorization: `Bearer ${authHeader}` },
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

      // Build the query
      let query = supabaseClient
        .from('ticket_audit_log')
        .select(`
          id,
          ticket_id,
          changed_by,
          field_name,
          old_value,
          new_value,
          created_at,
          users:changed_by (
            id,
            name,
            email
          ),
          tickets:ticket_id (
            title,
            type,
            status,
            priority
          )
        `)
        .order('created_at', { ascending: false })

      // If ticketId is provided, filter for that specific ticket
      if (ticketId) {
        console.log('Fetching audit logs for specific ticket:', ticketId)
        query = query.eq('ticket_id', ticketId)
      } else {
        console.log('Fetching all audit logs')
      }

      const { data: auditLogs, error } = await query

      if (error) {
        console.log('Failed to fetch audit logs:', error)
        throw error
      }

      console.log('Successfully fetched audit logs:', { count: auditLogs?.length })
      return new Response(
        JSON.stringify({ audit_logs: auditLogs }),
        {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          status: 200,
        }
      )
    } catch (error) {
      console.error('Unexpected error:', error)
      return new Response(
        JSON.stringify({ error: error.message }),
        {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          status: 500,
        }
      )
    }
  }

  console.log('Request rejected: Method not allowed:', req.method)
  return new Response(
    JSON.stringify({ error: 'Method not allowed' }),
    { status: 405, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
  )
}) 