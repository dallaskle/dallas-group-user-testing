import { Card } from '@/components/ui/card'
import { useProjectsStore } from '@/features/student/store/projects.store'
import { useEffect, useState } from 'react'
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

interface CreateFeatureResponseCardProps {
  feature: Feature
}

export function CreateFeatureResponseCard({ feature }: CreateFeatureResponseCardProps) {
  const { projects, fetchProjects } = useProjectsStore()
  const [projectName, setProjectName] = useState<string>('')

  useEffect(() => {
    const loadProjectData = async () => {
      // Fetch projects if they're not already loaded
      if (projects.length === 0) {
        await fetchProjects()
      }
      
      const project = projects.find(p => p.id === feature.project_id)
      if (project) {
        setProjectName(project.name)
      }
    }

    loadProjectData()
  }, [feature.project_id, projects, fetchProjects])

  return (
    <Link to={`/student/features/${feature.id}`} className="block">
      <Card className="p-4 bg-green-50 dark:bg-green-900/20 border-green-200 dark:border-green-800 hover:bg-green-100 dark:hover:bg-green-900/30 transition-colors">
        <div className="space-y-2">
          <h3 className="text-lg font-semibold text-green-700 dark:text-green-300">
            Feature Created Successfully!
          </h3>
          <div className="space-y-1">
            <p className="text-sm font-medium">Project: {projectName || 'Loading...'}</p>
            <p className="text-sm font-medium">Feature: {feature.name}</p>
            <p className="text-sm text-muted-foreground">{feature.description}</p>
            <div className="flex gap-2 text-xs text-muted-foreground">
              <span>Status: {feature.status}</span>
              <span>•</span>
              <span>Validations: {feature.current_validations}/{feature.required_validations}</span>
            </div>
          </div>
        </div>
      </Card>
    </Link>
  )
}
