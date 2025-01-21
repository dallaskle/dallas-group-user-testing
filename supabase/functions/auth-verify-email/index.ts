// @ts-nocheck
import { serve, createClient } from '../_shared/deps.ts'
import { corsHeaders } from '../_shared/cors.ts'

console.log("Auth verify-email function started")

serve(async (req) => {
  console.log('📨 Received email verification request')
  
  if (req.method === 'OPTIONS') {
    console.log('👌 Handling CORS preflight request')
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    const { token } = await req.json()
    console.log('🎟️ Received token for verification')

    // Initialize Supabase client
    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    )
    console.log('🔌 Supabase client initialized')

    const { data, error } = await supabaseClient.auth.verifyOtp({
      token_hash: token,
      type: 'email'
    })
    console.log('✅ OTP verification attempted')

    if (error) {
      console.error('❌ Verification error:', error)
      throw error
    }

    console.log('✨ Email successfully verified')
    return new Response(
      JSON.stringify({ data, error: null }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200,
      }
    )
  } catch (error) {
    console.error('💥 Error processing verification:', error.message)
    return new Response(
      JSON.stringify({ data: null, error: error.message }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 400,
      }
    )
  }
}) 