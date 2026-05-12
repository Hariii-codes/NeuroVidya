/**
 * ProgressChart Component
 *
 * Displays reading accuracy trends over time using Recharts.
 */

import React, { useEffect, useState } from 'react';
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer
} from 'recharts';
import axios from 'axios';

interface ProgressData {
  date: string;
  accuracy: number;
}

export const ProgressChart: React.FC = () => {
  const [data, setData] = useState<ProgressData[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadProgress();
  }, []);

  const loadProgress = async () => {
    setLoading(true);
    try {
      const response = await axios.get('/api/reading-coach/progress/me');
      const sessions = response.data.sessions || [];

      // Transform sessions into chart data
      const chartData = sessions.slice(-10).map((session: any) => ({
        date: new Date(session.createdAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
        accuracy: session.accuracyScore
      }));

      setData(chartData);
    } catch (error) {
      console.error('Failed to load progress:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="bg-white rounded-lg shadow-md p-6">
        <h2 className="text-2xl font-bold text-gray-800 mb-4">Your Progress</h2>
        <div className="flex items-center justify-center h-64">
          <div className="w-8 h-8 border-4 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-lg shadow-md p-6">
      <h2 className="text-2xl font-bold text-gray-800 mb-4">Your Progress</h2>

      {data.length === 0 ? (
        <div className="text-center py-8 text-gray-500">
          <p>No sessions yet. Complete a reading to see your progress!</p>
        </div>
      ) : (
        <ResponsiveContainer width="100%" height={250}>
          <LineChart data={data}>
            <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
            <XAxis
              dataKey="date"
              stroke="#6b7280"
              fontSize={12}
            />
            <YAxis
              domain={[0, 100]}
              stroke="#6b7280"
              fontSize={12}
              label={{ value: 'Accuracy %', angle: -90, position: 'insideLeft' }}
            />
            <Tooltip
              contentStyle={{
                backgroundColor: 'white',
                border: '1px solid #e5e7eb',
                borderRadius: '8px'
              }}
              formatter={(value: number) => [`${value.toFixed(1)}%`, 'Accuracy']}
            />
            <Line
              type="monotone"
              dataKey="accuracy"
              stroke="#3b82f6"
              strokeWidth={2}
              dot={{ fill: '#3b82f6', r: 4 }}
              activeDot={{ r: 6 }}
            />
          </LineChart>
        </ResponsiveContainer>
      )}

      {/* Stats Summary */}
      {data.length > 0 && (
        <div className="mt-4 grid grid-cols-3 gap-4">
          <div className="text-center p-3 bg-blue-50 rounded-lg">
            <p className="text-2xl font-bold text-blue-600">
              {data[data.length - 1]?.accuracy.toFixed(1)}%
            </p>
            <p className="text-sm text-gray-600">Latest Score</p>
          </div>
          <div className="text-center p-3 bg-green-50 rounded-lg">
            <p className="text-2xl font-bold text-green-600">
              {data.length}
            </p>
            <p className="text-sm text-gray-600">Sessions</p>
          </div>
          <div className="text-center p-3 bg-purple-50 rounded-lg">
            <p className="text-2xl font-bold text-purple-600">
              {(data.reduce((sum, d) => sum + d.accuracy, 0) / data.length).toFixed(1)}%
            </p>
            <p className="text-sm text-gray-600">Average</p>
          </div>
        </div>
      )}
    </div>
  );
};
