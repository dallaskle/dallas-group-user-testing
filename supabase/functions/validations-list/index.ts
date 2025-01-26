import { createHandler } from '../_shared/handler.ts'
import { corsHeaders } from '../_shared/cors.ts'
import { ValidationsListService } from './validations-list.service.ts'
import { z } from '../_shared/deps.ts'

console.log('Hello from validations-list!')

const listValidationsSchema = z.object({
  featureIds: z.array(z.string()).optional(),
  featureNames: z.record(z.string()).optional(),
  featureId: z.string().optional(),
  ascending: z.boolean().optional(),
  withValidator: z.boolean().optional()
})

export default createHandler(async (req, supabaseClient, user) => {
  if (req.method !== 'POST') {
    return new Response(
      JSON.stringify({ error: 'Method not allowed' }),
      { status: 405, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )
  }

  try {
    const service = new ValidationsListService(supabaseClient)
    const body = await req.json()
    
    // Validate request body
    const validatedBody = listValidationsSchema.parse(body)
    
    let result
    if (validatedBody.featureIds) {
      result = await service.getValidationsByFeatureIds(
        validatedBody.featureIds,
        validatedBody.featureNames || {},
        validatedBody.ascending
      )
    } else if (validatedBody.featureId && validatedBody.withValidator) {
      result = await service.getFeatureValidationsWithValidator(validatedBody.featureId)
    } else if (validatedBody.featureId) {
      result = await service.getFeatureValidations(validatedBody.featureId)
    } else {
      throw new Error('Invalid request parameters')
    }
    
    return new Response(
      JSON.stringify(result),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200,
      }
    )
  } catch (error) {
    console.error('Error listing validations:', error)
    return new Response(
      JSON.stringify({ error: error.message }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 400,
      }
    )
  }
}) 