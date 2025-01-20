import { createClient } from '@supabase/supabase-js'
import { Database } from '../../../src/types/database.types'

// Initialize Supabase client with service role key for admin operations
const supabase = createClient<Database>(
  process.env.SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)

export const login = async (req: Request) => {
  try {
    const { email, password } = await req.json()

    // Validate input
    if (!email || !password) {
      return new Response(
        JSON.stringify({ error: 'Missing email or password' }),
        { status: 400 }
      )
    }

    // Authenticate user
    const { data: authData, error: authError } = await supabase.auth.signInWithPassword({
      email,
      password
    })

    if (authError) {
      return new Response(
        JSON.stringify({ error: authError.message }),
        { status: 401 }
      )
    }

    // Get user data from database
    const { data: userData, error: dbError } = await supabase
      .from('users')
      .select('*')
      .eq('id', authData.user.id)
      .single()

    if (dbError || !userData) {
      return new Response(
        JSON.stringify({ error: 'User data not found' }),
        { status: 404 }
      )
    }

    // Check if email is verified
    if (!authData.user.email_confirmed_at) {
      return new Response(
        JSON.stringify({ 
          error: 'Please verify your email before logging in',
          isVerificationError: true 
        }),
        { status: 403 }
      )
    }

    return new Response(
      JSON.stringify({
        session: authData.session,
        user: {
          ...authData.user,
          ...userData
        }
      }),
      { status: 200 }
    )

  } catch (error) {
    return new Response(
      JSON.stringify({ error: 'Internal server error' }),
      { status: 500 }
    )
  }
} 