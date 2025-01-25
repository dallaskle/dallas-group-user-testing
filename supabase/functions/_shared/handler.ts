import { serve, createClient, SupabaseClient } from './deps.ts'
import { corsHeaders } from './cors.ts'

type HandlerFunction = (req: Request, supabaseClient: SupabaseClient, user: any) => Promise<Response>

export const createHandler = (handler: HandlerFunction) => {
  return serve(async (req: Request) => {
    console.log('Request received:', {
      method: req.method,
      url: req.url,
      headers: Object.fromEntries(req.headers.entries())
    })

    // Handle CORS preflight
    if (req.method === 'OPTIONS') {
      console.log('Handling CORS preflight request')
      return new Response(null, {
        status: 204,
        headers: corsHeaders
      })
    }

    try {
      // Get and verify auth header
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
      const supabaseClient = createClient(
        Deno.env.get('SUPABASE_URL') ?? '',
        Deno.env.get('SUPABASE_ANON_KEY') ?? '',
        {
          global: {
            headers: { Authorization: authHeader },
          },
        }
      )

      // Get and verify user
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

      // Execute the handler with authenticated context
      return await handler(req, supabaseClient, user)

    } catch (error) {
      console.log('Error occurred:', error.message)
      return new Response(
        JSON.stringify({ error: error.message }),
        {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          status: 400,
        }
      )
    }
  })
} 