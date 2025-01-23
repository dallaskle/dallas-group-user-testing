import { TesterMetrics as AdminTesterMetrics } from '@/features/admin/components/TesterMetrics'
import { QAScorecard } from '@/features/admin/components/QAScorecard'

export const TesterMetrics = () => {
  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
      <QAScorecard />
      <AdminTesterMetrics fullWidth />
    </div>
  )
} 