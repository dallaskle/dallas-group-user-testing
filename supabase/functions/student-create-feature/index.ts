import { serve, createClient } from '../_shared/deps.ts'
import { corsHeaders } from '../_shared/cors.ts'

interface CreateFeatureRequest {
  project_id: string
  name: string
  description: string
  required_validations?: number
}

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
      
      const { project_id, name, description, required_validations = 3 } = requestBody as CreateFeatureRequest

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
      const supabaseClient = createClient(
        Deno.env.get('SUPABASE_URL') ?? '',
        Deno.env.get('SUPABASE_ANON_KEY') ?? '',
        {
          global: {
            headers: { Authorization: authHeader },
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

      // Verify project ownership
      console.log('Verifying project ownership')
      const { data: project, error: projectError } = await supabaseClient
        .from('projects')
        .select('id')
        .eq('id', project_id)
        .eq('student_id', user.id)
        .single()

      if (projectError || !project) {
        console.log('Project ownership verification failed:', projectError)
        return new Response(
          JSON.stringify({ error: 'Project not found or access denied' }),
          { status: 403, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        )
      }

      // Create the feature
      console.log('Creating feature')
      const { data: feature, error: featureError } = await supabaseClient
        .from('features')
        .insert({
          project_id,
          name,
          description,
          required_validations,
          status: 'Not Started',
          current_validations: 0,
        })
        .select()
        .single()

      if (featureError) {
        console.log('Feature creation failed:', featureError)
        return new Response(
          JSON.stringify({ error: featureError.message }),
          { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        )
      }

      console.log('Feature created successfully:', { featureId: feature.id })
      return new Response(
        JSON.stringify(feature),
        { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    } catch (error) {
      console.error('Unexpected error:', error)
      return new Response(
        JSON.stringify({ error: error.message }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }
  }

  console.log('Request rejected: Method not allowed:', req.method)
  // Handle unsupported methods
  return new Response(
    JSON.stringify({ error: 'Method not allowed' }),
    { status: 405, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
  )
}) 