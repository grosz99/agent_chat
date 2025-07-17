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
    { agent: 'orchestrator', message: 'Orchestrator analyzing query...', duration: 4000 },
    { agent: 'financial', message: 'Financial Agent finding revenue gaps...', duration: 5000 },
    { agent: 'pipeline', message: 'Pipeline Agent searching deals...', duration: 5000 },
    { agent: 'orchestrator', message: 'Orchestrator combining results...', duration: 3000 },
    { agent: 'complete', message: 'Analysis complete', duration: 2000 }
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
          currentStep.agent === 'orchestrator' ? 'opacity-100' : 'opacity-60'
        } transition-all duration-500`}>
          <div className={`w-10 h-10 rounded-lg flex items-center justify-center border-2 transition-all duration-500 ${
            currentStep.agent === 'orchestrator' 
              ? 'bg-green-100 border-green-500 ring-4 ring-green-300 shadow-lg shadow-green-200 animate-pulse' 
              : 'bg-gray-50 border-gray-200'
          }`}>
            <Brain className={`w-5 h-5 transition-colors duration-300 ${
              currentStep.agent === 'orchestrator' ? 'text-green-700' : 'text-gray-400'
            }`} />
          </div>
          <span className={`text-xs mt-1 transition-colors duration-300 ${
            currentStep.agent === 'orchestrator' ? 'text-green-700 font-medium' : 'text-gray-400'
          }`}>Orchestrator</span>
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
          currentStep.agent === 'financial' ? 'opacity-100' : 'opacity-60'
        } transition-all duration-500`}>
          <div className={`w-10 h-10 rounded-lg flex items-center justify-center border-2 transition-all duration-500 ${
            currentStep.agent === 'financial' 
              ? 'bg-green-100 border-green-500 ring-4 ring-green-300 shadow-lg shadow-green-200 animate-pulse' 
              : 'bg-gray-50 border-gray-200'
          }`}>
            <BarChart3 className={`w-5 h-5 transition-colors duration-300 ${
              currentStep.agent === 'financial' ? 'text-green-700' : 'text-gray-400'
            }`} />
          </div>
          <span className={`text-xs mt-1 transition-colors duration-300 ${
            currentStep.agent === 'financial' ? 'text-green-700 font-medium' : 'text-gray-400'
          }`}>Financial</span>
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
          currentStep.agent === 'pipeline' ? 'opacity-100' : 'opacity-60'
        } transition-all duration-500`}>
          <div className={`w-10 h-10 rounded-lg flex items-center justify-center border-2 transition-all duration-500 ${
            currentStep.agent === 'pipeline' 
              ? 'bg-green-100 border-green-500 ring-4 ring-green-300 shadow-lg shadow-green-200 animate-pulse' 
              : 'bg-gray-50 border-gray-200'
          }`}>
            <Database className={`w-5 h-5 transition-colors duration-300 ${
              currentStep.agent === 'pipeline' ? 'text-green-700' : 'text-gray-400'
            }`} />
          </div>
          <span className={`text-xs mt-1 transition-colors duration-300 ${
            currentStep.agent === 'pipeline' ? 'text-green-700 font-medium' : 'text-gray-400'
          }`}>Pipeline</span>
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