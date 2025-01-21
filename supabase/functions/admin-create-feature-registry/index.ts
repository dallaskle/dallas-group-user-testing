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
  // Handle CORS
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    // Create Supabase client
    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_ANON_KEY') ?? '',
      {
        global: {
          headers: { Authorization: req.headers.get('Authorization')! },
        },
      }
    )

    // Get user and verify admin status
    const {
      data: { user },
      error: userError,
    } = await supabaseClient.auth.getUser()

    if (userError || !user) {
      return new Response(JSON.stringify({ error: 'Unauthorized' }), {
        status: 401,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      })
    }

    // Get user role from users table
    const { data: userData, error: userDataError } = await supabaseClient
      .from('users')
      .select('is_admin')
      .eq('id', user.id)
      .single()

    if (userDataError || !userData?.is_admin) {
      return new Response(JSON.stringify({ error: 'Unauthorized - Admin access required' }), {
        status: 403,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      })
    }

    // Parse request body
    const { projectRegistryId, name, description, isRequired }: FeatureRegistryRequest = await req.json()

    if (!projectRegistryId || !name || !description) {
      return new Response(JSON.stringify({ error: 'Project registry ID, name, and description are required' }), {
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      })
    }

    // Verify project registry exists
    const { data: projectRegistry, error: projectError } = await supabaseClient
      .from('project_registry')
      .select('id')
      .eq('id', projectRegistryId)
      .single()

    if (projectError || !projectRegistry) {
      return new Response(JSON.stringify({ error: 'Project registry not found' }), {
        status: 404,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      })
    }

    // Create feature registry
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
      return new Response(JSON.stringify({ error: createError.message }), {
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      })
    }

    return new Response(JSON.stringify(featureRegistry), {
      status: 200,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    })
  } catch (error) {
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    })
  }
}) 