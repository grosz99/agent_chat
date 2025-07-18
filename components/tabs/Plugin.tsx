'use client';

import React, { useState } from 'react';
import { Database, ExternalLink, Play, CheckCircle } from 'lucide-react';

export function Plugin() {
  const [loading, setLoading] = useState(false);
  const [response, setResponse] = useState<any>(null);

  const handleSimulateQuery = async () => {
    setLoading(true);
    setResponse(null);
    
    try {
      const response = await fetch('/api/agents/plugin', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          externalApp: 'ClientView 2.0',
          query: 'Get high-value opportunities'
        })
      });
      
      const result = await response.json();
      setResponse(result);
    } catch (error) {
      console.error('Error simulating query:', error);
      setResponse({ error: 'Failed to simulate external query' });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex flex-col h-full overflow-y-auto">
      <div className="p-6">
        <h2 className="text-2xl font-bold text-gray-900 mb-6">ClientView 2.0 Integration</h2>
        
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 mb-6">
          <div className="flex items-center gap-4 mb-6">
            <div className="p-3 rounded-lg bg-[var(--primary-light)] text-white">
              <Database className="w-8 h-8" />
            </div>
            <div>
              <h3 className="text-lg font-semibold">Pipeline Analytics Agent</h3>
              <p className="text-gray-600">External API Integration Demo</p>
            </div>
          </div>
          
          <p className="text-gray-600 mb-6">
            This demonstrates how external applications like ClientView 2.0 can integrate with our 
            Pipeline Analytics Agent through API endpoints to access deal data, opportunity insights, 
            and contract information.
          </p>
          
          <div className="bg-gray-50 rounded-lg p-4 mb-6">
            <h4 className="font-medium mb-2 flex items-center gap-2">
              <ExternalLink className="w-4 h-4" />
              API Endpoint:
            </h4>
            <code className="text-sm bg-gray-200 px-3 py-1 rounded font-mono">
              POST /api/agents/plugin
            </code>
          </div>

          <div className="space-y-4">
            <div className="border-l-4 border-[var(--primary-color)] pl-4">
              <h4 className="font-medium">Integration Benefits:</h4>
              <ul className="text-sm text-gray-600 mt-1 space-y-1">
                <li>• Real-time pipeline data access</li>
                <li>• Structured client and opportunity information</li>
                <li>• Contract values and deal stages</li>
                <li>• Seamless external app integration</li>
              </ul>
            </div>

            <div className="bg-gray-50 rounded-lg p-4">
              <p className="text-sm font-medium mb-3">Try the External Query:</p>
              <button 
                onClick={handleSimulateQuery}
                disabled={loading}
                className="px-4 py-2 bg-[var(--primary-color)] text-white rounded-lg hover:bg-[var(--primary-dark)] disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center gap-2"
              >
                {loading ? (
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                ) : (
                  <Play className="w-4 h-4" />
                )}
                Simulate External Query
              </button>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <h3 className="text-lg font-semibold mb-4">API Response Preview</h3>
          <div className="bg-gray-50 rounded-lg p-4 min-h-64 overflow-auto">
            {loading ? (
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-lg bg-[var(--primary-light)] text-white">
                  <Database className="w-4 h-4" />
                </div>
                <div className="flex-1">
                  <p className="text-sm font-medium text-gray-700">Pipeline Analytics Agent</p>
                  <p className="text-xs text-gray-500">Processing external query...</p>
                </div>
                <div className="w-4 h-4 border-2 border-[var(--primary-color)] border-t-transparent rounded-full animate-spin"></div>
              </div>
            ) : response ? (
              <div className="space-y-4">
                <div className="flex items-center gap-3 pb-3 border-b border-gray-200">
                  <div className="p-2 rounded-lg bg-[var(--primary-light)] text-white">
                    <Database className="w-4 h-4" />
                  </div>
                  <div className="flex-1">
                    <p className="text-sm font-medium text-gray-700">Pipeline Analytics Agent</p>
                    <p className="text-xs text-gray-500">Query completed successfully</p>
                  </div>
                  <CheckCircle className="w-4 h-4 text-green-500" />
                </div>
                
                {response.error ? (
                  <div className="text-red-600 text-sm">{response.error}</div>
                ) : (
                  <div className="space-y-3">
                    <div className="grid grid-cols-2 gap-4">
                      <div className="bg-white p-3 rounded border">
                        <p className="text-xs text-gray-500 mb-1">Client</p>
                        <p className="font-medium">{response.client}</p>
                      </div>
                      <div className="bg-white p-3 rounded border">
                        <p className="text-xs text-gray-500 mb-1">Opportunity</p>
                        <p className="font-medium">{response.opportunity}</p>
                      </div>
                      <div className="bg-white p-3 rounded border">
                        <p className="text-xs text-gray-500 mb-1">Stage</p>
                        <p className="font-medium">{response.stage}</p>
                      </div>
                      <div className="bg-white p-3 rounded border">
                        <p className="text-xs text-gray-500 mb-1">Contract Value</p>
                        <p className="font-medium text-[var(--primary-color)]">{response.value}</p>
                      </div>
                    </div>
                    
                    <div className="bg-white p-3 rounded border">
                      <p className="text-xs text-gray-500 mb-1">Additional Details</p>
                      <p className="text-sm">{response.details}</p>
                    </div>
                  </div>
                )}
              </div>
            ) : (
              <p className="text-gray-500 text-center py-8">
                Click "Simulate External Query" to see how ClientView 2.0 would receive pipeline data
              </p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}