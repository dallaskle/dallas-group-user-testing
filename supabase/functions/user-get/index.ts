import { createHandler } from '../_shared/handler.ts'
import { corsHeaders } from '../_shared/cors.ts'
import { UserGetService } from './user-get.service.ts'

console.log('Hello from user-get!')

export default createHandler(async (_req, supabaseClient, user) => {
  const service = new UserGetService(supabaseClient)
  
  try {
    const userData = await service.getUser(user.id)
    
    return new Response(
      JSON.stringify(userData),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200,
      }
    )
  } catch (error) {
    console.error('Error in user-get:', error)
    return new Response(
      JSON.stringify({ error: error.message }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 500,
      }
    )
  }
})