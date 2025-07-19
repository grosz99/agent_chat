'use client';

import { useState } from 'react';
import Image from 'next/image';
import { Home as HomeIcon, BarChart3, Database, Plug } from 'lucide-react';
import { TabNavigation } from '@/components/tabs/TabNavigation';
import { Home as HomePage } from '@/components/tabs/Home';
import { ScenarioPlanning } from '@/components/tabs/ScenarioPlanning';
import { Dashboard } from '@/components/tabs/Dashboard';
import { Plugin } from '@/components/tabs/Plugin';

const tabs = [
  {
    id: 'home',
    label: 'Home',
    icon: <HomeIcon className="w-4 h-4" />
  },
  {
    id: 'scenario-planning',
    label: 'Beacon',
    icon: <Database className="w-4 h-4" />
  },
  {
    id: 'dashboard',
    label: 'MyMetrics',
    icon: <BarChart3 className="w-4 h-4" />
  },
  {
    id: 'plugin',
    label: 'Plugin',
    icon: <Plug className="w-4 h-4" />
  }
];

export default function Home() {
  const [activeTab, setActiveTab] = useState('home');

  return (
    <div className="flex flex-col h-screen font-sans" style={{ background: 'var(--background-secondary)', fontFamily: 'Inter, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif' }}>
      {/* Header */}
      <header className="bg-white border-b shadow-sm" style={{ borderColor: 'var(--border-light)' }}>
        <div className="px-6 py-4">
          <div className="flex items-center space-x-3">
            <div className="relative">
              <Image 
                src="/surge-logo.svg" 
                alt="Surge Logo" 
                width={60} 
                height={60}
                className="rounded-lg"
              />
            </div>
            <div>
              <h1 className="text-2xl font-bold" style={{ color: 'var(--primary-color)' }}>Surge</h1>
              <p className="text-sm text-secondary">Don't keep pace - surge ahead</p>
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
        {activeTab === 'home' && <HomePage />}
        {activeTab === 'scenario-planning' && <ScenarioPlanning />}
        {activeTab === 'dashboard' && <Dashboard />}
        {activeTab === 'plugin' && <Plugin />}
      </div>
    </div>
  );
}