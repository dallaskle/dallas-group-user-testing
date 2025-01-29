import { createClient } from '../../_shared/deps.ts'
import { AgentContext, Tool, EmbeddingResult, SimilaritySearchResult } from '../../_shared/ai-types.ts'

interface SearchParams extends Record<string, unknown> {
  query: string
  doc_type?: string
  project_id?: string
  feature_id?: string
  ticket_id?: string
  limit?: number
}

function isSearchParams(params: Record<string, unknown>): params is SearchParams {
  return (
    typeof params.query === 'string' &&
    (params.doc_type === undefined || typeof params.doc_type === 'string') &&
    (params.project_id === undefined || typeof params.project_id === 'string') &&
    (params.feature_id === undefined || typeof params.feature_id === 'string') &&
    (params.ticket_id === undefined || typeof params.ticket_id === 'string') &&
    (params.limit === undefined || typeof params.limit === 'number')
  )
}

async function generateEmbedding(content: string): Promise<EmbeddingResult> {
  const response = await fetch('https://api.openai.com/v1/embeddings', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${Deno.env.get('OPENAI_API_KEY')}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      input: content,
      model: 'text-embedding-ada-002',
    }),
  })

  if (!response.ok) {
    throw new Error(`OpenAI API error: ${response.statusText}`)
  }

  const result = await response.json()
  return {
    embedding: result.data[0].embedding,
    usage: result.usage,
  }
}

export const searchForDetailsTool: Tool = {
  name: 'searchForDetails',
  description: 'Searches for relevant documents using vector similarity search',
  execute: async (context: AgentContext, params: Record<string, unknown>) => {
    try {
      if (!isSearchParams(params)) {
        throw new Error('Invalid parameters: Expected SearchParams structure')
      }

      const supabase = createClient(
        Deno.env.get('SUPABASE_URL') ?? '',
        Deno.env.get('SUPABASE_ANON_KEY') ?? '',
        { global: { headers: { Authorization: `Bearer ${context.accessToken}` } } }
      )

      // Generate embedding for the search query
      const { embedding, usage } = await generateEmbedding(params.query)

      // Build the base query
      let query = supabase.rpc('match_documents', {
        query_embedding: embedding,
        match_threshold: 0.5,
        match_count: params.limit || 10
      })

      // Add filters if provided
      if (params.doc_type) {
        query = query.eq('doc_type', params.doc_type)
      }
      if (params.project_id) {
        query = query.eq('project_id', params.project_id)
      }
      if (params.feature_id) {
        query = query.eq('feature_id', params.feature_id)
      }
      if (params.ticket_id) {
        query = query.eq('ticket_id', params.ticket_id)
      }

      // Execute the query
      const { data, error } = await query

      if (error) {
        throw error
      }

      // Transform results to include similarity scores
      const results: SimilaritySearchResult[] = data.map((doc: any) => ({
        id: doc.id,
        content: doc.content,
        metadata: doc.metadata || {},
        similarity: doc.similarity
      }))

      return {
        success: true,
        results,
        usage,
      }
    } catch (error) {
      console.error('Error in searchForDetails:', error)
      throw error
    }
  },
} 