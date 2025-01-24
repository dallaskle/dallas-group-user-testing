import { useState, useEffect } from 'react'
import { Label } from '@/components/ui/label'
import { Calendar } from '@/components/ui/calendar'
import { Button } from '@/components/ui/button'
import { format, set } from 'date-fns'
import { CalendarIcon, Clock } from 'lucide-react'
import { cn } from '@/lib/utils'
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
} from '@/components/ui/command'
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover'
import type { StepProps } from './types'

export const TypeDetailsStep = ({ formData, onFormDataChange, projects }: StepProps) => {
  

  if (formData.ticketType === 'testing') {
    return (
      <div className="space-y-6">Testing Ticket</div>
    )
  }

  if (formData.ticketType === 'support') {
    return (
      <div className="space-y-6">

      </div>
    )
  }

  return null
} 