'use client';

import React, { useState, useEffect } from 'react';
import { DollarSign, TrendingUp, Target, Users, Send, BarChart3 } from 'lucide-react';
import Image from 'next/image';
import { KPICard } from '@/components/dashboard/KPICard';
import { RevenueTrendChart } from '@/components/dashboard/RevenueTrendChart';

interface DashboardData {
  kpis: {
    totalRevenue: { value: number; change: { value: number; type: 'increase' | 'decrease' | 'neutral' } };
    revenueGrowth: { value: number; change: { value: number; type: 'increase' | 'decrease' | 'neutral' } };
    pipelineValue: { value: number; change: { value: number; type: 'increase' | 'decrease' | 'neutral' } };
    conversionRate: { value: number; change: { value: number; type: 'increase' | 'decrease' | 'neutral' } };
  };
  trendData: Array<{ month: string; revenue: number; pipeline: number }>;
}

export function Dashboard() {
  const [data, setData] = useState<DashboardData | null>(null);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [searchLoading, setSearchLoading] = useState(false);
  const [searchResult, setSearchResult] = useState<string | null>(null);

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      const response = await fetch('/api/dashboard');
      const result = await response.json();
      
      if (result.success) {
        setData(result.data);
      }
    } catch (error) {
      console.error('Error fetching dashboard data:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = async () => {
    if (!searchQuery.trim()) return;
    
    setSearchLoading(true);
    setSearchResult(null);
    
    try {
      const response = await fetch('/api/snowflake-query', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          query: searchQuery,
          agentId: 'ncc-financial'
        })
      });
      
      const result = await response.json();
      
      if (result.success) {
        setSearchResult(result.response.content);
      } else {
        setSearchResult('Sorry, I couldn\'t process your question. Please try again.');
      }
    } catch (error) {
      console.error('Error searching:', error);
      setSearchResult('An error occurred while processing your question.');
    } finally {
      setSearchLoading(false);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleSearch();
    }
  };

  const formatCurrency = (value: number) => {
    if (value >= 1000000) {
      return `$${(value / 1000000).toFixed(1)}M`;
    } else if (value >= 1000) {
      return `$${(value / 1000).toFixed(0)}K`;
    }
    return `$${value}`;
  };

  const formatPercentage = (value: number) => {
    return `${value}%`;
  };

  return (
    <div className="flex flex-col h-full overflow-y-auto">
      <div className="p-6">
        <h2 className="text-2xl font-bold text-gray-900 mb-6">My Metrics</h2>
        
        {/* KPI Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          <KPICard
            title="Total Revenue"
            value={data ? formatCurrency(data.kpis.totalRevenue.value) : '$0'}
            change={data?.kpis.totalRevenue.change}
            icon={<DollarSign className="w-5 h-5" />}
            loading={loading}
          />
          <KPICard
            title="Revenue Growth"
            value={data ? formatPercentage(data.kpis.revenueGrowth.value) : '0%'}
            change={data?.kpis.revenueGrowth.change}
            icon={<TrendingUp className="w-5 h-5" />}
            loading={loading}
          />
          <KPICard
            title="Pipeline Value"
            value={data ? formatCurrency(data.kpis.pipelineValue.value) : '$0'}
            change={data?.kpis.pipelineValue.change}
            icon={<Target className="w-5 h-5" />}
            loading={loading}
          />
          <KPICard
            title="Conversion Rate"
            value={data ? formatPercentage(data.kpis.conversionRate.value) : '0%'}
            change={data?.kpis.conversionRate.change}
            icon={<Users className="w-5 h-5" />}
            loading={loading}
          />
        </div>

        {/* Trend Chart */}
        <div className="mb-8">
          <RevenueTrendChart 
            data={data?.trendData || []}
            loading={loading}
          />
        </div>

        {/* Search Bar */}
        <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
          <div className="flex items-center gap-3 mb-4">
            <Image 
              src="/surge-logo.svg" 
              alt="Surge Logo" 
              width={30} 
              height={30}
            />
            <h3 className="text-lg font-semibold">Ask Surge</h3>
          </div>
          <div className="flex gap-2 mb-4">
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              onKeyPress={handleKeyPress}
              placeholder="What drove revenue to increase from March to April?"
              className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[var(--primary-color)] focus:border-transparent"
              disabled={searchLoading}
            />
            <button 
              onClick={handleSearch}
              disabled={searchLoading || !searchQuery.trim()}
              className="px-4 py-2 bg-[var(--primary-color)] text-white rounded-lg hover:bg-[var(--primary-dark)] disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center gap-2"
            >
              {searchLoading ? (
                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
              ) : (
                <Send className="w-4 h-4" />
              )}
              Ask
            </button>
          </div>
          
          {searchLoading && (
            <div className="bg-gray-50 rounded-lg p-4 border-l-4 border-[var(--primary-color)]">
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-lg bg-[var(--primary-color)] text-white">
                  <BarChart3 className="w-4 h-4" />
                </div>
                <div className="flex-1">
                  <p className="text-sm font-medium text-gray-700">NCC Agent</p>
                  <p className="text-xs text-gray-500">Analyzing revenue data...</p>
                </div>
                <div className="w-4 h-4 border-2 border-[var(--primary-color)] border-t-transparent rounded-full animate-spin"></div>
              </div>
            </div>
          )}
          
          {searchResult && (
            <div className="bg-gray-50 rounded-lg p-4 border-l-4 border-[var(--primary-color)]">
              <div className="flex items-start gap-3 mb-3">
                <div className="p-2 rounded-lg bg-[var(--primary-color)] text-white">
                  <BarChart3 className="w-4 h-4" />
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-700">NCC Agent</p>
                  <p className="text-xs text-gray-500">Analysis complete</p>
                </div>
              </div>
              <p className="text-sm text-gray-700 whitespace-pre-wrap">{searchResult}</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}