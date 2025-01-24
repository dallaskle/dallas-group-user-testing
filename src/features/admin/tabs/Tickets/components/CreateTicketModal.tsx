import { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Label } from '@/components/ui/label'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Calendar } from '@/components/ui/calendar'
import { format } from 'date-fns'
import { CalendarIcon, Loader2, X } from 'lucide-react'
import { cn } from '@/lib/utils'
import { useAdminDashboardStore } from '../../../store/adminDashboard.store'
import type { CreateTicketRequest } from '../../../api/adminDashboard.api'
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
} from '@/components/ui/command'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover'

interface CreateTicketModalProps {
  open: boolean
  onOpenChange: (open: boolean) => void
}

type Step = {
  title: string
  description: string
}

const STEPS: Step[] = [
  {
    title: 'Ticket Type & Basic Info',
    description: 'Select the type of ticket and provide basic information'
  },
  {
    title: 'Additional Details',
    description: 'Provide type-specific details for your ticket'
  },
  {
    title: 'Assignment & Review',
    description: 'Assign the ticket and review all information'
  }
]

interface ProjectFeature {
  id: string
  name: string
}

interface ProjectWithFeatures {
  id: string
  name: string
  features: ProjectFeature[]
}

export const CreateTicketModal = ({ open, onOpenChange }: CreateTicketModalProps) => {
  // Form state
  const [step, setStep] = useState(1)
  const [ticketType, setTicketType] = useState<'testing' | 'support' | 'question'>()
  const [title, setTitle] = useState('')
  const [description, setDescription] = useState('')
  const [priority, setPriority] = useState<'low' | 'medium' | 'high'>('medium')
  const [assignedTo, setAssignedTo] = useState<string>()
  const [category, setCategory] = useState<'project' | 'feature' | 'testing' | 'other'>()
  const [projectId, setProjectId] = useState<string>()
  const [featureId, setFeatureId] = useState<string>()
  const [deadline, setDeadline] = useState<Date>()
  const [searchTerm, setSearchTerm] = useState('')

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

  // Fetch necessary data when modal opens
  useEffect(() => {
    if (open) {
      fetchTesters()
      fetchProjects()
    }
  }, [open, fetchTesters, fetchProjects])

  // In the component, transform the projects data:
  const projectsWithFeatures = projects?.map(project => ({
    id: project.id,
    name: project.name,
    features: project.status_counts ? 
      Object.entries(project.status_counts).map(([status, count]) => ({
        id: `${project.id}-${status}`,
        name: `${status} (${count})`
      })) : []
  })) || []

  const handleSubmit = async () => {
    const request: CreateTicketRequest = {
      type: ticketType!,
      title,
      description,
      priority,
      assignedTo: assignedTo || null,
    }

    if (ticketType === 'testing') {
      request.featureId = featureId
      request.deadline = deadline?.toISOString()
    } else if (ticketType === 'support') {
      request.category = category
      request.projectId = projectId
    }

    await createTicket(request)
    onOpenChange(false)
    resetForm()
  }

  const resetForm = () => {
    setStep(1)
    setTicketType(undefined)
    setTitle('')
    setDescription('')
    setPriority('medium')
    setAssignedTo(undefined)
    setCategory(undefined)
    setProjectId(undefined)
    setFeatureId(undefined)
    setDeadline(undefined)
    setSearchTerm('')
  }

  const canProceed = () => {
    if (step === 1) {
      return ticketType && title && description
    }
    if (step === 2) {
      if (ticketType === 'testing') {
        return featureId && deadline
      }
      if (ticketType === 'support') {
        return category
      }
      return true
    }
    return true
  }

  const handleClose = () => {
    onOpenChange(false)
    resetForm()
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

              {/* Step 1: Basic Info */}
              {step === 1 && (
                <div className="space-y-6">
                  <div className="space-y-4">
                    <Label>Ticket Type</Label>
                    <div className="grid grid-cols-3 gap-4">
                      <div
                        className={cn(
                          "rounded-lg border-2 p-4 cursor-pointer hover:border-primary transition-colors",
                          ticketType === 'testing' ? "border-primary" : "border-muted"
                        )}
                        onClick={() => setTicketType('testing')}
                        role="button"
                        tabIndex={0}
                        onKeyDown={(e) => e.key === 'Enter' && setTicketType('testing')}
                      >
                        <h3 className="font-semibold">Testing Ticket</h3>
                        <p className="text-sm text-muted-foreground">
                          Create a new testing task for feature validation
                        </p>
                      </div>
                      <div
                        className={cn(
                          "rounded-lg border-2 p-4 cursor-pointer hover:border-primary transition-colors",
                          ticketType === 'support' ? "border-primary" : "border-muted"
                        )}
                        onClick={() => setTicketType('support')}
                        role="button"
                        tabIndex={0}
                        onKeyDown={(e) => e.key === 'Enter' && setTicketType('support')}
                      >
                        <h3 className="font-semibold">Support Ticket</h3>
                        <p className="text-sm text-muted-foreground">
                          Request technical support or assistance
                        </p>
                      </div>
                      <div
                        className={cn(
                          "rounded-lg border-2 p-4 cursor-pointer hover:border-primary transition-colors",
                          ticketType === 'question' ? "border-primary" : "border-muted"
                        )}
                        onClick={() => setTicketType('question')}
                        role="button"
                        tabIndex={0}
                        onKeyDown={(e) => e.key === 'Enter' && setTicketType('question')}
                      >
                        <h3 className="font-semibold">Question</h3>
                        <p className="text-sm text-muted-foreground">
                          Ask a general question about the platform
                        </p>
                      </div>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="title">Title</Label>
                    <Input
                      id="title"
                      value={title}
                      onChange={(e) => setTitle(e.target.value)}
                      placeholder="Enter a clear and concise title"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="description">Description</Label>
                    <Textarea
                      id="description"
                      value={description}
                      onChange={(e) => setDescription(e.target.value)}
                      placeholder="Provide a detailed description of the ticket"
                      rows={5}
                    />
                  </div>

                  <div className="space-y-2">
                    <Label>Priority</Label>
                    <Select
                      value={priority}
                      onValueChange={(value: 'low' | 'medium' | 'high') => setPriority(value)}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select priority level" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="low">Low Priority</SelectItem>
                        <SelectItem value="medium">Medium Priority</SelectItem>
                        <SelectItem value="high">High Priority</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              )}

              {/* Step 2: Type-specific details */}
              {step === 2 && (
                <div className="space-y-6">
                  {ticketType === 'testing' && (
                    <>
                      <div className="space-y-2">
                        <Label>Feature</Label>
                        <Command className="border rounded-md">
                          <CommandInput
                            placeholder="Search features by name..."
                            value={searchTerm}
                            onValueChange={setSearchTerm}
                          />
                          <CommandEmpty>No features found.</CommandEmpty>
                          <CommandGroup>
                            {projects?.map(project => (
                              <div key={project.id}>
                                <h4 className="px-2 py-1 text-sm font-medium text-muted-foreground">
                                  {project.name}
                                </h4>
                                {projectsWithFeatures
                                  .find(p => p.id === project.id)
                                  ?.features.map(feature => (
                                    <CommandItem
                                      key={feature.id}
                                      value={feature.id}
                                      onSelect={() => setFeatureId(feature.id)}
                                      className="pl-4"
                                    >
                                      {feature.name}
                                    </CommandItem>
                                  ))}
                              </div>
                            ))}
                          </CommandGroup>
                        </Command>
                      </div>

                      <div className="space-y-2">
                        <Label>Deadline</Label>
                        <Popover>
                          <PopoverTrigger asChild>
                            <Button
                              variant="outline"
                              className={cn(
                                "w-full justify-start text-left font-normal",
                                !deadline && "text-muted-foreground"
                              )}
                            >
                              <CalendarIcon className="mr-2 h-4 w-4" />
                              {deadline ? format(deadline, "PPP") : "Select deadline"}
                            </Button>
                          </PopoverTrigger>
                          <PopoverContent className="w-auto p-0" align="start">
                            <Calendar
                              mode="single"
                              selected={deadline}
                              onSelect={setDeadline}
                              initialFocus
                              disabled={(date) => date < new Date()}
                            />
                          </PopoverContent>
                        </Popover>
                      </div>
                    </>
                  )}

                  {ticketType === 'support' && (
                    <>
                      <div className="space-y-2">
                        <Label>Category</Label>
                        <Select
                          value={category}
                          onValueChange={(value: 'project' | 'feature' | 'testing' | 'other') =>
                            setCategory(value)
                          }
                        >
                          <SelectTrigger>
                            <SelectValue placeholder="Select support category" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="project">Project Support</SelectItem>
                            <SelectItem value="feature">Feature Support</SelectItem>
                            <SelectItem value="testing">Testing Support</SelectItem>
                            <SelectItem value="other">Other</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>

                      {category && category !== 'other' && (
                        <div className="space-y-2">
                          <Label>Related Project</Label>
                          <Select value={projectId} onValueChange={setProjectId}>
                            <SelectTrigger>
                              <SelectValue placeholder="Select related project" />
                            </SelectTrigger>
                            <SelectContent>
                              {projects?.map(project => (
                                <SelectItem key={project.id} value={project.id}>
                                  {project.name}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                        </div>
                      )}
                    </>
                  )}
                </div>
              )}

              {/* Step 3: Assignment & Review */}
              {step === 3 && (
                <div className="space-y-6">
                  <div className="space-y-2">
                    <Label>Assign To</Label>
                    <Select value={assignedTo} onValueChange={setAssignedTo}>
                      <SelectTrigger>
                        <SelectValue placeholder="Select assignee" />
                      </SelectTrigger>
                      <SelectContent>
                        {testers?.map(tester => (
                          <SelectItem key={tester.id} value={tester.id}>
                            {tester.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="rounded-lg border p-4 space-y-4">
                    <h4 className="font-medium">Review Information</h4>
                    <dl className="space-y-2">
                      <div className="flex justify-between">
                        <dt className="text-muted-foreground">Type:</dt>
                        <dd className="font-medium">{ticketType}</dd>
                      </div>
                      <div className="flex justify-between">
                        <dt className="text-muted-foreground">Title:</dt>
                        <dd className="font-medium">{title}</dd>
                      </div>
                      <div className="flex justify-between">
                        <dt className="text-muted-foreground">Priority:</dt>
                        <dd className="font-medium">{priority}</dd>
                      </div>
                      {ticketType === 'testing' && (
                        <>
                          <div className="flex justify-between">
                            <dt className="text-muted-foreground">Feature:</dt>
                            <dd className="font-medium">
                              {projectsWithFeatures
                                .find(p => p.features.some(f => f.id === featureId))
                                ?.features.find(f => f.id === featureId)?.name || "Not selected"}
                            </dd>
                          </div>
                          <div className="flex justify-between">
                            <dt className="text-muted-foreground">Deadline:</dt>
                            <dd className="font-medium">
                              {deadline ? format(deadline, "PPP") : "Not set"}
                            </dd>
                          </div>
                        </>
                      )}
                      {ticketType === 'support' && (
                        <>
                          <div className="flex justify-between">
                            <dt className="text-muted-foreground">Category:</dt>
                            <dd className="font-medium">{category}</dd>
                          </div>
                          {projectId && (
                            <div className="flex justify-between">
                              <dt className="text-muted-foreground">Project:</dt>
                              <dd className="font-medium">
                                {projects?.find(p => p.id === projectId)?.name}
                              </dd>
                            </div>
                          )}
                        </>
                      )}
                      <div className="flex justify-between">
                        <dt className="text-muted-foreground">Assigned To:</dt>
                        <dd className="font-medium">
                          {testers?.find(t => t.id === assignedTo)?.name || "Unassigned"}
                        </dd>
                      </div>
                    </dl>
                  </div>
                </div>
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