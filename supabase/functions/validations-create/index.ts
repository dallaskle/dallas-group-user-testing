import { createHandler } from '../_shared/handler.ts'
import { corsHeaders } from '../_shared/cors.ts'
import { ValidationsCreateService } from './validations-create.service.ts'
import { z } from '../_shared/deps.ts'

console.log('Hello from validations-create!')

const createValidationSchema = z.object({
  featureId: z.string(),
  status: z.enum(['Working', 'Needs Fixing']),
  notes: z.string(),
  videoUrl: z.string().url()
})

export default createHandler(async (req, supabaseClient, user) => {
  if (req.method !== 'POST') {
    return new Response(
      JSON.stringify({ error: 'Method not allowed' }),
      { status: 405, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )
  }

  try {
    const service = new ValidationsCreateService(supabaseClient)
    const body = await req.json()
    
    // Validate request body
    const validatedBody = createValidationSchema.parse(body)
    
    const validation = await service.createValidation(user.id, validatedBody)
    
    return new Response(
      JSON.stringify(validation),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200,
      }
    )
  } catch (error) {
    console.error('Error creating validation:', error)
    return new Response(
      JSON.stringify({ error: error.message }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 400,
      }
    )
  }
}) 