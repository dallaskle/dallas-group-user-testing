import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { useTicketManagement } from '../../store/ticketManagement.store'
import { ChevronDownIcon, Cross2Icon } from '@radix-ui/react-icons'

const STATUS_OPTIONS = [
  { value: 'open', label: 'Open' },
  { value: 'in_progress', label: 'In Progress' },
  { value: 'resolved', label: 'Resolved' },
  { value: 'closed', label: 'Closed' },
]

const PRIORITY_OPTIONS = [
  { value: 'low', label: 'Low' },
  { value: 'medium', label: 'Medium' },
  { value: 'high', label: 'High' },
]

const TYPE_OPTIONS = [
  { value: 'bug', label: 'Bug' },
  { value: 'feature', label: 'Feature' },
  { value: 'improvement', label: 'Improvement' },
  { value: 'task', label: 'Task' },
]

export const TicketFilters = () => {
  const { filters, setFilters } = useTicketManagement()

  const handleStatusToggle = (status: string) => {
    const currentStatuses = filters.status || []
    const newStatuses = currentStatuses.includes(status)
      ? currentStatuses.filter(s => s !== status)
      : [...currentStatuses, status]
    setFilters({ status: newStatuses.length ? newStatuses : undefined })
  }

  const handlePriorityToggle = (priority: string) => {
    const currentPriorities = filters.priority || []
    const newPriorities = currentPriorities.includes(priority)
      ? currentPriorities.filter(p => p !== priority)
      : [...currentPriorities, priority]
    setFilters({ priority: newPriorities.length ? newPriorities : undefined })
  }

  const handleTypeToggle = (type: string) => {
    const currentTypes = filters.type || []
    const newTypes = currentTypes.includes(type)
      ? currentTypes.filter(t => t !== type)
      : [...currentTypes, type]
    setFilters({ type: newTypes.length ? newTypes : undefined })
  }

  const clearFilters = () => {
    setFilters({
      status: undefined,
      priority: undefined,
      type: undefined,
      assignedTo: undefined
    })
  }

  const hasFilters = !!(filters.status?.length || filters.priority?.length || filters.type?.length || filters.assignedTo)

  return (
    <div className="flex flex-wrap gap-2 items-center">
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="outline" size="sm">
            Status
            <ChevronDownIcon className="ml-2 h-4 w-4" />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="start">
          <DropdownMenuLabel>Filter by Status</DropdownMenuLabel>
          <DropdownMenuSeparator />
          <DropdownMenuGroup>
            {STATUS_OPTIONS.map(option => (
              <DropdownMenuItem
                key={option.value}
                onSelect={() => handleStatusToggle(option.value)}
              >
                <div className="flex items-center">
                  <input
                    type="checkbox"
                    checked={filters.status?.includes(option.value)}
                    className="mr-2"
                    readOnly
                  />
                  {option.label}
                </div>
              </DropdownMenuItem>
            ))}
          </DropdownMenuGroup>
        </DropdownMenuContent>
      </DropdownMenu>

      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="outline" size="sm">
            Priority
            <ChevronDownIcon className="ml-2 h-4 w-4" />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="start">
          <DropdownMenuLabel>Filter by Priority</DropdownMenuLabel>
          <DropdownMenuSeparator />
          <DropdownMenuGroup>
            {PRIORITY_OPTIONS.map(option => (
              <DropdownMenuItem
                key={option.value}
                onSelect={() => handlePriorityToggle(option.value)}
              >
                <div className="flex items-center">
                  <input
                    type="checkbox"
                    checked={filters.priority?.includes(option.value)}
                    className="mr-2"
                    readOnly
                  />
                  {option.label}
                </div>
              </DropdownMenuItem>
            ))}
          </DropdownMenuGroup>
        </DropdownMenuContent>
      </DropdownMenu>

      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="outline" size="sm">
            Type
            <ChevronDownIcon className="ml-2 h-4 w-4" />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="start">
          <DropdownMenuLabel>Filter by Type</DropdownMenuLabel>
          <DropdownMenuSeparator />
          <DropdownMenuGroup>
            {TYPE_OPTIONS.map(option => (
              <DropdownMenuItem
                key={option.value}
                onSelect={() => handleTypeToggle(option.value)}
              >
                <div className="flex items-center">
                  <input
                    type="checkbox"
                    checked={filters.type?.includes(option.value)}
                    className="mr-2"
                    readOnly
                  />
                  {option.label}
                </div>
              </DropdownMenuItem>
            ))}
          </DropdownMenuGroup>
        </DropdownMenuContent>
      </DropdownMenu>

      {hasFilters && (
        <Button
          variant="ghost"
          size="sm"
          onClick={clearFilters}
          className="text-muted-foreground"
        >
          Clear filters
          <Cross2Icon className="ml-2 h-4 w-4" />
        </Button>
      )}

      <div className="flex flex-wrap gap-1 ml-2">
        {filters.status?.map(status => (
          <Badge
            key={status}
            variant="secondary"
            className="cursor-pointer"
            onClick={() => handleStatusToggle(status)}
          >
            {STATUS_OPTIONS.find(o => o.value === status)?.label}
            <Cross2Icon className="ml-1 h-3 w-3" />
          </Badge>
        ))}
        {filters.priority?.map(priority => (
          <Badge
            key={priority}
            variant="secondary"
            className="cursor-pointer"
            onClick={() => handlePriorityToggle(priority)}
          >
            {PRIORITY_OPTIONS.find(o => o.value === priority)?.label}
            <Cross2Icon className="ml-1 h-3 w-3" />
          </Badge>
        ))}
        {filters.type?.map(type => (
          <Badge
            key={type}
            variant="secondary"
            className="cursor-pointer"
            onClick={() => handleTypeToggle(type)}
          >
            {TYPE_OPTIONS.find(o => o.value === type)?.label}
            <Cross2Icon className="ml-1 h-3 w-3" />
          </Badge>
        ))}
      </div>
    </div>
  )
} 