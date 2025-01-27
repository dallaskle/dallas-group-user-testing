import { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { format } from 'date-fns'
import { Download, Play } from 'lucide-react'
import { useValidationsStore } from '../store/validations.store'
import { useProjectsStore } from '../store/projects.store'

interface ValidationHistoryPanelProps {
  projectId: string
}

export const ValidationHistoryPanel = ({ projectId }: ValidationHistoryPanelProps) => {
  const { validationsByProject, isLoading, sortBy, setSortBy, loadValidations } = useValidationsStore()
  const { projects, fetchProjects } = useProjectsStore()
  const [filter, setFilter] = useState<'all' | 'Working' | 'Needs Fixing'>('all')
  const [selectedVideo, setSelectedVideo] = useState<string | null>(null)
  const [selectedTester, setSelectedTester] = useState<string>('all')

  const validations = validationsByProject[projectId] || []
  
  // Get unique testers from validations
  const testers = [...new Set(validations.map(v => v.validator.name))].sort()

  // Load projects and validations when component mounts or sort changes
  useEffect(() => {
    const loadData = async () => {
      if (projects.length === 0) {
        await fetchProjects()
      }
      await loadValidations(projectId)
    }
    loadData()
  }, [sortBy, projectId, projects.length, fetchProjects, loadValidations])

  const filteredValidations = validations.filter(validation => 
    (filter === 'all' || validation.status === filter) &&
    (selectedTester === 'all' || validation.validator.name === selectedTester)
  )

  return (
    <>
      <div>
        <div className="flex items-center gap-4 mb-6">
          <Select value={filter} onValueChange={(value: typeof filter) => setFilter(value)}>
            <SelectTrigger className="w-[180px]">
              <SelectValue placeholder="Filter by status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Statuses</SelectItem>
              <SelectItem value="Working">Working</SelectItem>
              <SelectItem value="Needs Fixing">Needs Fixing</SelectItem>
            </SelectContent>
          </Select>

          <Select value={selectedTester} onValueChange={setSelectedTester}>
            <SelectTrigger className="w-[180px]">
              <SelectValue placeholder="Filter by tester" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Testers</SelectItem>
              {testers.map(tester => (
                <SelectItem key={tester} value={tester}>
                  {tester}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          <Select value={sortBy} onValueChange={(value: 'newest' | 'oldest') => setSortBy(value)}>
            <SelectTrigger className="w-[180px]">
              <SelectValue placeholder="Sort by" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="newest">Newest First</SelectItem>
              <SelectItem value="oldest">Oldest First</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {isLoading ? (
          <div className="flex items-center justify-center py-8">
            <div className="h-8 w-8 animate-spin rounded-full border-b-2 border-gray-900"></div>
          </div>
        ) : (
          <div className="space-y-4">
            {filteredValidations.length === 0 ? (
              <p className="text-center text-gray-500 py-8">No validations found</p>
            ) : (
              filteredValidations.map(validation => (
                <div
                  key={validation.id}
                  className="p-4 rounded-lg border border-gray-200"
                >
                  <div className="flex items-start justify-between">
                    <div className="space-y-2">
                      <h3 className="font-medium text-gray-900">
                        {validation.feature.name}
                      </h3>
                      <div className="flex items-center gap-2">
                        <Badge variant={validation.status === 'Working' ? 'default' : 'destructive'}>
                          {validation.status}
                        </Badge>
                        <span className="text-sm text-gray-500">
                          by {validation.validator.name}
                        </span>
                        <span className="text-sm text-gray-500">
                          {format(new Date(validation.created_at), 'MMM d, yyyy HH:mm')}
                        </span>
                      </div>
                      <p className="text-sm text-gray-700">{validation.notes}</p>
                    </div>
                    {validation.video_url && (
                      <div className="flex items-center gap-2 ml-4 shrink-0">
                        <Button
                          variant="outline"
                          size="sm"
                          className="whitespace-nowrap"
                          onClick={() => setSelectedVideo(validation.video_url)}
                        >
                          <Play className="h-4 w-4 mr-2" />
                          View Recording
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          className="whitespace-nowrap"
                          onClick={() => window.open(validation.video_url, '_blank')}
                        >
                          <Download className="h-4 w-4 mr-2" />
                          Download Recording
                        </Button>
                      </div>
                    )}
                  </div>
                </div>
              ))
            )}
          </div>
        )}
      </div>

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
    </>
  )
} 