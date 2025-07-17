'use client';

import React, { useEffect, useState } from 'react';
import { BarChart3, Database, Users, ArrowRight, Sparkles, Brain } from 'lucide-react';

interface Agent {
  id: string;
  name: string;
  icon: React.ComponentType<any>;
  color: string;
  status: 'idle' | 'thinking' | 'communicating' | 'complete';
}

interface Communication {
  from: string;
  to: string;
  message: string;
  status: 'active' | 'complete';
}

interface AgentInteractionFlowProps {
  query: string;
  onComplete?: () => void;
}

const agents: Agent[] = [
  {
    id: 'orchestrator',
    name: 'Orchestrator',
    icon: Brain,
    color: 'bg-green-600',
    status: 'idle'
  },
  {
    id: 'financial',
    name: 'Financial Agent',
    icon: BarChart3,
    color: 'bg-green-500',
    status: 'idle'
  },
  {
    id: 'pipeline',
    name: 'Pipeline Agent',
    icon: Database,
    color: 'bg-green-400',
    status: 'idle'
  }
];

export default function AgentInteractionFlow({ query, onComplete }: AgentInteractionFlowProps) {
  const [agentStates, setAgentStates] = useState<Agent[]>(agents);
  const [communications, setCommunications] = useState<Communication[]>([]);
  const [currentStep, setCurrentStep] = useState(0);
  const [isComplete, setIsComplete] = useState(false);
  const [currentMessage, setCurrentMessage] = useState('Starting orchestration...');

  // Animation sequence for "Which deals can help fill revenue gaps?"
  const animationSteps = [
    {
      agentUpdates: [{ id: 'orchestrator', status: 'thinking' as const }],
      communications: [],
      delay: 4000 // Give orchestrator time to think
    },
    {
      agentUpdates: [
        { id: 'orchestrator', status: 'communicating' as const },
        { id: 'financial', status: 'thinking' as const }
      ],
      communications: [{
        from: 'orchestrator',
        to: 'financial',
        message: 'Analyze revenue gaps for Q4',
        status: 'active' as const
      }],
      delay: 5000 // Show communication in action
    },
    {
      agentUpdates: [{ id: 'financial', status: 'communicating' as const }],
      communications: [{
        from: 'orchestrator',
        to: 'financial',
        message: 'Analyze revenue gaps for Q4',
        status: 'complete' as const
      }],
      delay: 4000 // Financial agent processing time
    },
    {
      agentUpdates: [
        { id: 'orchestrator', status: 'thinking' as const },
        { id: 'financial', status: 'complete' as const }
      ],
      communications: [
        {
          from: 'orchestrator',
          to: 'financial',
          message: 'Analyze revenue gaps for Q4',
          status: 'complete' as const
        },
        {
          from: 'financial',
          to: 'orchestrator',
          message: 'Gap: $2.5M in Q4 revenue',
          status: 'active' as const
        }
      ],
      delay: 4000 // Orchestrator thinking about next step
    },
    {
      agentUpdates: [
        { id: 'orchestrator', status: 'communicating' as const },
        { id: 'pipeline', status: 'thinking' as const }
      ],
      communications: [
        {
          from: 'orchestrator',
          to: 'financial',
          message: 'Analyze revenue gaps for Q4',
          status: 'complete' as const
        },
        {
          from: 'financial',
          to: 'orchestrator',
          message: 'Gap: $2.5M in Q4 revenue',
          status: 'complete' as const
        },
        {
          from: 'orchestrator',
          to: 'pipeline',
          message: 'Find deals ≥$2.5M closing Q4',
          status: 'active' as const
        }
      ],
      delay: 5000 // Show pipeline agent working
    },
    {
      agentUpdates: [
        { id: 'pipeline', status: 'communicating' as const }
      ],
      communications: [
        {
          from: 'orchestrator',
          to: 'financial',
          message: 'Analyze revenue gaps for Q4',
          status: 'complete' as const
        },
        {
          from: 'financial',
          to: 'orchestrator',
          message: 'Gap: $2.5M in Q4 revenue',
          status: 'complete' as const
        },
        {
          from: 'orchestrator',
          to: 'pipeline',
          message: 'Find deals ≥$2.5M closing Q4',
          status: 'complete' as const
        }
      ],
      delay: 4000 // Pipeline processing time
    },
    {
      agentUpdates: [
        { id: 'orchestrator', status: 'thinking' as const },
        { id: 'pipeline', status: 'complete' as const }
      ],
      communications: [
        {
          from: 'orchestrator',
          to: 'financial',
          message: 'Analyze revenue gaps for Q4',
          status: 'complete' as const
        },
        {
          from: 'financial',
          to: 'orchestrator',
          message: 'Gap: $2.5M in Q4 revenue',
          status: 'complete' as const
        },
        {
          from: 'orchestrator',
          to: 'pipeline',
          message: 'Find deals ≥$2.5M closing Q4',
          status: 'complete' as const
        },
        {
          from: 'pipeline',
          to: 'orchestrator',
          message: 'Found 5 qualifying deals',
          status: 'active' as const
        }
      ],
      delay: 4000 // Final orchestrator analysis
    },
    {
      agentUpdates: [
        { id: 'orchestrator', status: 'complete' as const },
        { id: 'financial', status: 'complete' as const },
        { id: 'pipeline', status: 'complete' as const }
      ],
      communications: [
        {
          from: 'orchestrator',
          to: 'financial',
          message: 'Analyze revenue gaps for Q4',
          status: 'complete' as const
        },
        {
          from: 'financial',
          to: 'orchestrator',
          message: 'Gap: $2.5M in Q4 revenue',
          status: 'complete' as const
        },
        {
          from: 'orchestrator',
          to: 'pipeline',
          message: 'Find deals ≥$2.5M closing Q4',
          status: 'complete' as const
        },
        {
          from: 'pipeline',
          to: 'orchestrator',
          message: 'Found 5 qualifying deals',
          status: 'complete' as const
        }
      ],
      delay: 3000 // Longer pause before completion
    }
  ];

  // Reset animation when component mounts or query changes
  useEffect(() => {
    setAgentStates(agents);
    setCommunications([]);
    setCurrentStep(0);
    setIsComplete(false);
  }, [query]);

  useEffect(() => {
    if (currentStep < animationSteps.length) {
      const step = animationSteps[currentStep];
      
      // Update agent states
      setAgentStates(prev => prev.map(agent => {
        const update = step.agentUpdates.find(u => u.id === agent.id);
        return update ? { ...agent, status: update.status } : agent;
      }));

      // Update communications
      setCommunications(step.communications);

      // Move to next step
      const timer = setTimeout(() => {
        setCurrentStep(currentStep + 1);
      }, step.delay);

      return () => clearTimeout(timer);
    } else {
      setIsComplete(true);
      if (onComplete) {
        onComplete();
      }
    }
  }, [currentStep, animationSteps, onComplete]);

  const getAgentPosition = (agentId: string) => {
    const positions: Record<string, { x: number; y: number }> = {
      orchestrator: { x: 50, y: 25 },
      financial: { x: 25, y: 75 },
      pipeline: { x: 75, y: 75 }
    };
    return positions[agentId] || { x: 50, y: 50 };
  };

  const renderConnection = (comm: Communication, index: number) => {
    const fromPos = getAgentPosition(comm.from);
    const toPos = getAgentPosition(comm.to);
    
    // Use viewBox coordinates (0-100)
    const x1 = fromPos.x;
    const y1 = fromPos.y;
    const x2 = toPos.x;
    const y2 = toPos.y;
    
    return (
      <g key={index}>
        <line
          x1={x1}
          y1={y1}
          x2={x2}
          y2={y2}
          stroke={comm.status === 'active' ? '#059669' : '#6B7280'}
          strokeWidth="3"
          strokeDasharray={comm.status === 'active' ? '8,4' : 'none'}
          className={comm.status === 'active' ? 'animate-dash' : ''}
        />
        {comm.status === 'active' && (
          <circle r="6" fill="#059669" className="animate-flow">
            <animateMotion
              dur="3s"
              repeatCount="indefinite"
              path={`M${x1},${y1} L${x2},${y2}`}
            />
          </circle>
        )}
        <text
          x={(x1 + x2) / 2}
          y={(y1 + y2) / 2}
          textAnchor="middle"
          className="text-xs fill-gray-700 font-medium"
          dy="-8"
        >
          {comm.message}
        </text>
      </g>
    );
  };

  return (
    <div className={`w-full bg-gradient-to-br from-gray-50 to-gray-100 rounded-lg border border-gray-200 transition-all duration-500 ${
      isComplete ? 'p-4' : 'p-6'
    }`}>
      <div className="mb-4">
        <h3 className={`font-semibold text-gray-900 mb-1 ${
          isComplete ? 'text-base' : 'text-lg'
        }`}>Multi-Agent Orchestration</h3>
        <p className={`text-gray-600 ${
          isComplete ? 'text-xs' : 'text-sm'
        }`}>Analyzing: "Which deals can help fill revenue gaps?"</p>
        {!isComplete && (
          <p className="text-xs text-gray-500 mt-1">Orchestrator coordinates Financial Agent and Pipeline Agent</p>
        )}
      </div>

      <div className={`relative bg-white rounded-lg border border-gray-200 overflow-hidden transition-all duration-500 ${
        isComplete ? 'h-48' : 'h-96'
      }`}>
        <svg className="absolute inset-0 w-full h-full" viewBox="0 0 100 100" preserveAspectRatio="xMidYMid meet">
          <defs>
            <style>
              {`
                @keyframes dash {
                  to {
                    stroke-dashoffset: -10;
                  }
                }
                .animate-dash {
                  animation: dash 0.5s linear infinite;
                }
              `}
            </style>
          </defs>
          
          {/* Render connections */}
          {communications.map((comm, index) => renderConnection(comm, index))}
        </svg>

        {/* Render agents */}
        {agentStates.map((agent) => {
          const pos = getAgentPosition(agent.id);
          const Icon = agent.icon;
          
          return (
            <div
              key={agent.id}
              className="absolute transform -translate-x-1/2 -translate-y-1/2 transition-all duration-300"
              style={{ left: `${pos.x}%`, top: `${pos.y}%` }}
            >
              <div className={`
                relative p-4 bg-white rounded-lg border-2 shadow-lg
                ${agent.status === 'thinking' ? 'border-green-300 animate-pulse' : ''}
                ${agent.status === 'communicating' ? 'border-green-500' : ''}
                ${agent.status === 'complete' ? 'border-green-600' : ''}
                ${agent.status === 'idle' ? 'border-gray-300' : ''}
              `}>
                <div className={`${agent.color} p-2 rounded-lg text-white mb-2`}>
                  <Icon className="w-6 h-6" />
                </div>
                <div className="text-sm font-medium text-gray-900">{agent.name}</div>
                <div className="text-xs text-gray-500 capitalize">{agent.status}</div>
                
                {agent.status === 'thinking' && (
                  <div className="absolute -top-2 -right-2">
                    <Sparkles className="w-4 h-4 text-green-500 animate-spin" />
                  </div>
                )}
                
                {agent.status === 'communicating' && (
                  <div className="absolute -top-2 -right-2">
                    <div className="w-3 h-3 bg-green-500 rounded-full animate-pulse" />
                  </div>
                )}
              </div>
            </div>
          );
        })}

        {/* Status indicator */}
        <div className="absolute bottom-4 left-4">
          <div className={`flex items-center gap-2 px-3 py-1.5 rounded-full text-sm
            ${isComplete ? 'bg-green-100 text-green-700' : 'bg-green-100 text-green-700'}
          `}>
            {isComplete ? (
              <>
                <div className="w-2 h-2 bg-green-500 rounded-full" />
                Analysis Complete
              </>
            ) : (
              <>
                <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse" />
                Orchestrating... Step {currentStep + 1} of {animationSteps.length}
              </>
            )}
          </div>
        </div>
      </div>

      {/* Legend */}
      <div className="mt-4 flex gap-4 text-xs text-gray-600">
        <div className="flex items-center gap-1">
          <div className="w-3 h-3 border-2 border-green-300 rounded" />
          <span>Thinking</span>
        </div>
        <div className="flex items-center gap-1">
          <div className="w-3 h-3 border-2 border-green-500 rounded" />
          <span>Communicating</span>
        </div>
        <div className="flex items-center gap-1">
          <div className="w-3 h-3 border-2 border-green-600 rounded" />
          <span>Complete</span>
        </div>
      </div>
    </div>
  );
}