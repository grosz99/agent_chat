'use client';

import React, { useState } from 'react';
import { Settings, Database, MessageCircle, Upload, Check } from 'lucide-react';

interface AgentConfigViewProps {
  onClose: () => void;
}

export function AgentConfigView({ onClose }: AgentConfigViewProps) {
  const [currentStep, setCurrentStep] = useState(1);

  const steps = [
    { id: 1, title: 'Instructions', icon: <MessageCircle className="w-5 h-5" /> },
    { id: 2, title: 'API Connection', icon: <Database className="w-5 h-5" /> },
    { id: 3, title: 'Knowledge Base', icon: <Upload className="w-5 h-5" /> },
    { id: 4, title: 'Ready', icon: <Check className="w-5 h-5" /> }
  ];

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg shadow-2xl w-full max-w-4xl h-[80vh] flex flex-col">
        {/* Header */}
        <div className="bg-[#1B4332] text-white p-4 rounded-t-lg flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-white bg-opacity-20 rounded-lg">
              <Settings className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-lg font-semibold">NCC Agent Configuration</h2>
              <p className="text-sm opacity-90">See how easy it is to set up an agent</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 hover:bg-white hover:bg-opacity-20 rounded-lg transition-colors text-white"
          >
            ✕
          </button>
        </div>

        {/* Steps Header */}
        <div className="p-4 border-b bg-gray-50">
          <div className="flex items-center justify-between max-w-2xl mx-auto">
            {steps.map((step, index) => (
              <div key={step.id} className="flex items-center">
                <div className={`flex items-center gap-2 px-3 py-2 rounded-lg ${
                  currentStep >= step.id 
                    ? 'bg-[#1B4332] text-white' 
                    : currentStep === step.id - 1 
                    ? 'bg-blue-100 text-blue-700'
                    : 'bg-gray-100 text-gray-500'
                }`}>
                  {step.icon}
                  <span className="text-sm font-medium">{step.title}</span>
                </div>
                {index < steps.length - 1 && (
                  <div className={`w-8 h-0.5 mx-2 ${
                    currentStep > step.id ? 'bg-[#1B4332]' : 'bg-gray-300'
                  }`} />
                )}
              </div>
            ))}
          </div>
        </div>

        {/* Content */}
        <div className="flex-1 p-6 overflow-y-auto">
          {currentStep === 1 && (
            <div className="max-w-2xl mx-auto">
              <h3 className="text-xl font-semibold mb-4">Step 1: Agent Instructions</h3>
              <p className="text-gray-600 mb-4">Define what your agent knows and how it should behave:</p>
              
              <div className="bg-gray-50 p-4 rounded-lg mb-4">
                <h4 className="font-medium mb-2">Business Context</h4>
                <textarea
                  readOnly
                  className="w-full h-32 p-3 bg-white border rounded resize-none"
                  value={`You are a specialized business intelligence assistant for analyzing consulting firm financial data.

BUSINESS CONTEXT:
- NCC = Net Cash Contribution (key performance metric)
- Data includes: Client projects, Regional offices, Business sectors
- Regions: Asia Pacific, EMESA, North America
- Sectors: Industrial Goods, Consumer, TMT, Financial Institutions

RESPONSE STYLE:
- Provide business insights, not just raw data
- Calculate percentages, trends, and comparisons
- Explain what numbers mean for business performance
- Suggest actionable insights
- Format responses professionally`}
                />
              </div>

              <button
                onClick={() => setCurrentStep(2)}
                className="px-6 py-2 bg-[#1B4332] text-white rounded-lg hover:bg-[#0f2419] transition-colors"
              >
                Next: API Connection
              </button>
            </div>
          )}

          {currentStep === 2 && (
            <div className="max-w-2xl mx-auto">
              <h3 className="text-xl font-semibold mb-4">Step 2: API Connection</h3>
              <p className="text-gray-600 mb-4">Connect your agent to data sources:</p>
              
              <div className="space-y-4">
                <div className="bg-gray-50 p-4 rounded-lg">
                  <h4 className="font-medium mb-2">Supabase Database</h4>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    <input
                      type="text"
                      placeholder="Supabase URL"
                      value="https://gfprvjfahdmlcmveimvi.supabase.co"
                      readOnly
                      className="px-3 py-2 bg-white border rounded"
                    />
                    <input
                      type="password"
                      placeholder="Supabase Key"
                      value="eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
                      readOnly
                      className="px-3 py-2 bg-white border rounded"
                    />
                  </div>
                  <div className="mt-2 flex items-center gap-2 text-green-600">
                    <Check className="w-4 h-4" />
                    <span className="text-sm">Connected to NCC table</span>
                  </div>
                </div>

                <div className="bg-gray-50 p-4 rounded-lg">
                  <h4 className="font-medium mb-2">OpenAI Integration</h4>
                  <input
                    type="password"
                    placeholder="OpenAI API Key"
                    value="sk-svcacct-HD5H4sAuMErJoOQrc2F..."
                    readOnly
                    className="w-full px-3 py-2 bg-white border rounded"
                  />
                  <div className="mt-2 flex items-center gap-2 text-green-600">
                    <Check className="w-4 h-4" />
                    <span className="text-sm">GPT-3.5 Turbo connected</span>
                  </div>
                </div>
              </div>

              <div className="flex gap-3 mt-6">
                <button
                  onClick={() => setCurrentStep(1)}
                  className="px-6 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition-colors"
                >
                  Back
                </button>
                <button
                  onClick={() => setCurrentStep(3)}
                  className="px-6 py-2 bg-[#1B4332] text-white rounded-lg hover:bg-[#0f2419] transition-colors"
                >
                  Next: Knowledge Base
                </button>
              </div>
            </div>
          )}

          {currentStep === 3 && (
            <div className="max-w-2xl mx-auto">
              <h3 className="text-xl font-semibold mb-4">Step 3: Knowledge Base (Optional)</h3>
              <p className="text-gray-600 mb-4">Upload documents to give your agent additional context:</p>
              
              <div className="space-y-4">
                <div className="bg-gray-50 p-4 rounded-lg">
                  <h4 className="font-medium mb-2">Uploaded Documents</h4>
                  <div className="space-y-2">
                    <div className="flex items-center gap-3 p-3 bg-white rounded border">
                      <Upload className="w-4 h-4 text-gray-500" />
                      <span>company_strategy.txt</span>
                      <span className="text-sm text-gray-500">(329 bytes)</span>
                      <Check className="w-4 h-4 text-green-500 ml-auto" />
                    </div>
                    <div className="flex items-center gap-3 p-3 bg-white rounded border">
                      <Upload className="w-4 h-4 text-gray-500" />
                      <span>ncc_targets.txt</span>
                      <span className="text-sm text-gray-500">(645 bytes)</span>
                      <Check className="w-4 h-4 text-green-500 ml-auto" />
                    </div>
                  </div>
                </div>

                <div className="bg-blue-50 p-4 rounded-lg border border-blue-200">
                  <h4 className="font-medium text-blue-800 mb-2">How Knowledge Base Works</h4>
                  <ul className="text-sm text-blue-700 space-y-1">
                    <li>• Agent searches documents for relevant context</li>
                    <li>• Combines database data with document insights</li>
                    <li>• References specific documents in responses</li>
                    <li>• Works just like CustomGPT file uploads</li>
                  </ul>
                </div>
              </div>

              <div className="flex gap-3 mt-6">
                <button
                  onClick={() => setCurrentStep(2)}
                  className="px-6 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition-colors"
                >
                  Back
                </button>
                <button
                  onClick={() => setCurrentStep(4)}
                  className="px-6 py-2 bg-[#1B4332] text-white rounded-lg hover:bg-[#0f2419] transition-colors"
                >
                  Finish Setup
                </button>
              </div>
            </div>
          )}

          {currentStep === 4 && (
            <div className="max-w-2xl mx-auto text-center">
              <div className="mb-6">
                <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Check className="w-8 h-8 text-green-600" />
                </div>
                <h3 className="text-xl font-semibold mb-2">NCC Agent Ready!</h3>
                <p className="text-gray-600">Your agent is configured and ready to analyze NCC data.</p>
              </div>

              <div className="bg-gray-50 p-6 rounded-lg mb-6">
                <h4 className="font-medium mb-3">What your agent can do:</h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-sm">
                  <div className="flex items-center gap-2">
                    <Check className="w-4 h-4 text-green-500" />
                    <span>Analyze NCC performance by region</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Check className="w-4 h-4 text-green-500" />
                    <span>Track sector-specific trends</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Check className="w-4 h-4 text-green-500" />
                    <span>Provide strategic recommendations</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Check className="w-4 h-4 text-green-500" />
                    <span>Reference uploaded business documents</span>
                  </div>
                </div>
              </div>

              <button
                onClick={onClose}
                className="px-6 py-2 bg-[#1B4332] text-white rounded-lg hover:bg-[#0f2419] transition-colors"
              >
                Start Using Agent
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}