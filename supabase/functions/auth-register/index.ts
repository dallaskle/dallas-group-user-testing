import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.39.3'
import { serve } from 'https://deno.land/std@0.168.0/http/server.ts'
import { corsHeaders } from '../_shared/cors.ts'

console.log("Auth register function started")

serve(async (req) => {
  // Handle CORS
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    const { 
      email, 
      password, 
      name, 
      is_student = false,
      is_admin = false,
      is_tester = false
    } = await req.json()

    if (!email || !password || !name) {
      throw new Error('Email, password, and name are required')
    }

    // Initialize Supabase client
    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    )

    // Create auth user with email verification enabled
    const { data: authData, error: authError } = await supabaseClient.auth.admin.createUser({
      email,
      password,
      email_confirm: true, // Set to true to enable email confirmation
      user_metadata: { name },
    })

    if (authError) throw authError

    // Create user record in users table
    const { error: userError } = await supabaseClient
      .from('users')
      .insert({
        id: authData.user.id,
        email: email,
        name: name,
        is_student,
        is_admin,
        is_tester
      })

    if (userError) {
      // Rollback auth user creation if user table insert fails
      await supabaseClient.auth.admin.deleteUser(authData.user.id)
      throw userError
    }

    return new Response(
      JSON.stringify({ 
        data: { 
          user: authData.user,
          message: 'User created successfully. Please check your email for verification.'
        }, 
        error: null 
      }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200,
      }
    )
  } catch (error) {
    return new Response(
      JSON.stringify({ data: null, error: error.message }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 400,
      }
    )
  }
}) 