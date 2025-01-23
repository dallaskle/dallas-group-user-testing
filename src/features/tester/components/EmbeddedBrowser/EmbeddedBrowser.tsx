import { useState, useEffect, useRef } from 'react'
import { Card } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { RefreshCw, ArrowLeft, ArrowRight, Globe, Video, StopCircle, X } from 'lucide-react'
import { useToast } from '@/components/ui/use-toast'

interface EmbeddedBrowserProps {
  initialUrl?: string
  onUrlChange?: (url: string) => void
  onRecordingComplete?: (videoBlob: Blob) => void
}

export const EmbeddedBrowser = ({ 
  initialUrl = '', 
  onUrlChange,
  onRecordingComplete 
}: EmbeddedBrowserProps) => {
  const [inputUrl, setInputUrl] = useState(initialUrl)
  const [currentUrl, setCurrentUrl] = useState('')
  const [iframeKey, setIframeKey] = useState(0)
  const [history, setHistory] = useState<string[]>([])
  const [historyIndex, setHistoryIndex] = useState(-1)
  const [isOpen, setIsOpen] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [loadError, setLoadError] = useState<string | null>(null)
  const [isRecording, setIsRecording] = useState(false)
  const [recordingTime, setRecordingTime] = useState(0)
  const [previewUrl, setPreviewUrl] = useState<string | null>(null)
  const mediaRecorderRef = useRef<MediaRecorder | null>(null)
  const chunksRef = useRef<Blob[]>([])
  const timerRef = useRef<NodeJS.Timeout>()
  const iframeRef = useRef<HTMLIFrameElement>(null)
  const { toast } = useToast()

  // Close modal on escape key
  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        setIsOpen(false)
      }
    }
    window.addEventListener('keydown', handleEscape)
    return () => window.removeEventListener('keydown', handleEscape)
  }, [])

  const isSameOrigin = (urlToCheck: string) => {
    try {
      const currentOrigin = window.location.origin
      const urlOrigin = new URL(urlToCheck).origin
      return currentOrigin === urlOrigin
    } catch {
      return false
    }
  }

  const handleUrlChange = (newUrl: string) => {
    setInputUrl(newUrl)
  }

  const handleNavigate = () => {
    if (!inputUrl) return
    
    try {
      // Validate URL format
      let urlToNavigate = inputUrl
      if (!inputUrl.match(/^https?:\/\//i)) {
        // Check if it's a valid domain format
        if (!inputUrl.match(/^[a-zA-Z0-9][a-zA-Z0-9-]{1,61}[a-zA-Z0-9]\.[a-zA-Z]{2,}/) && !inputUrl.match(/^(?:[0-9]{1,3}\.){3}[0-9]{1,3}$/)) {
          toast({
            title: "Invalid URL",
            description: "Please enter a valid domain (e.g., example.com)",
            variant: "destructive"
          })
          return
        }
        urlToNavigate = `https://${inputUrl}`
      }

      // Validate URL parsing
      const parsedUrl = new URL(urlToNavigate)
      
      // Check for localhost or IP-based URLs
      if (
        parsedUrl.hostname === 'localhost' ||
        parsedUrl.hostname === '127.0.0.1' ||
        parsedUrl.hostname.startsWith('192.168.') ||
        parsedUrl.hostname.startsWith('10.') ||
        parsedUrl.hostname.startsWith('172.')
      ) {
        toast({
          title: "Cannot load local URLs",
          description: "For security reasons, you cannot load localhost or local network URLs.",
          variant: "destructive"
        })
        return
      }

      // Check if URL is same origin
      if (isSameOrigin(urlToNavigate)) {
        toast({
          title: "Cannot load this URL",
          description: "For security reasons, you cannot load pages from the same origin in the embedded browser.",
          variant: "destructive"
        })
        return
      }

      // Update the current URL and history only after validation
      setCurrentUrl(urlToNavigate)
      setHistory(prev => [...prev.slice(0, historyIndex + 1), urlToNavigate])
      setHistoryIndex(prev => prev + 1)
      setIframeKey(prev => prev + 1)
      setIsLoading(true)
      onUrlChange?.(urlToNavigate)
    } catch (error) {
      console.error('Invalid URL:', inputUrl)
      toast({
        title: "Invalid URL",
        description: "Please enter a valid URL (e.g., example.com)",
        variant: "destructive"
      })
    }
  }

  const handleBack = () => {
    if (historyIndex > 0) {
      setHistoryIndex(prev => prev - 1)
      const previousUrl = history[historyIndex - 1]
      setInputUrl(previousUrl)
      setCurrentUrl(previousUrl)
      onUrlChange?.(previousUrl)
      setIsLoading(true)
    }
  }

  const handleForward = () => {
    if (historyIndex < history.length - 1) {
      setHistoryIndex(prev => prev + 1)
      const nextUrl = history[historyIndex + 1]
      setInputUrl(nextUrl)
      setCurrentUrl(nextUrl)
      onUrlChange?.(nextUrl)
      setIsLoading(true)
    }
  }

  const handleRefresh = () => {
    if (!currentUrl) return
    
    if (isSameOrigin(currentUrl)) {
      toast({
        title: "Cannot refresh",
        description: "For security reasons, you cannot load pages from the same origin in the embedded browser.",
        variant: "destructive"
      })
      return
    }
    setIframeKey(prev => prev + 1)
    setIsLoading(true)
  }

  const handleIframeLoad = (event: React.SyntheticEvent<HTMLIFrameElement>) => {
    setIsLoading(false)
    setLoadError(null)

    // Try to access iframe content to check if it loaded
    try {
      // This will throw an error if the site can't be embedded
      const iframeWindow = (event.target as HTMLIFrameElement).contentWindow
      if (!iframeWindow) {
        throw new Error('Cannot access iframe content')
      }
    } catch (error) {
      setLoadError('This website cannot be embedded due to security restrictions (X-Frame-Options).')
    }
  }

  const startRecording = async () => {
    // Clear previous preview
    if (previewUrl) {
      URL.revokeObjectURL(previewUrl)
      setPreviewUrl(null)
    }

    try {
      // Get the iframe element
      const iframe = iframeRef.current
      if (!iframe) {
        throw new Error('Browser window not found')
      }

      // Request screen capture specifically targeting the iframe
      const stream = await navigator.mediaDevices.getDisplayMedia({
        video: {
          displaySurface: 'browser',
        },
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

        // Send recording to parent and close browser
        onRecordingComplete?.(blob)
        setIsOpen(false)
        
        stream.getTracks().forEach(track => track.stop())
        setIsRecording(false)
        setRecordingTime(0)
        if (timerRef.current) {
          clearInterval(timerRef.current)
        }

        toast({
          title: 'Success',
          description: 'Recording completed successfully. You can now submit it for validation.',
        })
      }

      mediaRecorder.start()
      setIsRecording(true)

      // Start timer
      timerRef.current = setInterval(() => {
        setRecordingTime(prev => prev + 1)
      }, 1000)

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
  }

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

  const clearPreview = () => {
    if (previewUrl) {
      URL.revokeObjectURL(previewUrl)
      setPreviewUrl(null)
    }
  }

  return (
    <>
      <Card className="p-4">
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-semibold">Embedded Browser</h3>
          </div>

          <div className="flex justify-center">
            <Button
              onClick={() => setIsOpen(true)}
              className="gap-2"
            >
              <Globe className="h-4 w-4" />
              Open Browser
            </Button>
          </div>

          {previewUrl && (
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <h4 className="text-sm font-medium">Last Recording</h4>
                <div className="flex items-center gap-2">
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={clearPreview}
                    className="h-8 w-8"
                  >
                    <X className="h-4 w-4" />
                  </Button>
                </div>
              </div>
              <div className="relative aspect-video w-full bg-black rounded-lg overflow-hidden">
                <video 
                  src={previewUrl} 
                  controls 
                  className="w-full h-full"
                  preload="metadata"
                />
              </div>
              <div className="text-sm text-gray-600 text-center">
                This recording is ready to be submitted for validation
              </div>
            </div>
          )}

          <div className="text-xs text-gray-500 text-center">
            {previewUrl ? (
              <>Your recording is ready. Open browser to record again.</>
            ) : (
              <>Click to open the embedded browser for testing</>
            )}
          </div>
        </div>
      </Card>

      {isOpen && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center">
          <div className="bg-white rounded-lg w-[95vw] h-[90vh] flex flex-col">
            <div className="p-2 border-b flex items-center gap-2">
              <Button
                variant="ghost"
                size="icon"
                onClick={handleBack}
                disabled={historyIndex <= 0}
              >
                <ArrowLeft className="h-4 w-4" />
              </Button>
              <Button
                variant="ghost"
                size="icon"
                onClick={handleForward}
                disabled={historyIndex >= history.length - 1}
              >
                <ArrowRight className="h-4 w-4" />
              </Button>
              <Button
                variant="ghost"
                size="icon"
                onClick={handleRefresh}
                disabled={!currentUrl}
              >
                <RefreshCw className={`h-4 w-4 ${isLoading ? 'animate-spin' : ''}`} />
              </Button>
              <div className="flex-1 flex items-center gap-2">
                <Input
                  type="url"
                  value={inputUrl}
                  onChange={(e) => handleUrlChange(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && handleNavigate()}
                  placeholder="Enter URL to test"
                  className="flex-1"
                />
                <Button onClick={handleNavigate}>Go</Button>
              </div>
              {/* Add recording button */}
              {!isRecording ? (
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={startRecording}
                  className="text-blue-600 hover:text-blue-800"
                  disabled={!currentUrl}
                >
                  <Video className="h-4 w-4" />
                </Button>
              ) : (
                <div className="flex items-center gap-2">
                  <div className="h-2 w-2 rounded-full bg-red-500 animate-pulse" />
                  <span className="text-sm font-medium">{formatTime(recordingTime)}</span>
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={stopRecording}
                    className="text-red-600 hover:text-red-800"
                  >
                    <StopCircle className="h-4 w-4" />
                  </Button>
                </div>
              )}
              <Button
                variant="ghost"
                size="icon"
                onClick={() => setIsOpen(false)}
              >
                <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="h-4 w-4">
                  <line x1="18" y1="6" x2="6" y2="18"></line>
                  <line x1="6" y1="6" x2="18" y2="18"></line>
                </svg>
              </Button>
            </div>
            <div className="flex-1 bg-white relative">
              {isLoading && (
                <div className="absolute inset-0 flex items-center justify-center bg-white bg-opacity-75">
                  <RefreshCw className="h-8 w-8 animate-spin text-gray-400" />
                </div>
              )}
              {currentUrl && !isSameOrigin(currentUrl) && (
                <>
                  <iframe
                    key={iframeKey}
                    ref={iframeRef}
                    src={currentUrl}
                    className="w-full h-full border-0"
                    title="Feature Test Browser"
                    sandbox="allow-scripts allow-forms allow-popups allow-downloads allow-same-origin allow-modals"
                    onLoad={handleIframeLoad}
                    referrerPolicy="no-referrer"
                    loading="lazy"
                  />
                  {loadError && (
                    <div className="absolute inset-0 flex flex-col items-center justify-center bg-white p-6 text-center">
                      <div className="mb-4 p-4 rounded-full bg-yellow-50">
                        <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="h-6 w-6 text-yellow-500">
                          <path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"/>
                          <line x1="12" y1="9" x2="12" y2="13"/>
                          <line x1="12" y1="17" x2="12.01" y2="17"/>
                        </svg>
                      </div>
                      <h3 className="text-lg font-semibold mb-2">Cannot Embed Website</h3>
                      <p className="text-gray-600 max-w-md">
                        {loadError}
                      </p>
                      <p className="text-sm text-gray-500 mt-4">
                        Try opening <a href={currentUrl} target="_blank" rel="noopener noreferrer" className="text-blue-500 hover:underline">the website directly</a> in a new tab instead.
                      </p>
                    </div>
                  )}
                </>
              )}
            </div>
          </div>
        </div>
      )}
    </>
  )
} 