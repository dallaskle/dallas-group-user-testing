import { useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
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
import { Database } from '@/shared/types/database.types'
import { supabase } from '@/lib/supabase'
import { format } from 'date-fns'
import { ChevronDown, ChevronUp, Download, Play } from 'lucide-react'

type Validation = Database['public']['Tables']['validations']['Row'] & {
  validator: {
    name: string
  }
  feature: {
    name: string
  }
}

interface ValidationHistoryPanelProps {
  projectId: string
}

export const ValidationHistoryPanel = ({ projectId }: ValidationHistoryPanelProps) => {
  const [isExpanded, setIsExpanded] = useState(false)
  const [validations, setValidations] = useState<Validation[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const [filter, setFilter] = useState<'all' | 'Working' | 'Needs Fixing'>('all')
  const [sortBy, setSortBy] = useState<'newest' | 'oldest'>('newest')
  const [selectedVideo, setSelectedVideo] = useState<string | null>(null)

  const loadValidations = async () => {
    try {
      setIsLoading(true)
      const { data: features } = await supabase
        .from('features')
        .select('id')
        .eq('project_id', projectId)

      if (!features) return

      const featureIds = features.map(f => f.id)

      const { data, error } = await supabase
        .from('validations')
        .select(`
          *,
          validator:validated_by(name),
          feature:feature_id(name)
        `)
        .in('feature_id', featureIds)
        .order('created_at', { ascending: sortBy === 'oldest' })

      if (error) throw error

      setValidations(data)
    } catch (error) {
      console.error('Failed to load validations:', error)
    } finally {
      setIsLoading(false)
    }
  }

  const toggleExpand = () => {
    setIsExpanded(!isExpanded)
    if (!isExpanded && validations.length === 0) {
      loadValidations()
    }
  }

  const filteredValidations = validations.filter(validation => 
    filter === 'all' || validation.status === filter
  )

  return (
    <>
      <Card>
        <CardHeader className="cursor-pointer" onClick={toggleExpand}>
          <div className="flex items-center justify-between">
            <CardTitle className="text-xl">Validation History</CardTitle>
            <Button variant="ghost" size="sm">
              {isExpanded ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
            </Button>
          </div>
        </CardHeader>
        {isExpanded && (
          <CardContent>
            <div className="flex items-center gap-4 mb-4">
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

              <Select value={sortBy} onValueChange={(value: typeof sortBy) => {
                setSortBy(value)
                loadValidations()
              }}>
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
          </CardContent>
        )}
      </Card>

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