'use client';

import { useState, useRef, useEffect } from 'react';
import { Send, BarChart3, Database, Users, PlusCircle, Brain } from 'lucide-react';
import Image from 'next/image';
import CompactAgentFlow from '@/components/visualization/CompactAgentFlow';

interface ChatMessage {
  id: string;
  role: 'user' | 'assistant' | 'system';
  content: string;
  timestamp: Date;
  agentId?: string;
  data?: any[];
  chart?: any;
  insights?: string[];
}

interface DataSource {
  id: string;
  name: string;
  description: string;
  icon: React.ComponentType<any>;
  color: string;
}

// Client-only timestamp component to prevent hydration mismatch
function TimeDisplay({ timestamp }: { timestamp: Date }) {
  const [timeString, setTimeString] = useState<string>('');

  useEffect(() => {
    setTimeString(timestamp.toLocaleTimeString());
  }, [timestamp]);

  return <span suppressHydrationWarning>{timeString}</span>;
}

const dataSources: DataSource[] = [
  {
    id: 'ncc-financial',
    name: 'Financial Data',
    description: 'Revenue, expenses, and financial metrics',
    icon: BarChart3,
    color: 'bg-[var(--primary-color)]'
  },
  {
    id: 'pipeline-analytics', 
    name: 'Sales Pipeline',
    description: 'Deals, opportunities, and sales metrics',
    icon: Database,
    color: 'bg-[var(--primary-light)]'
  },
  {
    id: 'attendance-analytics',
    name: 'HR Analytics',
    description: 'Office attendance and workforce metrics',
    icon: Users,
    color: 'bg-blue-600'
  }
];

