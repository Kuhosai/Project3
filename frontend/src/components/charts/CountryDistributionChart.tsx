import React from 'react';
import {
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  Tooltip,
  Legend,
} from 'recharts';
import type { PieLabelRenderProps } from 'recharts';
import type { CountryStatsDto } from '../../types/api.types';

interface CountryDistributionChartProps {
  data: CountryStatsDto[];
}

const COLORS = ['#6750A4', '#625B71', '#9A82DB', '#7965AF', '#B69DF8', '#4F378B', '#D0BCFF'];

const RADIAN = Math.PI / 180;
const renderCustomizedLabel = (props: PieLabelRenderProps) => {
  const { cx, cy, midAngle, innerRadius, outerRadius } = props;
  const percentage = (props as unknown as Record<string, unknown>).percentage as number | undefined;
  if ((percentage ?? 0) < 5) return null;

  const cxNum = typeof cx === 'number' ? cx : 0;
  const cyNum = typeof cy === 'number' ? cy : 0;
  const midAngleNum = typeof midAngle === 'number' ? midAngle : 0;
  const innerR = typeof innerRadius === 'number' ? innerRadius : 0;
  const outerR = typeof outerRadius === 'number' ? outerRadius : 0;

  const radius = innerR + (outerR - innerR) * 0.5;
  const x = cxNum + radius * Math.cos(-midAngleNum * RADIAN);
  const y = cyNum + radius * Math.sin(-midAngleNum * RADIAN);

  return (
    <text x={x} y={y} fill="white" textAnchor="middle" dominantBaseline="central" fontSize={12}>
      {`${(percentage ?? 0).toFixed(1)}%`}
    </text>
  );
};

const CountryDistributionChart: React.FC<CountryDistributionChartProps> = ({ data }) => {
  return (
    <ResponsiveContainer width="100%" height={300}>
      <PieChart>
        <Pie
          data={data}
          cx="50%"
          cy="50%"
          labelLine={false}
          label={renderCustomizedLabel}
          outerRadius={110}
          dataKey="clickCount"
          nameKey="country"
        >
          {data.map((_entry, index) => (
            <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
          ))}
        </Pie>
        <Tooltip
          formatter={(value, name) => [value ?? 0, name ?? '']}
          labelFormatter={() => ''}
        />
        <Legend
          formatter={(value: string, entry) => {
            const payload = entry.payload as { percentage?: number } | undefined;
            const pct = payload?.percentage ?? 0;
            return `${value} (${pct.toFixed(1)}%)`;
          }}
        />
      </PieChart>
    </ResponsiveContainer>
  );
};

export default CountryDistributionChart;
