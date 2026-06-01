import React from 'react';
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  Cell,
} from 'recharts';
import type { BrowserStatsDto } from '../../types/api.types';

interface BrowserDistributionChartProps {
  data: BrowserStatsDto[];
}

const COLORS = ['#6750A4', '#625B71', '#9A82DB', '#7965AF', '#B69DF8'];

const BrowserDistributionChart: React.FC<BrowserDistributionChartProps> = ({ data }) => {
  return (
    <ResponsiveContainer width="100%" height={300}>
      <BarChart data={data} margin={{ top: 10, right: 30, left: 0, bottom: 5 }}>
        <CartesianGrid strokeDasharray="3 3" stroke="#E8DEF8" />
        <XAxis dataKey="browser" tick={{ fontSize: 12, fill: '#49454F' }} />
        <YAxis tick={{ fontSize: 12, fill: '#49454F' }} allowDecimals={false} />
        <Tooltip formatter={(value) => [value ?? 0, 'Clicks']} />
        <Legend />
        <Bar dataKey="clickCount" name="Clicks" radius={[6, 6, 0, 0]}>
          {data.map((_entry, index) => (
            <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
          ))}
        </Bar>
      </BarChart>
    </ResponsiveContainer>
  );
};

export default BrowserDistributionChart;
