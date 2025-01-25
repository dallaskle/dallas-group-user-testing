import { assertEquals } from 'https://deno.land/std@0.208.0/assert/mod.ts'
import { createClient } from '@supabase/supabase-js'

// Use fixed dates for testing to avoid timing issues
const NOW = new Date('2024-02-01T12:00:00Z')
const ONE_DAY = 24 * 60 * 60 * 1000

// Mock data
const mockQueue = [
  {
    id: 'queue-1',
    type: 'testing',
    status: 'in_progress',
    created_at: new Date(NOW.getTime() - 2 * ONE_DAY).toISOString(), // 2 days ago
    updated_at: NOW.toISOString(),
    testing_ticket: {
      deadline: new Date(NOW.getTime() + 12 * 60 * 60 * 1000).toISOString(), // 12 hours from now
      feature: {
        validations: [],
        required_validations: 3,
        current_validations: 1
      }
    }
  },
  {
    id: 'queue-2',
    type: 'testing',
    status: 'open',
    created_at: new Date(NOW.getTime() - ONE_DAY).toISOString(), // 1 day ago
    updated_at: NOW.toISOString(),
    testing_ticket: {
      deadline: new Date(NOW.getTime() + 20 * 60 * 60 * 1000).toISOString(), // 20 hours from now
      feature: {
        validations: [],
        required_validations: 2,
        current_validations: 0
      }
    }
  }
]

const mockHistory = [
  {
    id: 'history-1',
    type: 'testing',
    status: 'resolved',
    created_at: new Date(NOW.getTime() - 5 * ONE_DAY).toISOString(), // 5 days ago
    updated_at: new Date(NOW.getTime() - 4 * ONE_DAY).toISOString(), // 4 days ago
    testing_ticket: {
      feature: {
        validations: [
          { status: 'Working' },
          { status: 'Working' },
          { status: 'Needs Fixing' }
        ],
        required_validations: 3,
        current_validations: 3
      }
    }
  },
  {
    id: 'history-2',
    type: 'testing',
    status: 'closed',
    created_at: new Date(NOW.getTime() - 2 * ONE_DAY).toISOString(), // 2 days ago
    updated_at: new Date(NOW.getTime() - 12 * 60 * 60 * 1000).toISOString(), // 12 hours ago
    testing_ticket: {
      feature: {
        validations: [
          { status: 'Working' },
          { status: 'Working' }
        ],
        required_validations: 2,
        current_validations: 2
      }
    }
  }
]

function calculateMetrics(queue: any[], history: any[], now = new Date()) {
  // Calculate basic metrics
  const totalAssigned = queue.length + history.length
  const testsCompleted = history.length
  const testsInProgress = queue.filter(t => t.status === 'in_progress').length

  // Calculate validation metrics
  const allValidations = history.flatMap(ticket => 
    ticket.testing_ticket.feature.validations || []
  )
  const workingValidations = allValidations.filter(v => v.status === 'Working').length
  const accuracyRate = allValidations.length > 0 
    ? (workingValidations / allValidations.length) * 100 
    : 0

  // Calculate average response time
  const responseTimes = history.map(ticket => 
    new Date(ticket.updated_at).getTime() - new Date(ticket.created_at).getTime()
  )
  const avgResponseTime = responseTimes.length > 0 
    ? responseTimes.reduce((a, b) => a + b, 0) / responseTimes.length 
    : 0

  // Calculate validation rate
  const totalRequired = history.reduce((sum, ticket) => 
    sum + (ticket.testing_ticket.feature.required_validations || 0), 0
  )
  const totalCompleted = history.reduce((sum, ticket) => 
    sum + (ticket.testing_ticket.feature.current_validations || 0), 0
  )
  const validationRate = totalRequired > 0 
    ? (totalCompleted / totalRequired) * 100 
    : 0

  // Calculate upcoming deadlines (next 24 hours)
  const upcomingDeadlines = queue.filter(ticket => {
    const deadline = new Date(ticket.testing_ticket.deadline)
    const timeDiff = deadline.getTime() - now.getTime()
    return timeDiff <= 24 * 60 * 60 * 1000 && timeDiff > 0
  }).length

  return {
    totalAssigned,
    testsCompleted,
    testsInProgress,
    accuracyRate,
    avgResponseTime,
    validationRate,
    upcomingDeadlines
  }
}

Deno.test('Metrics Calculation', async (t) => {
  await t.step('should calculate metrics for all time', () => {
    const metrics = calculateMetrics(mockQueue, mockHistory, NOW)

    assertEquals(metrics.totalAssigned, 4) // 2 in queue + 2 in history
    assertEquals(metrics.testsCompleted, 2) // 2 in history
    assertEquals(metrics.testsInProgress, 1) // 1 in queue with status 'in_progress'
    assertEquals(metrics.accuracyRate, 80) // 4 Working out of 5 total validations
    assertEquals(metrics.upcomingDeadlines, 2) // 2 tickets with deadlines in next 24h
    assertEquals(metrics.validationRate, 100) // All required validations completed in history
  })

  await t.step('should calculate metrics for last 24 hours', () => {
    const oneDayAgo = new Date(NOW.getTime() - ONE_DAY)
    
    const recentHistory = mockHistory.filter(ticket => 
      new Date(ticket.updated_at) > oneDayAgo
    )

    const metrics = calculateMetrics(mockQueue, recentHistory, NOW)
    assertEquals(metrics.testsCompleted, 1) // Only history-2 was completed in last 24h
    assertEquals(metrics.accuracyRate, 100) // Both validations in history-2 are Working
  })

  await t.step('should handle empty data', () => {
    const metrics = calculateMetrics([], [], NOW)
    
    assertEquals(metrics.totalAssigned, 0)
    assertEquals(metrics.testsCompleted, 0)
    assertEquals(metrics.testsInProgress, 0)
    assertEquals(metrics.accuracyRate, 0)
    assertEquals(metrics.validationRate, 0)
    assertEquals(metrics.upcomingDeadlines, 0)
  })
})
