import ReactMarkdown from 'react-markdown'
import type { Components } from 'react-markdown'

interface MessageProps {
  children: React.ReactNode
}

export function Message({ children }: MessageProps) {
  const components: Components = {
    p: ({ children }) => <p className="mb-2">{children}</p>,
    ul: ({ children }) => <ul className="list-disc pl-4 mb-2">{children}</ul>,
    li: ({ children }) => <li className="mb-1">{children}</li>,
    strong: ({ children }) => <strong className="font-semibold">{children}</strong>,
  }

  return (
    <div className="text-sm mb-2 py-2 prose prose-sm dark:prose-invert max-w-none">
      {typeof children === 'string' ? (
        <ReactMarkdown components={components}>
          {children}
        </ReactMarkdown>
      ) : (
        children
      )}
    </div>
  )
} 