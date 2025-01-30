import type { ReactNode } from 'react'

interface MessageProps {
  children: ReactNode
}

export function Message({ children }: MessageProps) {
  return (
    <div className="text-sm mb-2 py-2 prose prose-sm dark:prose-invert max-w-none whitespace-pre-wrap">
      {children}
    </div>
  )
} 