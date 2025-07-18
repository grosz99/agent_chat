'use client';

import React from 'react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

interface RevenueTrendChartProps {
  data: Array<{
    month: string;
    revenue: number;
    pipeline: number;
  }>;
  loading?: boolean;
}

export function RevenueTrendChart({ data, loading = false }: RevenueTrendChartProps) {
  if (loading) {
    return (
      <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
        <div className="h-6 bg-gray-200 rounded w-32 mb-4 animate-pulse"></div>
        <div className="h-64 bg-gray-100 rounded animate-pulse"></div>
      </div>
    );
  }

  const formatValue = (value: number) => {
    if (value >= 1000000) {
      return `$${(value / 1000000).toFixed(1)}M`;
    } else if (value >= 1000) {
      return `$${(value / 1000).toFixed(0)}K`;
    }
    return `$${value}`;
  };

  // Calculate min and max for narrower Y-axis range
  const revenues = data.map(item => item.revenue);
  const minRevenue = Math.min(...revenues);
  const maxRevenue = Math.max(...revenues);
  const padding = (maxRevenue - minRevenue) * 0.1; // 10% padding
  const yAxisMin = Math.max(0, minRevenue - padding);
  const yAxisMax = maxRevenue + padding;

  return (
    <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
      <h3 className="text-lg font-semibold mb-4 text-gray-900">Revenue Trend</h3>
      <div className="h-64">
        <ResponsiveContainer width="100%" height="100%">
          <LineChart data={data}>
            <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
            <XAxis 
              dataKey="month" 
              stroke="#6b7280"
              fontSize={12}
            />
            <YAxis 
              stroke="#6b7280"
              fontSize={12}
              tickFormatter={formatValue}
              domain={[yAxisMin, yAxisMax]}
            />
            <Tooltip 
              formatter={(value: number, name: string) => [formatValue(value), name]}
              labelStyle={{ color: '#374151' }}
              contentStyle={{ 
                backgroundColor: '#ffffff', 
                border: '1px solid #e5e7eb',
                borderRadius: '8px',
                boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)'
              }}
            />
            <Line 
              type="monotone" 
              dataKey="revenue" 
              stroke="#1B4332" 
              strokeWidth={3}
              dot={{ fill: '#1B4332', strokeWidth: 2, r: 4 }}
              activeDot={{ r: 6, fill: '#1B4332' }}
              name="Revenue"
            />
          </LineChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}