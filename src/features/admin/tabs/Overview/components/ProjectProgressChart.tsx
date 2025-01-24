import { Card } from "@/components/ui/card"
import { PieChart, Pie, Cell, ResponsiveContainer, Legend, Tooltip } from 'recharts'
import { ProjectProgress } from '../../../store/adminDashboard.store'

const STATUS_COLORS = {
  'Not Started': '#708090', // slate
  'In Progress': '#B87333', // copper
  'Successful Test': '#3A6B4F', // forest-light
  'Failed Test': '#7D6A60', // stone-dark
}

const STATUSES = ['Not Started', 'In Progress', 'Successful Test', 'Failed Test'] as const

interface ProjectProgressChartProps {
  projectProgress: ProjectProgress[]
}

export const ProjectProgressChart = ({ projectProgress }: ProjectProgressChartProps) => {
  // Calculate project progress data for pie chart
  const progressData = STATUSES.map(status => ({
    name: status,
    value: projectProgress.filter(p => p.status === status).length
  })).filter(item => item.value > 0)

  return (
    <Card className="p-6">
      <h3 className="font-semibold mb-4">Project Progress</h3>
      <div className="h-64">
        <ResponsiveContainer width="100%" height="100%">
          <PieChart>
            <Pie
              data={progressData}
              cx="50%"
              cy="50%"
              innerRadius={60}
              outerRadius={80}
              fill="#8884d8"
              paddingAngle={5}
              dataKey="value"
            >
              {progressData.map((entry) => (
                <Cell 
                  key={`cell-${entry.name}`} 
                  fill={STATUS_COLORS[entry.name as keyof typeof STATUS_COLORS]} 
                />
              ))}
            </Pie>
            <Tooltip 
              contentStyle={{ 
                backgroundColor: 'hsl(var(--card))',
                border: '1px solid hsl(var(--border))',
                borderRadius: '0.5rem'
              }}
              labelStyle={{ color: 'hsl(var(--foreground))' }}
            />
            <Legend 
              formatter={(value) => (
                <span style={{ color: 'hsl(var(--foreground))' }}>{value}</span>
              )}
            />
          </PieChart>
        </ResponsiveContainer>
      </div>
    </Card>
  )
} 