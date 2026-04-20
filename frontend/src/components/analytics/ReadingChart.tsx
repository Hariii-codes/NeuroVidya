// frontend/src/components/analytics/ReadingChart.tsx
import { DyslexiaText } from '@/components/common/DyslexiaText';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from 'recharts';

interface ReadingData {
  day: string;
  wordsRead: number;
  readingTime: number;
}

interface ReadingChartProps {
  data: ReadingData[];
}

export function ReadingChart({ data }: ReadingChartProps) {
  // Generate last 7 days of mock data if not provided
  const chartData: ReadingData[] = data.length > 0 ? data : [
    { day: 'Mon', wordsRead: 150, readingTime: 15 },
    { day: 'Tue', wordsRead: 230, readingTime: 20 },
    { day: 'Wed', wordsRead: 180, readingTime: 18 },
    { day: 'Thu', wordsRead: 320, readingTime: 28 },
    { day: 'Fri', wordsRead: 250, readingTime: 22 },
    { day: 'Sat', wordsRead: 400, readingTime: 35 },
    { day: 'Sun', wordsRead: 280, readingTime: 25 },
  ];

  return (
    <div className="bg-white rounded-2xl shadow-lg p-6">
      <DyslexiaText as="h3" size="lg" className="mb-4">
        Reading Progress (Last 7 Days)
      </DyslexiaText>

      <ResponsiveContainer width="100%" height={300}>
        <BarChart data={chartData}>
          <CartesianGrid strokeDasharray="3 3" stroke="#E8F4FC" />
          <XAxis
            dataKey="day"
            tick={{ fill: '#2E2E2E', fontSize: 14 }}
            tickLine={{ stroke: '#E8F4FC' }}
          />
          <YAxis
            tick={{ fill: '#2E2E2E', fontSize: 14 }}
            tickLine={{ stroke: '#E8F4FC' }}
          />
          <Tooltip
            contentStyle={{
              backgroundColor: '#F7F3E9',
              border: 'none',
              borderRadius: '8px',
              color: '#2E2E2E',
            }}
          />
          <Bar
            dataKey="wordsRead"
            fill="#5C8DF6"
            name="Words Read"
            radius={[8, 8, 0, 0]}
          />
        </BarChart>
      </ResponsiveContainer>

      {/* Reading Time Chart */}
      <div className="mt-6">
        <DyslexiaText size="md" className="mb-3 block opacity-70">
          Reading Time (minutes)
        </DyslexiaText>
        <ResponsiveContainer width="100%" height={200}>
          <BarChart data={chartData}>
            <CartesianGrid strokeDasharray="3 3" stroke="#E8F4FC" />
            <XAxis
              dataKey="day"
              tick={{ fill: '#2E2E2E', fontSize: 14 }}
              tickLine={{ stroke: '#E8F4FC' }}
            />
            <YAxis
              tick={{ fill: '#2E2E2E', fontSize: 14 }}
              tickLine={{ stroke: '#E8F4FC' }}
            />
            <Tooltip
              contentStyle={{
                backgroundColor: '#F7F3E9',
                border: 'none',
                borderRadius: '8px',
                color: '#2E2E2E',
              }}
            />
            <Bar
              dataKey="readingTime"
              fill="#6CC7A8"
              name="Reading Time"
              radius={[8, 8, 0, 0]}
            />
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
