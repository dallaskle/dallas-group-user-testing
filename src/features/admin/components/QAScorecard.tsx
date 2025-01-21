import React from 'react';
import { Card } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";

interface TesterScore {
  id: string;
  name: string;
  testsCompleted: number;
  accuracy: number;
  avgTimePerTest: number;
  rating: number;
}

const mockTesters: TesterScore[] = [
  {
    id: '1',
    name: 'Alice Johnson',
    testsCompleted: 45,
    accuracy: 95,
    avgTimePerTest: 8.5,
    rating: 4.8,
  },
  {
    id: '2',
    name: 'Bob Smith',
    testsCompleted: 32,
    accuracy: 88,
    avgTimePerTest: 12.3,
    rating: 4.2,
  },
  // Add more mock data as needed
];

export const QAScorecard: React.FC = () => {
  return (
    <Card className="p-6">
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <h3 className="text-lg font-semibold">QA Performance</h3>
          <select className="select select-sm">
            <option>Last 7 Days</option>
            <option>Last 30 Days</option>
            <option>All Time</option>
          </select>
        </div>

        <div className="space-y-6">
          {mockTesters.map((tester) => (
            <div key={tester.id} className="space-y-4">
              <div className="flex justify-between items-center">
                <div>
                  <h4 className="font-medium">{tester.name}</h4>
                  <p className="text-sm text-gray-500">{tester.testsCompleted} tests completed</p>
                </div>
                <div className="text-right">
                  <div className="text-lg font-semibold">{tester.rating.toFixed(1)}</div>
                  <div className="text-sm text-gray-500">Rating</div>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <div className="text-sm text-gray-500 mb-1">Accuracy</div>
                  <Progress 
                    value={tester.accuracy}
                    className="bg-gray-200 h-2"
                  />
                  <div className="text-sm mt-1">{tester.accuracy}%</div>
                </div>
                <div>
                  <div className="text-sm text-gray-500 mb-1">Avg. Time per Test</div>
                  <div className="text-sm">
                    {tester.avgTimePerTest.toFixed(1)} minutes
                  </div>
                </div>
              </div>

              <div className="border-t pt-2">
                <div className="flex justify-between text-sm text-gray-500">
                  <span>Tests this week: {Math.floor(tester.testsCompleted * 0.3)}</span>
                  <span>Pending reviews: {Math.floor(tester.testsCompleted * 0.1)}</span>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </Card>
  );
}; 