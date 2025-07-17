'use client';

import React, { useState, useEffect } from 'react';
import { BarChart3, Database, Brain } from 'lucide-react';

interface CompactAgentFlowProps {
  query: string;
  onComplete?: () => void;
}

export default function CompactAgentFlow({ query, onComplete }: CompactAgentFlowProps) {
  const [activeStep, setActiveStep] = useState(0);
  const [isComplete, setIsComplete] = useState(false);

  const steps = [
    { agent: 'orchestrator', message: 'Analyzing query...', duration: 2000 },
    { agent: 'financial', message: 'Finding revenue gaps...', duration: 2000 },
    { agent: 'pipeline', message: 'Searching deals...', duration: 2000 },
    { agent: 'orchestrator', message: 'Combining results...', duration: 1500 },
    { agent: 'complete', message: 'Analysis complete', duration: 500 }
  ];

  useEffect(() => {
    if (activeStep < steps.length) {
      const timer = setTimeout(() => {
        setActiveStep(activeStep + 1);
      }, steps[activeStep].duration);
      
      return () => clearTimeout(timer);
    } else {
      setIsComplete(true);
      if (onComplete) {
        setTimeout(onComplete, 500);
      }
    }
  }, [activeStep]);

  const currentStep = steps[activeStep] || steps[steps.length - 1];

  return (
    <div className="bg-white rounded-lg border border-gray-200 p-4 shadow-sm">
      {/* Header */}
      <div className="flex items-center gap-2 mb-4">
        <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
        <span className="text-sm font-medium text-gray-700">Multi-Agent Analysis</span>
      </div>

      {/* Workflow */}
      <div className="flex items-center justify-between mb-4">
        {/* Orchestrator */}
        <div className={`flex flex-col items-center ${
          currentStep.agent === 'orchestrator' ? 'opacity-100' : 'opacity-50'
        } transition-opacity duration-300`}>
          <div className={`w-10 h-10 rounded-lg flex items-center justify-center border-2 ${
            currentStep.agent === 'orchestrator' 
              ? 'bg-green-50 border-green-500 ring-2 ring-green-200' 
              : 'bg-gray-50 border-gray-200'
          }`}>
            <Brain className="w-5 h-5 text-green-600" />
          </div>
          <span className="text-xs text-gray-500 mt-1">Orchestrator</span>
        </div>

        {/* Connection Line 1 */}
        <div className={`flex-1 h-px mx-3 ${
          activeStep >= 1 ? 'bg-green-500' : 'bg-gray-200'
        } transition-colors duration-300`}>
          {activeStep >= 1 && (
            <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse" 
                 style={{ marginTop: '-3px', marginLeft: '50%' }}></div>
          )}
        </div>

        {/* Financial Agent */}
        <div className={`flex flex-col items-center ${
          currentStep.agent === 'financial' ? 'opacity-100' : 'opacity-50'
        } transition-opacity duration-300`}>
          <div className={`w-10 h-10 rounded-lg flex items-center justify-center border-2 ${
            currentStep.agent === 'financial' 
              ? 'bg-green-50 border-green-500 ring-2 ring-green-200' 
              : 'bg-gray-50 border-gray-200'
          }`}>
            <BarChart3 className="w-5 h-5 text-green-600" />
          </div>
          <span className="text-xs text-gray-500 mt-1">Financial</span>
        </div>

        {/* Connection Line 2 */}
        <div className={`flex-1 h-px mx-3 ${
          activeStep >= 2 ? 'bg-green-500' : 'bg-gray-200'
        } transition-colors duration-300`}>
          {activeStep >= 2 && (
            <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse" 
                 style={{ marginTop: '-3px', marginLeft: '50%' }}></div>
          )}
        </div>

        {/* Pipeline Agent */}
        <div className={`flex flex-col items-center ${
          currentStep.agent === 'pipeline' ? 'opacity-100' : 'opacity-50'
        } transition-opacity duration-300`}>
          <div className={`w-10 h-10 rounded-lg flex items-center justify-center border-2 ${
            currentStep.agent === 'pipeline' 
              ? 'bg-green-50 border-green-500 ring-2 ring-green-200' 
              : 'bg-gray-50 border-gray-200'
          }`}>
            <Database className="w-5 h-5 text-green-600" />
          </div>
          <span className="text-xs text-gray-500 mt-1">Pipeline</span>
        </div>
      </div>

      {/* Status Message */}
      <div className="text-center">
        <div className="text-xs text-gray-600">{currentStep.message}</div>
        <div className="text-xs text-gray-400 mt-1">
          Step {activeStep + 1} of {steps.length}
        </div>
      </div>

      {/* Progress Bar */}
      <div className="mt-3 bg-gray-100 rounded-full h-1">
        <div 
          className="bg-green-500 h-1 rounded-full transition-all duration-300"
          style={{ width: `${((activeStep + 1) / steps.length) * 100}%` }}
        ></div>
      </div>
    </div>
  );
}