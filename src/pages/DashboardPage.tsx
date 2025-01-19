import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { toast } from 'sonner'
import { useAuthStore } from '../stores/auth'
import { useProjectStore } from '../stores/project'

export default function DashboardPage() {
  const navigate = useNavigate()
  const { user } = useAuthStore()
  const { projects, isLoading, error, fetchProjects, createProject } = useProjectStore()
  const [showNewProjectModal, setShowNewProjectModal] = useState(false)
  const [newProjectTitle, setNewProjectTitle] = useState('')
  const [newProjectDescription, setNewProjectDescription] = useState('')
  const [isCreating, setIsCreating] = useState(false)

  useEffect(() => {
    fetchProjects()
  }, [fetchProjects])

  const handleCreateProject = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsCreating(true)

    try {
      await createProject(newProjectTitle, newProjectDescription)
      setShowNewProjectModal(false)
      setNewProjectTitle('')
      setNewProjectDescription('')
      toast.success('Project created successfully!')
    } catch (error) {
      toast.error('Failed to create project')
    } finally {
      setIsCreating(false)
    }
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 p-4">
        <div className="text-red-600 text-center">{error}</div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white shadow">
        <div className="max-w-7xl mx-auto py-6 px-4 sm:px-6 lg:px-8 flex justify-between items-center">
          <h1 className="text-3xl font-bold text-gray-900">Projects</h1>
          <button
            onClick={() => setShowNewProjectModal(true)}
            className="px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
          >
            New Project
          </button>
        </div>
      </header>

      <main className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
        {isLoading ? (
          <div className="text-center">Loading projects...</div>
        ) : (
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {projects.map((project) => (
              <div
                key={project.id}
                className="bg-white overflow-hidden shadow rounded-lg cursor-pointer hover:shadow-md transition-shadow duration-200"
                onClick={() => navigate(`/project/${project.id}`)}
              >
                <div className="px-4 py-5 sm:p-6">
                  <h3 className="text-lg font-medium text-gray-900 truncate">
                    {project.title}
                  </h3>
                  {project.description && (
                    <p className="mt-1 text-sm text-gray-500 line-clamp-2">
                      {project.description}
                    </p>
                  )}
                </div>
                <div className="bg-gray-50 px-4 py-4 sm:px-6">
                  <div className="text-sm text-gray-500">
                    Created {new Date(project.created_at).toLocaleDateString()}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </main>

      {showNewProjectModal && (
        <div className="fixed inset-0 bg-gray-500 bg-opacity-75 flex items-center justify-center p-4">
          <div className="bg-white rounded-lg max-w-md w-full p-6">
            <h2 className="text-lg font-medium text-gray-900 mb-4">
              Create New Project
            </h2>
            <form onSubmit={handleCreateProject}>
              <div className="space-y-4">
                <div>
                  <label
                    htmlFor="title"
                    className="block text-sm font-medium text-gray-700"
                  >
                    Title
                  </label>
                  <input
                    type="text"
                    id="title"
                    value={newProjectTitle}
                    onChange={(e) => setNewProjectTitle(e.target.value)}
                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
                    required
                  />
                </div>
                <div>
                  <label
                    htmlFor="description"
                    className="block text-sm font-medium text-gray-700"
                  >
                    Description (optional)
                  </label>
                  <textarea
                    id="description"
                    value={newProjectDescription}
                    onChange={(e) => setNewProjectDescription(e.target.value)}
                    rows={3}
                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
                  />
                </div>
              </div>
              <div className="mt-5 sm:mt-6 space-x-3">
                <button
                  type="submit"
                  disabled={isCreating}
                  className="inline-flex justify-center rounded-md border border-transparent shadow-sm px-4 py-2 bg-indigo-600 text-base font-medium text-white hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 sm:text-sm disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {isCreating ? 'Creating...' : 'Create Project'}
                </button>
                <button
                  type="button"
                  onClick={() => setShowNewProjectModal(false)}
                  className="inline-flex justify-center rounded-md border border-gray-300 shadow-sm px-4 py-2 bg-white text-base font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 sm:text-sm"
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
} 