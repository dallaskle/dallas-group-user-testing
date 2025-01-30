import { create } from 'zustand'
import { studentAiApi } from '../api/student-ai.api'
import { useAuthStore } from '@/features/auth/store/auth.store'
import chatbotResponses from '../utils/quickResponses'

// Helper function to get random quick response
function getRandomQuickResponse(): string {
  const index = Math.floor(Math.random() * chatbotResponses.length)
  return chatbotResponses[index]
}

// Helper function to split response if it contains punctuation
function splitQuickResponse(response: string): string[] {
  const punctuationSplits = response.split(/([,.!?—-]\s+)/)
  if (punctuationSplits.length > 2) {
    const firstPart = punctuationSplits.slice(0, 2).join('')
    const secondPart = punctuationSplits.slice(2).join('')
    return [firstPart.trim(), secondPart.trim()].filter(Boolean)
  }
  return [response]
}

// Constants for timing
const DELAYS = {
  INITIAL_TYPING: 500, // Show typing before first response
  FIRST_RESPONSE: 1500, // Show first response after initial typing
  SECOND_TYPING: 1000, // Show typing after first response
  SECOND_RESPONSE: 1000, // Show second response after second typing
  FINAL_TYPING: 500, // Brief delay before showing final typing indicator
} as const

export interface Message {
  id: string
  type: 'user' | 'agent'
  content: string
  timestamp: Date
  conversation_id?: string
  isQuickResponse?: boolean
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
  isTyping: boolean
  error: Error | null
  currentConversationId: string | null
  hasRealResponseArrived: boolean

  // State setters
  setMessages: (messages: Message[]) => void
  setLoading: (isLoading: boolean) => void
  setTyping: (isTyping: boolean) => void
  setError: (error: Error | null) => void
  clearMessages: () => void
  setCurrentConversationId: (id: string | null) => void
  setHasRealResponseArrived: (hasArrived: boolean) => void

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
  isTyping: false,
  error: null,
  currentConversationId: null,
  hasRealResponseArrived: false,

  // State setters
  setMessages: (messages) => set({ messages }),
  setLoading: (isLoading) => set({ isLoading }),
  setTyping: (isTyping) => set({ isTyping }),
  setError: (error) => set({ error }),
  clearMessages: () => set({ messages: [], currentConversationId: null }),
  setCurrentConversationId: (id) => set({ currentConversationId: id }),
  setHasRealResponseArrived: (hasArrived) => set({ hasRealResponseArrived: hasArrived }),

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

    // Reset the real response flag
    set({ hasRealResponseArrived: false })

    // Create and add user message
    const userMessage: Message = {
      id: crypto.randomUUID(),
      type: 'user',
      content: content.trim(),
      timestamp: new Date(),
      conversation_id: get().currentConversationId || undefined
    }
    get().addMessage(userMessage)

    // Show initial typing indicator
    setTimeout(() => {
      if (!get().hasRealResponseArrived) {
        set({ isTyping: true })

        // Add first quick response after delay
        setTimeout(() => {
          if (!get().hasRealResponseArrived) {
            set({ isTyping: false })
            const quickResponse = getRandomQuickResponse()
            const splitResponses = splitQuickResponse(quickResponse)
            
            get().addMessage({
              id: crypto.randomUUID(),
              type: 'agent',
              content: splitResponses[0],
              timestamp: new Date(),
              isQuickResponse: true,
              conversation_id: get().currentConversationId || undefined
            })

            // Show second typing indicator
            setTimeout(() => {
              if (!get().hasRealResponseArrived) {
                set({ isTyping: true })

                // If there's a second part, add it after delay
                if (splitResponses[1]) {
                  setTimeout(() => {
                    if (!get().hasRealResponseArrived) {
                      set({ isTyping: false })
                      get().addMessage({
                        id: crypto.randomUUID(),
                        type: 'agent',
                        content: splitResponses[1],
                        timestamp: new Date(),
                        isQuickResponse: true,
                        conversation_id: get().currentConversationId || undefined
                      })

                      // Show final typing indicator
                      setTimeout(() => {
                        if (!get().hasRealResponseArrived) {
                          set({ isTyping: true })
                        }
                      }, DELAYS.FINAL_TYPING)
                    }
                  }, DELAYS.SECOND_RESPONSE)
                }
              }
            }, DELAYS.SECOND_TYPING)
          }
        }, DELAYS.FIRST_RESPONSE)
      }
    }, DELAYS.INITIAL_TYPING)

    // Process the message
    set({ isLoading: true, error: null })
    try {
      const result = await studentAiApi.processRequest(content, {
        ...options,
        conversation_id: get().currentConversationId || undefined
      })

      // Mark that the real response has arrived and hide typing indicator
      set({ hasRealResponseArrived: true, isTyping: false })

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
      // Mark that the real response has arrived (with error) and hide typing indicator
      set({ hasRealResponseArrived: true, isTyping: false })

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
