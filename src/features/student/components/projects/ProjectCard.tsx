import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Database } from '@/shared/types/database.types'
import { Progress } from '@/components/ui/progress'

type Project = Database['public']['Tables']['projects']['Row']
type ProjectWithRegistry = Project & {
  registry: Database['public']['Tables']['project_registry']['Row']
  feature_count: number
  validation_count: number
}

interface ProjectCardProps {
  project: ProjectWithRegistry
  onEdit?: () => void
  onDelete?: () => void
}

export const ProjectCard = ({ project, onEdit, onDelete }: ProjectCardProps) => {
  const validationProgress = project.validation_count / (project.feature_count || 1) * 100

  return (
    <Card className="w-full">
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="text-xl font-bold">{project.name}</CardTitle>
          <Badge variant="outline">{project.registry.name}</Badge>
        </div>
        <CardDescription>{project.registry.description}</CardDescription>
      </CardHeader>
      
      <CardContent>
        <div className="space-y-4">
          <div className="flex justify-between text-sm text-gray-500">
            <span>Features: {project.feature_count}</span>
            <span>Validations: {project.validation_count}</span>
          </div>
          
          <div className="space-y-2">
            <div className="flex justify-between text-sm">
              <span>Validation Progress</span>
              <span>{Math.round(validationProgress)}%</span>
            </div>
            <Progress value={validationProgress} className="h-2" />
          </div>
        </div>
      </CardContent>

      <CardFooter className="flex justify-end space-x-2">
        {onEdit && (
          <Button
            variant="outline"
            size="sm"
            onClick={onEdit}
          >
            Edit
          </Button>
        )}
        {onDelete && (
          <Button
            variant="destructive"
            size="sm"
            onClick={onDelete}
          >
            Delete
          </Button>
        )}
      </CardFooter>
    </Card>
  )
} 