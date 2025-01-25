import { createHandler } from '../_shared/handler.ts'
import { corsHeaders } from '../_shared/cors.ts'

console.log('Hello from tester-metrics!')

export default createHandler(async (req, supabaseClient, user) => {
  const { timePeriod = 'all' } = await req.json()
  
  // Get filter date based on time period
  const now = new Date()
  const filterDate = new Date(now)
  switch (timePeriod) {
    case '1d':
      filterDate.setDate(now.getDate() - 1)
      break
    case '7d':
      filterDate.setDate(now.getDate() - 7)
      break
    case '30d':
      filterDate.setDate(now.getDate() - 30)
      break
    case 'all':
      filterDate.setFullYear(2000)
      break
  }

  // Get active queue
  const { data: queue, error: queueError } = await supabaseClient
    .from('tickets')
    .select(`
      *,
      testing_ticket:testing_tickets!inner(
        *,
        feature:features(
          *,
          validations(*)
        )
      )
    `)
    .eq('type', 'testing')
    .eq('assigned_to', user.id)
    .in('status', ['open', 'in_progress'])

  if (queueError) throw queueError

  // Get ticket history within time period
  const { data: ticketHistory, error: historyError } = await supabaseClient
    .from('tickets')
    .select(`
      *,
      testing_ticket:testing_tickets!inner(
        *,
        feature:features(
          *,
          validations(*)
        )
      )
    `)
    .eq('type', 'testing')
    .eq('assigned_to', user.id)
    .in('status', ['resolved', 'closed'])
    .gt('updated_at', filterDate.toISOString())

  if (historyError) throw historyError

  // Calculate metrics
  const totalAssigned = (queue || []).length + (ticketHistory || []).length
  const testsCompleted = (ticketHistory || []).length
  const testsInProgress = (queue || []).filter(t => t.status === 'in_progress').length

  // Calculate validation metrics
  const allValidations = (ticketHistory || []).flatMap(ticket => 
    ticket.testing_ticket.feature.validations || []
  )
  const workingValidations = allValidations.filter(v => v.status === 'Working').length
  const accuracyRate = allValidations.length > 0 
    ? (workingValidations / allValidations.length) * 100 
    : 0

  // Calculate average response time
  const responseTimes = (ticketHistory || []).map(ticket => 
    new Date(ticket.updated_at).getTime() - new Date(ticket.created_at).getTime()
  )
  const avgResponseTime = responseTimes.length > 0 
    ? responseTimes.reduce((a, b) => a + b, 0) / responseTimes.length 
    : 0

  // Calculate validation rate
  const totalRequired = (ticketHistory || []).reduce((sum, ticket) => 
    sum + (ticket.testing_ticket.feature.required_validations || 0), 0
  )
  const totalCompleted = (ticketHistory || []).reduce((sum, ticket) => 
    sum + (ticket.testing_ticket.feature.current_validations || 0), 0
  )
  const validationRate = totalRequired > 0 
    ? (totalCompleted / totalRequired) * 100 
    : 0

  // Calculate upcoming deadlines (next 24 hours)
  const upcomingDeadlines = (queue || []).filter(ticket => {
    const deadline = new Date(ticket.testing_ticket.deadline)
    const timeDiff = deadline.getTime() - now.getTime()
    return timeDiff <= 24 * 60 * 60 * 1000 && timeDiff > 0
  }).length

  const metrics = {
    totalAssigned,
    testsCompleted,
    testsInProgress,
    accuracyRate,
    avgResponseTime,
    validationRate,
    upcomingDeadlines
  }

  console.log('Metrics:', metrics)

  return new Response(
    JSON.stringify(metrics),
    {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: 200,
    }
  )
}) 