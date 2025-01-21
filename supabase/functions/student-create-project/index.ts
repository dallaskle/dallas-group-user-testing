import { serve, createClient } from '../_shared/deps.ts'
import { corsHeaders } from '../_shared/cors.ts'

interface CreateProjectRequest {
  name: string
  project_registry_id: string
  optional_feature_ids: string[]
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
      
      const { name, project_registry_id, optional_feature_ids } = requestBody as CreateProjectRequest

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

      console.log('Creating project with params:', {
        name,
        project_registry_id,
        student_id: user.id,
        optional_feature_count: optional_feature_ids.length
      })

      // Create the project
      const { data: project, error: projectError } = await supabaseClient
        .from('projects')
        .insert({
          name,
          student_id: user.id,
          project_registry_id
        })
        .select()
        .single()

      if (projectError) {
        console.log('Project creation failed:', projectError)
        return new Response(
          JSON.stringify({ error: projectError.message }),
          { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        )
      }

      // Get required features from feature_registry
      const { data: requiredFeatures, error: requiredFeaturesError } = await supabaseClient
        .from('feature_registry')
        .select('name, description')
        .eq('project_registry_id', project_registry_id)
        .eq('is_required', true)

      if (requiredFeaturesError) {
        console.log('Failed to fetch required features:', requiredFeaturesError)
        return new Response(
          JSON.stringify({ error: requiredFeaturesError.message }),
          { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        )
      }

      // Get optional features if any were selected
      let optionalFeatures = []
      if (optional_feature_ids.length > 0) {
        const { data: optFeatures, error: optFeaturesError } = await supabaseClient
          .from('feature_registry')
          .select('name, description')
          .in('id', optional_feature_ids)
          .eq('project_registry_id', project_registry_id)

        if (optFeaturesError) {
          console.log('Failed to fetch optional features:', optFeaturesError)
          return new Response(
            JSON.stringify({ error: optFeaturesError.message }),
            { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
          )
        }
        optionalFeatures = optFeatures || []
      }

      // Combine required and optional features
      const allFeatures = [...requiredFeatures, ...optionalFeatures].map(feature => ({
        project_id: project.id,
        name: feature.name,
        description: feature.description,
        status: 'Not Started',
        required_validations: 3,
        current_validations: 0
      }))

      // Insert all features
      const { data: features, error: featuresError } = await supabaseClient
        .from('features')
        .insert(allFeatures)
        .select()

      if (featuresError) {
        console.log('Features creation failed:', featuresError)
        return new Response(
          JSON.stringify({ error: featuresError.message }),
          { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        )
      }

      const response = {
        ...project,
        features
      }

      console.log('Project created successfully:', { projectId: project.id })
      return new Response(
        JSON.stringify(response),
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