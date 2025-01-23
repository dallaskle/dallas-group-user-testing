import { useEffect } from 'react'
import { TicketList } from './TicketList'
import { useTicketsStore } from '../../store/tickets.store'

interface ProjectTicketListProps {
  projectId: string
  className?: string
}

export function ProjectTicketList({ projectId, className }: ProjectTicketListProps) {
  const { setFilters } = useTicketsStore()

  useEffect(() => {
    setFilters({ projectId })
  }, [projectId, setFilters])

  return <TicketList className={className} />
} 