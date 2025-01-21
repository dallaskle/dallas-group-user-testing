import React from 'react';
import { Card } from "@/components/ui/card";
import { 
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

interface TesterMetricsProps {
  fullWidth?: boolean;
}

interface TesterMetric {
  id: string;
  name: string;
  testsCompleted: number;
  accuracyRate: number;
  avgResponseTime: number;
  validationRate: number;
  lastActive: string;
}

const mockMetrics: TesterMetric[] = [
  {
    id: '1',
    name: 'Alice Johnson',
    testsCompleted: 45,
    accuracyRate: 95,
    avgResponseTime: 8.5,
    validationRate: 92,
    lastActive: '2h ago',
  },
  {
    id: '2',
    name: 'Bob Smith',
    testsCompleted: 32,
    accuracyRate: 88,
    avgResponseTime: 12.3,
    validationRate: 85,
    lastActive: '4h ago',
  },
  {
    id: '3',
    name: 'Carol White',
    testsCompleted: 28,
    accuracyRate: 91,
    avgResponseTime: 10.1,
    validationRate: 89,
    lastActive: '1h ago',
  },
];

export const TesterMetrics: React.FC<TesterMetricsProps> = ({ fullWidth = false }) => {
  return (
    <Card className={`p-6 ${fullWidth ? 'w-full' : ''}`}>
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <h3 className="text-lg font-semibold">Tester Performance Metrics</h3>
          <div className="flex gap-2">
            <select className="select select-sm">
              <option>Last 7 Days</option>
              <option>Last 30 Days</option>
              <option>All Time</option>
            </select>
            <button className="btn btn-sm">Export</button>
          </div>
        </div>

        <div className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Tester</TableHead>
                <TableHead className="text-right">Tests</TableHead>
                <TableHead className="text-right">Accuracy</TableHead>
                <TableHead className="text-right">Avg Time</TableHead>
                <TableHead className="text-right">Validation</TableHead>
                <TableHead>Last Active</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {mockMetrics.map((metric) => (
                <TableRow key={metric.id}>
                  <TableCell className="font-medium">{metric.name}</TableCell>
                  <TableCell className="text-right">{metric.testsCompleted}</TableCell>
                  <TableCell className="text-right">
                    <span className={`${
                      metric.accuracyRate >= 90 ? 'text-green-600' :
                      metric.accuracyRate >= 80 ? 'text-yellow-600' :
                      'text-red-600'
                    }`}>
                      {metric.accuracyRate}%
                    </span>
                  </TableCell>
                  <TableCell className="text-right">{metric.avgResponseTime.toFixed(1)}m</TableCell>
                  <TableCell className="text-right">{metric.validationRate}%</TableCell>
                  <TableCell>{metric.lastActive}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>

        <div className="flex justify-between text-sm text-gray-500">
          <div>Showing {mockMetrics.length} testers</div>
          <div>Updated just now</div>
        </div>
      </div>
    </Card>
  );
}; 