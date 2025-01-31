import { Card } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Link } from 'react-router-dom'
import { format } from 'date-fns'

interface Feature {
  id: string
  name: string
  feature_id?: string
}

interface Validation {
  id: string
  feature_id: string
  validated_by: string
  status: string
  notes: string
  created_at: string
  updated_at: string
  validator?: {
    name: string
  }
  feature?: Feature
  video_url?: string
}

interface GetValidationsCardProps {
  validations: Validation[]
  project_id?: string
  feature_id?: string
  feature_count?: number
  isCompact?: boolean
}

export function GetValidationsCard({ validations, project_id, feature_id, feature_count, isCompact = false }: GetValidationsCardProps) {
  const validationsByFeature = validations.reduce((acc, validation) => {
    const featureId = validation.feature_id
    if (!acc[featureId]) {
      acc[featureId] = {
        feature: validation.feature || { id: featureId, name: 'Unknown Feature' },
        validations: []
      }
    }
    acc[featureId].validations.push(validation)
    return acc
  }, {} as Record<string, { feature: Feature, validations: Validation[] }>)

  return (
    <Card className={`p-4 bg-purple-50 dark:bg-purple-900/20 border-purple-200 dark:border-purple-800 ${
      isCompact ? 'p-2' : ''
    }`}>
      <div className="space-y-2">
        <h3 className={`font-semibold text-purple-700 dark:text-purple-300 ${
          isCompact ? 'text-sm' : 'text-lg'
        }`}>
          {project_id ? 'Project Validations' : 'Feature Validations'}
        </h3>

        {project_id && feature_count !== undefined && (
          <p className={`text-muted-foreground ${isCompact ? 'text-xs' : 'text-sm'}`}>
            Showing validations for {feature_count} features
          </p>
        )}

        <div className={`space-y-4 ${isCompact ? 'space-y-2' : ''}`}>
          {Object.entries(validationsByFeature).map(([featureId, { feature, validations: featureValidations }]) => (
            <div key={featureId} className="space-y-2">
              {project_id && (
                <h4 className={`font-medium ${isCompact ? 'text-xs' : 'text-sm'}`}>
                  {feature.name}
                </h4>
              )}
              
              <div className="space-y-2">
                {featureValidations.map((validation) => (
                  <Link 
                    key={validation.id}
                    to={`/student/features/${validation.feature_id}`}
                    className="block"
                  >
                    <div className="p-2 rounded-md bg-background/50 hover:bg-background/80 transition-colors">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <Badge variant="outline" className={`${isCompact ? 'text-xs' : 'text-sm'}`}>
                            {validation.status}
                          </Badge>
                          {validation.validator && (
                            <span className={`text-muted-foreground ${isCompact ? 'text-xs' : 'text-sm'}`}>
                              by {validation.validator.name}
                            </span>
                          )}
                        </div>
                        <span className={`text-muted-foreground ${isCompact ? 'text-xs' : 'text-sm'}`}>
                          {format(new Date(validation.created_at), 'MMM d, yyyy')}
                        </span>
                      </div>
                      {!isCompact && (
                        <div className="mt-1 space-y-1">
                          {validation.notes && (
                            <p className="text-sm text-muted-foreground">
                              {validation.notes}
                            </p>
                          )}
                          {validation.video_url && (
                            <p className="text-xs text-blue-600 dark:text-blue-400 hover:underline">
                              View Validation Video
                            </p>
                          )}
                        </div>
                      )}
                    </div>
                  </Link>
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>
    </Card>
  )
} 