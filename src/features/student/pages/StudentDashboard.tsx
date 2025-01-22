import { ProjectsWidget } from '../components/dashboard/ProjectsWidget'
import { FeaturesWidget } from '../components/dashboard/FeaturesWidget'
import { ValidationsWidget } from '../components/dashboard/ValidationsWidget'
import { ProjectsProvider } from '../components/ProjectsProvider'

export const StudentDashboard = () => {
  return (
    <ProjectsProvider>
      <div className="container mx-auto py-8">
        <div className="mb-8">
          <h1 className="text-4xl font-bold">Welcome back!</h1>
          <p className="text-gray-500">Here's an overview of your projects and recent activity.</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          <ProjectsWidget />
          <FeaturesWidget />
          <ValidationsWidget />
        </div>
      </div>
    </ProjectsProvider>
  )
}

export default StudentDashboard 