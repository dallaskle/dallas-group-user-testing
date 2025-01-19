import { useEffect, useState } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { toast } from 'sonner'
import { useAuthStore } from '../stores/auth'
import { useProjectStore } from '../stores/project'
import { supabase } from '../lib/supabase'

export default function ProjectPage() {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const { user } = useAuthStore()
  const {
    currentProject,
    features,
    featureStatuses,
    isLoading,
    error,
    fetchProjectById,
    fetchFeatures,
    fetchFeatureStatuses,
    createFeature,
    createFeatureStatus,
  } = useProjectStore()

  const [showNewFeatureModal, setShowNewFeatureModal] = useState(false)
  const [newFeatureTitle, setNewFeatureTitle] = useState('')
  const [newFeatureDescription, setNewFeatureDescription] = useState('')
  const [isCreatingFeature, setIsCreatingFeature] = useState(false)
  const [selectedFeature, setSelectedFeature] = useState<string | null>(null)
  const [isUploadingVideo, setIsUploadingVideo] = useState(false)
  const [testStatus, setTestStatus] = useState<'working' | 'not_working'>('working')
  const [testNotes, setTestNotes] = useState('')

  useEffect(() => {
    if (id) {
      fetchProjectById(id)
      fetchFeatures(id)
    }
  }, [id, fetchProjectById, fetchFeatures])

  useEffect(() => {
    if (selectedFeature) {
      fetchFeatureStatuses(selectedFeature)
    }
  }, [selectedFeature, fetchFeatureStatuses])

  const handleCreateFeature = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!id) return

    setIsCreatingFeature(true)
    try {
      await createFeature(id, newFeatureTitle, newFeatureDescription)
      setShowNewFeatureModal(false)
      setNewFeatureTitle('')
      setNewFeatureDescription('')
      toast.success('Feature created successfully!')
    } catch (error) {
      toast.error('Failed to create feature')
    } finally {
      setIsCreatingFeature(false)
    }
  }

  const handleVideoUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files || !e.target.files[0] || !selectedFeature || !user) return

    const file = e.target.files[0]
    setIsUploadingVideo(true)

    try {
      // Upload video to Supabase Storage
      const fileExt = file.name.split('.').pop()
      const fileName = `${Math.random()}.${fileExt}`
      const filePath = `${selectedFeature}/${fileName}`

      const { error: uploadError, data } = await supabase.storage
        .from('videos')
        .upload(filePath, file)

      if (uploadError) throw uploadError

      // Create feature status with video URL
      const videoUrl = data.path
      await createFeatureStatus(
        selectedFeature,
        user.id,
        videoUrl,
        testStatus,
        testNotes
      )

      toast.success('Test video uploaded successfully!')
      setTestStatus('working')
      setTestNotes('')
    } catch (error) {
      toast.error('Failed to upload test video')
      console.error('Upload error:', error)
    } finally {
      setIsUploadingVideo(false)
    }
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 p-4">
        <div className="text-red-600 text-center">{error}</div>
      </div>
    )
  }

  if (!currentProject) {
    return (
      <div className="min-h-screen bg-gray-50 p-4">
        <div className="text-center">Loading project...</div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white shadow">
        <div className="max-w-7xl mx-auto py-6 px-4 sm:px-6 lg:px-8 flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">
              {currentProject.title}
            </h1>
            {currentProject.description && (
              <p className="mt-1 text-sm text-gray-500">
                {currentProject.description}
              </p>
            )}
          </div>
          <button
            onClick={() => setShowNewFeatureModal(true)}
            className="px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
          >
            Add Feature
          </button>
        </div>
      </header>

      <main className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Features List */}
          <div>
            <h2 className="text-lg font-medium text-gray-900 mb-4">Features</h2>
            {isLoading ? (
              <div>Loading features...</div>
            ) : (
              <div className="space-y-4">
                {features.map((feature) => (
                  <div
                    key={feature.id}
                    className={`bg-white shadow rounded-lg p-4 cursor-pointer hover:shadow-md transition-shadow duration-200 ${
                      selectedFeature === feature.id ? 'ring-2 ring-indigo-500' : ''
                    }`}
                    onClick={() => setSelectedFeature(feature.id)}
                  >
                    <h3 className="text-lg font-medium text-gray-900">
                      {feature.title}
                    </h3>
                    {feature.description && (
                      <p className="mt-1 text-sm text-gray-500">
                        {feature.description}
                      </p>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Feature Testing */}
          {selectedFeature && (
            <div>
              <h2 className="text-lg font-medium text-gray-900 mb-4">
                Test Feature
              </h2>
              <div className="bg-white shadow rounded-lg p-6">
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700">
                      Status
                    </label>
                    <select
                      value={testStatus}
                      onChange={(e) =>
                        setTestStatus(e.target.value as 'working' | 'not_working')
                      }
                      className="mt-1 block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm rounded-md"
                    >
                      <option value="working">Working</option>
                      <option value="not_working">Not Working</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700">
                      Notes (optional)
                    </label>
                    <textarea
                      value={testNotes}
                      onChange={(e) => setTestNotes(e.target.value)}
                      rows={3}
                      className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700">
                      Upload Test Video
                    </label>
                    <input
                      type="file"
                      accept="video/*"
                      onChange={handleVideoUpload}
                      disabled={isUploadingVideo}
                      className="mt-1 block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-md file:border-0 file:text-sm file:font-semibold file:bg-indigo-50 file:text-indigo-700 hover:file:bg-indigo-100"
                    />
                  </div>
                </div>

                {/* Previous Tests */}
                <div className="mt-6">
                  <h3 className="text-sm font-medium text-gray-900 mb-3">
                    Previous Tests
                  </h3>
                  <div className="space-y-4">
                    {featureStatuses.map((status) => (
                      <div
                        key={status.id}
                        className="bg-gray-50 rounded-lg p-4"
                      >
                        <div className="flex items-center justify-between">
                          <div
                            className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                              status.status === 'working'
                                ? 'bg-green-100 text-green-800'
                                : 'bg-red-100 text-red-800'
                            }`}
                          >
                            {status.status === 'working' ? 'Working' : 'Not Working'}
                          </div>
                          <span className="text-sm text-gray-500">
                            {new Date(status.created_at).toLocaleDateString()}
                          </span>
                        </div>
                        {status.notes && (
                          <p className="mt-2 text-sm text-gray-500">
                            {status.notes}
                          </p>
                        )}
                        <video
                          className="mt-2 w-full rounded"
                          controls
                          src={`${import.meta.env.VITE_SUPABASE_URL}/storage/v1/object/public/videos/${status.video_url}`}
                        />
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </main>

      {/* New Feature Modal */}
      {showNewFeatureModal && (
        <div className="fixed inset-0 bg-gray-500 bg-opacity-75 flex items-center justify-center p-4">
          <div className="bg-white rounded-lg max-w-md w-full p-6">
            <h2 className="text-lg font-medium text-gray-900 mb-4">
              Add New Feature
            </h2>
            <form onSubmit={handleCreateFeature}>
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
                    value={newFeatureTitle}
                    onChange={(e) => setNewFeatureTitle(e.target.value)}
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
                    value={newFeatureDescription}
                    onChange={(e) => setNewFeatureDescription(e.target.value)}
                    rows={3}
                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
                  />
                </div>
              </div>
              <div className="mt-5 sm:mt-6 space-x-3">
                <button
                  type="submit"
                  disabled={isCreatingFeature}
                  className="inline-flex justify-center rounded-md border border-transparent shadow-sm px-4 py-2 bg-indigo-600 text-base font-medium text-white hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 sm:text-sm disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {isCreatingFeature ? 'Adding...' : 'Add Feature'}
                </button>
                <button
                  type="button"
                  onClick={() => setShowNewFeatureModal(false)}
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