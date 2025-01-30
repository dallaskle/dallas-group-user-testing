import type { ReactNode } from 'react'

interface MessageProps {
  children: ReactNode
  isCompact?: boolean
}

export function Message({ children, isCompact = false }: MessageProps) {
  return (
    <div className={`text-sm mb-1 py-1 prose prose-sm dark:prose-invert max-w-none whitespace-pre-wrap ${
      isCompact ? 'text-xs leading-tight' : ''
    }`}>
      {children}
    </div>
  )
} 