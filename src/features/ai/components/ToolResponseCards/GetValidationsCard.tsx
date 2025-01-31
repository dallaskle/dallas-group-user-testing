import { Card } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Link, useNavigate } from 'react-router-dom'
import { format } from 'date-fns'
import { Button } from '@/components/ui/button'
import { ExternalLink } from 'lucide-react'

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
}

interface GetValidationsCardProps {
  validations: Validation[]
  project_id?: string
  feature_id?: string
  feature_count?: number
  isCompact?: boolean
  onNavigate?: () => void
}

export function GetValidationsCard({ validations, project_id, feature_id, feature_count, isCompact = false, onNavigate }: GetValidationsCardProps) {
  const navigate = useNavigate()

  const handleViewValidations = (e: React.MouseEvent) => {
    e.preventDefault()
    if (!isCompact) {
      onNavigate?.()
    }
    if (project_id) {
      navigate(`/student/projects/${project_id}`)
    } else if (feature_id) {
      navigate(`/student/features/${feature_id}`)
    }
  }

  const handleValidationClick = (e: React.MouseEvent, featureId: string) => {
    e.preventDefault()
    onNavigate?.()
    navigate(`/student/features/${featureId}`)
  }

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
        <div className="flex items-center justify-between">
          <h3 className={`font-semibold text-purple-700 dark:text-purple-300 ${
            isCompact ? 'text-sm' : 'text-lg'
          }`}>
            {project_id ? 'Project Validations' : 'Feature Validations'}
          </h3>
          <Button 
            variant="ghost" 
            size="sm" 
            className="gap-2 text-purple-700 dark:text-purple-300 hover:text-purple-800 dark:hover:text-purple-200"
            onClick={handleViewValidations}
          >
            {isCompact ? '' : 'View Full Details'}
            <ExternalLink className="h-4 w-4" />
          </Button>
        </div>

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
                    onClick={(e) => handleValidationClick(e, validation.feature_id)}
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
                      {!isCompact && validation.notes && (
                        <p className="mt-1 text-sm text-muted-foreground">
                          {validation.notes}
                        </p>
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