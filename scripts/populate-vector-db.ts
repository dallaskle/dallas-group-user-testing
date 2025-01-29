#!/usr/bin/env node

import { createClient } from '@supabase/supabase-js'
import { OpenAI } from 'openai'
import * as dotenv from 'dotenv'
import pLimit from 'p-limit'
import { fileURLToPath } from 'url'
import { dirname } from 'path'
import type { Database } from '../src/database.types'

// Load environment variables
dotenv.config()

const __filename = fileURLToPath(import.meta.url)
const __dirname = dirname(__filename)

const supabase = createClient<Database>(
  process.env.VITE_SUPABASE_URL!,
  process.env.VITE_SUPABASE_ANON_KEY!
)

type Project = Database['public']['Tables']['projects']['Row']
type Feature = Database['public']['Tables']['features']['Row']
type ProjectRegistry = Database['public']['Tables']['project_registry']['Row']
type Ticket = Database['public']['Tables']['tickets']['Row']
type TestingTicket = Database['public']['Tables']['testing_tickets']['Row']
type SupportTicket = Database['public']['Tables']['support_tickets']['Row']
type Validation = Database['public']['Tables']['validations']['Row']
type Comment = Database['public']['Tables']['comments']['Row']

interface ProjectWithFeatures extends Project {
  features: Feature[]
  registry: ProjectRegistry
}

interface TicketWithDetails extends Ticket {
  testing_tickets: TestingTicket[]
  support_tickets: SupportTicket[]
}

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
})

// Rate limiting: 5 concurrent requests
const limit = pLimit(5)

// Retry logic
async function retry<T>(
  fn: () => Promise<T>,
  retries = 3,
  delay = 1000
): Promise<T> {
  try {
    return await fn()
  } catch (error) {
    if (retries === 0) throw error
    await new Promise(resolve => setTimeout(resolve, delay))
    return retry(fn, retries - 1, delay * 2)
  }
}

async function getEmbedding(text: string) {
  return retry(async () => {
    const response = await openai.embeddings.create({
      model: 'text-embedding-ada-002',
      input: text,
    })
    return response.data[0].embedding
  })
}

interface ProcessStats {
  total: number
  processed: number
  failed: number
}

async function processInBatches<T extends { id: string }>(
  items: T[],
  batchSize: number,
  processor: (item: T) => Promise<void>,
  stats: ProcessStats
) {
  for (let i = 0; i < items.length; i += batchSize) {
    const batch = items.slice(i, i + batchSize)
    console.log(`Processing batch ${Math.floor(i / batchSize) + 1} of ${Math.ceil(items.length / batchSize)}`)
    await Promise.all(
      batch.map(item =>
        limit(async () => {
          try {
            console.log(`Processing item with ID: ${item.id}`)
            await processor(item)
            stats.processed++
            console.log(`Successfully processed item with ID: ${item.id}`)
            console.log(`Progress: ${stats.processed}/${stats.total} (${Math.round((stats.processed/stats.total)*100)}%)`)
          } catch (error) {
            stats.failed++
            console.error(`Failed to process item with ID: ${item.id}`, error)
          }
        })
      )
    )
  }
}

