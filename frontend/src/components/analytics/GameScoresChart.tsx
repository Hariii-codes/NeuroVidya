// frontend/src/components/analytics/GameScoresChart.tsx
import { DyslexiaText } from '@/components/common/DyslexiaText';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  Legend,
} from 'recharts';

interface GameScore {
  gameType: string;
  score: number;
  accuracy: number;
}

interface GameScoresChartProps {
  data: GameScore[];
}

const GAME_COLORS: Record<string, string> = {
  'Word & Picture': '#5C8DF6',
  'Letter Detective': '#6CC7A8',
  'Syllable Builder': '#F4A261',
  'Sentence Maker': '#9B59B6',
  'Picture Stories': '#E74C3C',
  'Concept Maps': '#3498DB',
};

export function GameScoresChart({ data }: GameScoresChartProps) {
  // Generate mock data if not provided
  const chartData: GameScore[] = data.length > 0 ? data : [
    { gameType: 'Word & Picture', score: 85, accuracy: 92 },
    { gameType: 'Letter Detective', score: 78, accuracy: 88 },
    { gameType: 'Syllable Builder', score: 92, accuracy: 95 },
    { gameType: 'Sentence Maker', score: 70, accuracy: 82 },
    { gameType: 'Picture Stories', score: 88, accuracy: 90 },
    { gameType: 'Concept Maps', score: 65, accuracy: 75 },
  ];

  // Prepare pie chart data for game distribution
  const pieData = chartData.map((item) => ({
    name: item.gameType,
    value: item.score,
  }));

  return (
    <div className="space-y-6">
      {/* Scores Bar Chart */}
      <div className="bg-white rounded-2xl shadow-lg p-6">
        <DyslexiaText as="h3" size="lg" className="mb-4">
          Game Scores
        </DyslexiaText>

        <ResponsiveContainer width="100%" height={300}>
          <BarChart data={chartData} layout="vertical">
            <CartesianGrid strokeDasharray="3 3" stroke="#E8F4FC" />
            <XAxis
              type="number"
              tick={{ fill: '#2E2E2E', fontSize: 12 }}
              tickLine={{ stroke: '#E8F4FC' }}
            />
            <YAxis
              type="category"
              dataKey="gameType"
              tick={{ fill: '#2E2E2E', fontSize: 12 }}
              tickLine={{ stroke: '#E8F4FC' }}
              width={100}
            />
            <Tooltip
              contentStyle={{
                backgroundColor: '#F7F3E9',
                border: 'none',
                borderRadius: '8px',
                color: '#2E2E2E',
              }}
            />
            <Bar dataKey="score" radius={[0, 8, 8, 0]}>
              {chartData.map((entry, index) => (
                <Cell key={`cell-${index}`} fill={GAME_COLORS[entry.gameType] || '#5C8DF6'} />
              ))}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </div>

      {/* Accuracy Pie Chart */}
      <div className="bg-white rounded-2xl shadow-lg p-6">
        <DyslexiaText as="h3" size="lg" className="mb-4">
          Score Distribution
        </DyslexiaText>

        <ResponsiveContainer width="100%" height={300}>
          <PieChart>
            <Pie
              data={pieData}
              cx="50%"
              cy="50%"
              innerRadius={60}
              outerRadius={100}
              paddingAngle={2}
              dataKey="value"
              label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
            >
              {pieData.map((entry, index) => (
                <Cell
                  key={`cell-${index}`}
                  fill={GAME_COLORS[entry.name] || '#5C8DF6'}
                />
              ))}
            </Pie>
            <Tooltip
              contentStyle={{
                backgroundColor: '#F7F3E9',
                border: 'none',
                borderRadius: '8px',
                color: '#2E2E2E',
              }}
            />
            <Legend
              verticalAlign="bottom"
              height={36}
              iconType="circle"
              wrapperStyle={{ fontSize: '14' }}
            />
          </PieChart>
        </ResponsiveContainer>
      </div>

      {/* Accuracy Stats */}
      <div className="bg-white rounded-2xl shadow-lg p-6">
        <DyslexiaText as="h3" size="lg" className="mb-4">
          Accuracy by Game
        </DyslexiaText>
        <div className="space-y-3">
          {chartData.map((item) => (
            <div key={item.gameType} className="flex items-center gap-4">
              <div
                className="w-4 h-4 rounded"
                style={{ backgroundColor: GAME_COLORS[item.gameType] || '#5C8DF6' }}
              />
              <div className="flex-1">
                <div className="flex justify-between mb-1">
                  <DyslexiaText size="md">{item.gameType}</DyslexiaText>
                  <DyslexiaText size="md" className="font-bold">
                    {item.accuracy}%
                  </DyslexiaText>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div
                    className="h-2 rounded-full transition-all"
                    style={{
                      width: `${item.accuracy}%`,
                      backgroundColor: GAME_COLORS[item.gameType] || '#5C8DF6',
                    }}
                  />
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
