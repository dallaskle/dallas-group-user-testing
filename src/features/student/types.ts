import { Database } from '@/database.types'

export type Project = Database['public']['Tables']['projects']['Row']
export type ProjectRegistry = Database['public']['Tables']['project_registry']['Row']
export type Feature = Database['public']['Tables']['features']['Row']

export interface ProjectWithRegistry extends Project {
  registry: ProjectRegistry
  features: Feature[]
  feature_count: number
  validation_count: number
} 
