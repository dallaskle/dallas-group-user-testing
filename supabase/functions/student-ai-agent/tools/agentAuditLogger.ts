import { createClient } from '../../_shared/deps.ts'
import { AgentContext, Tool } from '../../_shared/ai-types.ts'

interface AuditLogParams extends Record<string, unknown> {
  agent_name: string
  user_input: string
  agent_response: string
  additional_metadata?: Record<string, unknown>
}

function isAuditLogParams(params: Record<string, unknown>): params is AuditLogParams {
  return (
    typeof params.agent_name === 'string' &&
    typeof params.user_input === 'string' &&
    typeof params.agent_response === 'string' &&
    (params.additional_metadata === undefined || typeof params.additional_metadata === 'object')
  )
}

export const agentAuditLoggerTool: Tool = {
  name: 'agentAuditLogger',
  description: 'Logs agent interactions for auditing purposes',
  execute: async (context: AgentContext, params: Record<string, unknown>) => {
    try {
      if (!isAuditLogParams(params)) {
        throw new Error('Invalid parameters: Expected AuditLogParams structure')
      }

      const supabase = createClient(
        Deno.env.get('SUPABASE_URL') ?? '',
        Deno.env.get('SUPABASE_ANON_KEY') ?? '',
        { global: { headers: { Authorization: `Bearer ${context.accessToken}` } } }
      )

      // Store the audit log
      const { data, error } = await supabase
        .from('agent_audit_log')
        .insert({
          agent_name: params.agent_name,
          user_input: params.user_input,
          agent_response: params.agent_response,
          user_id: context.userId,
          additional_metadata: params.additional_metadata || {},
        })
        .select()
        .single()

      if (error) {
        throw error
      }

      return {
        success: true,
        logId: data.id,
      }
    } catch (error) {
      console.error('Error in agentAuditLogger:', error)
      throw error
    }
  },
} 