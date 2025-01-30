import { create } from 'zustand'
import { studentAiApi } from '../api/student-ai.api'
import { useAuthStore } from '@/features/auth/store/auth.store'

export interface Message {
  id: string
  type: 'user' | 'agent'
  content: string
  timestamp: Date
  conversation_id?: string
  metadata?: {
    intermediateSteps?: Array<{
      action: string
      observation: string
    }>
    tool_used?: string
    tool_result?: {
      success: boolean
      error?: string
      feature?: any
    }
    error?: string
    message?: string
  }
}

interface AiChatState {
  messages: Message[]
  isLoading: boolean
  error: Error | null
  currentConversationId: string | null

  // State setters
  setMessages: (messages: Message[]) => void
  setLoading: (isLoading: boolean) => void
  setError: (error: Error | null) => void
  clearMessages: () => void
  setCurrentConversationId: (id: string | null) => void

  // Message actions
  addMessage: (message: Message) => void
  sendMessage: (content: string, options?: {
    project_id?: string
    feature_id?: string
  }) => Promise<void>
}

export const useAiChatStore = create<AiChatState>((set, get) => ({
  messages: [],
  isLoading: false,
  error: null,
  currentConversationId: null,

  // State setters
  setMessages: (messages) => set({ messages }),
  setLoading: (isLoading) => set({ isLoading }),
  setError: (error) => set({ error }),
  clearMessages: () => set({ messages: [], currentConversationId: null }),
  setCurrentConversationId: (id) => set({ currentConversationId: id }),

  // Message actions
  addMessage: (message) => 
    set((state) => ({
      messages: [...state.messages, message]
    })),

  sendMessage: async (content: string, options) => {
    const { session } = useAuthStore.getState()
    if (!session?.access_token) {
      set({ error: new Error('No active session') })
      return
    }

    // Create and add user message
    const userMessage: Message = {
      id: crypto.randomUUID(),
      type: 'user',
      content: content.trim(),
      timestamp: new Date(),
      conversation_id: get().currentConversationId || undefined
    }
    get().addMessage(userMessage)

    // Process the message
    set({ isLoading: true, error: null })
    try {
      const result = await studentAiApi.processRequest(content, {
        ...options
      })

      // If this is the first message, set the conversation ID
      if (!get().currentConversationId && result.metadata?.conversation_id) {
        set({ currentConversationId: result.metadata.conversation_id })
      }

      const agentMessage: Message = {
        id: crypto.randomUUID(),
        type: 'agent',
        content: result.response,
        timestamp: new Date(),
        conversation_id: result.metadata?.conversation_id || get().currentConversationId || undefined,
        metadata: {
          intermediateSteps: result.metadata?.intermediateSteps,
          tool_used: result.metadata?.tool_used,
          tool_result: result.metadata?.tool_result,
          message: result.metadata?.message,
        },
      }

      get().addMessage(agentMessage)
    } catch (error) {
      const errorMessage: Message = {
        id: crypto.randomUUID(),
        type: 'agent',
        content: 'I encountered an error while processing your request.',
        timestamp: new Date(),
        conversation_id: get().currentConversationId || undefined,
        metadata: {
          error: error instanceof Error ? error.message : 'Unknown error occurred',
        },
      }

      get().addMessage(errorMessage)
      set({ error: error instanceof Error ? error : new Error('Failed to process message') })
    } finally {
      set({ isLoading: false })
    }
  },
}))
