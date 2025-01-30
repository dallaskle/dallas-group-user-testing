import { useState, useEffect, useRef } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card } from '@/components/ui/card'
import { ScrollArea } from '@/components/ui/scroll-area'
import { useToast } from '@/components/ui/use-toast'
import { useAiChatStore } from '../store/ai-chat.store'
import { ToolResponseRouter } from './ToolResponseCards/ToolResponseRouter'
import { Message } from './ToolResponseCards/Message'
import { TypingIndicator } from './TypingIndicator'

export function StudentAiChat() {
  const [input, setInput] = useState('')
  const { toast } = useToast()
  const messagesEndRef = useRef<HTMLDivElement>(null)
  
  const { messages, isLoading, isTyping, error, sendMessage } = useAiChatStore()

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" })
  }

  useEffect(() => {
    scrollToBottom()
  }, [messages, isTyping])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!input.trim() || isLoading) return

    try {
      await sendMessage(input)
      setInput('')
    } catch (error) {
      toast({
        title: 'Error',
        description: error instanceof Error ? error.message : 'An error occurred',
        variant: 'destructive',
      })
    }
  }

  return (
    <div className="flex flex-col h-full p-4">
      <Card className="flex-1 overflow-hidden">
        <ScrollArea className="h-full px-4">
          <div className="space-y-2 py-0">
            {messages.map((message) => (
              <div
                key={message.id}
                className={`flex ${
                  message.type === 'user' ? 'justify-end' : 'justify-start'
                }`}
              >
                <div
                  className={`max-w-[80%] rounded-lg py-1 px-2 ${
                    message.type === 'user'
                      ? 'bg-primary text-primary-foreground'
                      : message.isQuickResponse
                      ? 'bg-muted/50'
                      : 'bg-muted'
                  }`}
                >
                  {message.type === 'user' ? (
                    <Message>{message.content}</Message>
                  ) : (
                    <>
                      {message.metadata?.tool_used === 'create_feature' ? (
                        <ToolResponseRouter 
                          toolName={message.metadata.tool_used}
                          toolResult={{
                            success: message.metadata.tool_result?.success || false,
                            error: message.metadata.tool_result?.error,
                            feature: message.metadata.tool_result?.feature,
                            message: message.metadata.message
                          }}
                          timestamp={message.timestamp}
                        />
                      ) : (
                        <Message>
                          {message.metadata?.message || message.content}
                        </Message>
                      )}
                      {message.metadata?.tool_result?.error && (
                        <p className="text-destructive text-xs mt-2">
                          Tool Error: {message.metadata.tool_result.error}
                        </p>
                      )}
                    </>
                  )}
                  {message.metadata?.intermediateSteps && (
                    <div className="mt-2 space-y-2">
                      {message.metadata.intermediateSteps.map((step, index) => (
                        <div
                          key={index}
                          className="bg-background rounded p-2 text-xs"
                        >
                          <Message>
                            <p className="font-medium">Action: {step.action}</p>
                            <p className="mt-1">Result: {step.observation}</p>
                          </Message>
                        </div>
                      ))}
                    </div>
                  )}
                  {message.metadata?.error && (
                    <p className="text-xs text-destructive mt-1">
                      {message.metadata.error}
                    </p>
                  )}
                  <p className="text-xs opacity-50 mt-1">
                    {message.timestamp.toLocaleTimeString()}
                  </p>
                </div>
              </div>
            ))}
            {isTyping && (
              <div className="flex justify-start">
                <div className="max-w-[80%] rounded-lg p-3 bg-muted/50">
                  <TypingIndicator />
                </div>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>
        </ScrollArea>
      </Card>

      <form onSubmit={handleSubmit} className="flex gap-2 pt-4">
        <Input
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder="Ask me anything..."
          disabled={isLoading}
          className="flex-1"
        />
        <Button type="submit" disabled={isLoading}>
          {isLoading ? 'Thinking...' : 'Send'}
        </Button>
      </form>
    </div>
  )
} 