import { serve, createClient } from '../_shared/deps.ts'
import { corsHeaders } from '../_shared/cors.ts'

console.log('Hello from tester-metrics!')

serve(async (req) => {
  console.log('Request received:', {
    method: req.method,
    url: req.url,
    headers: Object.fromEntries(req.headers.entries())
  })

  if (req.method === 'OPTIONS') {
    console.log('Handling CORS preflight request')
    return new Response(null, {
      status: 204,
      headers: corsHeaders
    })
  }

  try {
    // Get the auth header
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

    // Get all validations by this tester
    const { data: validations, error: validationsError } = await supabaseClient
      .from('validations')
      .select('*, feature:features(*)')
      .eq('validated_by', user.id)
      .order('created_at', { ascending: false })

    if (validationsError) throw validationsError

    // Calculate metrics
    const metrics = {
      testsCompleted: validations.length,
      accuracyRate: 0,
      avgResponseTime: 0,
      validationRate: 0,
    }

    if (validations.length > 0) {
      // Calculate accuracy rate (percentage of successful validations)
      const successfulValidations = validations.filter(v => v.status === 'Working')
      metrics.accuracyRate = Math.round((successfulValidations.length / validations.length) * 100)

      // Calculate average response time (in minutes)
      const totalResponseTime = validations.reduce((sum, v) => {
        const createdAt = new Date(v.created_at)
        const deadline = new Date(v.feature.deadline)
        const responseTime = Math.max(0, (deadline.getTime() - createdAt.getTime()) / (1000 * 60))
        return sum + responseTime
      }, 0)
      metrics.avgResponseTime = Math.round((totalResponseTime / validations.length) * 10) / 10

      // Calculate validation rate (percentage of validations completed before deadline)
      const onTimeValidations = validations.filter(v => {
        const createdAt = new Date(v.created_at)
        const deadline = new Date(v.feature.deadline)
        return createdAt <= deadline
      })
      metrics.validationRate = Math.round((onTimeValidations.length / validations.length) * 100)
    }

    // Return the metrics
    return new Response(
      JSON.stringify(metrics),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200,
      }
    )

  } catch (error) {
    return new Response(
      JSON.stringify({ error: error.message }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 400,
      }
    )
  }
}) 