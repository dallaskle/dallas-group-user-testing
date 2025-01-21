import { serve } from 'https://deno.land/std@0.168.0/http/server.ts'
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'
import { corsHeaders } from '../_shared/cors.ts'

console.log('Hello from tester-metrics!')

serve(async (req) => {
  // Handle CORS
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    // Create Supabase client
    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_ANON_KEY') ?? ''
    )

    // Get the JWT from the request
    const authHeader = req.headers.get('Authorization')
    if (!authHeader) {
      throw new Error('No authorization header')
    }

    // Get the user from the JWT
    const { data: { user }, error: userError } = await supabaseClient.auth.getUser(
      authHeader.replace('Bearer ', '')
    )
    if (userError || !user) {
      throw userError || new Error('User not found')
    }

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