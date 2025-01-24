import { useEffect, useState } from 'react'
import { useAdminDashboardStore } from '../../../../store/adminDashboard.store'
import type { CreateTicketStepProps, TicketCategory } from './types'
import type { ProjectDetails } from '../../../../api/adminDashboard.api'

const SUPPORT_CATEGORIES: { value: TicketCategory; label: string }[] = [
  { value: 'project', label: 'Project Issue' },
  { value: 'feature', label: 'Feature Issue' },
  { value: 'testing', label: 'Testing Issue' },
  { value: 'other', label: 'Other' },
]

export function TypeDetailsStep({ 
  formData, 
  onFormDataChange, 
  isLoading
}: CreateTicketStepProps) {
  const [isLoadingProjects, setIsLoadingProjects] = useState(false)
  const { projects, fetchProjects } = useAdminDashboardStore(state => ({
    projects: state.projects,
    fetchProjects: state.fetchProjects
  }))

  useEffect(() => {
    const loadProjects = async () => {
      try {
        setIsLoadingProjects(true)
        await fetchProjects()
      } catch (error) {
        console.error('Failed to load projects:', error)
      } finally {
        setIsLoadingProjects(false)
      }
    }
    loadProjects()
  }, [fetchProjects])

  const selectedProject = projects.find(p => p.id === formData.projectId)

  return (
    <div className="space-y-4">
      {formData.ticketType === 'testing' && (
        <>
          <div className="grid grid-cols-2 gap-4">
            {/* Projects Column */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Projects
              </label>
              <div className="border rounded-md overflow-hidden">
                <div className="max-h-60 overflow-y-auto">
                  {isLoadingProjects ? (
                    <div className="p-4 text-gray-500 text-center">
                      Loading projects...
                    </div>
                  ) : projects.length > 0 ? (
                    projects.map(project => (
                      <button
                        key={project.id}
                        onClick={() => onFormDataChange({ 
                          projectId: project.id,
                          featureId: undefined // Reset feature when project changes
                        })}
                        className={`w-full text-left px-4 py-2 hover:bg-gray-50 focus:outline-none focus:bg-gray-50 ${
                          project.id === formData.projectId ? 'bg-blue-50' : ''
                        }`}
                        disabled={isLoading}
                      >
                        <div className="font-medium">{project.name}</div>
                        <div className="text-sm text-gray-500">
                          {project.features.length} features
                        </div>
                      </button>
                    ))
                  ) : (
                    <div className="p-4 text-gray-500 text-center">
                      No projects available
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Features Column */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Features {selectedProject && `for ${selectedProject.name}`}
              </label>
              <div className="border rounded-md overflow-hidden">
                <div className="max-h-60 overflow-y-auto">
                  {selectedProject ? (
                    selectedProject.features.length > 0 ? (
                      selectedProject.features.map(feature => (
                        <button
                          key={feature.id}
                          onClick={() => onFormDataChange({ featureId: feature.id })}
                          className={`w-full text-left px-4 py-2 hover:bg-gray-50 focus:outline-none focus:bg-gray-50 ${
                            feature.id === formData.featureId ? 'bg-blue-50' : ''
                          }`}
                          disabled={isLoading}
                        >
                          <div className="font-medium">{feature.name}</div>
                          <div className="text-sm text-gray-500">
                            Status: {feature.status}
                          </div>
                        </button>
                      ))
                    ) : (
                      <div className="p-4 text-gray-500 text-center">
                        No features available for this project
                      </div>
                    )
                  ) : (
                    <div className="p-4 text-gray-500 text-center">
                      Select a project to view its features
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700">
              Deadline
            </label>
            <input
              type="datetime-local"
              value={formData.deadline || ''}
              onChange={(e) => onFormDataChange({ deadline: e.target.value })}
              className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 shadow-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
              disabled={isLoading}
            />
          </div>
        </>
      )}

      {formData.ticketType === 'support' && (
        <div>
          <label className="block text-sm font-medium text-gray-700">
            Category
          </label>
          <select
            value={formData.category || ''}
            onChange={(e) => onFormDataChange({ category: e.target.value as any })}
            className="mt-1 block w-full rounded-md border border-gray-300 bg-white px-3 py-2 shadow-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
            disabled={isLoading}
          >
            <option value="">Select a category</option>
            {SUPPORT_CATEGORIES.map(category => (
              <option key={category.value} value={category.value}>
                {category.label}
              </option>
            ))}
          </select>
        </div>
      )}
    </div>
  )
}