interface MessageProps {
  children: React.ReactNode
}

export function Message({ children }: MessageProps) {
  return (
    <p className="text-sm mb-2 py-2">{children}</p>
  )
} 