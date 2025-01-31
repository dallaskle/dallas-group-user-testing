import { CreateFeatureResponseCard } from './CreateFeatureResponseCard'
import { UpdateFeatureResponseCard } from './UpdateFeatureResponseCard'
import { DeleteFeatureResponseCard } from './DeleteFeatureResponseCard'
import { GetFeatureInfoCard } from './GetFeatureInfoCard'
import { GetProjectInfoCard } from './GetProjectInfoCard'
import { GetValidationsCard } from './GetValidationsCard'
import { Message } from './Message'

interface ToolResponseRouterProps {
  toolName: string
  toolResult: {
    success: boolean
    error?: string
    feature?: any
    project?: any
    validations?: any[]
    project_id?: string
    feature_id?: string
    feature_count?: number
    message?: string
    updates_applied?: Record<string, any>
  }
  timestamp: Date
  isCompact?: boolean
  onNavigate?: () => void
}

export function ToolResponseRouter({ toolName, toolResult, timestamp, isCompact = false, onNavigate }: ToolResponseRouterProps) {
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

  if (toolName === 'delete_feature' && toolResult.success && toolResult.feature) {
    return (
      <>
        <DeleteFeatureResponseCard 
          feature={toolResult.feature}
          message={toolResult.message || "Feature has been successfully deleted."}
          isCompact={isCompact}
        />
        <Message isCompact={isCompact}>
          {toolResult.message || "The feature has been deleted. This action cannot be undone. Let me know if you need anything else."}
        </Message>
      </>
    )
  }

  if (toolName === 'get_feature_info' && toolResult.success && toolResult.feature) {
    return (
      <>
        <GetFeatureInfoCard 
          feature={toolResult.feature}
          isCompact={isCompact}
        />
        <Message isCompact={isCompact}>
          {toolResult.message || "Here are the feature details. Click the card to view the full feature page. Let me know if you need any specific information or would like to make changes."}
        </Message>
      </>
    )
  }

  if (toolName === 'get_project_info' && toolResult.success && toolResult.project) {
    return (
      <>
        <GetProjectInfoCard 
          project={toolResult.project}
          isCompact={isCompact}
          onNavigate={onNavigate}
        />
        <Message isCompact={isCompact}>
          {toolResult.message || "Here are the project details. Click the card to view the full project page. Let me know if you need any specific information or would like to make changes."}
        </Message>
      </>
    )
  }

  if (toolName === 'get_validations' && toolResult.success && toolResult.validations) {
    return (
      <>
        <GetValidationsCard 
          validations={toolResult.validations}
          project_id={toolResult.project_id}
          feature_id={toolResult.feature_id}
          feature_count={toolResult.feature_count}
          isCompact={isCompact}
        />
        <Message isCompact={isCompact}>
          {toolResult.message || `Here are the validation details for ${toolResult.project_id ? 'the project' : 'the feature'}. Click on any validation to view the associated feature.`}
        </Message>
      </>
    )
  }

  // Default case: return null if no matching tool card
  return null
} 