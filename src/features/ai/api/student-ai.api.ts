import { useAuthStore } from '@/features/auth/store/auth.store'

export interface AgentRequest {
  content: string
  metadata?: Record<string, unknown>
}

// Base response type for all agent responses
interface BaseAgentResponse {
  success: boolean
  error?: string
}

// Specific response type for chat
export interface ChatAgentResponse extends BaseAgentResponse {
  response: string
  metadata?: {
    intermediateSteps?: Array<{
      action: string
      observation: string
    }>
    tool_used?: string
    tool_result?: {
      success: boolean
      error?: string
    }
  }
}

// Specific response type for search
export interface SearchAgentResponse extends BaseAgentResponse {
  data: {
    results: SearchResult[]
  }
}

// Specific response type for store
export interface StoreAgentResponse extends BaseAgentResponse {
  data: StoreResult
}

export interface SearchResult {
  id: string
  content: string
  metadata: Record<string, unknown>
  similarity: number
}

export interface StoreResult {
  docId: string
  usage: {
    prompt_tokens: number
    total_tokens: number
  }
}

export const studentAiApi = {
  async processRequest(content: string, options?: {
    project_id?: string
    feature_id?: string
  }): Promise<ChatAgentResponse> {
    const { session } = useAuthStore.getState()
    if (!session?.access_token) {
      throw new Error('No active session')
    }

    const response = await fetch(
      `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/student-ai-agent`,
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${session.access_token}`,
        },
        body: JSON.stringify({
          content,
          metadata: options,
        } as AgentRequest),
      }
    )

    if (!response.ok) {
      const error = await response.json()
      throw new Error(error.error || 'Failed to process request')
    }

    const result = await response.json() as ChatAgentResponse
    console.log('processRequest response:', result)
    if (!result.success) {
      throw new Error(result.error || 'Request failed')
    }

    return result
  },

  async search(query: string, options?: {
    doc_type?: string
    project_id?: string
    feature_id?: string
    ticket_id?: string
    limit?: number
  }): Promise<SearchResult[]> {
    const { session } = useAuthStore.getState()
    if (!session?.access_token) {
      throw new Error('No active session')
    }

    const response = await fetch(
      `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/student-ai-agent`,
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${session.access_token}`,
        },
        body: JSON.stringify({
          action: 'search',
          content: query,
          metadata: options,
        } as AgentRequest),
      }
    )

    if (!response.ok) {
      const error = await response.json()
      throw new Error(error.error || 'Failed to search documents')
    }

    const result = await response.json() as SearchAgentResponse
    console.log('search response:', result)
    if (!result.success) {
      throw new Error(result.error || 'Search failed')
    }

    return result.data.results
  },

  async store(content: string, options: {
    doc_type: string
    project_id?: string
    feature_id?: string
    ticket_id?: string
    metadata?: Record<string, unknown>
  }): Promise<StoreResult> {
    const { session } = useAuthStore.getState()
    if (!session?.access_token) {
      throw new Error('No active session')
    }

    const response = await fetch(
      `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/student-ai-agent`,
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${session.access_token}`,
        },
        body: JSON.stringify({
          action: 'store',
          content,
          metadata: options,
        } as AgentRequest),
      }
    )

    if (!response.ok) {
      const error = await response.json()
      throw new Error(error.error || 'Failed to store document')
    }

    const result = await response.json() as StoreAgentResponse
    console.log('store response:', result)
    if (!result.success) {
      throw new Error(result.error || 'Store operation failed')
    }

    return result.data
  },
} 