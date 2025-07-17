'use client';

import { useState, useRef, useEffect } from 'react';
import { Send, BarChart3, Database, Users, PlusCircle, Brain } from 'lucide-react';
import Image from 'next/image';

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
    description: 'Employee attendance and office metrics',
    icon: Users,
    color: 'bg-[var(--accent-color)]'
  }
];

export default function HomePage() {
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      id: '1',
      role: 'system',
      content: 'Welcome to BeaconAgent! I can help you analyze data across multiple sources. Ask me about revenue, sales pipeline, or employee metrics.',
      timestamp: new Date('2024-01-01T00:00:00.000Z')
    }
  ]);
  const [input, setInput] = useState('');
  const [selectedDataSource, setSelectedDataSource] = useState<string>('');
  const [isLoading, setIsLoading] = useState(false);
  const [showAgentFlow, setShowAgentFlow] = useState(false);
  const [currentQuery, setCurrentQuery] = useState('');
  const [pendingResponse, setPendingResponse] = useState<ChatMessage | null>(null);
  const [agentFlowStep, setAgentFlowStep] = useState(0);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const isMountedRef = useRef<boolean>(true);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  // Cleanup effect to prevent state updates on unmounted component
  useEffect(() => {
    isMountedRef.current = true;
    return () => {
      isMountedRef.current = false;
    };
  }, []);

  // Handle agent flow animation
  useEffect(() => {
    if (showAgentFlow && agentFlowStep < 4) {
      const durations = [4000, 5000, 5000, 3000, 2000];
      const timer = setTimeout(() => {
        setAgentFlowStep(prev => prev + 1);
      }, durations[agentFlowStep]);
      
      return () => clearTimeout(timer);
    } else if (agentFlowStep === 4) {
      // Complete the flow
      setTimeout(() => {
        handleAgentFlowComplete();
      }, 2000);
    }
  }, [showAgentFlow, agentFlowStep]);

  const handleSendMessage = async () => {
    if (!input.trim()) return;

    const userMessage: ChatMessage = {
      id: Date.now().toString(),
      role: 'user',
      content: input.trim(),
      timestamp: new Date()
    };

    setMessages(prev => [...prev, userMessage]);
    setInput('');
    setIsLoading(true);
    setCurrentQuery(input.trim());
    setShowAgentFlow(true);
    setAgentFlowStep(0);


    try {
      // Determine which agent to use based on query or selected data source
      let agentId = selectedDataSource;
      
      // Smart routing based on query content
      if (!agentId) {
        const query = input.toLowerCase();
        if (query.includes('revenue') || query.includes('financial') || query.includes('ncc')) {
          agentId = 'ncc-financial';
        } else if (query.includes('pipeline') || query.includes('deals') || query.includes('sales')) {
          agentId = 'pipeline-analytics';
        } else if (query.includes('attendance') || query.includes('office') || query.includes('employee')) {
          agentId = 'attendance-analytics';
        } else {
          agentId = 'ncc-financial'; // Default
        }
      }

      // Check if this is a multi-agent query
      const isMultiAgent = input.toLowerCase().includes('compare') || 
                          input.toLowerCase().includes('correlation') ||
                          input.toLowerCase().includes('relationship');

      let response;
      
      // Use working Snowflake query endpoint for real data responses
      response = await fetch('/api/snowflake-query', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          query: input.trim(),
          agentId
        })
      });

      const data = await response.json();

      if (isMountedRef.current && data.success) {
        const assistantMessage: ChatMessage = {
          id: (Date.now() + 1).toString(),
          role: 'assistant',
          content: data.response?.content || data.message || 'Analysis complete.',
          timestamp: new Date(),
          agentId: data.agent?.id || agentId,
          data: data.response?.data,
          insights: data.response?.insights || data.insights
        };

        // Wait for minimum demo time before showing results (let animation run)
        const minDemoTime = 8000; // 8 seconds minimum
        setTimeout(() => {
          if (isMountedRef.current) {
            // Add the multi-agent analysis to the message
            const messageWithAnalysis = {
              ...assistantMessage,
              content: assistantMessage.content + '\n\n[MULTI_AGENT_ANALYSIS]'
            };
            setMessages(prev => [...prev, messageWithAnalysis]);
          }
        }, minDemoTime);
      } else if (isMountedRef.current) {
        // Show detailed error information including missing env vars
        let errorContent = `Sorry, I encountered an error: ${data.error}`;
        
        if (data.missing && data.missing.length > 0) {
          errorContent += `\n\nMissing environment variables: ${data.missing.join(', ')}`;
        }
        
        if (data.available && data.available.length > 0) {
          errorContent += `\n\nAvailable environment variables: ${data.available.join(', ')}`;
        }
        
        if (data.allSnowflakeEnvVars && data.allSnowflakeEnvVars.length > 0) {
          errorContent += `\n\nAll Snowflake env vars found: ${data.allSnowflakeEnvVars.join(', ')}`;
        }
        
        if (data.envVarDetails) {
          errorContent += `\n\nEnvironment variable status: ${JSON.stringify(data.envVarDetails, null, 2)}`;
        }
        
        if (data.details) {
          errorContent += `\n\nDetails: ${data.details}`;
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
          content: `Sorry, I'm having trouble processing your request. Error: ${error instanceof Error ? error.message : 'Unknown error'}. Please try again.`,
          timestamp: new Date()
        };
        setMessages(prev => [...prev, errorMessage]);
        setShowAgentFlow(false);
        setIsLoading(false);
        setPendingResponse(null);
        setAgentFlowStep(0);
      }
    } finally {
      if (isMountedRef.current) {
        setIsLoading(false);
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

  const handleAgentFlowComplete = () => {
    // Just stop loading - message is already shown
    setIsLoading(false);
    // Don't hide showAgentFlow - keep it visible
  };

  const sampleQueries = [
    "What are the top 5 regions by revenue?",
    "Which deals can help fill revenue gaps?",
    "Compare sales pipeline performance across regions",
    "Show me attendance trends by office",
    "Analyze correlation between attendance and sales performance"
  ];

  return (
    <div className="flex h-screen font-sans" style={{ background: 'var(--background-secondary)', fontFamily: 'Inter, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif' }}>
      {/* Sidebar - Data Sources */}
      <div className="w-80 bg-white border-r flex flex-col shadow-lg" style={{ borderColor: 'var(--border-light)' }}>
        <div className="p-6 border-b" style={{ borderColor: 'var(--border-light)', background: 'var(--background)' }}>
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
              <h1 className="text-2xl font-bold" style={{ color: 'var(--primary-color)', fontFamily: 'Inter, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif' }}>BeaconAgent</h1>
              <p className="text-sm text-secondary" style={{ fontFamily: 'Inter, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif' }}>Multi-Agent Data Platform</p>
            </div>
          </div>
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
                      <div className="font-semibold" style={{ color: 'var(--foreground)', fontFamily: 'Inter, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif' }}>
                        {source.name}
                      </div>
                      <div className="text-xs text-secondary leading-relaxed" style={{ fontFamily: 'Inter, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif' }}>
                        {source.description}
                      </div>
                    </div>
                  </div>
                </button>
              );
            })}
          </div>
        </div>

        <div className="p-4">
          <h3 className="text-sm font-semibold text-gray-700 mb-3" style={{ fontFamily: 'Inter, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif' }}>Sample Queries</h3>
          <div className="space-y-2">
            {sampleQueries.map((query, index) => (
              <button
                key={index}
                onClick={() => setInput(query)}
                className="w-full p-2 text-left text-sm text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded transition-colors"
                style={{ fontFamily: 'Inter, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif' }}
              >
                {query}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Main Chat Area */}
      <div className="flex-1 flex flex-col">
        {/* Messages */}
        <div className="flex-1 overflow-y-auto p-4 space-y-4">
          {messages.map((message) => {
            const agentInfo = getAgentInfo(message.agentId);
            return (
              <div
                key={message.id}
                className={`flex ${
                  message.role === 'user' ? 'justify-end' : 'justify-start'
                }`}
              >
                <div
                  className={`max-w-3xl rounded-lg p-4 chat-message ${
                    message.role === 'user'
                      ? 'bg-blue-500 text-white user'
                      : message.role === 'system'
                      ? 'bg-gray-100 text-gray-800 system'
                      : 'bg-white border border-gray-200 text-black'
                  }`}
                  style={{ fontFamily: 'Inter, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif' }}
                >
                  
                  <div className="whitespace-pre-wrap text-black" style={{ fontFamily: 'Inter, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif' }}>
                    {message.content.replace('\n\n[MULTI_AGENT_ANALYSIS]', '')}
                  </div>
                  
                  {/* Multi-Agent Analysis - show if marker is present */}
                  {message.content.includes('[MULTI_AGENT_ANALYSIS]') && (
                    <div className="mt-4 bg-gray-50 rounded-lg p-4 border border-gray-200">
                      <div className="flex items-center gap-2 mb-4">
                        <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                        <span className="text-sm font-medium text-gray-700">Multi-Agent Analysis</span>
                      </div>

                      {/* Agents */}
                      <div className="flex items-center justify-between mb-4">
                        {/* Orchestrator */}
                        <div className="flex flex-col items-center">
                          <div className="w-10 h-10 rounded-lg flex items-center justify-center border-2 bg-gray-50 border-gray-200">
                            <Brain className="w-5 h-5 text-green-600" />
                          </div>
                          <span className="text-xs mt-1">Orchestrator</span>
                        </div>

                        {/* Line 1 */}
                        <div className="flex-1 h-px mx-3 bg-green-500"></div>

                        {/* Financial */}
                        <div className="flex flex-col items-center">
                          <div className="w-10 h-10 rounded-lg flex items-center justify-center border-2 bg-gray-50 border-gray-200">
                            <BarChart3 className="w-5 h-5 text-green-600" />
                          </div>
                          <span className="text-xs mt-1">Financial</span>
                        </div>

                        {/* Line 2 */}
                        <div className="flex-1 h-px mx-3 bg-green-500"></div>

                        {/* Pipeline */}
                        <div className="flex flex-col items-center">
                          <div className="w-10 h-10 rounded-lg flex items-center justify-center border-2 bg-gray-50 border-gray-200">
                            <Database className="w-5 h-5 text-green-600" />
                          </div>
                          <span className="text-xs mt-1">Pipeline</span>
                        </div>
                      </div>

                      {/* Status */}
                      <div className="text-center">
                        <div className="text-xs text-gray-600">Analysis complete</div>
                      </div>
                    </div>
                  )}
                  
                  
                  {message.data && message.data.length > 0 && (
                    <div className="mt-3 p-3 bg-gray-50 rounded border">
                      <div className="text-sm font-medium text-gray-700 mb-2">
                        Data Results ({message.data.length} rows)
                      </div>
                      <div className="text-xs text-gray-600 font-mono max-h-32 overflow-y-auto">
                        {JSON.stringify(message.data.slice(0, 3), null, 2)}
                        {message.data.length > 3 && <div>... and {message.data.length - 3} more rows</div>}
                      </div>
                    </div>
                  )}

                  {message.insights && message.insights.length > 0 && (
                    <div className="mt-3 space-y-1">
                      {message.insights.map((insight, index) => (
                        <div key={index} className="text-sm text-blue-600 bg-blue-50 p-2 rounded">
                          💡 {insight}
                        </div>
                      ))}
                    </div>
                  )}

                  <div className="text-xs text-gray-500 mt-2">
                    <TimeDisplay timestamp={message.timestamp} />
                  </div>
                </div>
              </div>
            );
          })}
          
          
          {isLoading && showAgentFlow && (
            <div className="flex justify-start">
              <div className="max-w-lg w-full">
                <div className="bg-white rounded-lg border border-gray-200 p-4 shadow-sm">
                  <div className="flex items-center gap-2 mb-4">
                    <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
                    <span className="text-sm font-medium text-gray-700">Multi-Agent Analysis</span>
                  </div>

                  {/* Agents */}
                  <div className="flex items-center justify-between mb-4">
                    {/* Orchestrator */}
                    <div className="flex flex-col items-center">
                      <div className={`w-10 h-10 rounded-lg flex items-center justify-center border-2 transition-all duration-500 ${
                        agentFlowStep === 0 || agentFlowStep === 3
                          ? 'bg-green-100 border-green-500 ring-4 ring-green-300 shadow-lg shadow-green-200 animate-pulse' 
                          : 'bg-gray-50 border-gray-200'
                      }`}>
                        <Brain className="w-5 h-5 text-green-600" />
                      </div>
                      <span className="text-xs mt-1">Orchestrator</span>
                    </div>

                    {/* Line 1 */}
                    <div className={`flex-1 h-px mx-3 transition-all duration-1000 ${
                      agentFlowStep >= 1 ? 'bg-green-500' : 'bg-gray-200'
                    }`}></div>

                    {/* Financial */}
                    <div className="flex flex-col items-center">
                      <div className={`w-10 h-10 rounded-lg flex items-center justify-center border-2 transition-all duration-500 ${
                        agentFlowStep === 1
                          ? 'bg-green-100 border-green-500 ring-4 ring-green-300 shadow-lg shadow-green-200 animate-pulse' 
                          : 'bg-gray-50 border-gray-200'
                      }`}>
                        <BarChart3 className="w-5 h-5 text-green-600" />
                      </div>
                      <span className="text-xs mt-1">Financial</span>
                    </div>

                    {/* Line 2 */}
                    <div className={`flex-1 h-px mx-3 transition-all duration-1000 ${
                      agentFlowStep >= 2 ? 'bg-green-500' : 'bg-gray-200'
                    }`}></div>

                    {/* Pipeline */}
                    <div className="flex flex-col items-center">
                      <div className={`w-10 h-10 rounded-lg flex items-center justify-center border-2 transition-all duration-500 ${
                        agentFlowStep === 2
                          ? 'bg-green-100 border-green-500 ring-4 ring-green-300 shadow-lg shadow-green-200 animate-pulse' 
                          : 'bg-gray-50 border-gray-200'
                      }`}>
                        <Database className="w-5 h-5 text-green-600" />
                      </div>
                      <span className="text-xs mt-1">Pipeline</span>
                    </div>
                  </div>

                  {/* Status */}
                  <div className="text-center">
                    <div className="text-xs text-gray-600">
                      {agentFlowStep === 0 && 'Orchestrator analyzing query...'}
                      {agentFlowStep === 1 && 'Financial Agent finding revenue gaps...'}
                      {agentFlowStep === 2 && 'Pipeline Agent searching deals...'}
                      {agentFlowStep === 3 && 'Orchestrator combining results...'}
                      {agentFlowStep >= 4 && 'Analysis complete'}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}
          
          {isLoading && !showAgentFlow && (
            <div className="flex justify-start">
              <div className="bg-white border border-gray-200 rounded-lg p-4">
                <div className="flex items-center space-x-2">
                  <div className="animate-spin rounded-full h-4 w-4 border-2 border-blue-500 border-t-transparent"></div>
                  <span className="text-gray-600">Analyzing data...</span>
                </div>
              </div>
            </div>
          )}
          
          <div ref={messagesEndRef} />
        </div>

        {/* Input Area */}
        <div className="border-t border-gray-200 p-4 bg-white">
          {selectedDataSource && (
            <div className="mb-2 flex items-center space-x-2">
              <span className="text-xs text-gray-500">Querying:</span>
              <div className="flex items-center space-x-1">
                {(() => {
                  const source = dataSources.find(ds => ds.id === selectedDataSource);
                  if (!source) return null;
                  const Icon = source.icon;
                  return (
                    <>
                      <div className={`p-1 rounded ${source.color} text-white`}>
                        <Icon width={10} height={10} />
                      </div>
                      <span className="text-xs font-medium text-gray-700">
                        {source.name}
                      </span>
                    </>
                  );
                })()}
              </div>
              <button
                onClick={() => setSelectedDataSource('')}
                className="text-xs text-gray-400 hover:text-gray-600"
              >
                ✕
              </button>
            </div>
          )}
          
          <div className="flex space-x-2">
            <textarea
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyPress={handleKeyPress}
              placeholder="Ask me about your data... (e.g., 'What are the top regions by revenue?')"
              className="flex-1 p-3 border border-gray-300 rounded-lg resize-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-black bg-white"
              style={{ fontFamily: 'Inter, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif', color: '#000000' }}
              rows={2}
              disabled={isLoading}
            />
            <button
              onClick={handleSendMessage}
              disabled={!input.trim() || isLoading}
              className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 disabled:bg-gray-400 transition-colors"
            >
              <Send width={20} height={20} />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}