import { Label } from '@/components/ui/label'
import { format } from 'date-fns'
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
} from '@/components/ui/command'
import { cn } from '@/lib/utils'
import type { StepProps } from './types'

export const AssignmentStep = ({ formData, onFormDataChange, testers, projects }: StepProps) => {
  console.group('AssignmentStep')
  console.log('Current formData:', formData)
  console.log('Available testers:', testers)
  console.log('Available projects:', projects)

  const handleTesterSearch = (value: string) => {
    console.log('Searching testers:', value)
    const tester = testers?.find(t => 
      t.name.toLowerCase().includes(value.toLowerCase())
    )
    if (tester) {
      console.log('Found tester:', tester)
      onFormDataChange({ assignedTo: tester.id })
    }
  }

  const handleTesterSelect = (testerId: string) => {
    console.log('Selected tester:', testerId)
    onFormDataChange({ assignedTo: testerId })
  }

  console.groupEnd()

  return (
    <div className="space-y-6">
      <div className="space-y-2">
        <Label>Assign To</Label>
        <Command className="border rounded-md">
          <CommandInput
            placeholder="Search testers..."
            value={testers?.find(t => t.id === formData.assignedTo)?.name || ''}
            onValueChange={handleTesterSearch}
          />
          <CommandEmpty>No testers found.</CommandEmpty>
          <CommandGroup>
            {testers?.map(tester => (
              <CommandItem
                key={tester.id}
                onSelect={() => handleTesterSelect(tester.id)}
              >
                <div className="flex items-center gap-2">
                  <div
                    className={cn(
                      "flex h-4 w-4 items-center justify-center rounded-sm border border-primary",
                      formData.assignedTo === tester.id
                        ? "bg-primary text-primary-foreground"
                        : "opacity-50 [&_svg]:invisible"
                    )}
                  >
                    <svg
                      className={cn("h-3 w-3")}
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                      strokeWidth={2}
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        d="M5 13l4 4L19 7"
                      />
                    </svg>
                  </div>
                  <span>{tester.name}</span>
                </div>
              </CommandItem>
            ))}
          </CommandGroup>
        </Command>
        {formData.assignedTo && (
          <p className="text-sm text-muted-foreground">
            Assigned to: {testers?.find(t => t.id === formData.assignedTo)?.name}
          </p>
        )}
      </div>

      <div className="rounded-lg border p-4 space-y-4">
        <h4 className="font-medium">Review Information</h4>
        <dl className="space-y-2">
          <div className="flex justify-between">
            <dt className="text-muted-foreground">Type:</dt>
            <dd className="font-medium capitalize">{formData.ticketType}</dd>
          </div>
          <div className="flex justify-between">
            <dt className="text-muted-foreground">Title:</dt>
            <dd className="font-medium">{formData.title}</dd>
          </div>
          <div className="flex justify-between">
            <dt className="text-muted-foreground">Priority:</dt>
            <dd className="font-medium capitalize">{formData.priority}</dd>
          </div>
          {formData.ticketType === 'testing' && (
            <>
              <div className="flex justify-between">
                <dt className="text-muted-foreground">Feature:</dt>
                <dd className="font-medium">
                  {projects
                    ?.find(p => p.features.some(f => f.id === formData.featureId))
                    ?.features.find(f => f.id === formData.featureId)?.name || "Not selected"}
                </dd>
              </div>
              <div className="flex justify-between">
                <dt className="text-muted-foreground">Deadline:</dt>
                <dd className="font-medium">
                  {formData.deadline ? format(formData.deadline, "PPP 'at' h:mm a") : "Not set"}
                </dd>
              </div>
            </>
          )}
          {formData.ticketType === 'support' && (
            <>
              <div className="flex justify-between">
                <dt className="text-muted-foreground">Category:</dt>
                <dd className="font-medium capitalize">{formData.category}</dd>
              </div>
              {formData.projectId && (
                <div className="flex justify-between">
                  <dt className="text-muted-foreground">Project:</dt>
                  <dd className="font-medium">
                    {projects?.find(p => p.id === formData.projectId)?.name}
                  </dd>
                </div>
              )}
            </>
          )}
        </dl>
      </div>
    </div>
  )
} 