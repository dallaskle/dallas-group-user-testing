import { createHandler } from '../_shared/handler.ts'
import { corsHeaders } from '../_shared/cors.ts'
import { ProjectsUpdateService } from './projects-update.service.ts'
import { z } from '../_shared/deps.ts'

console.log('Hello from projects-update!')

const updateProjectSchema = z.object({
  id: z.string(),
  type: z.enum(['project', 'feature']),
  updates: z.object({
    name: z.string().optional(),
    project_registry_id: z.string().optional(),
    student_id: z.string().optional(),
    description: z.string().optional(),
    status: z.enum(['Not Started', 'In Progress', 'Successful Test', 'Failed Test']).optional(),
    required_validations: z.number().optional(),
    current_validations: z.number().optional()
  })
})

export default createHandler(async (req, supabaseClient, _user) => {
  const service = new ProjectsUpdateService(supabaseClient)
  
  try {
    const body = await req.json()
    const params = updateProjectSchema.parse(body)

    let data
    if (params.type === 'project') {
      data = await service.updateProject({
        id: params.id,
        updates: {
          name: params.updates.name,
          project_registry_id: params.updates.project_registry_id,
          student_id: params.updates.student_id
        }
      })
    } else {
      data = await service.updateFeature({
        id: params.id,
        updates: {
          name: params.updates.name,
          description: params.updates.description,
          status: params.updates.status,
          required_validations: params.updates.required_validations,
          current_validations: params.updates.current_validations
        }
      })
    }

    console.log(`${params.type} updated:`, data)
    
    return new Response(
      JSON.stringify(data),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200,
      }
    )
  } catch (error) {
    console.error('Error updating project/feature:', error)
    return new Response(
      JSON.stringify({ error: error.message }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 500,
      }
    )
  }
}) 