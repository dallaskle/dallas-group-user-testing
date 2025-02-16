import { useState, useRef, useCallback } from 'react'
import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Video, StopCircle, RefreshCcw } from 'lucide-react'
import { useToast } from '@/components/ui/use-toast'

interface ScreenRecorderProps {
  onRecordingComplete: (videoBlob: Blob) => void
  maxDuration?: number // in seconds
}

export const ScreenRecorder = ({ onRecordingComplete, maxDuration = 120 }: ScreenRecorderProps) => {
  const [isRecording, setIsRecording] = useState(false)
  const [recordingTime, setRecordingTime] = useState(0)
  const [previewUrl, setPreviewUrl] = useState<string | null>(null)
  const mediaRecorderRef = useRef<MediaRecorder | null>(null)
  const chunksRef = useRef<Blob[]>([])
  const timerRef = useRef<NodeJS.Timeout>()
  const { toast } = useToast()

  const startRecording = useCallback(async () => {
    // Clear previous preview
    if (previewUrl) {
      URL.revokeObjectURL(previewUrl)
      setPreviewUrl(null)
    }

    try {
      const stream = await navigator.mediaDevices.getDisplayMedia({
        video: true,
        audio: false
      })

      // Handle user cancelling screen share
      stream.getVideoTracks()[0].onended = () => {
        if (mediaRecorderRef.current?.state === 'recording') {
          stopRecording()
        }
      }

      const mediaRecorder = new MediaRecorder(stream)
      mediaRecorderRef.current = mediaRecorder
      chunksRef.current = []

      mediaRecorder.ondataavailable = (event) => {
        if (event.data.size > 0) {
          chunksRef.current.push(event.data)
        }
      }

      mediaRecorder.onstop = () => {
        if (chunksRef.current.length === 0) {
          toast({
            title: 'Recording cancelled',
            description: 'No video data was recorded.',
            variant: 'default',
          })
          return
        }

        const blob = new Blob(chunksRef.current, {
          type: 'video/webm'
        })
        
        // Create preview URL
        const url = URL.createObjectURL(blob)
        setPreviewUrl(url)
        
        onRecordingComplete(blob)
        stream.getTracks().forEach(track => track.stop())
        setIsRecording(false)
        setRecordingTime(0)
        if (timerRef.current) {
          clearInterval(timerRef.current)
        }
      }

      mediaRecorder.start()
      setIsRecording(true)

      // Start timer
      timerRef.current = setInterval(() => {
        setRecordingTime(prev => {
          if (prev >= maxDuration) {
            stopRecording()
            return prev
          }
          return prev + 1
        })
      }, 1000)

      // Auto stop after maxDuration
      setTimeout(() => {
        if (mediaRecorderRef.current?.state === 'recording') {
          stopRecording()
        }
      }, maxDuration * 1000)

    } catch (error) {
      if (error instanceof Error) {
        const message = error.name === 'NotAllowedError' 
          ? 'Permission to record screen was denied.'
          : 'Failed to start screen recording. Please try again.'
        
        toast({
          title: 'Error',
          description: message,
          variant: 'destructive',
        })
      }
      console.error('Failed to start recording:', error)
    }
  }, [maxDuration, onRecordingComplete, toast, previewUrl])

  const stopRecording = () => {
    if (mediaRecorderRef.current?.state === 'recording') {
      mediaRecorderRef.current.stop()
    }
    if (timerRef.current) {
      clearInterval(timerRef.current)
    }
  }

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60)
    const secs = seconds % 60
    return `${mins}:${secs.toString().padStart(2, '0')}`
  }

  return (
    <Card className="p-4">
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="text-lg font-semibold">Screen Recording</h3>
          {isRecording && (
            <div className="flex items-center gap-2">
              <div className="h-2 w-2 rounded-full bg-red-500 animate-pulse" />
              <span className="text-sm font-medium">{formatTime(recordingTime)}</span>
            </div>
          )}
        </div>

        {previewUrl && (
          <div className="relative aspect-video w-full bg-black rounded-lg overflow-hidden">
            <video 
              src={previewUrl} 
              controls 
              className="w-full h-full"
              preload="metadata"
            />
          </div>
        )}

        <div className="flex justify-center gap-4">
          {!isRecording ? (
            <Button
              onClick={startRecording}
              className="gap-2"
            >
              {previewUrl ? (
                <>
                  <RefreshCcw className="h-4 w-4" />
                  Record Again
                </>
              ) : (
                <>
                  <Video className="h-4 w-4" />
                  Start Recording
                </>
              )}
            </Button>
          ) : (
            <Button
              onClick={stopRecording}
              variant="destructive"
              className="gap-2"
            >
              <StopCircle className="h-4 w-4" />
              Stop Recording
            </Button>
          )}
        </div>

        <div className="text-xs text-gray-500 text-center">
          {isRecording ? (
            <>Recording will automatically stop after {formatTime(maxDuration)}</>
          ) : (
            <>Click start to begin recording your screen</>
          )}
        </div>
      </div>
    </Card>
  )
} 