async function populateVectorDB() {
  console.log('Starting vector DB population...')
  
  try {
    // 1. Projects and Features
    console.log('Processing projects and features...')
    const { data: projects, error: projectsError } = await supabase
      .from('projects')
      .select(`
        *,
        registry:project_registry(*),
        features(*)
      `) as { data: ProjectWithFeatures[] | null, error: any }

    if (projectsError) throw new Error(`Failed to fetch projects: ${projectsError.message}`)
    if (!projects) throw new Error('No projects found')

    const projectStats: ProcessStats = {
      total: projects.length,
      processed: 0,
      failed: 0
    }

    await processInBatches(
      projects,
      5,
      async (project: ProjectWithFeatures) => {
        // Project embedding
        const projectContent = JSON.stringify({
          id: project.id,
          name: project.name,
          description: project.registry?.description || '',
          type: 'project'
        })
        
        const { error: insertError } = await supabase.from('ai_docs').insert({
          embedding: await getEmbedding(projectContent),
          doc_type: 'project',
          content: projectContent,
          project_id: project.id,
          metadata: {
            student_id: project.student_id,
            registry_id: project.project_registry_id
          }
        })

        if (insertError) throw new Error(`Failed to insert project doc: ${insertError.message}`)

        // Feature embeddings
        if (project.features) {
          const featureStats: ProcessStats = {
            total: project.features.length,
            processed: 0,
            failed: 0
          }

          await processInBatches(
            project.features,
            10,
            async (feature: Feature) => {
              const featureContent = JSON.stringify({
                id: feature.id,
                name: feature.name,
                description: feature.description,
                status: feature.status,
                type: 'feature'
              })

              const { error: featureInsertError } = await supabase.from('ai_docs').insert({
                embedding: await getEmbedding(featureContent),
                doc_type: 'feature',
                content: featureContent,
                project_id: project.id,
                feature_id: feature.id
              })

              if (featureInsertError) throw new Error(`Failed to insert feature doc: ${featureInsertError.message}`)
            },
            featureStats
          )
        }
      },
      projectStats
    )

    // 2. Tickets
    console.log('Processing tickets...')
    const { data: tickets, error: ticketsError } = await supabase
      .from('tickets')
      .select(`
        *,
        testing_tickets(*),
        support_tickets(*)
      `) as { data: TicketWithDetails[] | null, error: any }

    if (ticketsError) throw new Error(`Failed to fetch tickets: ${ticketsError.message}`)
    if (!tickets) throw new Error('No tickets found')

    const ticketStats: ProcessStats = {
      total: tickets.length,
      processed: 0,
      failed: 0
    }

    await processInBatches(
      tickets,
      10,
      async (ticket: TicketWithDetails) => {
        const ticketContent = JSON.stringify({
          id: ticket.id,
          type: ticket.type,
          title: ticket.title,
          description: ticket.description,
          status: ticket.status,
          priority: ticket.priority
        })

        const { error: insertError } = await supabase.from('ai_docs').insert({
          embedding: await getEmbedding(ticketContent),
          doc_type: 'ticket',
          content: ticketContent,
          ticket_id: ticket.id,
          project_id: ticket.support_tickets?.[0]?.project_id,
          feature_id: ticket.support_tickets?.[0]?.feature_id || ticket.testing_tickets?.[0]?.feature_id
        })

        if (insertError) throw new Error(`Failed to insert ticket doc: ${insertError.message}`)
      },
      ticketStats
    )

    // 3. Validations
    console.log('Processing validations...')
    const { data: validations, error: validationsError } = await supabase
      .from('validations')
      .select('*') as { data: Validation[] | null, error: any }

    if (validationsError) throw new Error(`Failed to fetch validations: ${validationsError.message}`)
    if (!validations) throw new Error('No validations found')

    const validationStats: ProcessStats = {
      total: validations.length,
      processed: 0,
      failed: 0
    }

    await processInBatches(
      validations,
      10,
      async (validation: Validation) => {
        const validationContent = JSON.stringify({
          id: validation.id,
          status: validation.status,
          notes: validation.notes,
          type: 'validation'
        })

        const { error: insertError } = await supabase.from('ai_docs').insert({
          embedding: await getEmbedding(validationContent),
          doc_type: 'validation',
          content: validationContent,
          validation_id: validation.id,
          feature_id: validation.feature_id
        })

        if (insertError) throw new Error(`Failed to insert validation doc: ${insertError.message}`)
      },
      validationStats
    )

    // 4. Comments
    console.log('Processing comments...')
    const { data: comments, error: commentsError } = await supabase
      .from('comments')
      .select('*') as { data: Comment[] | null, error: any }

    if (commentsError) throw new Error(`Failed to fetch comments: ${commentsError.message}`)
    if (!comments) throw new Error('No comments found')

    const commentStats: ProcessStats = {
      total: comments.length,
      processed: 0,
      failed: 0
    }

    await processInBatches(
      comments,
      10,
      async (comment: Comment) => {
        const { error: insertError } = await supabase.from('ai_docs').insert({
          embedding: await getEmbedding(comment.content),
          doc_type: 'comment',
          content: comment.content,
          feature_id: comment.feature_id,
          metadata: {
            author_id: comment.author_id
          }
        })

        if (insertError) throw new Error(`Failed to insert comment doc: ${insertError.message}`)
      },
      commentStats
    )

    console.log('Vector DB population completed successfully!')
  } catch (error) {
    console.error('Failed to populate vector DB:', error)
    throw error
  }
}

populateVectorDB()
  .then(() => {
    console.log('Script completed successfully')
    process.exit(0)
  })
  .catch((error) => {
    console.error('Script failed:', error)
    process.exit(1)
  })