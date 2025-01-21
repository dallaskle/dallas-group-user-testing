// @ts-nocheck
import { serve, createClient } from '../_shared/deps.ts'
import { corsHeaders } from '../_shared/cors.ts'

console.log("Auth register function started")

serve(async (req) => {
  console.log('📝 New registration request received')

  // Handle CORS
  if (req.method === 'OPTIONS') {
    console.log('👌 CORS preflight request handled')
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

    console.log(`📧 Processing registration for email: ${email}, name: ${name}`)
    console.log(`🎭 Roles - Student: ${is_student}, Admin: ${is_admin}, Tester: ${is_tester}`)

    if (!email || !password || !name) {
      console.error('❌ Validation failed: Missing required fields')
      throw new Error('Email, password, and name are required')
    }

    // Initialize Supabase client
    console.log('🔄 Initializing Supabase client')
    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    )

    // Create auth user with email verification enabled
    console.log('👤 Creating auth user...')
    const { data: authData, error: authError } = await supabaseClient.auth.admin.createUser({
      email,
      password,
      email_confirm: true,
      user_metadata: { name }
    })

    if (authError || !authData?.user) {
      console.error('❌ Auth user creation failed:', authError)
      throw authError
    }
    console.log('✅ Auth user created successfully')

    // Create session by signing in
    console.log('🔑 Creating session for user...')
    const { data: { session }, error: signInError } = await supabaseClient.auth.signInWithPassword({
      email,
      password
    })
    
    if (signInError) {
      console.error('❌ Session creation failed:', signInError)
      throw signInError
    }

    console.log('👤 Auth user creation result:', authData.user)
    console.log('🔗 Session:', session)

    // Create user record in users table
    console.log('📝 Creating user record in database...')
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
      console.error('❌ Database insert failed:', userError)
      // Rollback auth user creation if user table insert fails
      console.log('🔄 Rolling back auth user creation...')
      await supabaseClient.auth.admin.deleteUser(authData.user.id)
      throw userError
    }
    console.log('✅ User record created successfully')

    console.log('🎉 Registration completed successfully')
    return new Response(
      JSON.stringify({ 
        data: { 
          user: authData.user,
          session: session,
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
    console.error('❌ Registration failed:', error.message)
    return new Response(
      JSON.stringify({ data: null, error: error.message }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 400,
      }
    )
  }
}) 