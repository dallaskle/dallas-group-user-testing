import { useEffect, useState } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Textarea } from '@/components/ui/textarea'
import { useToast } from '@/components/ui/use-toast'
import { useTesterStore } from '../store/tester.store'
import { EmbeddedBrowser } from '../components/EmbeddedBrowser/EmbeddedBrowser'
import { ScreenRecorder } from '../components/ScreenRecorder/ScreenRecorder'
import { FileUploader } from '../components/FileUploader/FileUploader'
import { supabase } from '@/lib/supabase'
import { Comments } from '@/features/student/components/Comments'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Play } from 'lucide-react'

const TestingSession = () => {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const { toast } = useToast()
  const { currentTest, isLoading, submitValidation, setCurrentTestById } = useTesterStore()
  const [notes, setNotes] = useState('')
  const [videoUrl, setVideoUrl] = useState('')
  const [fileUrl, setFileUrl] = useState('')
  const [isUploading, setIsUploading] = useState(false)
  const [selectedVideo, setSelectedVideo] = useState<string | null>(null)

  // Set current test if not set
  useEffect(() => {
    if (!currentTest && id && !isLoading) {
      setCurrentTestById(id)
    }
  }, [currentTest, id, isLoading, setCurrentTestById])

  // Redirect if the current test doesn't match the URL id after attempting to set it
  useEffect(() => {
    if (!isLoading && (!currentTest || currentTest.id !== id)) {
      // Only redirect if we're not in the middle of uploading
      if (!isUploading) {
        toast({
          title: 'Error',
          description: 'Test not found or not assigned to you.',
          variant: 'destructive',
        })
        navigate('/testing')
      }
    }
  }, [currentTest, id, isLoading, navigate, toast, isUploading])

  const handleRecordingComplete = async (videoBlob: Blob) => {
    try {
      setIsUploading(true)
      
      // Get current session to ensure we're authenticated
      const { data: { session } } = await supabase.auth.getSession()
      console.log('Current session:', {
        isAuthenticated: !!session,
        userId: session?.user?.id,
        role: session?.user?.role
      })

      if (!session) {
        throw new Error('No active session')
      }
      
      console.log('Recording blob:', {
        size: videoBlob.size,
        type: videoBlob.type,
        lastModified: new Date().toISOString()
      })
      
      // Create a unique filename using UUID v4
      const filename = `${currentTest?.id}-${Date.now()}.webm`
      console.log('Uploading with filename:', filename)
      
      // Upload to Supabase Storage with explicit content type
      const { error: storageError, data } = await supabase.storage
        .from('test-recordings')
        .upload(filename, videoBlob, {
          cacheControl: '3600',
          upsert: true,
          contentType: 'video/webm'
        })

      if (storageError) {
        console.error('Storage error details:', {
          message: storageError.message,
          name: storageError.name,
          error: storageError
        })
        throw new Error(storageError.message || 'Failed to upload recording. Please try again.')
      }

      console.log('Upload successful:', data)

      // Get public URL
      const { data: { publicUrl } } = supabase.storage
        .from('test-recordings')
        .getPublicUrl(filename)

      console.log('Generated public URL:', publicUrl)
      setVideoUrl(publicUrl)

      // Log the state after setting
      console.log('Video URL state set to:', publicUrl)
      
      toast({
        title: 'Success',
        description: 'Recording uploaded successfully',
      })
    } catch (error) {
      console.error('Failed to upload recording:', error)
      toast({
        title: 'Error',
        description: error instanceof Error ? error.message : 'Failed to upload recording. Please try again.',
        variant: 'destructive',
      })
    } finally {
      setIsUploading(false)
    }
  }

  const handleFileComplete = (url: string) => {
    setFileUrl(url)
  }

  const handleSubmit = async (status: 'Working' | 'Needs Fixing') => {
    if (!currentTest) {
      toast({
        title: 'Error',
        description: 'No test selected.',
        variant: 'destructive',
      })
      return
    }

    if (!videoUrl && !fileUrl) {
      toast({
        title: 'Error',
        description: 'Please record a video or upload a file before submitting.',
        variant: 'destructive',
      })
      return
    }

    console.log('Submitting validation with:', {
      ticketId: currentTest.id,
      featureId: currentTest.testing_ticket.feature.id,
      status,
      videoUrl,
      notes,
    })

    try {
      const result = await submitValidation({
        ticketId: currentTest.id,
        featureId: currentTest.testing_ticket.feature.id,
        status,
        videoUrl: videoUrl || fileUrl, // Use whichever URL is available
        notes,
      })

      console.log('Validation submission result:', result)

      toast({
        title: 'Success',
        description: 'Validation submitted successfully',
      })

      navigate('/testing')
    } catch (error) {
      console.error('Failed to submit validation:', error)
      
      let errorMessage = 'Failed to submit validation. Please try again.'
      if (error instanceof Error) {
        // Check for specific error types
        if (error.message.includes('401')) {
          errorMessage = 'Your session has expired. Please log in again.'
        } else if (error.message.includes('403')) {
          errorMessage = 'You do not have permission to submit this validation.'
        }
      }
      
      toast({
        title: 'Error',
        description: errorMessage,
        variant: 'destructive',
      })
    }
  }

  if (!currentTest || !id) {
    return (
      <div className="container mx-auto py-8">
        <Card className="p-6">
          <p className="text-center text-gray-500">No test selected</p>
        </Card>
      </div>
    )
  }

  return (
    <div className="container mx-auto py-8">
      <div className="mb-8 flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold">{currentTest.title}</h1>
          <p className="text-gray-500 mt-2">Testing {currentTest.testing_ticket.feature.name}</p>
        </div>
        <Button variant="outline" onClick={() => navigate('/testing')}>
          Back to Dashboard
        </Button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Left Column - Feature Details & Notes */}
        <div className="space-y-6">
          <Card className="p-6">
            <h2 className="text-xl font-semibold mb-4">Feature Details</h2>
            <div className="space-y-4">
              <div>
                <h3 className="font-medium text-gray-700">Description</h3>
                <p className="mt-1 text-gray-600">{currentTest.description}</p>
              </div>
              <div>
                <h3 className="font-medium text-gray-700">Project Details</h3>
                <div className="mt-1 space-y-1 text-gray-600">
                  <p>Project: {currentTest.testing_ticket.feature.project.name}</p>
                  <p>Student: {currentTest.testing_ticket.feature.project.student.name}</p>
                  <p>Assigned by: {currentTest.created_by_user.name}</p>
                </div>
              </div>
              <div>
                <h3 className="font-medium text-gray-700">Deadline</h3>
                <p className="mt-1 text-gray-600">
                  {new Date(currentTest.testing_ticket.deadline).toLocaleDateString()}
                </p>
              </div>
            </div>
          </Card>

          <Card className="p-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-semibold">Validation History</h2>
              <div className="flex items-center gap-2">
                <p className="text-gray-600">
                  {currentTest.testing_ticket.feature.validations.length > 0 
                    ? "Previous Validations"
                    : "No Previous Validations"
                  }
                </p>
                <span className="text-sm text-gray-500">
                  ({currentTest.testing_ticket.feature.current_validations} of {currentTest.testing_ticket.feature.required_validations} required)
                </span>
              </div>
            </div>
            
            {currentTest.testing_ticket.feature.validations.length > 0 ? (
              <div className="space-y-4">
                {currentTest.testing_ticket.feature.validations.map((validation) => (
                  <div key={validation.id} className="p-4 bg-gray-50 rounded-lg">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-2">
                        <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${
                          validation.status === 'Working' 
                            ? 'bg-green-100 text-green-800'
                            : 'bg-red-100 text-red-800'
                        }`}>
                          {validation.status}
                        </span>
                        <span className="text-gray-700">by {validation.validated_by.name}</span>
                      </div>
                      {validation.video_url && (
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => setSelectedVideo(validation.video_url)}
                          className="text-blue-600 hover:text-blue-800"
                        >
                          <Play className="h-4 w-4 mr-2" />
                          View Recording
                        </Button>
                      )}
                    </div>
                    {validation.notes && (
                      <p className="mt-2 text-gray-600">{validation.notes}</p>
                    )}
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-center text-gray-500 py-4">No validation history available</p>
            )}
          </Card>

          {/* Comments Section */}
          <Card className="p-6">
            <Comments featureId={currentTest.testing_ticket.feature.id} />
          </Card>
        </div>

        {/* Right Column - Testing Interface */}
        <div className="space-y-6">
          <Card className="p-6">
            <h2 className="text-xl font-semibold mb-4">Submit Validation</h2>
            <div className="space-y-4">
              {(videoUrl || fileUrl) ? (
                <div className="bg-green-50 text-green-700 p-4 rounded-lg">
                  {videoUrl ? 'Recording' : 'File'} uploaded successfully
                </div>
              ) : (
                <div className="bg-yellow-50 text-yellow-700 p-4 rounded-lg">
                  Please record a video or upload a file before submitting
                </div>
              )}

              <div className="flex gap-4">
                <Button
                  onClick={() => handleSubmit('Working')}
                  className="flex-1"
                  disabled={isLoading || isUploading || (!videoUrl && !fileUrl)}
                >
                  Mark as Working
                </Button>
                <Button
                  onClick={() => handleSubmit('Needs Fixing')}
                  variant="destructive"
                  className="flex-1"
                  disabled={isLoading || isUploading || (!videoUrl && !fileUrl)}
                >
                  Mark as Needs Fixing
                </Button>
              </div>
            </div>
          </Card>

          <Card className="p-6">
            <h2 className="text-xl font-semibold mb-4">Test Notes</h2>
            <Textarea
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="Enter your test notes here..."
              className="min-h-[200px]"
            />
          </Card>
          
          <ScreenRecorder
            onRecordingComplete={handleRecordingComplete}
            maxDuration={120} // 2 minutes max
          />
          
          <FileUploader
            onFileComplete={handleFileComplete}
            maxSize={10} // 10MB max
          />

          <EmbeddedBrowser 
            onRecordingComplete={handleRecordingComplete}
          />
        </div>
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
    </div>
  )
}

export default TestingSession 