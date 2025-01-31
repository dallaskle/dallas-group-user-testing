import { Card } from '@/components/ui/card'
import { useProjectsStore } from '@/features/student/store/projects.store'
import { useEffect, useState } from 'react'

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

interface DeleteFeatureResponseCardProps {
  feature: Feature
  isCompact?: boolean
}

export function DeleteFeatureResponseCard({ feature, isCompact = false }: DeleteFeatureResponseCardProps) {
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
    <Card className={`p-4 bg-red-50 dark:bg-red-900/20 border-red-200 dark:border-red-800 ${
      isCompact ? 'p-2' : ''
    }`}>
      <div className="space-y-2">
        <h3 className={`font-semibold text-red-700 dark:text-red-300 ${
          isCompact ? 'text-sm' : 'text-lg'
        }`}>
          Feature Deleted Successfully
        </h3>
        <div className={`space-y-1 ${isCompact ? 'space-y-0.5' : ''}`}>
          <p className={`font-medium ${isCompact ? 'text-xs' : 'text-sm'}`}>
            Project: {projectName || 'Loading...'}
          </p>
          <p className={`font-medium ${isCompact ? 'text-xs' : 'text-sm'}`}>
            Feature: {feature.name}
          </p>
          {!isCompact && (
            <p className="text-sm text-muted-foreground">{feature.description}</p>
          )}
          <div className="flex gap-2 text-xs text-muted-foreground">
            <span>Status: {feature.status}</span>
            <span>•</span>
            <span>Validations: {feature.current_validations}/{feature.required_validations}</span>
          </div>
          <p className="text-xs text-red-600 dark:text-red-400">
            Feature ID: {feature.id}
          </p>
        </div>
      </div>
    </Card>
  )
} 
