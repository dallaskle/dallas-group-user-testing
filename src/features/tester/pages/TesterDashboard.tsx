import { useEffect, useState, useCallback } from 'react'
import { useNavigate } from 'react-router-dom'
import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { useToast } from '@/components/ui/use-toast'
import { useTesterStore } from '../store/tester.store'
import { TesterMetrics } from '@/features/admin/components/TesterMetrics'
import { QAScorecard } from '@/features/admin/components/QAScorecard'
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
import { Database } from '@/shared/types/database.types'

type Validation = Database['public']['Tables']['validations']['Row'] & {
  validated_by: Database['public']['Tables']['users']['Row']
}

const TesterDashboard = () => {
  const navigate = useNavigate()
  const { toast } = useToast()
  const { queue, ticketHistory, fetchQueue, fetchTicketHistory, isLoading } = useTesterStore()
  const [selectedVideo, setSelectedVideo] = useState<string | null>(null)
  
  // Local filtering and sorting state
  const [statusFilter, setStatusFilter] = useState<'all' | 'open' | 'in_progress'>('all')
  const [priorityFilter, setPriorityFilter] = useState<'all' | 'high' | 'medium' | 'low'>('all')
  const [searchQuery, setSearchQuery] = useState('')
  const [debouncedSearchQuery, setDebouncedSearchQuery] = useState('')
  const [sortBy, setSortBy] = useState<'newest' | 'oldest' | 'deadline' | 'priority'>('newest')

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

  useEffect(() => {
    fetchQueue()
    fetchTicketHistory()
  }, [fetchQueue, fetchTicketHistory])

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
      
      // Search filter
      if (debouncedSearchQuery) {
        const search = debouncedSearchQuery.toLowerCase()
        return (
          ticket.title.toLowerCase().includes(search) ||
          ticket.description.toLowerCase().includes(search)
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
          const priorityOrder = { high: 3, medium: 2, low: 1 }
          return priorityOrder[b.priority] - priorityOrder[a.priority]
        }
        default:
          return 0
      }
    })

  return (
    <div className="container mx-auto py-8">
      <h1 className="text-3xl font-bold mb-8">Tester Dashboard</h1>

      <Tabs defaultValue="queue">
        <TabsList className="grid w-full grid-cols-3 mb-8">
          <TabsTrigger value="queue">Test Queue</TabsTrigger>
          <TabsTrigger value="history">Test History</TabsTrigger>
          <TabsTrigger value="metrics">My Metrics</TabsTrigger>
        </TabsList>

        <TabsContent value="queue">
          <div className="space-y-4">
            <div className="flex justify-between items-center">
              <h2 className="text-xl font-semibold">Test Queue</h2>
              <Button onClick={() => fetchQueue()}>Refresh Queue</Button>
            </div>

            {/* Filtering and Sorting Controls */}
            <Card className="p-4">
              <div className="flex flex-col gap-4">
                <div className="flex items-center gap-4">
                  <div className="flex-1">
                    <div className="relative">
                      <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
                      <Input
                        placeholder="Search ticket title or description..."
                        value={searchQuery}
                        onChange={handleSearchChange}
                        className="pl-8 pr-8"
                      />
                      {searchQuery && (
                        <button
                          onClick={handleClearSearch}
                          className="absolute right-2 top-2.5 text-gray-400 hover:text-gray-600"
                        >
                          <X className="h-4 w-4" />
                        </button>
                      )}
                    </div>
                  </div>
                  
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
                                {ticket.testing_ticket.feature.validations.map((validation) => (
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
        </TabsContent>

        <TabsContent value="history">
          <div className="space-y-4">
            <div className="flex justify-between items-center">
              <h2 className="text-xl font-semibold">Test History</h2>
              <Button onClick={() => fetchTicketHistory()}>Refresh History</Button>
            </div>

            {isLoading ? (
              <div className="flex items-center justify-center h-32">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900"></div>
              </div>
            ) : ticketHistory.length > 0 ? (
              <div className="grid gap-4">
                {ticketHistory.map((ticket) => (
                  <Card key={ticket.id} className="p-6">
                    <div className="space-y-2">
                      <h3 className="font-semibold text-lg">{ticket.title}</h3>
                      <div className="text-sm text-gray-600">
                        <p>Feature: {ticket.testing_ticket.feature.name}</p>
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
                              <Button
                                variant="ghost"
                                size="sm"
                                className="text-blue-600 hover:text-blue-800 p-0"
                                onClick={() => setSelectedVideo(ticket.testing_ticket.validation?.video_url || null)}
                              >
                                <Play className="h-4 w-4 mr-2" />
                                View Test Video
                              </Button>
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
          </div>
        </TabsContent>

        <TabsContent value="metrics">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            <QAScorecard />
            <TesterMetrics fullWidth />
          </div>
        </TabsContent>
      </Tabs>

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

export default TesterDashboard 