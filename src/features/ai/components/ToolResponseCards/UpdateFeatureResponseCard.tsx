import { Card } from '@/components/ui/card'
import { useProjectsStore } from '@/features/student/store/projects.store'
import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { cn } from '@/lib/utils'

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

interface UpdateFeatureResponseCardProps {
  feature: Feature
  isCompact?: boolean
  updates_applied?: Record<string, any>
}

export function UpdateFeatureResponseCard({ feature, updates_applied = {}, isCompact = false }: UpdateFeatureResponseCardProps) {
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

  const updatedFields = updates_applied as Record<string, any>;
  const updatedFieldsString = Object.keys(updatedFields).join(', ');
  console.log(updatedFieldsString);
  console.log(updates_applied);
  console.log(updatedFields);
  return (
    <Link to={`/student/features/${feature.id}`} className="block">
      <Card className={`p-4 bg-amber-50 dark:bg-amber-900/20 border-amber-200 dark:border-amber-800 hover:bg-amber-100 dark:hover:bg-amber-900/30 transition-colors ${
        isCompact ? 'p-2' : ''
      }`}>
        <div className="space-y-2">
          <h3 className={`font-semibold text-amber-700 dark:text-amber-300 ${
            isCompact ? 'text-sm' : 'text-lg'
          }`}>
            Feature Updated Successfully!
          </h3>
          <div className={`space-y-1 ${isCompact ? 'space-y-0.5' : ''}`}>
            <p className={`font-medium ${isCompact ? 'text-xs' : 'text-sm'}`}>
              Project: {projectName || 'Loading...'}
            </p>
            <p className={cn(
              `font-medium ${isCompact ? 'text-xs' : 'text-sm'}`,
              updates_applied.name && 'text-amber-700 dark:text-amber-300'
            )}>
              Feature: {feature.name}
            </p>
            {!isCompact && (
              <p className={cn(
                "text-sm text-muted-foreground",
                updates_applied.description && 'text-amber-700 dark:text-amber-300 font-medium'
              )}>
                {feature.description}
              </p>
            )}
            <div className="flex gap-2 text-xs text-muted-foreground">
              <span className={cn(
                updates_applied.status && 'text-amber-700 dark:text-amber-300 font-medium'
              )}>
                Status: {feature.status}
              </span>
              <span>•</span>
              <span className={cn(
                updates_applied.required_validations && 'text-amber-700 dark:text-amber-300 font-medium'
              )}>
                Validations: {feature.current_validations}/{feature.required_validations}
              </span>
            </div>
            <div className="mt-2 text-xs text-amber-600 dark:text-amber-400">
              Updated: {Object.keys(updates_applied).length > 0 ? Object.keys(updates_applied).join(', ') : 'No updates applied'}
            </div>
          </div>
        </div>
      </Card>
    </Link>
  )
} 