export function ScenarioPlanning() {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [inputMessage, setInputMessage] = useState('');
  const [selectedDataSource, setSelectedDataSource] = useState<string>('');
  const [isLoading, setIsLoading] = useState(false);
  const [showAgentFlow, setShowAgentFlow] = useState(false);
  const [agentFlowStep, setAgentFlowStep] = useState(0);
  const [pendingResponse, setPendingResponse] = useState<{message: string, data?: any, insights?: string[], agentId?: string} | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const isMountedRef = useRef(true);
  const minDemoTime = 3000;

  useEffect(() => {
    isMountedRef.current = true;
    return () => {
      isMountedRef.current = false;
    };
  }, []);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleSendMessage = async () => {
    if (!inputMessage.trim()) return;

    const newMessage: ChatMessage = {
      id: Date.now().toString(),
      role: 'user',
      content: inputMessage,
      timestamp: new Date()
    };

    setMessages(prev => [...prev, newMessage]);
    setInputMessage('');
    setIsLoading(true);
    setPendingResponse(null);

    try {
      // This will be the same logic from the original page.tsx
      const response = await fetch('/api/snowflake-query', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          query: inputMessage,
          agentId: selectedDataSource || null
        })
      });

      const data = await response.json();

      if (response.ok && data.success && isMountedRef.current) {
        setShowAgentFlow(true);
        setAgentFlowStep(1);
        setPendingResponse({
          message: data.response.content,
          data: data.response.data,
          insights: data.response.insights,
          agentId: data.agent.id
        });

        setTimeout(() => {
          if (isMountedRef.current) {
            setAgentFlowStep(2);
            
            setTimeout(() => {
              if (!isMountedRef.current) return;
              
              const assistantMessage: ChatMessage = {
                id: (Date.now() + 1).toString(),
                role: 'assistant',
                content: pendingResponse?.message || '',
                timestamp: new Date(),
                agentId: pendingResponse?.agentId,
                data: pendingResponse?.data,
                chart: undefined,
                insights: pendingResponse?.insights
              };
              
              setMessages(prev => [...prev, assistantMessage]);
              setAgentFlowStep(3);
              
              setTimeout(() => {
                if (isMountedRef.current) {
                  setShowAgentFlow(false);
                  setAgentFlowStep(0);
                  setIsLoading(false);
                  setPendingResponse(null);
                }
              }, 500);
            }, 1500);
          }
        }, minDemoTime);
      } else if (isMountedRef.current) {
        console.error('API Error Response:', data);
        let errorContent = `Sorry, I encountered an error`;
        
        if (data.error) {
          errorContent += `: ${data.error}`;
        }
        
        if (data.details) {
          errorContent += `\n\nDetails: ${data.details}`;
        }
        
        if (data.missing && data.missing.length > 0) {
          errorContent += `\n\nMissing environment variables: ${data.missing.join(', ')}`;
        }
        
        const errorMessage: ChatMessage = {
          id: (Date.now() + 1).toString(),
          role: 'assistant', 
          content: errorContent,
          timestamp: new Date()
        };
        setMessages(prev => [...prev, errorMessage]);
        setShowAgentFlow(false);
        setIsLoading(false);
        setPendingResponse(null);
        setAgentFlowStep(0);
      }
    } catch (error) {
      console.error('Error sending message:', error);
      if (isMountedRef.current) {
        const errorMessage: ChatMessage = {
          id: (Date.now() + 1).toString(),
          role: 'assistant',
          content: `Sorry, I'm having trouble processing your request. ${error instanceof Error ? error.message : 'Please try again.'}`,
          timestamp: new Date()
        };
        setMessages(prev => [...prev, errorMessage]);
        setShowAgentFlow(false);
        setIsLoading(false);
        setPendingResponse(null);
        setAgentFlowStep(0);
      }
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  const getAgentInfo = (agentId?: string) => {
    return dataSources.find(ds => ds.id === agentId);
  };

  const sampleQueries = [
    "What are the top 5 regions by revenue?",
    "Which deals can help fill revenue gaps?",
    "Compare sales pipeline performance across regions",
    "Show me attendance trends by office",
    "Analyze correlation between attendance and sales performance"
  ];

  return (
    <div className="flex h-full">
      {/* Sidebar - Data Sources */}
      <div className="w-80 bg-white border-r flex flex-col shadow-lg" style={{ borderColor: 'var(--border-light)' }}>
        <div className="p-6 border-b" style={{ borderColor: 'var(--border-light)', background: 'var(--background)' }}>
          <h3 className="text-lg font-semibold mb-2">Scenario Planning</h3>
          <p className="text-sm text-gray-600">Multi-agent orchestration for complex queries</p>
        </div>

        <div className="p-4">
          <h3 className="text-sm font-semibold mb-4" style={{ color: 'var(--foreground)' }}>Data Sources</h3>
          <div className="space-y-3">
            {dataSources.map((source) => {
              const Icon = source.icon;
              const isSelected = selectedDataSource === source.id;
              return (
                <button
                  key={source.id}
                  onClick={() => setSelectedDataSource(
                    selectedDataSource === source.id ? '' : source.id
                  )}
                  className={`w-full p-4 rounded-xl border-2 transition-all duration-200 group ${
                    isSelected
                      ? 'border-[var(--primary-color)] shadow-md'
                      : 'border-[var(--border-light)] hover:border-[var(--primary-light)] hover:shadow-sm'
                  }`}
                  style={{ 
                    background: isSelected ? 'var(--secondary-color)' : 'var(--background)',
                  }}
                >
                  <div className="flex items-center space-x-3">
                    <div 
                      className={`p-2 rounded-lg text-white transition-transform group-hover:scale-110 ${source.color}`}
                    >
                      <Icon width={18} height={18} />
                    </div>
                    <div className="text-left flex-1">
                      <h4 className="font-medium text-sm" style={{ color: 'var(--foreground)' }}>{source.name}</h4>
                      <p className="text-xs mt-1" style={{ color: 'var(--text-secondary)' }}>{source.description}</p>
                    </div>
                  </div>
                </button>
              );
            })}
          </div>
        </div>

        <div className="p-4 border-t" style={{ borderColor: 'var(--border-light)', marginTop: 'auto' }}>
          <h3 className="text-sm font-semibold mb-3" style={{ color: 'var(--foreground)' }}>Sample Queries</h3>
          <div className="space-y-2">
            {sampleQueries.map((query, index) => (
              <button
                key={index}
                onClick={() => setInputMessage(query)}
                className="w-full text-left p-2 rounded-lg text-xs hover:bg-gray-50 transition-colors"
                style={{ color: 'var(--text-secondary)' }}
              >
                {query}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Main Chat Area */}
      <div className="flex-1 flex flex-col">
        {/* Messages Area */}
        <div className="flex-1 overflow-y-auto p-6">
          {/* Agent Flow Animation */}
          {showAgentFlow && pendingResponse && (
            <div className="mb-6">
              <CompactAgentFlow 
                query={inputMessage}
                onComplete={() => {
                  setShowAgentFlow(false);
                  setAgentFlowStep(0);
                }}
              />
            </div>
          )}
          
          {messages.length === 0 ? (
            <div className="text-center py-20">
              <Brain className="w-16 h-16 mx-auto mb-4" style={{ color: 'var(--primary-light)' }} />
              <h2 className="text-2xl font-semibold mb-2">Welcome to BeaconAgent</h2>
              <p className="text-gray-600 max-w-md mx-auto">
                I can help you analyze data across multiple sources. Select a data source or ask a complex question to get started.
              </p>
            </div>
          ) : (
            <div className="space-y-4 max-w-4xl mx-auto">
              {messages.map((message) => {
                const agent = getAgentInfo(message.agentId);
                return (
                  <div key={message.id} className={`flex ${message.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                    <div className={`max-w-3xl ${message.role === 'user' ? 'order-2' : 'order-1'}`}>
                      {message.role === 'assistant' && agent && (
                        <div className="flex items-center gap-2 mb-2">
                          <div className={`p-1.5 rounded-lg text-white ${agent.color}`}>
                            <agent.icon width={16} height={16} />
                          </div>
                          <span className="text-sm font-medium" style={{ color: 'var(--text-secondary)' }}>
                            {agent.name}
                          </span>
                        </div>
                      )}
                      <div
                        className={`rounded-xl px-4 py-3 ${
                          message.role === 'user'
                            ? 'bg-[var(--primary-color)] text-white'
                            : 'bg-gray-100 text-gray-800'
                        }`}
                      >
                        <p className="whitespace-pre-wrap">{message.content}</p>
                        
                        {message.data && message.data.length > 0 && (
                          <div className="mt-4 bg-white rounded-lg p-4 border border-gray-200">
                            <div className="overflow-x-auto">
                              <table className="min-w-full divide-y divide-gray-200">
                                <thead>
                                  <tr>
                                    {Object.keys(message.data[0]).map((key) => (
                                      <th
                                        key={key}
                                        className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                                      >
                                        {key}
                                      </th>
                                    ))}
                                  </tr>
                                </thead>
                                <tbody className="divide-y divide-gray-200">
                                  {message.data.slice(0, 10).map((row, index) => (
                                    <tr key={index}>
                                      {Object.values(row).map((value: any, cellIndex) => (
                                        <td key={cellIndex} className="px-4 py-2 text-sm text-gray-900">
                                          {value}
                                        </td>
                                      ))}
                                    </tr>
                                  ))}
                                </tbody>
                              </table>
                              {message.data.length > 10 && (
                                <p className="text-sm text-gray-500 mt-2">
                                  Showing 10 of {message.data.length} rows
                                </p>
                              )}
                            </div>
                          </div>
                        )}

                        {message.insights && message.insights.length > 0 && (
                          <div className="mt-4 bg-blue-50 rounded-lg p-4">
                            <h4 className="font-medium text-blue-900 mb-2">Key Insights</h4>
                            <ul className="list-disc list-inside space-y-1">
                              {message.insights.map((insight, index) => (
                                <li key={index} className="text-sm text-blue-800">{insight}</li>
                              ))}
                            </ul>
                          </div>
                        )}
                      </div>
                      <span className="text-xs text-gray-500 mt-1 block">
                        <TimeDisplay timestamp={message.timestamp} />
                      </span>
                    </div>
                  </div>
                );
              })}
              <div ref={messagesEndRef} />
            </div>
          )}
        </div>

        {/* Input Area */}
        <div className="border-t p-4 bg-white" style={{ borderColor: 'var(--border-light)' }}>
          <div className="flex space-x-2 max-w-4xl mx-auto">
            <input
              type="text"
              value={inputMessage}
              onChange={(e) => setInputMessage(e.target.value)}
              onKeyPress={handleKeyPress}
              placeholder="Ask a question about your data..."
              className="flex-1 px-4 py-3 border rounded-xl focus:outline-none focus:ring-2 focus:ring-[var(--primary-color)] focus:border-transparent"
              style={{ borderColor: 'var(--border-light)' }}
              disabled={isLoading}
            />
            <button
              onClick={handleSendMessage}
              disabled={isLoading || !inputMessage.trim()}
              className="px-4 py-3 bg-[var(--primary-color)] text-white rounded-xl hover:bg-[var(--primary-dark)] disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              <Send width={20} height={20} />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}