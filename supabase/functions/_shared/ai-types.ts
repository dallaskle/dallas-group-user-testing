import { Database } from './database.types.ts'

export type AiDoc = Database['public']['Tables']['ai_docs']['Row']
export type AgentAuditLog = Database['public']['Tables']['agent_audit_log']['Row']

export interface AgentContext {
  userId: string
  accessToken: string
}

export interface AgentRequest {
  action: string
  content: string
  metadata?: Record<string, unknown>
}

export interface AgentResponse {
  success: boolean
  message: string
  data?: unknown
  error?: string
}

export interface Tool {
  name: string
  description: string
  execute: (context: AgentContext, params: Record<string, unknown>) => Promise<unknown>
}

export interface EmbeddingResult {
  embedding: number[]
  usage: {
    prompt_tokens: number
    total_tokens: number
  }
}

export interface SimilaritySearchResult {
  id: string
  content: string
  metadata: Record<string, unknown>
  similarity: number
} 
