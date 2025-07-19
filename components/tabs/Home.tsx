'use client';

import React from 'react';
import { BarChart3, Users, TrendingUp, DollarSign, Calendar, Building, Clock, FileText, Database } from 'lucide-react';

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
    icon: <BarChart3 className="w-6 h-6" />,
    color: 'bg-[#1B4332]',
    available: true
  },
  {
    id: 'billability',
    name: 'Billability',
    description: 'Resource utilization analytics',
    icon: <Clock className="w-6 h-6" />,
    color: 'bg-[#1B4332]',
    available: false
  },
  {
    id: 'investments',
    name: 'Investments',
    description: 'Portfolio performance tracking',
    icon: <TrendingUp className="w-6 h-6" />,
    color: 'bg-[#1B4332]',
    available: false
  },
  {
    id: 'staffing',
    name: 'Staffing',
    description: 'Workforce planning and allocation',
    icon: <Users className="w-6 h-6" />,
    color: 'bg-[#1B4332]',
    available: false
  },
  {
    id: 'pipeline',
    name: 'Pipeline',
    description: 'Sales pipeline management',
    icon: <Database className="w-6 h-6" />,
    color: 'bg-[#1B4332]',
    available: true
  },
  {
    id: 'sca',
    name: 'SCA',
    description: 'Strategic client analytics',
    icon: <FileText className="w-6 h-6" />,
    color: 'bg-[#1B4332]',
    available: false
  },
  {
    id: 'office-attendance',
    name: 'Office Attendance',
    description: 'Workplace analytics and trends',
    icon: <Users className="w-6 h-6" />,
    color: 'bg-[#1B4332]',
    available: true
  },
  {
    id: 'dso',
    name: 'DSO',
    description: 'Days sales outstanding metrics',
    icon: <Calendar className="w-6 h-6" />,
    color: 'bg-[#1B4332]',
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
                    Request Access
                  </span>
                )}
              </div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">{agent.name}</h3>
              <p className="text-sm text-gray-600">{agent.description}</p>
            </div>
          ))}
        </div>

      </div>
    </div>
  );
}