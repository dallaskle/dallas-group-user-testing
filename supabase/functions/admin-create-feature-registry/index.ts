// @ts-nocheck
import { serve, createClient } from '../_shared/deps.ts'
import { corsHeaders } from '../_shared/cors.ts'

interface FeatureRegistryRequest {
  projectRegistryId: string
  name: string
  description: string
  isRequired: boolean
}

serve(async (req) => {
  console.log('🚀 Request received:', req.method)

  // Handle CORS
  if (req.method === 'OPTIONS') {
    console.log('✨ Handling CORS preflight request')
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    // Create Supabase client
    console.log('📦 Initializing Supabase client')
    const authHeader = req.headers.get('Authorization')
    if (!authHeader) {
      throw new Error('No authorization header')
    }

    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_ANON_KEY') ?? '',
      {
        global: {
          headers: { Authorization: authHeader },
        },
      }
    )

    // Get user ID from JWT token
    const token = authHeader.replace('Bearer ', '')
    const payload = JSON.parse(atob(token.split('.')[1]))
    const userId = payload.sub

    if (!userId) {
      throw new Error('Invalid token')
    }
    console.log('✅ User authenticated:', userId)

    // Get user role from users table
    console.log('👤 Checking admin status')
    const { data: userData, error: userDataError } = await supabaseClient
      .from('users')
      .select('is_admin')
      .eq('id', userId)
      .single()

    if (userDataError || !userData?.is_admin) {
      console.error('❌ Admin check failed:', { userDataError, isAdmin: userData?.is_admin })
      return new Response(JSON.stringify({ error: 'Unauthorized - Admin access required' }), {
        status: 403,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      })
    }
    console.log('✅ Admin status verified')

    // Parse request body
    console.log('📝 Parsing request body')
    const { projectRegistryId, name, description, isRequired }: FeatureRegistryRequest = await req.json()

    if (!projectRegistryId || !name || !description) {
      console.error('❌ Invalid request data:', { projectRegistryId, name, description })
      return new Response(JSON.stringify({ error: 'Project registry ID, name, and description are required' }), {
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      })
    }
    console.log('✅ Request data validated')

    // Verify project registry exists
    console.log('🔍 Verifying project registry exists')
    const { data: projectRegistry, error: projectError } = await supabaseClient
      .from('project_registry')
      .select('id')
      .eq('id', projectRegistryId)
      .single()

    if (projectError || !projectRegistry) {
      console.error('❌ Project registry not found:', projectError)
      return new Response(JSON.stringify({ error: 'Project registry not found' }), {
        status: 404,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      })
    }
    console.log('✅ Project registry found')

    // Create feature registry
    console.log('📁 Creating feature registry')
    const { data: featureRegistry, error: createError } = await supabaseClient
      .from('feature_registry')
      .insert([
        {
          project_registry_id: projectRegistryId,
          name,
          description,
          is_required: isRequired ?? false,
        },
      ])
      .select()
      .single()

    if (createError) {
      console.error('❌ Failed to create feature registry:', createError)
      return new Response(JSON.stringify({ error: createError.message }), {
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      })
    }

    console.log('✅ Feature registry created successfully:', featureRegistry.id)
    return new Response(JSON.stringify(featureRegistry), {
      status: 200,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    })
  } catch (error) {
    console.error('💥 Unexpected error:', error)
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    })
  }
}) 