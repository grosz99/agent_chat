'use client';

import React from 'react';
import { BarChart3, Users, TrendingUp, DollarSign, Calendar, Building, Clock, FileText } from 'lucide-react';

interface Agent {
  id: string;
  name: string;
  description: string;
  icon: React.ReactNode;
  color: string;
  available: boolean;
}

const agents: Agent[] = [
  {
    id: 'ncc',
    name: 'NCC',
    description: 'Revenue tracking and forecasting',
    icon: <DollarSign className="w-6 h-6" />,
    color: 'bg-green-500',
    available: true
  },
  {
    id: 'billability',
    name: 'Billability',
    description: 'Resource utilization analytics',
    icon: <Clock className="w-6 h-6" />,
    color: 'bg-blue-500',
    available: false
  },
  {
    id: 'investments',
    name: 'Investments',
    description: 'Portfolio performance tracking',
    icon: <TrendingUp className="w-6 h-6" />,
    color: 'bg-purple-500',
    available: false
  },
  {
    id: 'staffing',
    name: 'Staffing',
    description: 'Workforce planning and allocation',
    icon: <Users className="w-6 h-6" />,
    color: 'bg-indigo-500',
    available: false
  },
  {
    id: 'pipeline',
    name: 'Pipeline',
    description: 'Sales pipeline management',
    icon: <BarChart3 className="w-6 h-6" />,
    color: 'bg-orange-500',
    available: true
  },
  {
    id: 'sca',
    name: 'SCA',
    description: 'Strategic client analytics',
    icon: <FileText className="w-6 h-6" />,
    color: 'bg-red-500',
    available: false
  },
  {
    id: 'office-attendance',
    name: 'Office Attendance',
    description: 'Workplace analytics and trends',
    icon: <Building className="w-6 h-6" />,
    color: 'bg-teal-500',
    available: true
  },
  {
    id: 'dso',
    name: 'DSO',
    description: 'Days sales outstanding metrics',
    icon: <Calendar className="w-6 h-6" />,
    color: 'bg-yellow-500',
    available: false
  }
];

export function Home() {
  return (
    <div className="flex flex-col h-full overflow-y-auto bg-gray-50">
      {/* Welcome Header */}
      <div className="bg-white border-b border-gray-200 px-6 py-4">
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Surge Platform</h1>
            <p className="text-gray-600">Select an agent to begin your analysis</p>
          </div>
          <div className="text-right">
            <p className="text-sm text-gray-600">Welcome,</p>
            <p className="font-semibold text-gray-900">Justin</p>
          </div>
        </div>
      </div>

      {/* Agent Grid */}
      <div className="flex-1 p-8">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 max-w-7xl mx-auto">
          {agents.map((agent) => (
            <div
              key={agent.id}
              className={`bg-white rounded-lg shadow-sm border border-gray-200 p-6 transition-all duration-200 ${
                agent.available 
                  ? 'hover:shadow-lg hover:border-[var(--primary-color)] cursor-pointer' 
                  : 'opacity-60 cursor-not-allowed'
              }`}
            >
              <div className="flex items-start justify-between mb-4">
                <div className={`p-3 rounded-lg ${agent.color} text-white`}>
                  {agent.icon}
                </div>
                {!agent.available && (
                  <span className="text-xs bg-gray-100 text-gray-600 px-2 py-1 rounded">
                    Coming Soon
                  </span>
                )}
              </div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">{agent.name}</h3>
              <p className="text-sm text-gray-600">{agent.description}</p>
            </div>
          ))}
        </div>

        {/* Platform Info */}
        <div className="mt-12 text-center max-w-3xl mx-auto">
          <h2 className="text-xl font-semibold text-gray-900 mb-4">
            Don't keep pace - surge ahead
          </h2>
          <p className="text-gray-600">
            Surge provides intelligent agent-based analytics across your entire business ecosystem. 
            Each agent specializes in specific domains, working together to provide comprehensive insights.
          </p>
        </div>
      </div>
    </div>
  );
}