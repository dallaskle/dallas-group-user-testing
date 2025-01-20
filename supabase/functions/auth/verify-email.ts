import { createClient } from '@supabase/supabase-js'
import { Database } from '../../../src/types/database.types'

// Initialize Supabase client with service role key for admin operations
const supabase = createClient<Database>(
  process.env.SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)

export const verifyEmail = async (req: Request) => {
  try {
    const { token } = await req.json()

    if (!token) {
      return new Response(
        JSON.stringify({ error: 'Missing verification token' }),
        { status: 400 }
      )
    }

    // Verify the token
    const { data, error } = await supabase.auth.verifyOtp({
      token_hash: token,
      type: 'email'
    })

    if (error || !data.user) {
      return new Response(
        JSON.stringify({ 
          error: 'Invalid or expired verification token',
          details: error?.message || 'User not found'
        }),
        { status: 400 }
      )
    }

    // Update user metadata to mark email as verified
    const { error: updateError } = await supabase.auth.admin.updateUserById(
      data.user.id,
      { email_confirm: true }
    )

    if (updateError) {
      return new Response(
        JSON.stringify({ error: 'Failed to update verification status' }),
        { status: 500 }
      )
    }

    return new Response(
      JSON.stringify({ 
        message: 'Email verified successfully',
        user: data.user
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