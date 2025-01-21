// @ts-nocheck
import { serve, createClient } from '../_shared/deps.ts'
import { corsHeaders } from '../_shared/cors.ts'

interface ProjectRegistryRequest {
  name: string
  description: string
}

serve(async (req) => {
  console.log("New Updates 1")
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
    const { name, description }: ProjectRegistryRequest = await req.json()

    if (!name || !description) {
      console.error('❌ Invalid request data:', { name, description })
      return new Response(JSON.stringify({ error: 'Name and description are required' }), {
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      })
    }
    console.log('✅ Request data validated')

    // Create project registry
    console.log('📁 Creating project registry')
    const { data: projectRegistry, error: createError } = await supabaseClient
      .from('project_registry')
      .insert([
        {
          name,
          description,
          created_by: userId,
        },
      ])
      .select()
      .single()

    if (createError) {
      console.error('❌ Failed to create project registry:', createError)
      return new Response(JSON.stringify({ error: createError.message }), {
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      })
    }

    console.log('✅ Project registry created successfully:', projectRegistry.id)
    return new Response(JSON.stringify(projectRegistry), {
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