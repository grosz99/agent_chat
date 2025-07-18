'use client';

import { useState } from 'react';
import Image from 'next/image';
import { BarChart3, Database, Plug } from 'lucide-react';
import { TabNavigation } from '@/components/tabs/TabNavigation';
import { ScenarioPlanning } from '@/components/tabs/ScenarioPlanning';
import { Dashboard } from '@/components/tabs/Dashboard';
import { Plugin } from '@/components/tabs/Plugin';

const tabs = [
  {
    id: 'scenario-planning',
    label: 'Scenario Planning',
    icon: <Database className="w-4 h-4" />
  },
  {
    id: 'dashboard',
    label: 'Dashboard',
    icon: <BarChart3 className="w-4 h-4" />
  },
  {
    id: 'plugin',
    label: 'Plugin',
    icon: <Plug className="w-4 h-4" />
  }
];

export default function Home() {
  const [activeTab, setActiveTab] = useState('scenario-planning');

  return (
    <div className="flex flex-col h-screen font-sans" style={{ background: 'var(--background-secondary)', fontFamily: 'Inter, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif' }}>
      {/* Header */}
      <header className="bg-white border-b shadow-sm" style={{ borderColor: 'var(--border-light)' }}>
        <div className="px-6 py-4">
          <div className="flex items-center space-x-3">
            <div className="relative">
              <Image 
                src="/logo.svg" 
                alt="Beacon Logo" 
                width={40} 
                height={40}
                className="rounded-lg"
              />
            </div>
            <div>
              <h1 className="text-2xl font-bold" style={{ color: 'var(--primary-color)' }}>BeaconAgent</h1>
              <p className="text-sm text-secondary">Multi-Agent Data Platform</p>
            </div>
          </div>
        </div>
      </header>

      {/* Tab Navigation */}
      <TabNavigation
        tabs={tabs}
        activeTab={activeTab}
        onTabChange={setActiveTab}
      />

      {/* Tab Content */}
      <div className="flex-1 overflow-hidden">
        {activeTab === 'scenario-planning' && <ScenarioPlanning />}
        {activeTab === 'dashboard' && <Dashboard />}
        {activeTab === 'plugin' && <Plugin />}
      </div>
    </div>
  );
}