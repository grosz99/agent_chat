'use client';

import React from 'react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, ComposedChart, Bar } from 'recharts';

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
        <div className="h-80 bg-gray-100 rounded animate-pulse"></div>
      </div>
    );
  }

  // Calculate percentage change from previous month
  const dataWithChange = data.map((item, index) => {
    let percentChange = 0;
    if (index > 0) {
      const prevRevenue = data[index - 1].revenue;
      percentChange = ((item.revenue - prevRevenue) / prevRevenue) * 100;
    }
    return {
      ...item,
      percentChange: Math.round(percentChange * 10) / 10 // Round to 1 decimal
    };
  });

  const formatValue = (value: number) => {
    if (value >= 1000000) {
      return `$${(value / 1000000).toFixed(1)}M`;
    } else if (value >= 1000) {
      return `$${(value / 1000).toFixed(0)}K`;
    }
    return `$${value}`;
  };

  const formatPercent = (value: number) => {
    return `${value > 0 ? '+' : ''}${value}%`;
  };

  return (
    <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
      <h3 className="text-lg font-semibold mb-4 text-gray-900">Revenue Trend</h3>
      <div className="h-80">
        <ResponsiveContainer width="100%" height="100%">
          <ComposedChart data={dataWithChange}>
            <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
            <XAxis 
              dataKey="month" 
              stroke="#6b7280"
              fontSize={12}
            />
            <YAxis 
              yAxisId="revenue"
              stroke="#6b7280"
              fontSize={12}
              tickFormatter={formatValue}
            />
            <YAxis 
              yAxisId="percent"
              orientation="right"
              stroke="#6b7280"
              fontSize={12}
              tickFormatter={(value) => `${value}%`}
            />
            <Tooltip 
              formatter={(value: number, name: string) => {
                if (name === 'Revenue') return [formatValue(value), name];
                if (name === 'Change') return [formatPercent(value), '% Change'];
                return [value, name];
              }}
              labelStyle={{ color: '#374151' }}
              contentStyle={{ 
                backgroundColor: '#ffffff', 
                border: '1px solid #e5e7eb',
                borderRadius: '8px',
                boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)'
              }}
            />
            <Line 
              yAxisId="revenue"
              type="monotone" 
              dataKey="revenue" 
              stroke="#0e5f3f" 
              strokeWidth={3}
              dot={{ fill: '#0e5f3f', strokeWidth: 2, r: 4 }}
              activeDot={{ r: 6, fill: '#0e5f3f' }}
              name="Revenue"
            />
            <Bar 
              yAxisId="percent"
              dataKey="percentChange"
              fill="#9ca3af"
              name="Change"
              opacity={0.6}
              maxBarSize={20}
            />
          </ComposedChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}