import { CreateFeatureResponseCard } from './CreateFeatureResponseCard'
import { Message } from './Message'

interface ToolResponseRouterProps {
  toolName: string
  toolResult: any // We'll type this more specifically as we add more tools
  timestamp: Date
}

export function ToolResponseRouter({ toolName, toolResult, timestamp }: ToolResponseRouterProps) {
  if (toolName === 'create_feature' && toolResult.success && toolResult.feature) {
    return (
      <>
        <CreateFeatureResponseCard feature={toolResult.feature} />
        <Message>
          Got it created! Let me know if you want to update it, create more features, or if I made a mistake.
          You can also click on the feature to view it on the feature page.
        </Message>
      </>
    )
  }

  // Default case: return null if no matching tool card
  return null
} 