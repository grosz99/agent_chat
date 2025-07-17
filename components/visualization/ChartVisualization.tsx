'use client';

import React, { useState } from 'react';
import {
  BarChart, Bar, LineChart, Line, AreaChart, Area, PieChart, Pie,
  XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, Cell
} from 'recharts';
import { ChevronDown } from 'lucide-react';

interface ChartVisualizationProps {
  data: any[];
  title?: string;
  defaultChartType?: 'bar' | 'line' | 'area' | 'pie';
  xKey?: string;
  yKey?: string;
  colorScheme?: string[];
}

const DEFAULT_COLORS = [
  '#4F46E5', // Indigo
  '#7C3AED', // Purple
  '#2563EB', // Blue
  '#0891B2', // Cyan
  '#059669', // Emerald
  '#EAB308', // Yellow
  '#EA580C', // Orange
  '#DC2626', // Red
];

export default function ChartVisualization({
  data,
  title,
  defaultChartType = 'bar',
  xKey = 'name',
  yKey = 'value',
  colorScheme = DEFAULT_COLORS
}: ChartVisualizationProps) {
  const [chartType, setChartType] = useState(defaultChartType);
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);

  if (!data || data.length === 0) {
    return (
      <div className="w-full p-8 bg-gray-50 rounded-lg border border-gray-200 text-center">
        <p className="text-gray-500">No data available for visualization</p>
      </div>
    );
  }

  const renderChart = () => {
    switch (chartType) {
      case 'line':
        return (
          <LineChart data={data}>
            <CartesianGrid strokeDasharray="3 3" stroke="#E5E7EB" />
            <XAxis dataKey={xKey} stroke="#6B7280" fontSize={12} />
            <YAxis stroke="#6B7280" fontSize={12} />
            <Tooltip 
              contentStyle={{ 
                backgroundColor: 'white', 
                border: '1px solid #E5E7EB',
                borderRadius: '8px',
                boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)'
              }} 
            />
            <Legend />
            <Line 
              type="monotone" 
              dataKey={yKey} 
              stroke={colorScheme[0]} 
              strokeWidth={2}
              dot={{ fill: colorScheme[0], r: 4 }}
              activeDot={{ r: 6 }}
            />
          </LineChart>
        );

      case 'area':
        return (
          <AreaChart data={data}>
            <CartesianGrid strokeDasharray="3 3" stroke="#E5E7EB" />
            <XAxis dataKey={xKey} stroke="#6B7280" fontSize={12} />
            <YAxis stroke="#6B7280" fontSize={12} />
            <Tooltip 
              contentStyle={{ 
                backgroundColor: 'white', 
                border: '1px solid #E5E7EB',
                borderRadius: '8px',
                boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)'
              }} 
            />
            <Legend />
            <Area 
              type="monotone" 
              dataKey={yKey} 
              stroke={colorScheme[0]} 
              fill={colorScheme[0]} 
              fillOpacity={0.3}
            />
          </AreaChart>
        );

      case 'pie':
        return (
          <PieChart>
            <Pie
              data={data}
              cx="50%"
              cy="50%"
              labelLine={false}
              label={({ name, percent }) => `${name}: ${percent ? (percent * 100).toFixed(0) : 0}%`}
              outerRadius={80}
              fill="#8884d8"
              dataKey={yKey}
            >
              {data.map((entry, index) => (
                <Cell key={`cell-${index}`} fill={colorScheme[index % colorScheme.length]} />
              ))}
            </Pie>
            <Tooltip 
              contentStyle={{ 
                backgroundColor: 'white', 
                border: '1px solid #E5E7EB',
                borderRadius: '8px',
                boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)'
              }} 
            />
          </PieChart>
        );

      case 'bar':
      default:
        return (
          <BarChart data={data}>
            <CartesianGrid strokeDasharray="3 3" stroke="#E5E7EB" />
            <XAxis dataKey={xKey} stroke="#6B7280" fontSize={12} />
            <YAxis stroke="#6B7280" fontSize={12} />
            <Tooltip 
              contentStyle={{ 
                backgroundColor: 'white', 
                border: '1px solid #E5E7EB',
                borderRadius: '8px',
                boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)'
              }} 
            />
            <Legend />
            <Bar dataKey={yKey} fill={colorScheme[0]} radius={[4, 4, 0, 0]}>
              {data.map((entry, index) => (
                <Cell key={`cell-${index}`} fill={colorScheme[index % colorScheme.length]} />
              ))}
            </Bar>
          </BarChart>
        );
    }
  };

  return (
    <div className="w-full bg-white rounded-lg border border-gray-200 shadow-sm">
      <div className="p-4 border-b border-gray-200 flex justify-between items-center">
        <h3 className="text-lg font-semibold text-gray-900">{title || 'Data Visualization'}</h3>
        
        <div className="relative">
          <button
            onClick={() => setIsDropdownOpen(!isDropdownOpen)}
            className="flex items-center gap-2 px-3 py-1.5 text-sm bg-gray-50 hover:bg-gray-100 
                     rounded-md border border-gray-300 transition-colors"
          >
            <span className="capitalize">{chartType} Chart</span>
            <ChevronDown className={`w-4 h-4 transition-transform ${isDropdownOpen ? 'rotate-180' : ''}`} />
          </button>
          
          {isDropdownOpen && (
            <div className="absolute right-0 mt-1 w-36 bg-white rounded-md shadow-lg border border-gray-200 z-10">
              {['bar', 'line', 'area', 'pie'].map((type) => (
                <button
                  key={type}
                  onClick={() => {
                    setChartType(type as any);
                    setIsDropdownOpen(false);
                  }}
                  className={`w-full px-3 py-2 text-left text-sm hover:bg-gray-50 capitalize
                           ${chartType === type ? 'bg-gray-50 font-medium' : ''}`}
                >
                  {type} Chart
                </button>
              ))}
            </div>
          )}
        </div>
      </div>

      <div className="p-6">
        <ResponsiveContainer width="100%" height={400}>
          {renderChart()}
        </ResponsiveContainer>
      </div>
    </div>
  );
}