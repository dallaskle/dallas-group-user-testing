import { useEffect, useState } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Textarea } from '@/components/ui/textarea'
import { useToast } from '@/components/ui/use-toast'
import { useTesterStore } from '../store/tester.store'
import { EmbeddedBrowser } from '../components/EmbeddedBrowser/EmbeddedBrowser'
import { ScreenRecorder } from '../components/ScreenRecorder/ScreenRecorder'
import { supabase } from '@/lib/supabase'

const TestingSession = () => {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const { toast } = useToast()
  const { currentTest, claimTest, submitValidation, isLoading } = useTesterStore()
  const [notes, setNotes] = useState('')
  const [videoUrl, setVideoUrl] = useState('')
  const [isUploading, setIsUploading] = useState(false)

  useEffect(() => {
    const initializeTest = async () => {
      if (!id) return
      try {
        await claimTest(id)
      } catch (error) {
        console.error('Failed to claim test:', error)
        toast({
          title: 'Error',
          description: 'Failed to claim test. Please try again.',
          variant: 'destructive',
        })
        navigate('/testing')
      }
    }

    if (!currentTest && id) {
      initializeTest()
    }
  }, [id, currentTest, claimTest, toast, navigate])

  const handleRecordingComplete = async (videoBlob: Blob) => {
    try {
      setIsUploading(true)
      
      // Create a unique filename
      const filename = `${currentTest?.id}-${Date.now()}.webm`
      
      // Upload to Supabase Storage
      const { error } = await supabase.storage
        .from('test-recordings')
        .upload(filename, videoBlob)

      if (error) throw error

      // Get public URL
      const { data: { publicUrl } } = supabase.storage
        .from('test-recordings')
        .getPublicUrl(filename)

      setVideoUrl(publicUrl)
      toast({
        title: 'Success',
        description: 'Recording uploaded successfully',
      })
    } catch (error) {
      console.error('Failed to upload recording:', error)
      toast({
        title: 'Error',
        description: 'Failed to upload recording. Please try again.',
        variant: 'destructive',
      })
    } finally {
      setIsUploading(false)
    }
  }

  const handleSubmit = async (status: 'Working' | 'Needs Fixing') => {
    if (!currentTest || !videoUrl) {
      toast({
        title: 'Error',
        description: 'Please record and upload a video before submitting.',
        variant: 'destructive',
      })
      return
    }

    try {
      await submitValidation({
        ticketId: currentTest.id,
        featureId: currentTest.feature.id,
        status,
        videoUrl,
        notes,
      })

      toast({
        title: 'Success',
        description: 'Validation submitted successfully',
      })

      navigate('/testing')
    } catch (error) {
      console.error('Failed to submit validation:', error)
      toast({
        title: 'Error',
        description: 'Failed to submit validation. Please try again.',
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
          <p className="text-gray-500 mt-2">Testing {currentTest.feature.name}</p>
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
                <p className="mt-1 text-gray-600">{currentTest.feature.description}</p>
              </div>
              <div>
                <h3 className="font-medium text-gray-700">Test Instructions</h3>
                <p className="mt-1 text-gray-600">{currentTest.description}</p>
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
            <h2 className="text-xl font-semibold mb-4">Test Notes</h2>
            <Textarea
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="Enter your test notes here..."
              className="min-h-[200px]"
            />
          </Card>
        </div>

        {/* Right Column - Testing Interface */}
        <div className="space-y-6">
          <EmbeddedBrowser />
          
          <ScreenRecorder
            onRecordingComplete={handleRecordingComplete}
            maxDuration={120} // 2 minutes max
          />

          <Card className="p-6">
            <h2 className="text-xl font-semibold mb-4">Submit Validation</h2>
            <div className="space-y-4">
              {videoUrl ? (
                <div className="bg-green-50 text-green-700 p-4 rounded-lg">
                  Recording uploaded successfully
                </div>
              ) : (
                <div className="bg-yellow-50 text-yellow-700 p-4 rounded-lg">
                  Please record and upload a video before submitting
                </div>
              )}

              <div className="flex gap-4">
                <Button
                  onClick={() => handleSubmit('Working')}
                  className="flex-1"
                  disabled={isLoading || isUploading || !videoUrl}
                >
                  Mark as Working
                </Button>
                <Button
                  onClick={() => handleSubmit('Needs Fixing')}
                  variant="destructive"
                  className="flex-1"
                  disabled={isLoading || isUploading || !videoUrl}
                >
                  Mark as Needs Fixing
                </Button>
              </div>
            </div>
          </Card>
        </div>
      </div>
    </div>
  )
}

export default TestingSession 