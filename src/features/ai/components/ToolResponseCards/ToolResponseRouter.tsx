import { CreateFeatureResponseCard } from './CreateFeatureResponseCard'
import { UpdateFeatureResponseCard } from './UpdateFeatureResponseCard'
import { Message } from './Message'

interface ToolResponseRouterProps {
  toolName: string
  toolResult: {
    success: boolean
    error?: string
    feature?: any
    message?: string
    updates_applied?: Record<string, any>
  }
  timestamp: Date
  isCompact?: boolean
}

export function ToolResponseRouter({ toolName, toolResult, timestamp, isCompact = false }: ToolResponseRouterProps) {
  if (toolName === 'create_feature' && toolResult.success && toolResult.feature) {
    return (
      <>
        <CreateFeatureResponseCard feature={toolResult.feature} isCompact={isCompact} />
        <Message isCompact={isCompact}>
          {toolResult.message || "Got it created! Let me know if you want to update it, create more features, or if I made a mistake. You can also click on the feature to view it on the feature page."}
        </Message>
      </>
    )
  }
  console.log(typeof toolResult.updates_applied)
  if (toolName === 'update_feature' && toolResult.success && toolResult.feature) {
    return (
      <>
        <UpdateFeatureResponseCard 
          feature={toolResult.feature} 
          updates_applied={toolResult.updates_applied}
          isCompact={isCompact} 
        />
        <Message isCompact={isCompact}>
          {toolResult.message || `Successfully updated the feature's ${Object.keys(toolResult.updates_applied || {}).join(', ')}. Let me know if you want to make any other changes.`}
        </Message>
      </>
    )
  }

  // Default case: return null if no matching tool card
  return null
} 