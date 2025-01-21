import { useState } from 'react'
import { Card } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { RefreshCw, ArrowLeft, ArrowRight } from 'lucide-react'

interface EmbeddedBrowserProps {
  initialUrl?: string
  onUrlChange?: (url: string) => void
}

export const EmbeddedBrowser = ({ initialUrl = '', onUrlChange }: EmbeddedBrowserProps) => {
  const [url, setUrl] = useState(initialUrl)
  const [iframeKey, setIframeKey] = useState(0) // Used to force iframe refresh
  const [history, setHistory] = useState<string[]>([])
  const [historyIndex, setHistoryIndex] = useState(-1)

  const handleUrlChange = (newUrl: string) => {
    setUrl(newUrl)
    onUrlChange?.(newUrl)
  }

  const handleNavigate = () => {
    // Add to history
    setHistory(prev => [...prev.slice(0, historyIndex + 1), url])
    setHistoryIndex(prev => prev + 1)
    // Force iframe refresh
    setIframeKey(prev => prev + 1)
  }

  const handleBack = () => {
    if (historyIndex > 0) {
      setHistoryIndex(prev => prev - 1)
      const previousUrl = history[historyIndex - 1]
      setUrl(previousUrl)
      onUrlChange?.(previousUrl)
    }
  }

  const handleForward = () => {
    if (historyIndex < history.length - 1) {
      setHistoryIndex(prev => prev + 1)
      const nextUrl = history[historyIndex + 1]
      setUrl(nextUrl)
      onUrlChange?.(nextUrl)
    }
  }

  const handleRefresh = () => {
    setIframeKey(prev => prev + 1)
  }

  return (
    <Card className="w-full overflow-hidden">
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
        >
          <RefreshCw className="h-4 w-4" />
        </Button>
        <div className="flex-1 flex items-center gap-2">
          <Input
            type="url"
            value={url}
            onChange={(e) => handleUrlChange(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && handleNavigate()}
            placeholder="Enter URL to test"
            className="flex-1"
          />
          <Button onClick={handleNavigate}>Go</Button>
        </div>
      </div>
      <div className="w-full aspect-video bg-white">
        {url && (
          <iframe
            key={iframeKey}
            src={url}
            className="w-full h-full border-0"
            title="Feature Test Browser"
            sandbox="allow-same-origin allow-scripts allow-popups allow-forms"
          />
        )}
      </div>
    </Card>
  )
} 