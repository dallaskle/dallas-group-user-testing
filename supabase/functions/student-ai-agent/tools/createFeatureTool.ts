import { Tool, createClient } from '../../_shared/deps.ts'
import { AgentContext } from '../../_shared/ai-types.ts'

export class CreateFeatureTool extends Tool {
  name = "create_feature";
  description = "Creates a new feature for a project. Input should be a JSON string with project_id, name, and description.";
  context: AgentContext;

  constructor(context: AgentContext) {
    super();
    this.context = context;
  }

  async _call(input: string): Promise<string> {
    try {
      const params = JSON.parse(input);
      const { project_id, name, description, required_validations = 3 } = params;

      if (!project_id || !name || !description) {
        throw new Error('Missing required parameters: project_id, name, and description are required');
      }

      const supabase = createClient(
        Deno.env.get('SUPABASE_URL') ?? '',
        Deno.env.get('SUPABASE_ANON_KEY') ?? '',
        { global: { headers: { Authorization: `Bearer ${this.context.accessToken}` } } }
      )

      // Verify project ownership
      const { data: project, error: projectError } = await supabase
        .from('projects')
        .select('id')
        .eq('id', project_id)
        .eq('student_id', this.context.userId)
        .single()

      if (projectError || !project) {
        throw new Error('Project not found or access denied')
      }

      // Create the feature
      const { data: feature, error: featureError } = await supabase
        .from('features')
        .insert({
          project_id,
          name,
          description,
          required_validations,
          status: 'Not Started',
          current_validations: 0,
        })
        .select()
        .single()

      if (featureError) {
        throw featureError
      }

      return JSON.stringify({
        success: true,
        feature_id: feature.id,
        message: `Successfully created feature "${name}" for project ${project_id}`,
      })
    } catch (error) {
      return JSON.stringify({
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error occurred',
      })
    }
  }
} 
