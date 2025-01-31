import { createHandler } from '../_shared/handler.ts'
import { corsHeaders } from '../_shared/cors.ts'

interface AiAgentRequest {
  content: string
  metadata?: {
    project_id?: string
    feature_id?: string
    ticket_id?: string
    conversation_id?: string
  }
}

interface AiAgentResponse {
  success: boolean
  response: string
  error?: string
  metadata?: Record<string, unknown>
}

export default createHandler(async (req, supabaseClient, user) => {
  if (req.method !== 'POST') {
    return new Response(
      JSON.stringify({ error: 'Method not allowed' }),
      { status: 405, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )
  }

  try {
    const { content, metadata } = await req.json() as AiAgentRequest
    console.log('Processing request:', { content, metadata, userId: user.id })

    // Extract additional authToken from headers
    const authToken = req.headers.get('Authorization')?.split('Bearer ')[1] || ''
    console.log('Additional authToken:', authToken)

    // Get conversation history if conversation_id is provided
    let conversationHistory = []
    if (metadata?.conversation_id) {
      const { data: previousMessages, error: historyError } = await supabaseClient
        .from('agent_audit_log')
        .select('*')
        .eq('conversation_id', metadata.conversation_id)
        .order('created_at', { ascending: true })

      if (historyError) {
        console.error('Error fetching conversation history:', historyError)
      } else {
        // Filter out any messages with null agent_response (incomplete messages)
        conversationHistory = previousMessages.filter(msg => msg.agent_response !== null)
        console.log('Raw conversation history from DB:', JSON.stringify(conversationHistory, null, 2))
        console.log('Number of previous messages:', conversationHistory.length)
      }
    }

    // 1. Create initial audit log entry
    const { data: logEntry, error: logError } = await supabaseClient
      .from('agent_audit_log')
      .insert({
        agent_name: 'student-ai-agent',
        user_input: content,
        user_id: user.id,
        agent_response: null, // Explicitly set to null initially
        conversation_id: metadata?.conversation_id || null,
        additional_metadata: {
          ...metadata,
          request_timestamp: new Date().toISOString(),
          status: 'pending' // Add status to track progress
        }
      })
      .select()
      .single()

    if (logError) {
      console.error('Error creating audit log:', logError)
      throw new Error(`Failed to create audit log: ${logError.message}`)
    }

    // If this is the first message in a conversation, use its ID as the conversation_id
    if (!metadata?.conversation_id) {
      const { error: updateError } = await supabaseClient
        .from('agent_audit_log')
        .update({ conversation_id: logEntry.id })
        .eq('id', logEntry.id)

      if (updateError) {
        console.error('Error updating conversation_id:', updateError)
      } else {
        logEntry.conversation_id = logEntry.id
      }
    }

    console.log('Created audit log entry:', logEntry)

    // 2. Forward request to Python service
    const environment = "local"
    const pythonServiceUrl = environment === "local" ?
      "https://6cd8-2603-7000-2800-1584-9081-d31a-fc4a-2a02.ngrok-free.app" : Deno.env.get('PYTHON_SERVICE_URL')
    const pythonServiceApiKey = Deno.env.get('PYTHON_SERVICE_API_KEY')

    if (!pythonServiceUrl || !pythonServiceApiKey) {
      throw new Error('Python service configuration missing')
    }

    console.log('Forwarding request to Python service:', pythonServiceUrl)
    try {
      const requestBody = {
        content,
        user_id: user.id,
        project_id: metadata?.project_id,
        feature_id: metadata?.feature_id,
        conversation_id: logEntry.conversation_id,
        conversation_history: conversationHistory,
        authToken
      };
      console.log('Conversation history structure being sent to Python:', {
        historyLength: conversationHistory.length,
        sampleMessage: conversationHistory[0] || 'No history',
        messageTypes: conversationHistory.map(msg => ({
          hasUserInput: !!msg.user_input,
          hasAgentResponse: !!msg.agent_response,
          agent_name: msg.agent_name
        }))
      });
      console.log('Request body:', JSON.stringify(requestBody, null, 2));

      const pythonResponse = await fetch(`${pythonServiceUrl}/chat`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'X-API-Key': pythonServiceApiKey
        },
        body: JSON.stringify(requestBody)
      });

      console.log('Python service response status:', pythonResponse.status);
      console.log('Python service response headers:', Object.fromEntries(pythonResponse.headers.entries()));

      if (!pythonResponse.ok) {
        const errorText = await pythonResponse.text();
        console.error('Python service error response:', errorText);
        try {
          const error = JSON.parse(errorText);
          throw new Error(error.detail || 'Python service error');
        } catch (e) {
          throw new Error(`Python service error: ${errorText}`);
        }
      }

      const result = await pythonResponse.json()
      console.log('Received response from Python service:', result)

      // Check if the tool execution failed - look at the actual tool_result.success
      const toolExecutionFailed = result.metadata?.tool_used && result.metadata?.tool_result?.success === false
      if (toolExecutionFailed) {
        console.error('Tool execution failed:', result.metadata?.tool_result)
      }

      // Update audit log with response
      const { error: updateError } = await supabaseClient
        .from('agent_audit_log')
        .update({ 
          agent_response: result.response,
          additional_metadata: {
            ...metadata,
            python_service_metadata: result.metadata,
            tool_execution_failed: toolExecutionFailed,
            tool_error: toolExecutionFailed ? result.metadata?.tool_result?.error : undefined,
            response_timestamp: new Date().toISOString()
          }
        })
        .eq('id', logEntry.id)

      if (updateError) {
        console.error('Error updating audit log:', updateError)
        // Continue anyway as the main operation succeeded
      }

      // Determine appropriate status code based on tool execution result
      const statusCode = toolExecutionFailed ? 422 : 200

      return new Response(
        JSON.stringify({
          success: result.metadata?.tool_used ? result.metadata?.tool_result?.success : true,
          response: result.response,
          metadata: {
            ...result.metadata,
            conversation_id: logEntry.conversation_id,
            tool_used: result.metadata?.tool_used,
            tool_result: {
              success: result.metadata?.tool_used ? result.metadata?.tool_result?.success : true,
              error: result.metadata?.tool_result?.error,
              ...((['create_feature', 'update_feature', 'delete_feature', 'get_feature_info'].includes(result.metadata?.tool_used || '') && 
                  result.metadata?.tool_result?.feature) && {
                feature: result.metadata.tool_result.feature,
                ...(result.metadata?.tool_used === 'update_feature' && {
                  updates_applied: result.metadata.tool_result.updates_applied
                })
              }),
              ...(result.metadata?.tool_used === 'get_project_info' && result.metadata?.tool_result?.project && {
                project: result.metadata.tool_result.project
              }),
              ...(result.metadata?.tool_used === 'get_validations' && result.metadata?.tool_result?.validations && {
                validations: result.metadata.tool_result.validations,
                project_id: result.metadata.tool_result.project_id,
                feature_id: result.metadata.tool_result.feature_id,
                feature_count: result.metadata.tool_result.feature_count
              })
            }
          }
        } as AiAgentResponse),
        { 
          status: statusCode, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        }
      )

    } catch (error) {
      console.error('Error in Python service request:', error)
      return new Response(
        JSON.stringify({
          success: false,
          response: error instanceof Error ? error.message : 'An unknown error occurred',
          error: error instanceof Error ? error.message : 'An unknown error occurred'
        } as AiAgentResponse),
        { 
          status: 500, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        }
      )
    }

  } catch (error) {
    console.error('Error in student-ai-agent:', error)
    return new Response(
      JSON.stringify({
        success: false,
        response: error instanceof Error ? error.message : 'An unknown error occurred',
        error: error instanceof Error ? error.message : 'An unknown error occurred'
      } as AiAgentResponse),
      { 
        status: 500, 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      }
    )
  }
}) 