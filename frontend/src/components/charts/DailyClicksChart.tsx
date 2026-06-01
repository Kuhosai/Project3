import React from 'react';
import {
  ResponsiveContainer,
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
} from 'recharts';
import type { DailyClickStatsDto } from '../../types/api.types';

interface DailyClicksChartProps {
  data: DailyClickStatsDto[];
}

const DailyClicksChart: React.FC<DailyClicksChartProps> = ({ data }) => {
  return (
    <ResponsiveContainer width="100%" height={300}>
      <LineChart data={data} margin={{ top: 10, right: 30, left: 0, bottom: 0 }}>
        <CartesianGrid strokeDasharray="3 3" stroke="#E8DEF8" />
        <XAxis
          dataKey="date"
          tick={{ fontSize: 12, fill: '#49454F' }}
          tickFormatter={(val: string) => {
            const d = new Date(val);
            return `${d.getMonth() + 1}/${d.getDate()}`;
          }}
        />
        <YAxis tick={{ fontSize: 12, fill: '#49454F' }} allowDecimals={false} />
        <Tooltip
          formatter={(value) => [value ?? 0, 'Clicks']}
          labelFormatter={(label) =>
            typeof label === 'string' ? new Date(label).toLocaleDateString() : ''
          }
        />
        <Legend />
        <Line
          type="monotone"
          dataKey="clickCount"
          name="Daily Clicks"
          stroke="#6750A4"
          strokeWidth={2}
          dot={{ fill: '#6750A4', r: 4 }}
          activeDot={{ r: 6 }}
        />
      </LineChart>
    </ResponsiveContainer>
  );
};

export default DailyClicksChart;
