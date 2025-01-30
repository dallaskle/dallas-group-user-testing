import { Dialog, DialogContent } from '@/components/ui/dialog'
import { StudentAiChat } from './StudentAiChat'

interface AiChatModalProps {
  isOpen: boolean
  onClose: () => void
}

export function AiChatModal({ isOpen, onClose }: AiChatModalProps) {
  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl h-[80vh] p-0 gap-0">
        <div className="flex flex-col h-full overflow-hidden">
          <StudentAiChat />
        </div>
      </DialogContent>
    </Dialog>
  )
} 