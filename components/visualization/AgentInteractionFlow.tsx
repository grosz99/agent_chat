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
    color: 'bg-purple-500',
    status: 'idle'
  },
  {
    id: 'financial',
    name: 'Financial Agent',
    icon: BarChart3,
    color: 'bg-blue-500',
    status: 'idle'
  },
  {
    id: 'pipeline',
    name: 'Pipeline Agent',
    icon: Database,
    color: 'bg-green-500',
    status: 'idle'
  },
  {
    id: 'hr',
    name: 'HR Agent',
    icon: Users,
    color: 'bg-orange-500',
    status: 'idle'
  }
];

export default function AgentInteractionFlow({ query, onComplete }: AgentInteractionFlowProps) {
  const [agentStates, setAgentStates] = useState<Agent[]>(agents);
  const [communications, setCommunications] = useState<Communication[]>([]);
  const [currentStep, setCurrentStep] = useState(0);
  const [isComplete, setIsComplete] = useState(false);

  // Animation sequence for "Which deals can help fill revenue gaps?"
  const animationSteps = [
    {
      agentUpdates: [{ id: 'orchestrator', status: 'thinking' as const }],
      communications: [],
      delay: 2000 // Give orchestrator time to think
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
      delay: 3000 // Show communication in action
    },
    {
      agentUpdates: [{ id: 'financial', status: 'communicating' as const }],
      communications: [{
        from: 'orchestrator',
        to: 'financial',
        message: 'Analyze revenue gaps for Q4',
        status: 'complete' as const
      }],
      delay: 2500 // Financial agent processing time
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
      delay: 2000 // Orchestrator thinking about next step
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
      delay: 3000 // Show pipeline agent working
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
      delay: 2500 // Pipeline processing time
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
      delay: 2000 // Final orchestrator analysis
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
      delay: 1000 // Brief pause before completion
    }
  ];

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
        // Give time to see the complete state before moving to results
        setTimeout(onComplete, 3000);
      }
    }
  }, [currentStep, animationSteps, onComplete]);

  const getAgentPosition = (agentId: string) => {
    const positions: Record<string, { x: number; y: number }> = {
      orchestrator: { x: 50, y: 20 },
      financial: { x: 20, y: 70 },
      pipeline: { x: 80, y: 70 },
      hr: { x: 50, y: 120 }
    };
    return positions[agentId] || { x: 50, y: 50 };
  };

  const renderConnection = (comm: Communication, index: number) => {
    const fromPos = getAgentPosition(comm.from);
    const toPos = getAgentPosition(comm.to);
    
    return (
      <g key={index}>
        <line
          x1={`${fromPos.x}%`}
          y1={`${fromPos.y}%`}
          x2={`${toPos.x}%`}
          y2={`${toPos.y}%`}
          stroke={comm.status === 'active' ? '#3B82F6' : '#9CA3AF'}
          strokeWidth="2"
          strokeDasharray={comm.status === 'active' ? '5,5' : 'none'}
          className={comm.status === 'active' ? 'animate-dash' : ''}
        />
        {comm.status === 'active' && (
          <circle r="4" fill="#3B82F6" className="animate-flow">
            <animateMotion
              dur="2s"
              repeatCount="indefinite"
              path={`M${fromPos.x},${fromPos.y} L${toPos.x},${toPos.y}`}
            />
          </circle>
        )}
        <text
          x={`${(fromPos.x + toPos.x) / 2}%`}
          y={`${(fromPos.y + toPos.y) / 2}%`}
          textAnchor="middle"
          className="text-xs fill-gray-600"
          dy="-5"
        >
          {comm.message}
        </text>
      </g>
    );
  };

  return (
    <div className="w-full bg-gradient-to-br from-gray-50 to-gray-100 rounded-lg border border-gray-200 p-6">
      <div className="mb-4">
        <h3 className="text-lg font-semibold text-gray-900 mb-1">Agent Collaboration Network</h3>
        <p className="text-sm text-gray-600">Query: "{query}"</p>
      </div>

      <div className="relative h-96 bg-white rounded-lg border border-gray-200 overflow-hidden">
        <svg className="absolute inset-0 w-full h-full">
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
                ${agent.status === 'thinking' ? 'border-yellow-400 animate-pulse' : ''}
                ${agent.status === 'communicating' ? 'border-blue-400' : ''}
                ${agent.status === 'complete' ? 'border-green-400' : ''}
                ${agent.status === 'idle' ? 'border-gray-300' : ''}
              `}>
                <div className={`${agent.color} p-2 rounded-lg text-white mb-2`}>
                  <Icon className="w-6 h-6" />
                </div>
                <div className="text-sm font-medium text-gray-900">{agent.name}</div>
                <div className="text-xs text-gray-500 capitalize">{agent.status}</div>
                
                {agent.status === 'thinking' && (
                  <div className="absolute -top-2 -right-2">
                    <Sparkles className="w-4 h-4 text-yellow-500 animate-spin" />
                  </div>
                )}
                
                {agent.status === 'communicating' && (
                  <div className="absolute -top-2 -right-2">
                    <div className="w-3 h-3 bg-blue-500 rounded-full animate-pulse" />
                  </div>
                )}
              </div>
            </div>
          );
        })}

        {/* Status indicator */}
        <div className="absolute bottom-4 left-4">
          <div className={`flex items-center gap-2 px-3 py-1.5 rounded-full text-sm
            ${isComplete ? 'bg-green-100 text-green-700' : 'bg-blue-100 text-blue-700'}
          `}>
            {isComplete ? (
              <>
                <div className="w-2 h-2 bg-green-500 rounded-full" />
                Analysis Complete
              </>
            ) : (
              <>
                <div className="w-2 h-2 bg-blue-500 rounded-full animate-pulse" />
                Orchestrating... Step {currentStep + 1} of {animationSteps.length}
              </>
            )}
          </div>
        </div>
      </div>

      {/* Legend */}
      <div className="mt-4 flex gap-4 text-xs text-gray-600">
        <div className="flex items-center gap-1">
          <div className="w-3 h-3 border-2 border-yellow-400 rounded" />
          <span>Thinking</span>
        </div>
        <div className="flex items-center gap-1">
          <div className="w-3 h-3 border-2 border-blue-400 rounded" />
          <span>Communicating</span>
        </div>
        <div className="flex items-center gap-1">
          <div className="w-3 h-3 border-2 border-green-400 rounded" />
          <span>Complete</span>
        </div>
      </div>
    </div>
  );
}