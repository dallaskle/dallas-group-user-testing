import { useState, useCallback } from 'react'
import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { useTesterStore } from '../store/tester.store'
import { Play, Search, X } from 'lucide-react'
import debounce from 'lodash/debounce'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"

export const TestHistory = () => {
  const { ticketHistory, fetchTicketHistory, isLoading } = useTesterStore()
  const [selectedVideo, setSelectedVideo] = useState<string | null>(null)

  // Local filtering and sorting state
  const [statusFilter, setStatusFilter] = useState<'all' | 'resolved' | 'closed'>('all')
  const [projectFilter, setProjectFilter] = useState<string>('all')
  const [studentFilter, setStudentFilter] = useState<string>('all')
  const [searchQuery, setSearchQuery] = useState('')
  const [debouncedSearchQuery, setDebouncedSearchQuery] = useState('')
  const [sortBy, setSortBy] = useState<'newest' | 'oldest'>('newest')

  // Get unique projects and students from history
  const projects = Array.from(
    new Map(
      ticketHistory.map(ticket => [
        ticket.testing_ticket.feature.project?.id,
        {
          id: ticket.testing_ticket.feature.project?.id,
          name: ticket.testing_ticket.feature.project?.name
        }
      ])
    ).values()
  ).sort((a, b) => a.name.localeCompare(b.name))

  const students = Array.from(
    new Map(
      ticketHistory.map(ticket => [
        ticket.testing_ticket.feature.project?.student?.id,
        {
          id: ticket.testing_ticket.feature.project?.student?.id,
          name: ticket.testing_ticket.feature.project?.student?.name
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

  // Filter and sort history
  const filteredAndSortedHistory = ticketHistory
    .filter(ticket => {
      // Status filter
      if (statusFilter !== 'all' && ticket.status !== statusFilter) {
        return false
      }

      // Project filter
      if (projectFilter !== 'all' && ticket.testing_ticket.feature.project?.id !== projectFilter) {
        return false
      }

      // Student filter
      if (studentFilter !== 'all' && ticket.testing_ticket.feature.project?.student?.id !== studentFilter) {
        return false
      }
      
      // Search filter
      if (debouncedSearchQuery) {
        const search = debouncedSearchQuery.toLowerCase()
        return (
          ticket.title.toLowerCase().includes(search) ||
          ticket.description.toLowerCase().includes(search) ||
          ticket.testing_ticket.feature.name.toLowerCase().includes(search) ||
          ticket.testing_ticket.feature.project?.name.toLowerCase().includes(search) ||
          ticket.testing_ticket.feature.project?.student?.name.toLowerCase().includes(search)
        )
      }
      
      return true
    })
    .sort((a, b) => {
      switch (sortBy) {
        case 'newest':
          return new Date(b.updated_at).getTime() - new Date(a.updated_at).getTime()
        case 'oldest':
          return new Date(a.updated_at).getTime() - new Date(b.updated_at).getTime()
        default:
          return 0
      }
    })

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h2 className="text-xl font-semibold">Test History</h2>
        <Button onClick={() => fetchTicketHistory()}>Refresh History</Button>
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
                <SelectItem value="resolved">Resolved</SelectItem>
                <SelectItem value="closed">Closed</SelectItem>
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
              </SelectContent>
            </Select>
          </div>
        </div>
      </Card>

      {isLoading ? (
        <div className="flex items-center justify-center h-32">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900"></div>
        </div>
      ) : filteredAndSortedHistory.length > 0 ? (
        <div className="grid gap-4">
          {filteredAndSortedHistory.map((ticket) => (
            <Card key={ticket.id} className="p-6">
              <div className="space-y-2">
                <div className="flex items-center gap-2">
                  <h3 className="font-semibold text-lg">{ticket.title}</h3>
                  <Badge variant="outline">
                    {ticket.status}
                  </Badge>
                </div>
                <div className="text-sm text-gray-600">
                  <p>Feature: {ticket.testing_ticket.feature.name}</p>
                  <p>Project: {ticket.testing_ticket.feature.project?.name}</p>
                  <p>Student: {ticket.testing_ticket.feature.project?.student?.name}</p>
                  <p>Completed: {new Date(ticket.updated_at).toLocaleDateString()}</p>
                  {ticket.testing_ticket.validation && (
                    <>
                      <p className="mt-2 font-medium">Validation Details:</p>
                      <div className="ml-2">
                        <p>Status: <span className={
                          ticket.testing_ticket.validation.status === 'Working' 
                            ? 'text-green-600 font-medium'
                            : 'text-red-600 font-medium'
                        }>
                          {ticket.testing_ticket.validation.status}
                        </span></p>
                        {ticket.testing_ticket.validation.notes && (
                          <p>Notes: {ticket.testing_ticket.validation.notes}</p>
                        )}
                        {ticket.testing_ticket.validation.video_url && (
                          <Button
                            variant="ghost"
                            size="sm"
                            className="text-blue-600 hover:text-blue-800 p-0"
                            onClick={() => setSelectedVideo(ticket.testing_ticket.validation?.video_url || null)}
                          >
                            <Play className="h-4 w-4 mr-2" />
                            View Test Video
                          </Button>
                        )}
                      </div>
                    </>
                  )}
                </div>
                <p className="text-gray-700 mt-4">{ticket.description}</p>
              </div>
            </Card>
          ))}
        </div>
      ) : (
        <Card className="p-6">
          <p className="text-center text-gray-500">No completed tests</p>
        </Card>
      )}

      <Dialog open={!!selectedVideo} onOpenChange={() => setSelectedVideo(null)}>
        <DialogContent className="max-w-4xl">
          <DialogHeader>
            <DialogTitle>Validation Recording</DialogTitle>
          </DialogHeader>
          {selectedVideo && (
            <div className="aspect-video">
              <video
                src={selectedVideo}
                controls
                className="w-full h-full rounded-lg"
              >
                Your browser does not support the video tag.
              </video>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  )
} 