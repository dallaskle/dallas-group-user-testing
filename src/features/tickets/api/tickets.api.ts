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
    const { data, error } = await supabase.functions.invoke(`${FUNCTION_PREFIX}tickets-create`, {
      body: request,
    })

    if (error) throw error
    return data
  },

  update: async (request: UpdateTicketRequest): Promise<TicketResponse> => {
    const { data, error } = await supabase.functions.invoke(`${FUNCTION_PREFIX}tickets-update`, {
      body: request,
    })

    if (error) throw error
    return data
  },

  list: async (request: ListTicketsRequest): Promise<ListTicketsResponse> => {
    const { data, error } = await supabase.functions.invoke(`${FUNCTION_PREFIX}tickets-list`, {
      body: request,
    })

    if (error) throw error
    return data
  },

  getById: async (id: string): Promise<TicketResponse> => {
    const { data, error } = await supabase.functions.invoke(`${FUNCTION_PREFIX}tickets-get`, {
      body: { id },
    })

    if (error) throw error
    return data
  },

  assign: async (id: string, assignedTo: string | null): Promise<TicketResponse> => {
    const { data, error } = await supabase.functions.invoke(`${FUNCTION_PREFIX}tickets-assign`, {
      body: { id, assignedTo },
    })

    if (error) throw error
    return data
  },

  transition: async (id: string, status: string): Promise<TicketResponse> => {
    const { data, error } = await supabase.functions.invoke(`${FUNCTION_PREFIX}tickets-transition`, {
      body: { id, status },
    })

    if (error) throw error
    return data
  },
} 