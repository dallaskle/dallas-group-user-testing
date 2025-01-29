import { createHandler } from '../_shared/handler.ts'
import { corsHeaders } from '../_shared/cors.ts'

interface AiAgentRequest {
  content: string
  metadata?: {
    project_id?: string
    feature_id?: string
    ticket_id?: string
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

    // 1. Create initial audit log entry
    const { data: logEntry, error: logError } = await supabaseClient
      .from('agent_audit_log')
      .insert({
        agent_name: 'student-ai-agent',
        user_input: content,
        user_id: user.id,
        agent_response: null, // Explicitly set to null initially
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

    console.log('Created audit log entry:', logEntry)

    // 2. Forward request to Python service
    const pythonServiceUrl = Deno.env.get('PYTHON_SERVICE_URL')
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
        authToken
      };
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

      // Check if the tool execution failed
      const toolExecutionFailed = result.tool_used && result.tool_result?.success === false
      if (toolExecutionFailed) {
        console.error('Tool execution failed:', result.tool_result)
      }

      // 3. Update audit log with response
      const { error: updateError } = await supabaseClient
        .from('agent_audit_log')
        .update({ 
          agent_response: result.response,
          additional_metadata: {
            ...metadata,
            python_service_metadata: result.metadata,
            tool_execution_failed: toolExecutionFailed,
            tool_error: toolExecutionFailed ? result.tool_result?.error : undefined,
            response_timestamp: new Date().toISOString()
          }
        })
        .eq('id', logEntry.id)

      if (updateError) {
        console.error('Error updating audit log:', updateError)
        // Continue anyway as the main operation succeeded
      }

      // 4. If the response indicates a tool was used, store that in ai_docs
      if (result.metadata?.tool_used) {
        const { error: docError } = await supabaseClient
          .from('ai_docs')
          .insert({
            content: result.response,
            doc_type: 'tool_execution',
            project_id: metadata?.project_id,
            feature_id: metadata?.feature_id,
            metadata: {
              tool_name: result.metadata.tool_used,
              tool_result: result.metadata.tool_result,
              execution_success: !toolExecutionFailed,
              error_details: toolExecutionFailed ? result.tool_result?.error : undefined,
              user_id: user.id,
              timestamp: new Date().toISOString()
            }
          })

        if (docError) {
          console.error('Error storing tool execution in ai_docs:', docError)
          // Continue anyway as this is not critical
        }
      }

      // Determine appropriate status code based on tool execution result
      const statusCode = toolExecutionFailed ? 422 : 200

      return new Response(
        JSON.stringify({
          success: !toolExecutionFailed,
          response: result.response,
          metadata: result.metadata,
          error: toolExecutionFailed ? result.tool_result?.error : undefined
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
          response: '',
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
        response: '',
        error: error instanceof Error ? error.message : 'An unknown error occurred'
      } as AiAgentResponse),
      { 
        status: 500, 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      }
    )
  }
}) 