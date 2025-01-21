import { createClient } from '@supabase/supabase-js'
import { Database } from '../../../src/types/database.types'

// Initialize Supabase client with service role key for admin operations
const supabase = createClient<Database>(
  process.env.SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!,
  {
    auth: {
      autoRefreshToken: false,
      persistSession: false
    }
  }
)

export const register = async (req: Request) => {
  try {
    const { name, email, password, role } = await req.json()

    // Validate input
    if (!name || !email || !password || !role) {
      return new Response(
        JSON.stringify({ error: 'Missing required fields' }),
        { status: 400 }
      )
    }

    // Validate role
    if (!['student', 'tester'].includes(role)) {
      return new Response(
        JSON.stringify({ error: 'Invalid role' }),
        { status: 400 }
      )
    }

    // Create auth user without email confirmation
    const { data: authData, error: authError } = await supabase.auth.admin.createUser({
      email,
      password,
      email_confirm: true, // Skip email verification
      user_metadata: { 
        name, 
        role
      }
    })

    if (authError) {
      return new Response(
        JSON.stringify({ error: authError.message }),
        { status: 400 }
      )
    }

    // Create user record in users table
    const { error: dbError } = await supabase
      .from('users')
      .insert({
        id: authData.user.id,
        name,
        email,
        is_student: role === 'student',
        is_tester: role === 'tester',
        is_admin: false
      })

    if (dbError) {
      // Rollback auth user creation if db insert fails
      await supabase.auth.admin.deleteUser(authData.user.id)
      return new Response(
        JSON.stringify({ error: 'Failed to create user record' }),
        { status: 500 }
      )
    }

    // Sign in the user to create a session
    const { data: signInData, error: signInError } = await supabase.auth.signInWithPassword({
      email,
      password
    })

    if (signInError) {
      return new Response(
        JSON.stringify({ error: 'Failed to create session' }),
        { status: 500 }
      )
    }

    // Get user data from database
    const { data: userData, error: userError } = await supabase
      .from('users')
      .select('*')
      .eq('id', authData.user.id)
      .single()

    if (userError || !userData) {
      return new Response(
        JSON.stringify({ error: 'Failed to fetch user data' }),
        { status: 500 }
      )
    }

    return new Response(
      JSON.stringify({ 
        session: signInData.session,
        user: {
          ...authData.user,
          ...userData
        }
      }),
      { status: 201 }
    )

  } catch (error) {
    return new Response(
      JSON.stringify({ error: 'Internal server error' }),
      { status: 500 }
    )
  }
} 