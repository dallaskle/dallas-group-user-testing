import { useState } from 'react'
import { studentAiApi } from '../api/student-ai.api'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card } from '@/components/ui/card'
import { ScrollArea } from '@/components/ui/scroll-area'
import { useToast } from '@/components/ui/use-toast'

interface Message {
  id: string
  type: 'user' | 'agent'
  content: string
  timestamp: Date
  metadata?: {
    intermediateSteps?: Array<{
      action: string
      observation: string
    }>
    error?: string
  }
}

export function StudentAiChat() {
  const [messages, setMessages] = useState<Message[]>([])
  const [input, setInput] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const { toast } = useToast()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!input.trim() || isLoading) return

    const userMessage: Message = {
      id: crypto.randomUUID(),
      type: 'user',
      content: input.trim(),
      timestamp: new Date(),
    }

    setMessages(prev => [...prev, userMessage])
    setInput('')
    setIsLoading(true)

    try {
      const result = await studentAiApi.processRequest(input)

      const agentMessage: Message = {
        id: crypto.randomUUID(),
        type: 'agent',
        content: result.data?.output || result.message,
        timestamp: new Date(),
        metadata: {
          intermediateSteps: result.data?.intermediateSteps,
        },
      }

      setMessages(prev => [...prev, agentMessage])
    } catch (error) {
      const errorMessage: Message = {
        id: crypto.randomUUID(),
        type: 'agent',
        content: 'I encountered an error while processing your request.',
        timestamp: new Date(),
        metadata: {
          error: error instanceof Error ? error.message : 'Unknown error occurred',
        },
      }

      setMessages(prev => [...prev, errorMessage])
      
      toast({
        title: 'Error',
        description: error instanceof Error ? error.message : 'An error occurred',
        variant: 'destructive',
      })
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="flex flex-col h-[600px] max-w-2xl mx-auto p-4 space-y-4">
      <Card className="flex-1 p-4">
        <ScrollArea className="h-full pr-4">
          <div className="space-y-4">
            {messages.map((message) => (
              <div
                key={message.id}
                className={`flex ${
                  message.type === 'user' ? 'justify-end' : 'justify-start'
                }`}
              >
                <div
                  className={`max-w-[80%] rounded-lg p-3 ${
                    message.type === 'user'
                      ? 'bg-primary text-primary-foreground'
                      : 'bg-muted'
                  }`}
                >
                  <p className="text-sm">{message.content}</p>
                  {message.metadata?.intermediateSteps && (
                    <div className="mt-2 space-y-2">
                      {message.metadata.intermediateSteps.map((step, index) => (
                        <div
                          key={index}
                          className="bg-background rounded p-2 text-xs"
                        >
                          <p className="font-medium">Action: {step.action}</p>
                          <p className="mt-1">Result: {step.observation}</p>
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
          </div>
        </ScrollArea>
      </Card>

      <form onSubmit={handleSubmit} className="flex gap-2">
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