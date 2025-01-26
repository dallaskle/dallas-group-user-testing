import { createHandler } from '../_shared/handler.ts'
import { corsHeaders } from '../_shared/cors.ts'
import { CommentsCreateService } from './comments-create.service.ts'

console.log('Hello from comments-create!')

export default createHandler(async (req, supabaseClient, user) => {
  const service = new CommentsCreateService(supabaseClient)
  
  try {
    if (req.method !== 'POST') {
      return new Response(
        JSON.stringify({ error: 'Method not allowed' }),
        {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          status: 405,
        }
      )
    }

    const { feature_id, content } = await req.json()
    
    if (!feature_id || !content) {
      return new Response(
        JSON.stringify({ error: 'feature_id and content are required' }),
        {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          status: 400,
        }
      )
    }

    const comment = await service.createComment({
      feature_id,
      content,
      author_id: user.id
    })
    
    console.log('Created comment:', comment)
    
    return new Response(
      JSON.stringify(comment),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 201,
      }
    )
  } catch (error) {
    console.error('Error creating comment:', error)
    return new Response(
      JSON.stringify({ error: error.message }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 500,
      }
    )
  }
}) 