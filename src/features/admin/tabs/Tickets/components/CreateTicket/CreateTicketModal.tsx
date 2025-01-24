import { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Loader2, X } from 'lucide-react'
import { useAdminDashboardStore } from '../../../../store/adminDashboard.store'
import type { CreateTicketRequest } from '../../../../api/adminDashboard.api'
import { STEPS } from './constants'
import { BasicInfoStep } from './BasicInfoStep'
import { TypeDetailsStep } from './TypeDetailsStep'
import { AssignmentStep } from './AssignmentStep'
import type { CreateTicketFormData } from './types'

interface CreateTicketModalProps {
  open: boolean
  onOpenChange: (open: boolean) => void
}

export const CreateTicketModal = ({ open, onOpenChange }: CreateTicketModalProps) => {
  // Form state
  const [step, setStep] = useState(1)
  const [formData, setFormData] = useState<CreateTicketFormData>({
    title: '',
    description: '',
    priority: 'medium',
    selectedTime: Date.now(),
    status: 'open',
  })

  // Store state and actions
  const {
    createTicket,
    testers,
    projects,
    fetchTesters,
    fetchProjects,
    isLoading,
    error
  } = useAdminDashboardStore()

  // Debug logs for store data
  useEffect(() => {
    console.group('CreateTicketModal - Store Data')
    console.log('Testers:', testers)
    console.log('Projects:', projects)
    console.log('Loading:', isLoading)
    console.log('Error:', error)
    console.groupEnd()
  }, [testers, projects, isLoading, error])

  // Debug log for form data changes
  useEffect(() => {
    console.group('CreateTicketModal - Form Data')
    console.log('Current Step:', step)
    console.log('Form Data:', formData)
    console.groupEnd()
  }, [step, formData])

  // Fetch necessary data when modal opens
  useEffect(() => {
    if (open) {
      console.log('Modal opened - Fetching data...')
      fetchTesters()
      fetchProjects()
    }
  }, [open, fetchTesters, fetchProjects])

  // Transform projects data for components
  const projectsWithFeatures = projects?.map(project => ({
    id: project.id,
    name: project.name,
    features: project.features?.map(feature => ({
      id: feature.id,
      name: feature.name
    })) || []
  })) || []

  const handleSubmit = async () => {
    console.group('CreateTicketModal - Submitting')
    const request: CreateTicketRequest = {
      type: formData.ticketType!,
      title: formData.title,
      description: formData.description,
      priority: formData.priority,
      assignedTo: formData.assignedTo || null,
    }

    if (formData.ticketType === 'testing') {
      if (!formData.featureId || !formData.deadline) {
        console.error('Missing required testing ticket data')
        return
      }
      request.featureId = formData.featureId
      request.projectId = formData.projectId // Include project ID for testing tickets
      request.deadline = formData.deadline.toISOString()
    } else if (formData.ticketType === 'support') {
      if (!formData.category) {
        console.error('Missing required support ticket data')
        return
      }
      request.category = formData.category
      request.projectId = formData.projectId // Project ID is optional for support tickets
    }

    console.log('Submit Request:', request)
    console.groupEnd()

    try {
      await createTicket(request)
      onOpenChange(false)
      resetForm()
    } catch (err) {
      console.error('Failed to create ticket:', err)
    }
  }

  const resetForm = () => {
    console.log('Resetting form...')
    setStep(1)
    setFormData({
      title: '',
      description: '',
      priority: 'medium',
      selectedTime: Date.now(),
      status: 'open',
      assignedTo: undefined,
      projectId: undefined,
      featureId: undefined,
      aiResponse: undefined,
      resolutionNotes: undefined,
      validationId: undefined
    })
  }

  const handleClose = () => {
    console.log('Closing modal...')
    onOpenChange(false)
    resetForm()
  }

  const canProceed = () => {
    const can = step === 1
      ? formData.ticketType && formData.title && formData.description
      : step === 2
      ? formData.ticketType === 'testing'
        ? formData.featureId && formData.projectId && formData.deadline // Require both feature and project IDs
        : formData.ticketType === 'support'
        ? formData.category
        : true
      : true

    console.log(`Step ${step} can proceed:`, can)
    return can
  }

  if (!open) return null

  return (
    <div className="fixed inset-0 z-50 bg-background/80 backdrop-blur-sm">
      <div className="fixed inset-0 z-50 flex items-start justify-center">
        <div className="flex h-full w-full flex-col bg-background shadow-lg">
          {/* Header */}
          <div className="flex items-center justify-between border-b px-6 py-4">
            <div>
              <h2 className="text-lg font-semibold">Create New Ticket</h2>
              <p className="text-sm text-muted-foreground">
                Step {step} of {STEPS.length}: {STEPS[step - 1].title}
              </p>
            </div>
            <Button
              variant="ghost"
              size="icon"
              className="h-8 w-8"
              onClick={handleClose}
            >
              <X className="h-4 w-4" />
              <span className="sr-only">Close</span>
            </Button>
          </div>

          {/* Progress bar */}
          <div className="relative h-2 bg-muted">
            <div
              className="absolute inset-y-0 left-0 bg-primary transition-all duration-300"
              style={{ width: `${(step / STEPS.length) * 100}%` }}
            />
          </div>

          {/* Content */}
          <div className="flex-1 overflow-y-auto p-6">
            <div className="mx-auto max-w-3xl space-y-8">
              {/* Step description */}
              <div className="text-center">
                <h3 className="text-lg font-medium">{STEPS[step - 1].title}</h3>
                <p className="text-sm text-muted-foreground">
                  {STEPS[step - 1].description}
                </p>
              </div>

              {error && (
                <div className="rounded-md bg-destructive/15 p-3 text-sm text-destructive">
                  {error}
                </div>
              )}

              {/* Step content */}
              {step === 1 && (
                <BasicInfoStep
                  formData={formData}
                  onFormDataChange={(updates) => setFormData(prev => ({ ...prev, ...updates }))}
                />
              )}

              {step === 2 && (
                <TypeDetailsStep
                  formData={formData}
                  onFormDataChange={(updates) => setFormData(prev => ({ ...prev, ...updates }))}
                  projects={projectsWithFeatures}
                />
              )}

              {step === 3 && (
                <AssignmentStep
                  formData={formData}
                  onFormDataChange={(updates) => setFormData(prev => ({ ...prev, ...updates }))}
                  testers={testers}
                  projects={projectsWithFeatures}
                />
              )}
            </div>
          </div>

          {/* Footer */}
          <div className="border-t bg-muted/50 px-6 py-4">
            <div className="flex justify-between gap-4">
              <Button
                variant="outline"
                onClick={() => step > 1 && setStep(step - 1)}
                disabled={step === 1}
              >
                Previous
              </Button>
              <div className="flex gap-2">
                <Button
                  variant="outline"
                  onClick={handleClose}
                >
                  Cancel
                </Button>
                {step < STEPS.length ? (
                  <Button
                    onClick={() => setStep(step + 1)}
                    disabled={!canProceed() || isLoading}
                  >
                    Continue
                  </Button>
                ) : (
                  <Button
                    onClick={handleSubmit}
                    disabled={!canProceed() || isLoading}
                  >
                    {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                    Create Ticket
                  </Button>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
} 