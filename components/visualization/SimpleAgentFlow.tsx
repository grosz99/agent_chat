'use client';

import React, { useState, useEffect } from 'react';
import { BarChart3, Database, Brain, ArrowRight } from 'lucide-react';

interface SimpleAgentFlowProps {
  query: string;
  onComplete?: () => void;
}

export default function SimpleAgentFlow({ query, onComplete }: SimpleAgentFlowProps) {
  const [step, setStep] = useState(0);
  const [isComplete, setIsComplete] = useState(false);

  const steps = [
    {
      message: "Orchestrator analyzing query...",
      activeAgent: "orchestrator",
      delay: 3000
    },
    {
      message: "Orchestrator → Financial Agent: 'Find revenue gaps'",
      activeAgent: "financial",
      showConnection: "orchestrator-financial",
      delay: 4000
    },
    {
      message: "Financial Agent found: $2.5M Q4 revenue gap",
      activeAgent: "financial",
      delay: 3000
    },
    {
      message: "Orchestrator → Pipeline Agent: 'Find deals ≥$2.5M'",
      activeAgent: "pipeline",
      showConnection: "orchestrator-pipeline",
      delay: 4000
    },
    {
      message: "Pipeline Agent found: 5 qualifying deals",
      activeAgent: "pipeline",
      delay: 3000
    },
    {
      message: "Orchestrator combining results...",
      activeAgent: "orchestrator",
      delay: 2000
    },
    {
      message: "Analysis complete!",
      activeAgent: "complete",
      delay: 1000
    }
  ];

  useEffect(() => {
    if (step < steps.length) {
      const timer = setTimeout(() => {
        setStep(step + 1);
      }, steps[step].delay);
      
      return () => clearTimeout(timer);
    } else {
      setIsComplete(true);
      if (onComplete) {
        setTimeout(onComplete, 1000);
      }
    }
  }, [step]);

  const currentStepData = steps[step] || steps[steps.length - 1];

  return (
    <div className="w-full bg-gradient-to-br from-green-50 to-emerald-50 rounded-lg border border-green-200 p-6">
      <div className="mb-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-2">Multi-Agent Orchestration</h3>
        <p className="text-sm text-gray-600">Query: "Which deals can help fill revenue gaps?"</p>
      </div>

      {/* Current Step Message */}
      <div className="mb-6 p-4 bg-white rounded-lg border border-green-200">
        <div className="flex items-center gap-2">
          <div className="w-3 h-3 bg-green-500 rounded-full animate-pulse"></div>
          <span className="text-sm font-medium text-gray-700">{currentStepData.message}</span>
        </div>
        <div className="text-xs text-gray-500 mt-1">Step {step + 1} of {steps.length}</div>
      </div>

      {/* Agent Flow */}
      <div className="relative">
        {/* Orchestrator */}
        <div className={`absolute top-4 left-1/2 transform -translate-x-1/2 transition-all duration-500 ${
          currentStepData.activeAgent === 'orchestrator' ? 'ring-4 ring-green-300' : ''
        }`}>
          <div className="bg-white rounded-lg p-4 border-2 border-green-500 shadow-lg">
            <div className="bg-green-600 p-2 rounded-lg text-white mb-2">
              <Brain className="w-6 h-6" />
            </div>
            <div className="text-sm font-medium text-gray-900">Orchestrator</div>
            <div className="text-xs text-gray-500">Coordinating</div>
          </div>
        </div>

        {/* Connection Lines */}
        {currentStepData.showConnection === 'orchestrator-financial' && (
          <div className="absolute top-20 left-1/4 w-1/4 h-px bg-green-500 animate-pulse"></div>
        )}
        {currentStepData.showConnection === 'orchestrator-pipeline' && (
          <div className="absolute top-20 right-1/4 w-1/4 h-px bg-green-500 animate-pulse"></div>
        )}

        {/* Financial Agent */}
        <div className={`absolute top-32 left-8 transition-all duration-500 ${
          currentStepData.activeAgent === 'financial' ? 'ring-4 ring-green-300' : ''
        }`}>
          <div className="bg-white rounded-lg p-4 border-2 border-green-500 shadow-lg">
            <div className="bg-green-500 p-2 rounded-lg text-white mb-2">
              <BarChart3 className="w-6 h-6" />
            </div>
            <div className="text-sm font-medium text-gray-900">Financial Agent</div>
            <div className="text-xs text-gray-500">Revenue Analysis</div>
          </div>
        </div>

        {/* Pipeline Agent */}
        <div className={`absolute top-32 right-8 transition-all duration-500 ${
          currentStepData.activeAgent === 'pipeline' ? 'ring-4 ring-green-300' : ''
        }`}>
          <div className="bg-white rounded-lg p-4 border-2 border-green-500 shadow-lg">
            <div className="bg-green-400 p-2 rounded-lg text-white mb-2">
              <Database className="w-6 h-6" />
            </div>
            <div className="text-sm font-medium text-gray-900">Pipeline Agent</div>
            <div className="text-xs text-gray-500">Deal Search</div>
          </div>
        </div>
      </div>

      {/* Progress Bar */}
      <div className="mt-24 bg-gray-200 rounded-full h-2">
        <div 
          className="bg-green-500 h-2 rounded-full transition-all duration-1000"
          style={{ width: `${(step / steps.length) * 100}%` }}
        ></div>
      </div>
    </div>
  );
}