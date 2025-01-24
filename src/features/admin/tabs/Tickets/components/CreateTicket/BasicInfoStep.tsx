import { Label } from '@/components/ui/label'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { cn } from '@/lib/utils'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import type { StepProps, TicketType, TicketPriority } from './types'

export const BasicInfoStep = ({ formData, onFormDataChange }: StepProps) => {
  console.group('BasicInfoStep')
  console.log('Current formData:', formData)

  const handleTicketTypeSelect = (type: TicketType) => {
    console.log('Selected ticket type:', type)
    onFormDataChange({ ticketType: type })
  }

  const handleTitleChange = (value: string) => {
    console.log('Title changed:', value)
    onFormDataChange({ title: value })
  }

  const handleDescriptionChange = (value: string) => {
    console.log('Description changed:', value)
    onFormDataChange({ description: value })
  }

  const handlePriorityChange = (value: TicketPriority) => {
    console.log('Priority changed:', value)
    onFormDataChange({ priority: value })
  }

  console.groupEnd()

  return (
    <div className="space-y-6">
      <div className="space-y-4">
        <Label>Ticket Type</Label>
        <div className="grid grid-cols-3 gap-4">
          <div
            className={cn(
              "rounded-lg border-2 p-4 cursor-pointer hover:border-primary transition-colors",
              formData.ticketType === 'testing' ? "border-primary" : "border-muted"
            )}
            onClick={() => handleTicketTypeSelect('testing')}
            role="button"
            tabIndex={0}
            onKeyDown={(e) => e.key === 'Enter' && handleTicketTypeSelect('testing')}
          >
            <h3 className="font-semibold">Testing Ticket</h3>
            <p className="text-sm text-muted-foreground">
              Create a new testing task for feature validation
            </p>
          </div>
          <div
            className={cn(
              "rounded-lg border-2 p-4 cursor-pointer hover:border-primary transition-colors",
              formData.ticketType === 'support' ? "border-primary" : "border-muted"
            )}
            onClick={() => handleTicketTypeSelect('support')}
            role="button"
            tabIndex={0}
            onKeyDown={(e) => e.key === 'Enter' && handleTicketTypeSelect('support')}
          >
            <h3 className="font-semibold">Support Ticket</h3>
            <p className="text-sm text-muted-foreground">
              Request technical support or assistance
            </p>
          </div>
          <div
            className={cn(
              "rounded-lg border-2 p-4 cursor-pointer hover:border-primary transition-colors",
              formData.ticketType === 'question' ? "border-primary" : "border-muted"
            )}
            onClick={() => handleTicketTypeSelect('question')}
            role="button"
            tabIndex={0}
            onKeyDown={(e) => e.key === 'Enter' && handleTicketTypeSelect('question')}
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
          value={formData.title}
          onChange={(e) => handleTitleChange(e.target.value)}
          placeholder="Enter a clear and concise title"
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="description">Description</Label>
        <Textarea
          id="description"
          value={formData.description}
          onChange={(e) => handleDescriptionChange(e.target.value)}
          placeholder="Provide a detailed description of the ticket"
          rows={5}
        />
      </div>

      <div className="space-y-2">
        <Label>Priority</Label>
        <Select
          value={formData.priority}
          onValueChange={handlePriorityChange}
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
  )
} 