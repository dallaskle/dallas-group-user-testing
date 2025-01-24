import type { CreateTicketStepProps } from './types'

const TICKET_TYPES = [
  { value: 'support', label: 'Support Request' },
  { value: 'testing', label: 'Testing Request' },
  { value: 'question', label: 'General Question' },
]

const PRIORITY_LEVELS = [
  { value: 'low', label: 'Low' },
  { value: 'medium', label: 'Medium' },
  { value: 'high', label: 'High' },
]

export function BasicInfoStep({ 
  formData, 
  onFormDataChange, 
  isLoading 
}: CreateTicketStepProps) {
  return (
    <div className="space-y-4">
      <div>
        <label className="block text-sm font-medium text-gray-700">
          Ticket Type
        </label>
        <select
          value={formData.ticketType}
          onChange={(e) => onFormDataChange({ ticketType: e.target.value as any })}
          className="mt-1 block w-full rounded-md border border-gray-300 bg-white px-3 py-2 shadow-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
          disabled={isLoading}
        >
          <option value="">Select a type</option>
          {TICKET_TYPES.map(type => (
            <option key={type.value} value={type.value}>
              {type.label}
            </option>
          ))}
        </select>
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700">
          Title
        </label>
        <input
          type="text"
          value={formData.title}
          onChange={(e) => onFormDataChange({ title: e.target.value })}
          className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 shadow-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
          placeholder="Enter a descriptive title"
          disabled={isLoading}
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700">
          Description
        </label>
        <textarea
          value={formData.description}
          onChange={(e) => onFormDataChange({ description: e.target.value })}
          rows={4}
          className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 shadow-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
          placeholder="Provide detailed information about the ticket"
          disabled={isLoading}
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700">
          Priority
        </label>
        <select
          value={formData.priority}
          onChange={(e) => onFormDataChange({ priority: e.target.value as any })}
          className="mt-1 block w-full rounded-md border border-gray-300 bg-white px-3 py-2 shadow-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
          disabled={isLoading}
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
  )
}