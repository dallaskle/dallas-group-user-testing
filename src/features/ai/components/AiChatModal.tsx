import { Dialog, DialogContent } from '@/components/ui/dialog'
import { StudentAiChat } from './StudentAiChat'
import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Maximize2, Minimize2, X } from 'lucide-react'
import { cn } from '@/lib/utils'

interface AiChatModalProps {
  isOpen: boolean
  onClose: () => void
}

export function AiChatModal({ isOpen, onClose }: AiChatModalProps) {
  const [showCompact, setShowCompact] = useState(true)

  // Handlers for the compact modal
  const handleExpand = () => {
    setShowCompact(false)
  }

  // Handlers for the expanded modal
  const handleMinimize = () => {
    setShowCompact(true)
  }

  return (
    <>
      {/* Compact Modal - No backdrop, positioned in corner */}
      <div
        className={cn(
          "fixed right-4 top-4 w-[400px] rounded-lg shadow-lg border bg-background transition-all duration-200",
          "z-50",
          showCompact && isOpen ? "opacity-100 translate-y-0" : "opacity-0 -translate-y-2 pointer-events-none"
        )}
      >
        <div className="flex flex-col h-[400px]">
          <div className="flex justify-between items-center p-2 border-b">
            <span className="text-sm font-medium px-2">AI Assistant</span>
            <div className="flex gap-1">
              <Button
                variant="ghost"
                size="icon"
                onClick={handleExpand}
                className="h-8 w-8"
              >
                <Maximize2 className="h-4 w-4" />
              </Button>
              <Button
                variant="ghost"
                size="icon"
                onClick={onClose}
                className="h-8 w-8"
              >
                <X className="h-4 w-4" />
              </Button>
            </div>
          </div>
          <div className="flex-1 overflow-hidden">
            <StudentAiChat isCompact={true} />
          </div>
        </div>
      </div>

      {/* Expanded Modal - With backdrop, centered */}
      <Dialog 
        open={!showCompact && isOpen} 
        onOpenChange={(open) => {
          if (!open) onClose()
        }}
      >
        <DialogContent className="max-w-4xl h-[90vh] p-0 gap-0 flex flex-col">
          <div className="flex justify-between items-center p-2 border-b shrink-0">
            <span className="text-sm font-medium px-2">AI Assistant</span>
            <div className="flex gap-1">
              <Button
                variant="ghost"
                size="icon"
                onClick={handleMinimize}
                className="h-8 w-8"
              >
                <Minimize2 className="h-4 w-4" />
              </Button>
              <Button
                variant="ghost"
                size="icon"
                onClick={onClose}
                className="h-8 w-8"
              >
                <X className="h-4 w-4" />
              </Button>
            </div>
          </div>
          <div className="flex-1 min-h-0">
            <StudentAiChat isCompact={false} onNavigate={onClose} />
          </div>
        </DialogContent>
      </Dialog>
    </>
  )
} 