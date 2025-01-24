import { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { useAdminDashboardStore } from '../../../store/adminDashboard.store'
import { CreateTicketRequest } from '../../../api/adminDashboard.api'
import { Card } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { format } from 'date-fns'
import { Calendar } from '@/components/ui/calendar'
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover'
import { cn } from '@/lib/utils'
import { CalendarIcon } from 'lucide-react'
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem } from '@/components/ui/command'

interface CreateTicketDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
}

export const CreateTicketDialog = ({ open, onOpenChange }: CreateTicketDialogProps) => {
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

  const { createTicket, testers, projects, fetchTesters, fetchProjects } = useAdminDashboardStore()

  // Fetch necessary data when dialog opens
  useEffect(() => {
    if (open) {
      fetchTesters()
      fetchProjects()
    }
  }, [open, fetchTesters, fetchProjects])

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

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl h-[80vh] flex flex-col">
        <DialogHeader>
          <DialogTitle>Create New Ticket - Step {step} of 3</DialogTitle>
        </DialogHeader>

        <div className="flex-1 overflow-y-auto py-4">
          {step === 1 && (
            <div className="space-y-6">
              <div className="space-y-4">
                <Label>Ticket Type</Label>
                <div className="grid grid-cols-3 gap-4">
                  <Card
                    className={cn(
                      "p-4 cursor-pointer hover:border-primary",
                      ticketType === 'testing' && "border-primary"
                    )}
                    onClick={() => setTicketType('testing')}
                  >
                    <h3 className="font-semibold">Testing Ticket</h3>
                    <p className="text-sm text-muted-foreground">Create a new testing task</p>
                  </Card>
                  <Card
                    className={cn(
                      "p-4 cursor-pointer hover:border-primary",
                      ticketType === 'support' && "border-primary"
                    )}
                    onClick={() => setTicketType('support')}
                  >
                    <h3 className="font-semibold">Support Ticket</h3>
                    <p className="text-sm text-muted-foreground">Request technical support</p>
                  </Card>
                  <Card
                    className={cn(
                      "p-4 cursor-pointer hover:border-primary",
                      ticketType === 'question' && "border-primary"
                    )}
                    onClick={() => setTicketType('question')}
                  >
                    <h3 className="font-semibold">Question</h3>
                    <p className="text-sm text-muted-foreground">Ask a general question</p>
                  </Card>
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="title">Title</Label>
                <Input
                  id="title"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="Enter ticket title"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="description">Description</Label>
                <Textarea
                  id="description"
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="Enter detailed description"
                  rows={5}
                />
              </div>

              <div className="space-y-2">
                <Label>Priority</Label>
                <Select value={priority} onValueChange={(value: 'low' | 'medium' | 'high') => setPriority(value)}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select priority" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="low">Low</SelectItem>
                    <SelectItem value="medium">Medium</SelectItem>
                    <SelectItem value="high">High</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          )}

          {step === 2 && (
            <div className="space-y-6">
              {ticketType === 'testing' && (
                <>
                  <div className="space-y-2">
                    <Label>Feature</Label>
                    <Command className="border rounded-md">
                      <CommandInput 
                        placeholder="Search features..." 
                        value={searchTerm}
                        onValueChange={setSearchTerm}
                      />
                      <CommandEmpty>No features found.</CommandEmpty>
                      <CommandGroup>
                        {projects?.map(project => (
                          project.features?.map(feature => (
                            <CommandItem
                              key={feature.id}
                              value={feature.id}
                              onSelect={() => setFeatureId(feature.id)}
                            >
                              {feature.name} ({project.name})
                            </CommandItem>
                          ))
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
                          {deadline ? format(deadline, "PPP") : "Pick a date"}
                        </Button>
                      </PopoverTrigger>
                      <PopoverContent className="w-auto p-0">
                        <Calendar
                          mode="single"
                          selected={deadline}
                          onSelect={setDeadline}
                          initialFocus
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
                    <Select value={category} onValueChange={(value: 'project' | 'feature' | 'testing' | 'other') => setCategory(value)}>
                      <SelectTrigger>
                        <SelectValue placeholder="Select category" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="project">Project</SelectItem>
                        <SelectItem value="feature">Feature</SelectItem>
                        <SelectItem value="testing">Testing</SelectItem>
                        <SelectItem value="other">Other</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  {category === 'project' && (
                    <div className="space-y-2">
                      <Label>Project</Label>
                      <Command className="border rounded-md">
                        <CommandInput 
                          placeholder="Search projects..." 
                          value={searchTerm}
                          onValueChange={setSearchTerm}
                        />
                        <CommandEmpty>No projects found.</CommandEmpty>
                        <CommandGroup>
                          {projects?.map(project => (
                            <CommandItem
                              key={project.id}
                              value={project.id}
                              onSelect={() => setProjectId(project.id)}
                            >
                              {project.name}
                            </CommandItem>
                          ))}
                        </CommandGroup>
                      </Command>
                    </div>
                  )}
                </>
              )}
            </div>
          )}

          {step === 3 && (
            <div className="space-y-6">
              <div className="space-y-2">
                <Label>Assign To (Optional)</Label>
                <Command className="border rounded-md">
                  <CommandInput 
                    placeholder="Search testers..." 
                    value={searchTerm}
                    onValueChange={setSearchTerm}
                  />
                  <CommandEmpty>No testers found.</CommandEmpty>
                  <CommandGroup>
                    {testers?.map(tester => (
                      <CommandItem
                        key={tester.id}
                        value={tester.id}
                        onSelect={() => setAssignedTo(tester.id)}
                      >
                        {tester.name}
                      </CommandItem>
                    ))}
                  </CommandGroup>
                </Command>
              </div>

              <div className="space-y-4">
                <h3 className="font-semibold">Review Ticket Details</h3>
                <div className="space-y-2">
                  <p><strong>Type:</strong> {ticketType}</p>
                  <p><strong>Title:</strong> {title}</p>
                  <p><strong>Description:</strong> {description}</p>
                  <p><strong>Priority:</strong> {priority}</p>
                  {ticketType === 'testing' && (
                    <>
                      <p><strong>Feature:</strong> {projects?.find(p => 
                        p.features?.some(f => f.id === featureId)
                      )?.features?.find(f => f.id === featureId)?.name}</p>
                      <p><strong>Deadline:</strong> {deadline ? format(deadline, "PPP") : "Not set"}</p>
                    </>
                  )}
                  {ticketType === 'support' && (
                    <>
                      <p><strong>Category:</strong> {category}</p>
                      {projectId && (
                        <p><strong>Project:</strong> {projects?.find(p => p.id === projectId)?.name}</p>
                      )}
                    </>
                  )}
                  <p><strong>Assigned To:</strong> {testers?.find(t => t.id === assignedTo)?.name || "Unassigned"}</p>
                </div>
              </div>
            </div>
          )}
        </div>

        <div className="flex justify-between pt-6 border-t">
          <Button
            variant="outline"
            onClick={() => step > 1 ? setStep(step - 1) : onOpenChange(false)}
          >
            {step > 1 ? 'Back' : 'Cancel'}
          </Button>
          <Button
            onClick={() => step < 3 ? setStep(step + 1) : handleSubmit()}
            disabled={!canProceed()}
          >
            {step < 3 ? 'Next' : 'Create Ticket'}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  )
} 