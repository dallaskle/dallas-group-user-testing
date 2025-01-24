import { useState, useEffect, useCallback } from 'react'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogOverlay,
  DialogFooter,
  DialogDescription
} from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { useAdminDashboardStore } from '../../../../store/adminDashboard.store'
import type { CreateTicketFormData, TicketCategory } from './types'

const INITIAL_FORM_DATA: CreateTicketFormData = {
  ticketType: 'support',
  title: '',
  description: '',
  priority: 'medium',
}

const TICKET_TYPES = [
  { 
    value: 'support', 
    label: 'Support Request',
    description: 'Get help with technical issues'
  },
  { 
    value: 'testing', 
    label: 'Testing Request',
    description: 'Request feature validation'
  },
  { 
    value: 'question', 
    label: 'General Question',
    description: 'Ask about the platform'
  },
]

const PRIORITY_LEVELS = [
  { value: 'low', label: 'Low' },
  { value: 'medium', label: 'Medium' },
  { value: 'high', label: 'High' },
]

const SUPPORT_CATEGORIES: { value: TicketCategory; label: string; description: string }[] = [
  { 
    value: 'project', 
    label: 'Project Issue',
    description: 'Issues with project setup or configuration'
  },
  { 
    value: 'feature', 
    label: 'Feature Issue',
    description: 'Problems with specific features'
  },
  { 
    value: 'testing', 
    label: 'Testing Issue',
    description: 'Issues with test execution or results'
  },
  { 
    value: 'other', 
    label: 'Other',
    description: 'Other support requests'
  },
]

interface CreateTicketModalProps {
  isOpen: boolean
  onClose: () => void
}

