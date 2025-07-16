'use client';

import { useState } from 'react';

interface Agent {
  id: string;
  name: string;
  description: string;
  dataSourceId: string;
  capabilities: string[];
  status: string;
}

interface QueryResponse {
  success: boolean;
  agent: {
    id: string;
    name: string;
    description: string;
    dataSourceId: string;
  };
  response: {
    content: string;
    data?: any[];
    sql?: string;
    confidence: number;
    suggestions?: string[];
    reasoning?: string;
  };
}

export default function TestAgentsPage() {
  const [agents, setAgents] = useState<Agent[]>([]);
  const [selectedAgent, setSelectedAgent] = useState<string>('');
  const [query, setQuery] = useState<string>('');
  const [response, setResponse] = useState<QueryResponse | null>(null);
  const [loading, setLoading] = useState<boolean>(false);
  const [collaborationId, setCollaborationId] = useState<string>('');

  const loadAgents = async () => {
    try {
      const res = await fetch('/api/agents/query');
      const data = await res.json();
      if (data.success) {
        setAgents(data.agents);
      }
    } catch (error) {
      console.error('Failed to load agents:', error);
    }
  };

  const queryAgent = async () => {
    if (!selectedAgent || !query.trim()) return;

    setLoading(true);
    try {
      const res = await fetch('/api/agents/query', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          agentId: selectedAgent,
          query: query.trim(),
          context: {
            conversationId: 'test-conversation',
            userId: 'test-user'
          }
        })
      });

      const data = await res.json();
      setResponse(data);
    } catch (error) {
      console.error('Failed to query agent:', error);
    } finally {
      setLoading(false);
    }
  };

  const startCollaboration = async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/agents/collaborate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          topic: 'Revenue Gap Analysis',
          query: 'Analyze revenue gaps and determine if pipeline performance can explain or fill them. NCC Agent should identify gaps, Pipeline Agent should check Won deals coverage.',
          leadAgentId: 'ncc-financial',
          collaboratingAgentIds: ['pipeline-analytics', 'attendance-analytics']
        })
      });

      const data = await res.json();
      if (data.success) {
        setCollaborationId(data.collaborationId);
      }
    } catch (error) {
      console.error('Failed to start collaboration:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="container mx-auto px-4 py-8 max-w-4xl">
      <h1 className="text-3xl font-bold mb-8">BeaconAgent Test Interface</h1>
      
      {/* Load Agents */}
      <div className="mb-8 p-6 bg-gray-50 rounded-lg">
        <h2 className="text-xl font-semibold mb-4">1. Load Available Agents</h2>
        <button
          onClick={loadAgents}
          className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600"
        >
          Load Agents
        </button>
        
        {agents.length > 0 && (
          <div className="mt-4">
            <h3 className="font-medium mb-2">Available Agents:</h3>
            <div className="space-y-2">
              {agents.map(agent => (
                <div key={agent.id} className="p-3 bg-white rounded border">
                  <div className="font-medium">{agent.name}</div>
                  <div className="text-sm text-gray-600">{agent.description}</div>
                  <div className="text-xs text-gray-500">
                    Status: {agent.status} | Capabilities: {agent.capabilities.join(', ')}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Individual Agent Query */}
      <div className="mb-8 p-6 bg-gray-50 rounded-lg">
        <h2 className="text-xl font-semibold mb-4">2. Query Individual Agent</h2>
        
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium mb-2">Select Agent:</label>
            <select
              value={selectedAgent}
              onChange={(e) => setSelectedAgent(e.target.value)}
              className="w-full p-2 border rounded"
            >
              <option value="">Choose an agent...</option>
              {agents.map(agent => (
                <option key={agent.id} value={agent.dataSourceId}>
                  {agent.name}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium mb-2">Query:</label>
            <textarea
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Ask the agent a question about their data..."
              className="w-full p-3 border rounded h-24"
            />
          </div>

          <button
            onClick={queryAgent}
            disabled={!selectedAgent || !query.trim() || loading}
            className="bg-green-500 text-white px-4 py-2 rounded hover:bg-green-600 disabled:bg-gray-400"
          >
            {loading ? 'Processing...' : 'Query Agent'}
          </button>
        </div>

        {/* Response Display */}
        {response && (
          <div className="mt-6 p-4 bg-white rounded border">
            <h3 className="font-semibold mb-2">{response.agent.name} Response:</h3>
            <div className="space-y-3">
              <div>
                <div className="font-medium">Analysis:</div>
                <div className="text-gray-700">{response.response.content}</div>
              </div>
              
              {response.response.sql && (
                <div>
                  <div className="font-medium">SQL Query:</div>
                  <pre className="text-sm bg-gray-100 p-2 rounded overflow-x-auto">
                    {response.response.sql}
                  </pre>
                </div>
              )}
              
              {response.response.data && response.response.data.length > 0 && (
                <div>
                  <div className="font-medium">Data ({response.response.data.length} rows):</div>
                  <pre className="text-sm bg-gray-100 p-2 rounded overflow-x-auto max-h-40">
                    {JSON.stringify(response.response.data.slice(0, 3), null, 2)}
                  </pre>
                </div>
              )}
              
              <div className="text-sm text-gray-600">
                Confidence: {(response.response.confidence * 100).toFixed(1)}%
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Agent Collaboration */}
      <div className="mb-8 p-6 bg-gray-50 rounded-lg">
        <h2 className="text-xl font-semibold mb-4">3. Start Agent Collaboration</h2>
        <p className="text-gray-600 mb-4">
          This will start a conversation between the NCC Financial Agent and Pipeline Analytics Agent
          to analyze revenue gaps and pipeline coverage.
        </p>
        
        <button
          onClick={startCollaboration}
          disabled={loading}
          className="bg-purple-500 text-white px-4 py-2 rounded hover:bg-purple-600 disabled:bg-gray-400"
        >
          {loading ? 'Starting...' : 'Start Revenue Gap Analysis'}
        </button>

        {collaborationId && (
          <div className="mt-4 p-3 bg-white rounded border">
            <div className="font-medium">Collaboration Started!</div>
            <div className="text-sm text-gray-600">ID: {collaborationId}</div>
            <div className="text-sm mt-2">
              Check the browser console and server logs to see the agent conversation in real-time.
            </div>
          </div>
        )}
      </div>

      {/* Sample Queries */}
      <div className="p-6 bg-blue-50 rounded-lg">
        <h2 className="text-xl font-semibold mb-4">Sample Queries to Try</h2>
        <div className="space-y-2 text-sm">
          <div><strong>NCC Financial Agent:</strong> "What are the top 5 regions by total NCC revenue? Show me the specific numbers."</div>
          <div><strong>Pipeline Analytics Agent:</strong> "Which regions have the highest value Won deals? Break it down by sector."</div>
          <div><strong>Attendance Analytics Agent:</strong> "What is the average attendance rate by office? Which offices have the lowest attendance?"</div>
        </div>
      </div>
    </div>
  );
}