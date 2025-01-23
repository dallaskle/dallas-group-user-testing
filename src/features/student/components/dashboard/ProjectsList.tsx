import { useNavigate } from 'react-router-dom'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Progress } from '@/components/ui/progress'
import { ArrowRight } from 'lucide-react'

interface Project {
  id: string
  name: string
  registry: {
    name: string
  }
  feature_count: number
  validation_count: number
  required_validation_count: number
  features: Array<{
    id: string
    name: string
    status: 'Not Started' | 'In Progress' | 'Successful Test' | 'Failed Test'
  }>
}

interface ProjectsListProps {
  projects: Project[]
}

export const ProjectsList = ({ projects }: ProjectsListProps) => {
  const navigate = useNavigate()

  return (
    <div className="space-y-4">
      <h2 className="text-2xl font-bold">My Projects</h2>
      <div className="grid gap-4 md:grid-cols-2">
        {projects.map((project) => {
          const validationProgress = project.required_validation_count > 0
            ? (project.validation_count / project.required_validation_count) * 100
            : 0

          const statusCounts = project.features.reduce(
            (acc, feature) => {
              acc[feature.status]++
              return acc
            },
            {
              'Not Started': 0,
              'In Progress': 0,
              'Successful Test': 0,
              'Failed Test': 0,
            } as Record<string, number>
          )

          return (
            <Card 
              key={project.id} 
              className="bg-muted/50 hover:border-primary/50 transition-colors group cursor-pointer"
              onClick={() => navigate(`/student/projects/${project.id}`)}
            >
              <CardHeader>
                <div className="flex items-start justify-between">
                  <div>
                    <CardTitle className="text-xl">{project.name}</CardTitle>
                    <p className="text-sm text-muted-foreground mt-1">
                      Based on {project.registry.name}
                    </p>
                  </div>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="opacity-0 group-hover:opacity-100 transition-opacity"
                  >
                    <ArrowRight className="h-4 w-4" />
                  </Button>
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div>
                    <div className="flex justify-between text-sm mb-2">
                      <span className="text-muted-foreground">Validation Progress</span>
                      <span className="font-medium">{Math.round(validationProgress)}%</span>
                    </div>
                    <Progress value={validationProgress} className="h-2 bg-secondary" />
                    <p className="text-xs text-muted-foreground mt-2">
                      {project.validation_count} of {project.required_validation_count} validations
                    </p>
                  </div>

                  <div className="flex flex-wrap gap-2">
                    {Object.entries(statusCounts).map(([status, count]) => (
                      count > 0 && (
                        <Badge
                          key={status}
                          variant={
                            status === 'Not Started' ? 'secondary' :
                            status === 'In Progress' ? 'default' :
                            status === 'Successful Test' ? 'success' :
                            'destructive'
                          }
                        >
                          {count} {status}
                        </Badge>
                      )
                    ))}
                  </div>
                </div>
              </CardContent>
            </Card>
          )
        })}
      </div>
    </div>
  )
} 