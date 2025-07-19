'use client';

import React, { useState } from 'react';
import { BarChart3, Users, TrendingUp, DollarSign, Calendar, Building, Clock, FileText, Database, ArrowRight } from 'lucide-react';
import Image from 'next/image';

interface Agent {
  id: string;
  name: string;
  description: string;
  details: string;
  icon: React.ReactNode;
  color: string;
  available: boolean;
}

interface HomeProps {
  onTabChange?: (tabId: string) => void;
}

const agents: Agent[] = [
  {
    id: 'ncc',
    name: 'NCC',
    description: 'Revenue tracking and forecasting',
    details: 'Track net client contribution, analyze revenue trends, forecast future performance, and identify growth opportunities across your portfolio.',
    icon: <BarChart3 className="w-6 h-6" />,
    color: 'bg-[#1B4332]',
    available: true
  },
  {
    id: 'billability',
    name: 'Billability',
    description: 'Resource utilization analytics',
    details: 'Monitor consultant utilization rates, track billable hours, analyze capacity planning, and optimize resource allocation across projects.',
    icon: <Clock className="w-6 h-6" />,
    color: 'bg-[#1B4332]',
    available: false
  },
  {
    id: 'investments',
    name: 'Investments',
    description: 'Portfolio performance tracking',
    details: 'Track investment portfolio performance, analyze ROI on strategic initiatives, monitor capital deployment, and evaluate investment opportunities.',
    icon: <TrendingUp className="w-6 h-6" />,
    color: 'bg-[#1B4332]',
    available: false
  },
  {
    id: 'staffing',
    name: 'Staffing',
    description: 'Workforce planning and allocation',
    details: 'Optimize team composition, forecast staffing needs, manage talent allocation, and ensure the right skills are matched to client needs.',
    icon: <Users className="w-6 h-6" />,
    color: 'bg-[#1B4332]',
    available: false
  },
  {
    id: 'pipeline',
    name: 'Pipeline',
    description: 'Sales pipeline management',
    details: 'Manage sales opportunities, track deal progression, analyze win rates, and forecast revenue from active pipeline opportunities.',
    icon: <Database className="w-6 h-6" />,
    color: 'bg-[#1B4332]',
    available: true
  },
  {
    id: 'sca',
    name: 'SCA',
    description: 'Strategic client analytics',
    details: 'Analyze strategic client accounts, identify expansion opportunities, track client health scores, and develop account growth strategies.',
    icon: <FileText className="w-6 h-6" />,
    color: 'bg-[#1B4332]',
    available: false
  },
  {
    id: 'office-attendance',
    name: 'Office Attendance',
    description: 'Workplace analytics and trends',
    details: 'Monitor office attendance patterns, analyze workspace utilization, track hybrid work trends, and optimize real estate footprint.',
    icon: <Users className="w-6 h-6" />,
    color: 'bg-[#1B4332]',
    available: true
  },
  {
    id: 'dso',
    name: 'DSO',
    description: 'Days sales outstanding metrics',
    details: 'Track collections performance, analyze payment patterns, identify at-risk accounts, and optimize cash flow through reduced DSO.',
    icon: <Calendar className="w-6 h-6" />,
    color: 'bg-[#1B4332]',
    available: false
  }
];

export function Home({ onTabChange }: HomeProps) {
  const handleBeaconClick = () => {
    if (onTabChange) {
      onTabChange('scenario-planning');
    }
  };

  return (
    <div className="flex flex-col h-full overflow-y-auto bg-gray-50">
      {/* Welcome Header */}
      <div className="bg-white border-b border-gray-200 px-6 py-4">
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Explore agents that you have access to</h1>
            <p className="text-gray-600">Review what is in each agent and request access as needed</p>
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
              className={`bg-white rounded-lg shadow-sm border border-gray-200 p-6 transition-all duration-200 relative group ${
                agent.available 
                  ? 'hover:shadow-lg hover:border-[var(--primary-color)] cursor-pointer' 
                  : 'opacity-60'
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
              
              {/* Hover tooltip */}
              <div className="absolute bottom-full left-0 right-0 mb-2 p-3 bg-gray-900 text-white text-xs rounded-lg opacity-0 group-hover:opacity-100 transition-opacity duration-200 pointer-events-none z-10">
                {agent.details}
                <div className="absolute bottom-0 left-1/2 transform -translate-x-1/2 translate-y-full">
                  <div className="border-4 border-transparent border-t-gray-900"></div>
                </div>
              </div>
              
              {/* Request button for unavailable agents */}
              {!agent.available && (
                <button 
                  onClick={(e) => {
                    e.stopPropagation();
                    alert('Request submitted for ' + agent.name + ' agent access');
                  }}
                  className="mt-3 w-full text-sm bg-gray-100 hover:bg-gray-200 text-gray-700 py-1 px-3 rounded transition-colors"
                >
                  Request here
                </button>
              )}
            </div>
          ))}
        </div>
        
        {/* Beacon Link */}
        <div className="mt-12 text-center">
          <button
            onClick={handleBeaconClick}
            className="inline-flex items-center gap-3 px-6 py-3 bg-[var(--primary-color)] text-white rounded-lg hover:bg-[var(--primary-dark)] transition-colors"
          >
            <Image 
              src="/logo.svg" 
              alt="Beacon Logo" 
              width={24} 
              height={24}
              className="brightness-0 invert"
            />
            Start using your agents today in Beacon
            <ArrowRight className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
}