import { supabase } from '@/lib/supabase'
import {
  CreateTicketRequest,
  UpdateTicketRequest,
  ListTicketsRequest,
  TicketResponse,
  ListTicketsResponse,
} from './types'

const FUNCTION_PREFIX = import.meta.env.VITE_SUPABASE_FUNCTION_PREFIX || ''

export const ticketsApi = {
  create: async (request: CreateTicketRequest): Promise<TicketResponse> => {
    const session = await supabase.auth.getSession()
    if (!session.data.session?.access_token) {
      throw new Error('No active session')
    }

    const response = await fetch(
      `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/${FUNCTION_PREFIX}tickets-create`,
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${session.data.session.access_token}`,
        },
        body: JSON.stringify(request),
      }
    )

    if (!response.ok) {
      const error = await response.json()
      throw new Error(error.error || 'Failed to create ticket')
    }

    return await response.json()
  },

  update: async (request: UpdateTicketRequest): Promise<TicketResponse> => {
    const session = await supabase.auth.getSession()
    if (!session.data.session?.access_token) {
      throw new Error('No active session')
    }

    const response = await fetch(
      `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/${FUNCTION_PREFIX}tickets-update`,
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${session.data.session.access_token}`,
        },
        body: JSON.stringify(request),
      }
    )

    if (!response.ok) {
      const error = await response.json()
      throw new Error(error.error || 'Failed to update ticket')
    }

    return await response.json()
  },

  list: async (request: ListTicketsRequest): Promise<ListTicketsResponse> => {
    const session = await supabase.auth.getSession()
    if (!session.data.session?.access_token) {
      throw new Error('No active session')
    }

    const response = await fetch(
      `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/${FUNCTION_PREFIX}tickets-list`,
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${session.data.session.access_token}`,
        },
        body: JSON.stringify(request),
      }
    )

    if (!response.ok) {
      const error = await response.json()
      throw new Error(error.error || 'Failed to list tickets')
    }

    return await response.json()
  },

  getById: async (id: string): Promise<TicketResponse> => {
    const session = await supabase.auth.getSession()
    if (!session.data.session?.access_token) {
      throw new Error('No active session')
    }

    const response = await fetch(
      `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/${FUNCTION_PREFIX}tickets-get`,
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${session.data.session.access_token}`,
        },
        body: JSON.stringify({ id }),
      }
    )

    if (!response.ok) {
      const error = await response.json()
      throw new Error(error.error || 'Failed to get ticket')
    }

    return await response.json()
  },

  assign: async (id: string, assignedTo: string | null): Promise<TicketResponse> => {
    const session = await supabase.auth.getSession()
    if (!session.data.session?.access_token) {
      throw new Error('No active session')
    }

    const response = await fetch(
      `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/${FUNCTION_PREFIX}tickets-assign`,
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${session.data.session.access_token}`,
        },
        body: JSON.stringify({ id, assignedTo }),
      }
    )

    if (!response.ok) {
      const error = await response.json()
      throw new Error(error.error || 'Failed to assign ticket')
    }

    return await response.json()
  },

  transition: async (id: string, status: string): Promise<TicketResponse> => {
    const session = await supabase.auth.getSession()
    if (!session.data.session?.access_token) {
      throw new Error('No active session')
    }

    const response = await fetch(
      `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/${FUNCTION_PREFIX}tickets-transition`,
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${session.data.session.access_token}`,
        },
        body: JSON.stringify({ id, status }),
      }
    )

    if (!response.ok) {
      const error = await response.json()
      throw new Error(error.error || 'Failed to transition ticket')
    }

    return await response.json()
  },
} 