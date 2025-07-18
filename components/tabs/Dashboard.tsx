'use client';

import React from 'react';

export function Dashboard() {
  return (
    <div className="flex flex-col h-full">
      <div className="p-6">
        <h2 className="text-2xl font-bold text-gray-900 mb-6">Revenue Dashboard</h2>
        
        {/* KPI Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
            <p className="text-sm text-gray-600">Total Revenue</p>
            <p className="text-2xl font-bold text-gray-900">$0</p>
          </div>
          <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
            <p className="text-sm text-gray-600">Revenue Growth</p>
            <p className="text-2xl font-bold text-gray-900">0%</p>
          </div>
          <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
            <p className="text-sm text-gray-600">Pipeline Value</p>
            <p className="text-2xl font-bold text-gray-900">$0</p>
          </div>
          <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
            <p className="text-sm text-gray-600">Conversion Rate</p>
            <p className="text-2xl font-bold text-gray-900">0%</p>
          </div>
        </div>

        {/* Trend Chart Placeholder */}
        <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200 mb-8">
          <h3 className="text-lg font-semibold mb-4">Revenue Trend</h3>
          <div className="h-64 flex items-center justify-center text-gray-500">
            Chart will be displayed here
          </div>
        </div>

        {/* Search Bar */}
        <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
          <h3 className="text-lg font-semibold mb-4">Ask Questions About This Data</h3>
          <div className="flex gap-2">
            <input
              type="text"
              placeholder="e.g., What drove the revenue increase last quarter?"
              className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#1B4332] focus:border-transparent"
            />
            <button className="px-4 py-2 bg-[#1B4332] text-white rounded-lg hover:bg-[#2B6D4C] transition-colors">
              Ask
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}