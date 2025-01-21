import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { useProjectsStore } from '../../store/projects.store'
import { ProjectCard } from '../projects/ProjectCard'
import { PlusIcon } from 'lucide-react'

export const ProjectsWidget = () => {
  const { projects, isLoading } = useProjectsStore()
  const activeProjects = projects.length

  return (
    <Card className="col-span-2">
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-4">
        <CardTitle className="text-2xl font-bold">Projects</CardTitle>
        <Button size="sm">
          <PlusIcon className="mr-2 h-4 w-4" />
          New Project
        </Button>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <p className="text-sm font-medium text-gray-500">Active Projects</p>
              <p className="text-3xl font-bold">{activeProjects}</p>
            </div>
          </div>

          {isLoading ? (
            <div className="flex items-center justify-center py-6">
              <div className="h-8 w-8 animate-spin rounded-full border-b-2 border-gray-900"></div>
            </div>
          ) : (
            <div className="space-y-4">
              {projects.slice(0, 2).map((project) => (
                <ProjectCard
                  key={project.id}
                  project={project}
                />
              ))}
              {projects.length > 2 && (
                <Button variant="link" className="w-full">
                  View All Projects
                </Button>
              )}
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  )
} 