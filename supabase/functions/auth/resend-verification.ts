import { createClient } from '@supabase/supabase-js'
import { Database } from '../../../src/types/database.types'

// Initialize Supabase client with service role key for admin operations
const supabase = createClient<Database>(
  process.env.SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)

export const resendVerification = async (req: Request) => {
  try {
    const { email } = await req.json()

    if (!email) {
      return new Response(
        JSON.stringify({ error: 'Missing email address' }),
        { status: 400 }
      )
    }

    // Get user by email
    const { data: { users }, error: getUserError } = await supabase.auth.admin.listUsers()
    const user = users?.find(u => u.email === email)

    if (getUserError || !user) {
      return new Response(
        JSON.stringify({ error: 'User not found' }),
        { status: 404 }
      )
    }

    // Check if email is already verified
    if (user.email_confirmed_at) {
      return new Response(
        JSON.stringify({ error: 'Email is already verified' }),
        { status: 400 }
      )
    }

    // Resend verification email
    const { error: resendError } = await supabase.auth.resend({
      type: 'signup',
      email: email
    })

    if (resendError) {
      return new Response(
        JSON.stringify({ error: 'Failed to resend verification email' }),
        { status: 500 }
      )
    }

    return new Response(
      JSON.stringify({ 
        message: 'Verification email sent successfully',
        email
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