import { Card } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Progress } from '@/components/ui/progress'
import { Link } from 'react-router-dom'

interface Feature {
  id: string
  project_id: string
  name: string
  description: string
  status: string
  required_validations: number
  current_validations: number
  created_at: string
  updated_at: string
}

interface Project {
  id: string
  name: string
  registry: {
    id: string
    name: string
  }
  features: Feature[]
  stats: {
    features_by_status: {
      'Not Started': number
      'In Progress': number
      'Successful Test': number
      'Failed Test': number
    }
    total_features: number
    total_validations: number
    required_validations: number
    validation_progress: number
  }
}

interface GetProjectInfoCardProps {
  project: Project
  isCompact?: boolean
}

export function GetProjectInfoCard({ project, isCompact = false }: GetProjectInfoCardProps) {
  return (
    <Link to={`/student/projects/${project.id}`} className="block">
      <Card className={`p-4 bg-blue-50 dark:bg-blue-900/20 border-blue-200 dark:border-blue-800 hover:bg-blue-100 dark:hover:bg-blue-900/30 transition-colors ${
        isCompact ? 'p-2' : ''
      }`}>
        <div className="space-y-2">
          <h3 className={`font-semibold text-blue-700 dark:text-blue-300 ${
            isCompact ? 'text-sm' : 'text-lg'
          }`}>
            {project.name}
          </h3>
          <p className={`text-muted-foreground ${isCompact ? 'text-xs' : 'text-sm'}`}>
            Based on {project.registry.name}
          </p>
          
          <div className={`space-y-2 ${isCompact ? 'space-y-1' : ''}`}>
            <div className="flex flex-wrap gap-2">
              {Object.entries(project.stats.features_by_status).map(([status, count]) => (
                <Badge 
                  key={status} 
                  variant="secondary"
                  className={`${isCompact ? 'text-xs' : 'text-sm'}`}
                >
                  {status}: {count}
                </Badge>
              ))}
            </div>

            <div className="space-y-1">
              <Progress 
                value={project.stats.validation_progress} 
                className="h-2"
              />
              <div className="flex justify-between text-muted-foreground text-xs">
                <span>
                  {project.stats.total_validations} of {project.stats.required_validations} validations complete
                </span>
                <span>{Math.round(project.stats.validation_progress)}%</span>
              </div>
            </div>

            {!isCompact && project.features.length > 0 && (
              <div className="mt-4 space-y-2">
                <h4 className="font-medium text-sm">Recent Features</h4>
                <div className="space-y-2">
                  {project.features.slice(0, 3).map(feature => (
                    <div 
                      key={feature.id}
                      className="p-2 rounded-md bg-background/50"
                    >
                      <div className="flex items-center justify-between">
                        <span className="font-medium text-sm">{feature.name}</span>
                        <Badge variant="outline" className="text-xs">
                          {feature.status}
                        </Badge>
                      </div>
                      <p className="text-xs text-muted-foreground mt-1">
                        {feature.description}
                      </p>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      </Card>
    </Link>
  )
} 