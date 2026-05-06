'use client';

import { useState, useEffect } from 'react';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Cell,
} from 'recharts';
import { formatCurrency } from '@/lib/utils';

interface MonthlyBarChartProps {
  data: { month: string; total: number }[];
}

export default function MonthlyBarChart({ data }: MonthlyBarChartProps) {
  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);

  if (!mounted) return <div className="h-72" />;

  const maxIdx = data.reduce(
    (best, cur, idx) => (cur.total > data[best].total ? idx : best),
    0
  );

  return (
    <ResponsiveContainer width="100%" height={288}>
      <BarChart data={data} margin={{ top: 5, right: 10, left: 10, bottom: 5 }}>
        <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" vertical={false} />
        <XAxis
          dataKey="month"
          tick={{ fill: '#64748b', fontSize: 12 }}
          axisLine={false}
          tickLine={false}
        />
        <YAxis
          tick={{ fill: '#64748b', fontSize: 11 }}
          axisLine={false}
          tickLine={false}
          tickFormatter={(v: number) => (v >= 1000 ? `$${(v / 1000).toFixed(1)}k` : `$${v}`)}
          width={50}
        />
        <Tooltip
          formatter={(value: number) => [formatCurrency(value), 'Total Spent']}
          contentStyle={{
            borderRadius: '12px',
            border: '1px solid #e2e8f0',
            boxShadow: '0 4px 6px -1px rgba(0,0,0,0.1)',
          }}
          cursor={{ fill: '#f1f5f9' }}
        />
        <Bar dataKey="total" radius={[6, 6, 0, 0]} maxBarSize={48}>
          {data.map((_, idx) => (
            <Cell
              key={idx}
              fill={idx === maxIdx ? '#2563EB' : '#93C5FD'}
            />
          ))}
        </Bar>
      </BarChart>
    </ResponsiveContainer>
  );
}
