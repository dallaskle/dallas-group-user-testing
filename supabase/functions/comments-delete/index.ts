import { createHandler } from '../_shared/handler.ts'
import { corsHeaders } from '../_shared/cors.ts'
import { CommentsDeleteService } from './comments-delete.service.ts'

console.log('Hello from comments-delete!')

export default createHandler(async (req, supabaseClient, user) => {
  const service = new CommentsDeleteService(supabaseClient)
  
  try {
    if (req.method !== 'DELETE') {
      return new Response(
        JSON.stringify({ error: 'Method not allowed' }),
        {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          status: 405,
        }
      )
    }

    const { id } = await req.json()
    console.log('Received request to delete comment:', id)
    
    if (!id) {
      return new Response(
        JSON.stringify({ error: 'id is required' }),
        {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          status: 400,
        }
      )
    }

    await service.deleteComment(id)
    console.log('Deleted comment:', id)
    
    return new Response(
      JSON.stringify({ message: 'Comment deleted successfully' }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200,
      }
    )
  } catch (error) {
    console.error('Error deleting comment:', error)
    return new Response(
      JSON.stringify({ error: error.message }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 500,
      }
    )
  }
}) 