function CreateTicketModal({ isOpen, onClose }: CreateTicketModalProps) {
  const [formData, setFormData] = useState<CreateTicketFormData>(INITIAL_FORM_DATA)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [isLoadingData, setIsLoadingData] = useState(false)
  
  const store = useAdminDashboardStore()
  
  const loadData = useCallback(async () => {
    if (!isOpen) return
    
    try {
      setIsLoadingData(true)
      await Promise.all([
        store.fetchProjects(),
        store.fetchTesters()
      ])
    } catch (error) {
      console.error('Failed to load data:', error)
    } finally {
      setIsLoadingData(false)
    }
  }, [isOpen, store.fetchProjects, store.fetchTesters])

  useEffect(() => {
    loadData()
  }, [loadData])

  const handleFormChange = (updates: Partial<CreateTicketFormData>) => {
    setFormData(prev => ({ ...prev, ...updates }))
  }

  const handleSubmit = async () => {
    try {
      setIsSubmitting(true)
      const requestData = {
        ...formData,
        type: formData.ticketType
      }
      await store.createTicket(requestData)
      await store.fetchTickets() // Refetch tickets to get updated list
      onClose()
      setFormData(INITIAL_FORM_DATA)
    } catch (error) {
      console.error('Failed to create ticket:', error)
    } finally {
      setIsSubmitting(false)
    }
  }

  const selectedProject = store.projects.find(p => p.id === formData.projectId)
  
  const isFormValid = 
    formData.ticketType &&
    formData.title &&
    formData.description &&
    formData.priority &&
    (formData.ticketType === 'testing' 
      ? formData.projectId && formData.featureId && formData.deadline
      : formData.ticketType === 'support'
      ? formData.category
      : true) &&
    formData.assignedTo

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogOverlay />
      <DialogContent className="max-w-3xl">
        <DialogHeader>
          <DialogTitle>Create New Ticket</DialogTitle>
          <DialogDescription>
            Fill out the form below to create a new ticket. All fields marked with * are required.
          </DialogDescription>
        </DialogHeader>
        
        <div className="py-4 space-y-8 max-h-[70vh] overflow-y-auto">
          {/* Basic Info Section */}
          <div className="space-y-4">
            <h2 className="text-lg font-semibold">Basic Information</h2>
            
            <div>
              <label className="block text-sm font-medium text-gray-700">
                Ticket Type *
              </label>
              <div className="grid grid-cols-3 gap-4 mt-1">
                {TICKET_TYPES.map(type => (
                  <button
                    key={type.value}
                    type="button"
                    onClick={() => handleFormChange({ ticketType: type.value })}
                    className={`
                      flex flex-col items-start p-4 rounded-lg border-2 transition-colors
                      ${formData.ticketType === type.value 
                        ? 'border-blue-500 bg-blue-50 text-blue-700' 
                        : 'border-gray-200 hover:border-blue-200 text-gray-900'
                      }
                      disabled:opacity-50 disabled:cursor-not-allowed
                    `}
                    disabled={isSubmitting}
                  >
                    <span className="font-medium mb-1">{type.label}</span>
                    <span className="text-sm text-gray-500">{type.description}</span>
                  </button>
                ))}
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700">
                Title *
              </label>
              <input
                type="text"
                value={formData.title}
                onChange={(e) => handleFormChange({ title: e.target.value })}
                className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 shadow-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
                placeholder="Enter a descriptive title"
                disabled={isSubmitting}
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700">
                Description *
              </label>
              <textarea
                value={formData.description}
                onChange={(e) => handleFormChange({ description: e.target.value })}
                rows={4}
                className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 shadow-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
                placeholder="Provide detailed information about the ticket"
                disabled={isSubmitting}
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700">
                Priority *
              </label>
              <select
                value={formData.priority}
                onChange={(e) => handleFormChange({ priority: e.target.value as any })}
                className="mt-1 block w-full rounded-md border border-gray-300 bg-white px-3 py-2 shadow-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
                disabled={isSubmitting}
              >
                <option value="">Select priority</option>
                {PRIORITY_LEVELS.map(level => (
                  <option key={level.value} value={level.value}>
                    {level.label}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Type Details Section */}
          {formData.ticketType && (
            <div className="space-y-4">
              <h2 className="text-lg font-semibold">Type Details</h2>

              {formData.ticketType === 'testing' && (
                <>
                  <div className="grid grid-cols-2 gap-4">
                    {/* Projects Column */}
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Projects *
                      </label>
                      <div className="border rounded-md overflow-hidden">
                        <div className="max-h-60 overflow-y-auto">
                          {isLoadingData ? (
                            <div className="p-4 text-gray-500 text-center">
                              Loading projects...
                            </div>
                          ) : store.projects.length > 0 ? (
                            store.projects.map(project => (
                              <button
                                key={project.id}
                                onClick={() => handleFormChange({ 
                                  projectId: project.id,
                                  featureId: undefined
                                })}
                                className={`w-full text-left px-4 py-2 hover:bg-gray-50 focus:outline-none focus:bg-gray-50 ${
                                  project.id === formData.projectId ? 'bg-blue-50' : ''
                                }`}
                                disabled={isSubmitting}
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
                        Features * {selectedProject && `for ${selectedProject.name}`}
                      </label>
                      <div className="border rounded-md overflow-hidden">
                        <div className="max-h-60 overflow-y-auto">
                          {selectedProject ? (
                            selectedProject.features.length > 0 ? (
                              selectedProject.features.map(feature => (
                                <button
                                  key={feature.id}
                                  onClick={() => handleFormChange({ featureId: feature.id })}
                                  className={`w-full text-left px-4 py-2 hover:bg-gray-50 focus:outline-none focus:bg-gray-50 ${
                                    feature.id === formData.featureId ? 'bg-blue-50' : ''
                                  }`}
                                  disabled={isSubmitting}
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
                      Deadline *
                    </label>
                    <input
                      type="datetime-local"
                      value={formData.deadline || ''}
                      onChange={(e) => handleFormChange({ deadline: e.target.value })}
                      className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 shadow-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
                      disabled={isSubmitting}
                    />
                  </div>
                </>
              )}

              {formData.ticketType === 'support' && (
                <div>
                  <label className="block text-sm font-medium text-gray-700">
                    Category *
                  </label>
                  <div className="grid grid-cols-2 gap-4 mt-1">
                    {SUPPORT_CATEGORIES.map(category => (
                      <button
                        key={category.value}
                        type="button"
                        onClick={() => handleFormChange({ category: category.value })}
                        className={`
                          flex flex-col items-start p-4 rounded-lg border-2 transition-colors
                          ${formData.category === category.value 
                            ? 'border-blue-500 bg-blue-50 text-blue-700' 
                            : 'border-gray-200 hover:border-blue-200 text-gray-900'
                          }
                          disabled:opacity-50 disabled:cursor-not-allowed
                        `}
                        disabled={isSubmitting}
                      >
                        <span className="font-medium mb-1">{category.label}</span>
                        <span className="text-sm text-gray-500">{category.description}</span>
                      </button>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Assignment Section */}
          <div className="space-y-4">
            <h2 className="text-lg font-semibold">Assignment</h2>
            
            <div>
              <label className="block text-sm font-medium text-gray-700">
                Assign To *
              </label>
              <select
                value={formData.assignedTo || ''}
                onChange={(e) => handleFormChange({ assignedTo: e.target.value })}
                className="mt-1 block w-full rounded-md border border-gray-300 bg-white px-3 py-2 shadow-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
                disabled={isSubmitting}
              >
                <option value="">Select a tester</option>
                {store.testers.map(tester => (
                  <option key={tester.id} value={tester.id}>
                    {tester.name}
                  </option>
                ))}
              </select>
            </div>
          </div>
        </div>

        <DialogFooter>
          <div className="flex justify-between w-full">
            <Button
              variant="outline"
              onClick={onClose}
              disabled={isSubmitting}
            >
              Cancel
            </Button>
            <Button
              onClick={handleSubmit}
              disabled={!isFormValid || isSubmitting}
            >
              {isSubmitting ? 'Creating...' : 'Create Ticket'}
            </Button>
          </div>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}

export default CreateTicketModal