import { Agent, AgentMessage, AgentResponse } from './agent';

export interface OrchestrationRequest {
  query: string;
  userId: string;
  conversationId: string;
  filters?: QueryFilters;
  context?: Record<string, any>;
}

export interface QueryFilters {
  dateRange?: {
    start: Date;
    end: Date;
  };
  dimensions?: Record<string, string[]>;
  metrics?: string[];
}

export interface OrchestrationPlan {
  id: string;
  query: string;
  steps: OrchestrationStep[];
  dependencies: Map<string, string[]>;
  estimatedDuration: number;
}

export interface OrchestrationStep {
  id: string;
  agentId: string;
  action: string;
  parameters: Record<string, any>;
  dependencies: string[];
  priority: number;
  timeout: number;
}

export interface OrchestrationResult {
  requestId: string;
  query: string;
  plan: OrchestrationPlan;
  responses: AgentResponse[];
  finalAnswer: string;
  data: any[];
  visualizations: VisualizationConfig[];
  executionTime: number;
  confidence: number;
  suggestions?: string[];
}

export interface AgentCommunication {
  fromAgentId: string;
  toAgentId: string;
  messageType: 'query' | 'response' | 'clarification' | 'error';
  content: string;
  data?: any;
  timestamp: Date;
}

export interface VisualizationConfig {
  type: string;
  data: any[];
  options: Record<string, any>;
  title?: string;
  description?: string;
}