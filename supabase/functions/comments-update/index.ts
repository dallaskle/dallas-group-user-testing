import { createHandler } from '../_shared/handler.ts'
import { corsHeaders } from '../_shared/cors.ts'
import { CommentsUpdateService } from './comments-update.service.ts'

console.log('Hello from comments-update!')

export default createHandler(async (req, supabaseClient, user) => {
  const service = new CommentsUpdateService(supabaseClient)
  
  try {
    if (req.method !== 'PUT') {
      return new Response(
        JSON.stringify({ error: 'Method not allowed' }),
        {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          status: 405,
        }
      )
    }

    const { id, content } = await req.json()
    
    if (!id || !content) {
      return new Response(
        JSON.stringify({ error: 'id and content are required' }),
        {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          status: 400,
        }
      )
    }

    const comment = await service.updateComment(id, content)
    console.log('Updated comment:', comment)
    
    return new Response(
      JSON.stringify(comment),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200,
      }
    )
  } catch (error) {
    console.error('Error updating comment:', error)
    return new Response(
      JSON.stringify({ error: error.message }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 500,
      }
    )
  }
}) 