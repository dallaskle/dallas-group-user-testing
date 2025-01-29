import { createClient } from '../../_shared/deps.ts'
import { AgentContext, Tool, EmbeddingResult } from '../../_shared/ai-types.ts'

interface StoreEmbeddingParams extends Record<string, unknown> {
  content: string
  doc_type: string
  project_id?: string
  feature_id?: string
  ticket_id?: string
  validation_id?: string
  metadata?: Record<string, unknown>
}

function isStoreEmbeddingParams(params: Record<string, unknown>): params is StoreEmbeddingParams {
  return (
    typeof params.content === 'string' &&
    typeof params.doc_type === 'string' &&
    (params.project_id === undefined || typeof params.project_id === 'string') &&
    (params.feature_id === undefined || typeof params.feature_id === 'string') &&
    (params.ticket_id === undefined || typeof params.ticket_id === 'string') &&
    (params.validation_id === undefined || typeof params.validation_id === 'string') &&
    (params.metadata === undefined || typeof params.metadata === 'object')
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

export const storeEmbeddingTool: Tool = {
  name: 'storeEmbedding',
  description: 'Stores text content with its embedding vector in the database',
  execute: async (context: AgentContext, params: Record<string, unknown>) => {
    try {
      if (!isStoreEmbeddingParams(params)) {
        throw new Error('Invalid parameters: Expected StoreEmbeddingParams structure')
      }

      const supabase = createClient(
        Deno.env.get('SUPABASE_URL') ?? '',
        Deno.env.get('SUPABASE_ANON_KEY') ?? '',
        { global: { headers: { Authorization: `Bearer ${context.accessToken}` } } }
      )

      // Generate embedding for the content
      const { embedding, usage } = await generateEmbedding(params.content)

      // Store the document with its embedding
      const { data, error } = await supabase
        .from('ai_docs')
        .insert({
          embedding,
          doc_type: params.doc_type,
          content: params.content,
          project_id: params.project_id,
          feature_id: params.feature_id,
          ticket_id: params.ticket_id,
          validation_id: params.validation_id,
          metadata: {
            ...params.metadata,
            embedding_usage: usage,
          },
        })
        .select()
        .single()

      if (error) {
        throw error
      }

      return {
        success: true,
        docId: data.id,
        usage,
      }
    } catch (error) {
      console.error('Error in storeEmbedding:', error)
      throw error
    }
  },
} 
