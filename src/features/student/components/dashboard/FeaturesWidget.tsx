import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { useProjectsStore } from '../../store/projects.store'
import { ListChecks } from 'lucide-react'

export const FeaturesWidget = () => {
  const { projects, isLoading } = useProjectsStore()
  
  // Calculate total features across all projects
  const totalFeatures = projects.reduce((sum, project) => sum + project.feature_count, 0)
  
  // Calculate features by status (we'll need to implement this later with actual feature data)
  const featureStats = {
    notStarted: 0,
    inProgress: 0,
    successful: 0,
    failed: 0
  }

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-xl font-bold">Features</CardTitle>
        <ListChecks className="h-5 w-5 text-gray-500" />
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          <div className="space-y-2">
            <p className="text-3xl font-bold">{totalFeatures}</p>
            <p className="text-sm font-medium text-gray-500">Total Features</p>
          </div>

          {isLoading ? (
            <div className="flex items-center justify-center py-2">
              <div className="h-4 w-4 animate-spin rounded-full border-b-2 border-gray-900"></div>
            </div>
          ) : (
            <div className="grid grid-cols-2 gap-2 text-sm">
              <div>
                <p className="font-medium text-green-600">{featureStats.successful}</p>
                <p className="text-gray-500">Successful</p>
              </div>
              <div>
                <p className="font-medium text-yellow-600">{featureStats.inProgress}</p>
                <p className="text-gray-500">In Progress</p>
              </div>
              <div>
                <p className="font-medium text-red-600">{featureStats.failed}</p>
                <p className="text-gray-500">Failed</p>
              </div>
              <div>
                <p className="font-medium text-gray-600">{featureStats.notStarted}</p>
                <p className="text-gray-500">Not Started</p>
              </div>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  )
} 