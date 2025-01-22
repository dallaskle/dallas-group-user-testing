import { useState, useRef } from 'react'
import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Upload, X, Video } from 'lucide-react'
import { useToast } from '@/components/ui/use-toast'
import { supabase } from '@/lib/supabase'

interface FileUploaderProps {
  onFileComplete: (fileUrl: string) => void
  maxSize?: number // in MB
}

export const FileUploader = ({ onFileComplete, maxSize = 100 }: FileUploaderProps) => {
  const [isUploading, setIsUploading] = useState(false)
  const [previewUrl, setPreviewUrl] = useState<string | null>(null)
  const [fileName, setFileName] = useState<string | null>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)
  const { toast } = useToast()

  const handleFileSelect = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (!file) return

    // Check file size
    if (file.size > maxSize * 1024 * 1024) {
      toast({
        title: 'Error',
        description: `File size must be less than ${maxSize}MB`,
        variant: 'destructive',
      })
      return
    }

    // Validate file type
    if (!file.type.startsWith('video/')) {
      toast({
        title: 'Error',
        description: 'Please select a video file',
        variant: 'destructive',
      })
      return
    }

    try {
      setIsUploading(true)

      // Create a unique filename
      const filename = `${crypto.randomUUID()}-${file.name}`

      // Upload to Supabase Storage
      const { error: storageError, data } = await supabase.storage
        .from('test-recordings')
        .upload(filename, file, {
          cacheControl: '3600',
          upsert: true,
          contentType: file.type
        })

      if (storageError) throw storageError

      // Get public URL
      const { data: { publicUrl } } = supabase.storage
        .from('test-recordings')
        .getPublicUrl(filename)

      setPreviewUrl(publicUrl)
      setFileName(file.name)
      onFileComplete(publicUrl)

      toast({
        title: 'Success',
        description: 'Video uploaded successfully',
      })
    } catch (error) {
      console.error('Failed to upload video:', error)
      toast({
        title: 'Error',
        description: 'Failed to upload video. Please try again.',
        variant: 'destructive',
      })
    } finally {
      setIsUploading(false)
      if (fileInputRef.current) {
        fileInputRef.current.value = ''
      }
    }
  }

  const handleRemove = () => {
    setPreviewUrl(null)
    setFileName(null)
    onFileComplete('')
  }

  return (
    <Card className="p-4">
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="text-lg font-semibold">Upload Video</h3>
          {isUploading && (
            <div className="flex items-center gap-2">
              <div className="h-2 w-2 rounded-full bg-blue-500 animate-pulse" />
              <span className="text-sm font-medium">Uploading...</span>
            </div>
          )}
        </div>

        {previewUrl && fileName ? (
          <div className="space-y-3">
            <div className="relative aspect-video w-full bg-black rounded-lg overflow-hidden">
              <video 
                src={previewUrl} 
                controls 
                className="w-full h-full"
                preload="metadata"
              />
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium truncate max-w-[200px]">
                {fileName}
              </span>
              <Button
                variant="ghost"
                size="icon"
                onClick={handleRemove}
                className="h-8 w-8"
              >
                <X className="h-4 w-4" />
              </Button>
            </div>
          </div>
        ) : (
          <div className="flex justify-center">
            <input
              type="file"
              className="hidden"
              onChange={handleFileSelect}
              ref={fileInputRef}
              accept="video/*"
            />
            <Button
              onClick={() => fileInputRef.current?.click()}
              disabled={isUploading}
              className="gap-2"
            >
              <Upload className="h-4 w-4" />
              Upload Video
            </Button>
          </div>
        )}

        <div className="text-xs text-gray-500 text-center">
          {!previewUrl && (
            <>Maximum video size: {maxSize}MB</>
          )}
        </div>
      </div>
    </Card>
  )
} 