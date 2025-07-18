'use client';

import React from 'react';

export function Plugin() {
  return (
    <div className="flex flex-col h-full">
      <div className="p-6">
        <h2 className="text-2xl font-bold text-gray-900 mb-6">ClientView 2.0 Integration</h2>
        
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 mb-6">
          <h3 className="text-lg font-semibold mb-4">External Application Demo</h3>
          <p className="text-gray-600 mb-4">
            This demonstrates how the Pipeline Analytics Agent can be integrated into external applications 
            like ClientView 2.0 through our API endpoints.
          </p>
          
          <div className="bg-gray-50 rounded-lg p-4 mb-4">
            <h4 className="font-medium mb-2">API Endpoint:</h4>
            <code className="text-sm bg-gray-200 px-2 py-1 rounded">/api/agents/plugin/pipeline</code>
          </div>

          <div className="space-y-4">
            <div className="border-l-4 border-[#1B4332] pl-4">
              <h4 className="font-medium">Sample Integration:</h4>
              <p className="text-sm text-gray-600 mt-1">
                ClientView 2.0 can query pipeline data directly through our agent API
              </p>
            </div>

            <div className="bg-gray-50 rounded-lg p-4">
              <p className="text-sm font-medium mb-2">Try it out:</p>
              <button className="px-4 py-2 bg-[#1B4332] text-white rounded-lg hover:bg-[#2B6D4C] transition-colors">
                Simulate External Query
              </button>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <h3 className="text-lg font-semibold mb-4">Response Preview</h3>
          <div className="bg-gray-50 rounded-lg p-4 h-64 overflow-auto">
            <p className="text-gray-500">Query results will appear here...</p>
          </div>
        </div>
      </div>
    </div>
  );
}