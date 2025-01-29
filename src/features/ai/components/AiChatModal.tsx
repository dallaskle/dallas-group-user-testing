import { Dialog, DialogContent } from '@/components/ui/dialog'
import { StudentAiChat } from './StudentAiChat'

interface AiChatModalProps {
  isOpen: boolean
  onClose: () => void
}

export function AiChatModal({ isOpen, onClose }: AiChatModalProps) {
  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl h-[80vh]">
        <StudentAiChat />
      </DialogContent>
    </Dialog>
  )
} 