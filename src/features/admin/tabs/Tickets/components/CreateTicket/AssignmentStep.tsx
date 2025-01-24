import { useEffect } from 'react'
import { useAdminDashboardStore } from '../../../../store/adminDashboard.store'
import type { CreateTicketStepProps } from './types'

export function AssignmentStep({ 
  formData, 
  onFormDataChange, 
  isLoading 
}: CreateTicketStepProps) {
  const { testers, fetchTesters } = useAdminDashboardStore(state => ({
    testers: state.testers,
    fetchTesters: state.fetchTesters
  }))

  useEffect(() => {
    fetchTesters()
  }, [fetchTesters])

  return (
    <div className="space-y-4">
      <div>
        <label className="block text-sm font-medium text-gray-700">
          Assign To
        </label>
        <select
          value={formData.assignedTo || ''}
          onChange={(e) => onFormDataChange({ assignedTo: e.target.value })}
          className="mt-1 block w-full rounded-md border border-gray-300 bg-white px-3 py-2 shadow-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
          disabled={isLoading}
        >
          <option value="">Select a tester</option>
          {testers.map(tester => (
            <option key={tester.id} value={tester.id}>
              {tester.name}
            </option>
          ))}
        </select>
      </div>
    </div>
  )
}