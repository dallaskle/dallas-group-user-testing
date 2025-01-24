import { useState, useCallback } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Search, X, Play, Info } from 'lucide-react'
import debounce from 'lodash/debounce'
import type { TestHistoryItem } from '../../../api/adminDashboard.api'
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
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover"

interface TestHistoryProps {
  testHistory: TestHistoryItem[]
  onRefresh: () => void
  isLoading: boolean
}

export const TestHistory = ({ testHistory, onRefresh, isLoading }: TestHistoryProps) => {
  const [selectedVideo, setSelectedVideo] = useState<string | null>(null)
  const [statusFilter, setStatusFilter] = useState<'all' | 'resolved' | 'closed'>('all')
  const [projectFilter, setProjectFilter] = useState<string>('all')
  const [studentFilter, setStudentFilter] = useState<string>('all')
  const [testerFilter, setTesterFilter] = useState<string>('all')
  const [searchQuery, setSearchQuery] = useState('')
  const [debouncedSearchQuery, setDebouncedSearchQuery] = useState('')
  const [sortBy, setSortBy] = useState<'newest' | 'oldest'>('newest')

  // Get unique projects, students, and testers from history
  const projects = Array.from(
    new Map(
      testHistory
        .filter(ticket => ticket.testing_ticket?.feature?.project)
        .map(ticket => [
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
      testHistory
        .filter(ticket => ticket.testing_ticket?.feature?.project?.student)
        .map(ticket => [
          ticket.testing_ticket.feature.project.student.id,
          {
            id: ticket.testing_ticket.feature.project.student.id,
            name: ticket.testing_ticket.feature.project.student.name
          }
        ])
    ).values()
  ).sort((a, b) => a.name.localeCompare(b.name))

  const testers = Array.from(
    new Map(
      testHistory
        .filter(ticket => ticket.assigned_to)
        .map(ticket => [
          ticket.assigned_to.id,
          {
            id: ticket.assigned_to.id,
            name: ticket.assigned_to.name
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

  console.log(testHistory)
  // Filter and sort history
  const filteredAndSortedHistory = testHistory
    .filter(ticket => {
      if (!ticket.testing_ticket?.feature?.project) {
        return false
      }

      // Status filter
      if (statusFilter !== 'all' && ticket.status !== statusFilter) {
        return false
      }

      // Project filter
      if (projectFilter !== 'all' && ticket.testing_ticket.feature.project.id !== projectFilter) {
        return false
      }

      // Student filter
      if (studentFilter !== 'all' && 
          ticket.testing_ticket.feature.project.student?.id !== studentFilter) {
        return false
      }

      // Tester filter
      if (testerFilter !== 'all' && ticket.assigned_to?.id !== testerFilter) {
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
          (ticket.testing_ticket.feature.project.student?.name || '').toLowerCase().includes(search) ||
          (ticket.assigned_to?.name || '').toLowerCase().includes(search)
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
        <Button onClick={onRefresh}>Refresh History</Button>
      </div>

      {/* Filtering and Sorting Controls */}
      <div className="space-y-4 bg-card p-4 rounded-lg border">
        <div className="flex items-center gap-4">
          <div className="flex-1">
            <div className="relative">
              <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search ticket title, description, feature, project, student, or tester..."
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

          <Select value={testerFilter} onValueChange={setTesterFilter}>
            <SelectTrigger className="w-[180px]">
              <SelectValue placeholder="Filter by tester" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Testers</SelectItem>
              {testers.map(tester => (
                <SelectItem key={tester.id} value={tester.id}>
                  {tester.name}
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

      {isLoading ? (
        <div className="flex items-center justify-center h-32">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900"></div>
        </div>
      ) : filteredAndSortedHistory.length > 0 ? (
        <div className="rounded-md border">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Title</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Priority</TableHead>
                <TableHead>Feature</TableHead>
                <TableHead>Project</TableHead>
                <TableHead>Student</TableHead>
                <TableHead>Tester</TableHead>
                <TableHead>Completed</TableHead>
                <TableHead>Validation</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredAndSortedHistory.map((ticket) => (
                <TableRow key={ticket.id}>
                  <TableCell className="font-medium">
                    <div className="max-w-[200px] group relative">
                      <div className="font-medium truncate cursor-default">
                        {ticket.title}
                      </div>
                      <div className="text-sm text-muted-foreground truncate">
                        {ticket.description}
                      </div>
                      <div className="invisible group-hover:visible absolute left-full top-0 ml-2 p-2 bg-popover text-popover-foreground rounded-md shadow-md border w-[300px] z-50">
                        <div className="space-y-2">
                          <p className="font-medium break-words">{ticket.title}</p>
                          <p className="text-sm text-muted-foreground break-words">{ticket.description}</p>
                        </div>
                      </div>
                    </div>
                  </TableCell>
                  <TableCell>
                    <Badge variant="outline">
                      {ticket.status}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <Badge variant={
                      ticket.priority === 'high' ? 'destructive' :
                      ticket.priority === 'medium' ? 'default' :
                      'secondary'
                    }>
                      {ticket.priority}
                    </Badge>
                  </TableCell>
                  <TableCell>{ticket.testing_ticket.feature.name}</TableCell>
                  <TableCell>{ticket.testing_ticket.feature.project.name}</TableCell>
                  <TableCell>{ticket.testing_ticket.feature.project.student?.name}</TableCell>
                  <TableCell>{ticket.assigned_to?.name}</TableCell>
                  <TableCell>{new Date(ticket.updated_at).toLocaleDateString()}</TableCell>
                  <TableCell>
                    {ticket.testing_ticket.validations && ticket.testing_ticket.validations.length > 0 ? (
                      <div className="flex items-center gap-2">
                        {ticket.testing_ticket.validations.map((validation) => (
                          <div key={validation.id} className="flex items-center">
                            <div 
                              className={`h-2 w-2 rounded-full ${
                                validation.status === 'Working' 
                                  ? 'bg-green-500'
                                  : 'bg-red-500'
                              }`}
                            />
                            {validation.video_url && (
                              <Play 
                                className="h-3 w-3 ml-1 text-blue-600 cursor-pointer" 
                                onClick={() => setSelectedVideo(validation.video_url)}
                              />
                            )}
                          </div>
                        ))}
                        <Popover>
                          <PopoverTrigger asChild>
                            <Button variant="ghost" size="sm" className="h-6 w-6 p-0">
                              <Info className="h-4 w-4" />
                            </Button>
                          </PopoverTrigger>
                          <PopoverContent className="w-80">
                            <div className="space-y-4">
                              {ticket.testing_ticket.validations.map((validation, index) => (
                                <div key={validation.id} className={index > 0 ? "border-t pt-4" : ""}>
                                  <div className="flex items-center gap-2">
                                    <div 
                                      className={`h-2 w-2 rounded-full ${
                                        validation.status === 'Working' 
                                          ? 'bg-green-500'
                                          : 'bg-red-500'
                                      }`}
                                    />
                                    <span className={
                                      validation.status === 'Working' 
                                        ? 'text-green-600 font-medium'
                                        : 'text-red-600 font-medium'
                                    }>
                                      {validation.status}
                                    </span>
                                  </div>
                                  {validation.notes && (
                                    <p className="text-sm text-muted-foreground mt-2">
                                      {validation.notes}
                                    </p>
                                  )}
                                  {validation.video_url && (
                                    <Button
                                      variant="ghost"
                                      size="sm"
                                      className="text-blue-600 hover:text-blue-800 p-0 h-auto mt-2"
                                      onClick={() => setSelectedVideo(validation.video_url)}
                                    >
                                      <Play className="h-4 w-4 mr-2" />
                                      View Video
                                    </Button>
                                  )}
                                  <div className="text-xs text-muted-foreground mt-1">
                                    {new Date(validation.created_at).toLocaleString()}
                                  </div>
                                </div>
                              ))}
                            </div>
                          </PopoverContent>
                        </Popover>
                      </div>
                    ) : (
                      <span className="text-muted-foreground text-sm">No validations</span>
                    )}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      ) : (
        <div className="text-center p-8 border rounded-lg">
          <p className="text-gray-500">No completed tests</p>
        </div>
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