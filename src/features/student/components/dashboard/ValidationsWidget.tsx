import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { useProjectsStore } from '../../store/projects.store'
import { CheckCircle } from 'lucide-react'

export const ValidationsWidget = () => {
  const { projects, isLoading } = useProjectsStore()
  
  // Calculate total validations across all projects
  const totalValidations = projects.reduce((sum, project) => sum + project.validation_count, 0)
  
  // Calculate validation rate (we'll implement this with actual data later)
  const validationRate = {
    success: 0,
    pending: 0,
    total: totalValidations
  }

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-xl font-bold">Validations</CardTitle>
        <CheckCircle className="h-5 w-5 text-gray-500" />
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          <div className="space-y-2">
            <p className="text-3xl font-bold">{totalValidations}</p>
            <p className="text-sm font-medium text-gray-500">Total Validations</p>
          </div>

          {isLoading ? (
            <div className="flex items-center justify-center py-2">
              <div className="h-4 w-4 animate-spin rounded-full border-b-2 border-gray-900"></div>
            </div>
          ) : (
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <p className="font-medium text-green-600">{validationRate.success}</p>
                  <p className="text-gray-500">Successful</p>
                </div>
                <div>
                  <p className="font-medium text-yellow-600">{validationRate.pending}</p>
                  <p className="text-gray-500">Pending</p>
                </div>
              </div>

              {/* Recent validations preview - we'll implement this later */}
              <div className="text-sm text-gray-500">
                <p className="font-medium mb-2">Recent Activity</p>
                <p className="text-xs">No recent validations</p>
              </div>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  )
} 