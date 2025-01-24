export interface Step {
  title: string
  description: string
}

export const STEPS: Step[] = [
  {
    title: 'Ticket Type & Basic Info',
    description: 'Select the type of ticket and provide basic information'
  },
  {
    title: 'Additional Details',
    description: 'Provide type-specific details for your ticket'
  },
  {
    title: 'Assignment & Review',
    description: 'Assign the ticket and review all information'
  }
] 