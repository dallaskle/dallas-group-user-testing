import { useState, useCallback } from 'react'
import { useNavigate } from 'react-router-dom'
import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { useTesterStore } from '../store/tester.store'
import { Play, Search, X } from 'lucide-react'
import debounce from 'lodash/debounce'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Database } from '@/database.types'

export const TestQueue = () => {
  const navigate = useNavigate()
  const { queue, fetchQueue, isLoading } = useTesterStore()
  
  // Local filtering and sorting state
  const [statusFilter, setStatusFilter] = useState<'all' | 'open' | 'in_progress'>('all')
  const [priorityFilter, setPriorityFilter] = useState<'all' | 'high' | 'medium' | 'low'>('all')
  const [projectFilter, setProjectFilter] = useState<string>('all')
  const [studentFilter, setStudentFilter] = useState<string>('all')
  const [searchQuery, setSearchQuery] = useState('')
  const [debouncedSearchQuery, setDebouncedSearchQuery] = useState('')
  const [sortBy, setSortBy] = useState<'newest' | 'oldest' | 'deadline' | 'priority'>('newest')

  // Get unique projects and students from queue
  const projects = Array.from(
    new Map(
      queue.map(ticket => [
        ticket.testing_ticket.feature.project.id,
        {
          id: ticket.testing_ticket.feature.project.id,
          name: ticket.testing_ticket.feature.project.name
        }
      ])
    ).values()
  ).sort((a, b) => a.name.localeCompare(b.name))

  const students = Array.from(
    new Map(
      queue.map(ticket => [
        ticket.testing_ticket.feature.project.student.id,
        {
          id: ticket.testing_ticket.feature.project.student.id,
          name: ticket.testing_ticket.feature.project.student.name
        }
      ])
    ).values()
  ).sort((a, b) => a.name.localeCompare(b.name))

  // Debounce search query updates
  const debouncedSetSearch = useCallback(
    debounce((value: string) => {
      setDebouncedSearchQuery(value)
    }, 300),
    []
  )

  // Update debounced search when input changes
  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchQuery(e.target.value)
    debouncedSetSearch(e.target.value)
  }

  // Clear both search states
  const handleClearSearch = () => {
    setSearchQuery('')
    setDebouncedSearchQuery('')
  }

  // Filter and sort queue
  const filteredAndSortedQueue = queue
    .filter(ticket => {
      // Status filter
      if (statusFilter !== 'all' && ticket.status !== statusFilter) {
        return false
      }
      
      // Priority filter
      if (priorityFilter !== 'all' && ticket.priority !== priorityFilter) {
        return false
      }

      // Project filter
      if (projectFilter !== 'all' && ticket.testing_ticket.feature.project.id !== projectFilter) {
        return false
      }

      // Student filter
      if (studentFilter !== 'all' && ticket.testing_ticket.feature.project.student.id !== studentFilter) {
        return false
      }
      
      // Search filter
      if (debouncedSearchQuery) {
        const search = debouncedSearchQuery.toLowerCase()
        return (
          ticket.title.toLowerCase().includes(search) ||
          ticket.description.toLowerCase().includes(search) ||
          ticket.testing_ticket.feature.name.toLowerCase().includes(search) ||
          ticket.testing_ticket.feature.project.name.toLowerCase().includes(search) ||
          ticket.testing_ticket.feature.project.student.name.toLowerCase().includes(search)
        )
      }
      
      return true
    })
    .sort((a, b) => {
      switch (sortBy) {
        case 'newest':
          return new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
        case 'oldest':
          return new Date(a.created_at).getTime() - new Date(b.created_at).getTime()
        case 'deadline':
          return new Date(a.testing_ticket.deadline).getTime() - new Date(b.testing_ticket.deadline).getTime()
        case 'priority': {
          const priorityOrder: Record<string, number> = { high: 3, medium: 2, low: 1 }
          return priorityOrder[b.priority] - priorityOrder[a.priority]
        }
        default:
          return 0
      }
    })

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h2 className="text-xl font-semibold">Test Queue</h2>
        <Button onClick={() => fetchQueue()}>Refresh Queue</Button>
      </div>

      {/* Filtering and Sorting Controls */}
      <Card className="p-4" hover={false}>
        <div className="flex flex-col gap-4">
          <div className="flex items-center gap-4">
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search ticket title, description, feature, project, or student..."
                  value={searchQuery}
                  onChange={handleSearchChange}
                  className="pl-8 pr-8"
                />
                {searchQuery && (
                  <button
                    onClick={handleClearSearch}
                    className="absolute right-2 top-2.5 text-gray-400"
                  >
                    <X className="h-4 w-4" />
                  </button>
                )}
              </div>
            </div>
          </div>

          <div className="flex items-center gap-4">
            <Select value={statusFilter} onValueChange={(value: typeof statusFilter) => setStatusFilter(value)}>
              <SelectTrigger className="w-[180px]">
                <SelectValue placeholder="Filter by status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Statuses</SelectItem>
                <SelectItem value="open">Open</SelectItem>
                <SelectItem value="in_progress">In Progress</SelectItem>
              </SelectContent>
            </Select>

            <Select value={priorityFilter} onValueChange={(value: typeof priorityFilter) => setPriorityFilter(value)}>
              <SelectTrigger className="w-[180px]">
                <SelectValue placeholder="Filter by priority" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Priorities</SelectItem>
                <SelectItem value="high">High</SelectItem>
                <SelectItem value="medium">Medium</SelectItem>
                <SelectItem value="low">Low</SelectItem>
              </SelectContent>
            </Select>

            <Select value={projectFilter} onValueChange={setProjectFilter}>
              <SelectTrigger className="w-[180px]">
                <SelectValue placeholder="Filter by project" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Projects</SelectItem>
                {projects.map(project => (
                  <SelectItem key={project.id} value={project.id}>
                    {project.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            <Select value={studentFilter} onValueChange={setStudentFilter}>
              <SelectTrigger className="w-[180px]">
                <SelectValue placeholder="Filter by student" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Students</SelectItem>
                {students.map(student => (
                  <SelectItem key={student.id} value={student.id}>
                    {student.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            <Select value={sortBy} onValueChange={(value: typeof sortBy) => setSortBy(value)}>
              <SelectTrigger className="w-[180px]">
                <SelectValue placeholder="Sort by" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="newest">Newest First</SelectItem>
                <SelectItem value="oldest">Oldest First</SelectItem>
                <SelectItem value="deadline">Deadline</SelectItem>
                <SelectItem value="priority">Priority</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>
      </Card>

      {isLoading ? (
        <div className="flex items-center justify-center h-32">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900"></div>
        </div>
      ) : filteredAndSortedQueue.length > 0 ? (
        <div className="grid gap-4">
          {filteredAndSortedQueue.map((ticket) => (
            <Card key={ticket.id} className="p-6">
              <div className="flex justify-between items-start">
                <div className="space-y-2">
                  <div className="flex items-center gap-2">
                    <h3 className="font-semibold text-lg">{ticket.title}</h3>
                    <Badge variant={
                      ticket.priority === 'high' ? 'destructive' :
                      ticket.priority === 'medium' ? 'default' :
                      'secondary'
                    }>
                      {ticket.priority}
                    </Badge>
                    <Badge variant={
                      ticket.status === 'open' ? 'outline' : 'default'
                    }>
                      {ticket.status}
                    </Badge>
                  </div>
                  <div className="text-sm text-gray-600 space-y-1">
                    <p>Feature: {ticket.testing_ticket.feature.name}</p>
                    <p>Project: {ticket.testing_ticket.feature.project.name}</p>
                    <p>Student: {ticket.testing_ticket.feature.project.student.name}</p>
                    <p>Assigned by: {ticket.created_by_user.name}</p>
                    <p>Deadline: {new Date(ticket.testing_ticket.deadline).toLocaleDateString()}</p>
                    
                    <div className="mt-2">
                      <div className="flex items-center gap-2">
                        <p className="font-medium">
                          {ticket.testing_ticket.feature.validations.length > 0 
                            ? "Previous Validations"
                            : "No Previous Validations"
                          }
                        </p>
                        <span className="text-sm text-gray-500">
                          ({ticket.testing_ticket.feature.current_validations} of {ticket.testing_ticket.feature.required_validations} required)
                        </span>
                      </div>
                      {ticket.testing_ticket.feature.validations.length > 0 && (
                        <div className="ml-2 mt-1 space-y-2">
                          {ticket.testing_ticket.feature.validations.map((validation: any) => (
                            <div key={validation.id} className="flex items-center space-x-2">
                              <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${
                                validation.status === 'Working' 
                                  ? 'bg-green-100 text-green-800'
                                  : 'bg-red-100 text-red-800'
                              }`}>
                                {validation.status}
                              </span>
                              <span className="text-gray-500">by {validation.validated_by.name}</span>
                              {validation.notes && (
                                <span className="text-gray-500">- {validation.notes}</span>
                              )}
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  </div>
                  <p className="text-gray-700 mt-4">{ticket.description}</p>
                </div>
                <Button
                  onClick={() => {
                    useTesterStore.getState().setCurrentTestById(ticket.id)
                    navigate(`/testing/${ticket.id}`)
                  }}
                  variant="secondary"
                  className="shrink-0"
                >
                  <Play className="h-4 w-4 mr-2" />
                  Start Testing
                </Button>
              </div>
            </Card>
          ))}
        </div>
      ) : (
        <Card className="p-6">
          <p className="text-center text-gray-500">No tests in queue</p>
        </Card>
      )}
    </div>
  )
} 