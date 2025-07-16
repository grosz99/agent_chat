import { AgentConversationManager, conversationManager, ConversationMessage } from './agent-conversation';
import { agentFactory } from '../agents/agent-factory';
import { FlexibleDataSourceAgent } from '../agents/flexible-data-agent';
import { logger } from '../utils/logger';
import { v4 as uuidv4 } from 'uuid';

export interface OrchestrationWorkflow {
  id: string;
  name: string;
  description: string;
  requiredAgents: string[];
  steps: OrchestrationStep[];
  context?: any;
}

export interface OrchestrationStep {
  id: string;
  agentId: string;
  action: 'analyze' | 'question' | 'compare' | 'summarize';
  parameters: any;
  dependencies?: string[];
  condition?: (previousResults: any[]) => boolean;
}

export interface OrchestrationResult {
  workflowId: string;
  conversationId?: string;
  status: 'running' | 'completed' | 'failed';
  results: any[];
  agentInsights: { [agentId: string]: any };
  conclusions: string[];
  recommendations: string[];
  executionTime: number;
  startTime: Date;
  endTime?: Date;
}

export class BeaconOrchestrator {
  private workflows: Map<string, OrchestrationWorkflow> = new Map();
  private activeOrchestrations: Map<string, OrchestrationResult> = new Map();
  private conversationManager: AgentConversationManager;

  constructor() {
    this.conversationManager = conversationManager;
    this.setupAgentMessageHandlers();
    this.registerWorkflows();
    logger.info('BeaconOrchestrator initialized');
  }

  private setupAgentMessageHandlers(): void {
    const agents = agentFactory.getAllAgents();
    
    agents.forEach(agent => {
      this.conversationManager.registerMessageHandler(
        agent.id,
        this.createAgentMessageHandler(agent)
      );
    });
  }

  private createAgentMessageHandler(agent: FlexibleDataSourceAgent) {
    return async (message: ConversationMessage): Promise<ConversationMessage | null> => {
      try {
        logger.info(`Agent ${agent.name} processing message`, {
          messageType: message.messageType,
          fromAgent: message.fromAgentId,
          content: message.content
        });

        // Create context for the agent based on the message
        const context = {
          conversationId: message.conversationId,
          userId: 'orchestrator',
          dataSourceId: agent.dataSourceId,
          semanticModel: agent.semanticModel,
          history: [],
          metadata: {
            ...message.metadata,
            conversationContext: message.content
          }
        };

        // Process the message through the agent
        const agentResponse = await agent.processQuery(message.content, context);

        // Create response message
        const responseMessage: ConversationMessage = {
          id: uuidv4(),
          conversationId: message.conversationId,
          fromAgentId: agent.id,
          toAgentId: message.fromAgentId,
          messageType: 'response',
          content: agentResponse.content,
          data: {
            analysisData: agentResponse.data,
            sql: agentResponse.sql,
            confidence: agentResponse.confidence,
            suggestions: agentResponse.suggestions
          },
          timestamp: new Date(),
          responseToMessageId: message.id,
          metadata: {
            agentName: agent.name,
            dataSourceId: agent.dataSourceId
          } as Record<string, any>
        };

        return responseMessage;

      } catch (error) {
        logger.error(`Error in agent message handler for ${agent.name}`, error);
        
        return {
          id: uuidv4(),
          conversationId: message.conversationId,
          fromAgentId: agent.id,
          toAgentId: message.fromAgentId,
          messageType: 'response',
          content: `I encountered an error processing your request: ${error}`,
          timestamp: new Date(),
          responseToMessageId: message.id,
          metadata: { error: true } as Record<string, any>
        };
      }
    };
  }

  private registerWorkflows(): void {
    // Revenue Gap Analysis Workflow
    this.registerWorkflow({
      id: 'revenue-gap-analysis',
      name: 'Revenue Gap Analysis',
      description: 'Identifies revenue gaps and checks if pipeline can fill them',
      requiredAgents: ['ncc-financial', 'pipeline-analytics'],
      steps: [
        {
          id: 'identify-revenue-gaps',
          agentId: 'ncc-financial',
          action: 'analyze',
          parameters: {
            analysisType: 'revenue-gaps',
            timeframe: 'monthly',
            threshold: 'below-average'
          }
        },
        {
          id: 'check-pipeline-coverage',
          agentId: 'pipeline-analytics',
          action: 'question',
          parameters: {
            analysisType: 'won-deals-coverage',
            correlateWith: 'revenue-gaps'
          },
          dependencies: ['identify-revenue-gaps']
        }
      ]
    });

    // Cross-Regional Performance Analysis
    this.registerWorkflow({
      id: 'cross-regional-performance',
      name: 'Cross-Regional Performance Analysis',
      description: 'Compare performance across regions using NCC, attendance, and pipeline data',
      requiredAgents: ['ncc-financial', 'attendance-analytics', 'pipeline-analytics'],
      steps: [
        {
          id: 'ncc-by-region',
          agentId: 'ncc-financial',
          action: 'analyze',
          parameters: { groupBy: 'region', metric: 'total_ncc' }
        },
        {
          id: 'attendance-by-region',
          agentId: 'attendance-analytics',
          action: 'analyze',
          parameters: { groupBy: 'region', metric: 'attendance_rate' }
        },
        {
          id: 'pipeline-by-region',
          agentId: 'pipeline-analytics',
          action: 'analyze',
          parameters: { groupBy: 'region', metric: 'total_value' }
        }
      ]
    });

    // Underperforming Office Investigation
    this.registerWorkflow({
      id: 'office-investigation',
      name: 'Office Performance Investigation',
      description: 'Investigate why certain offices are underperforming',
      requiredAgents: ['ncc-financial', 'attendance-analytics'],
      steps: [
        {
          id: 'identify-low-performers',
          agentId: 'ncc-financial',
          action: 'analyze',
          parameters: { analysisType: 'bottom-performers', groupBy: 'office' }
        },
        {
          id: 'check-attendance-correlation',
          agentId: 'attendance-analytics',
          action: 'question',
          parameters: { 
            analysisType: 'attendance-correlation',
            correlateWith: 'low-performing-offices'
          },
          dependencies: ['identify-low-performers']
        }
      ]
    });
  }

  registerWorkflow(workflow: OrchestrationWorkflow): void {
    this.workflows.set(workflow.id, workflow);
    logger.info(`Workflow registered: ${workflow.name}`);
  }

  async executeWorkflow(workflowId: string, context?: any): Promise<string> {
    const workflow = this.workflows.get(workflowId);
    if (!workflow) {
      throw new Error(`Workflow ${workflowId} not found`);
    }

    const orchestrationId = uuidv4();
    const startTime = new Date();

    const result: OrchestrationResult = {
      workflowId,
      status: 'running',
      results: [],
      agentInsights: {},
      conclusions: [],
      recommendations: [],
      executionTime: 0,
      startTime
    };

    this.activeOrchestrations.set(orchestrationId, result);

    logger.info(`Starting workflow execution: ${workflow.name}`, {
      orchestrationId,
      workflowId,
      context
    });

    try {
      await this.executeWorkflowSteps(workflow, result, context);
      
      result.status = 'completed';
      result.endTime = new Date();
      result.executionTime = result.endTime.getTime() - result.startTime.getTime();

      logger.info(`Workflow completed: ${workflow.name}`, {
        orchestrationId,
        executionTime: result.executionTime
      });

    } catch (error) {
      result.status = 'failed';
      result.endTime = new Date();
      result.executionTime = result.endTime.getTime() - result.startTime.getTime();
      
      logger.error(`Workflow failed: ${workflow.name}`, { error, orchestrationId });
      throw error;
    }

    return orchestrationId;
  }

  private async executeWorkflowSteps(
    workflow: OrchestrationWorkflow, 
    result: OrchestrationResult, 
    context?: any
  ): Promise<void> {
    const stepResults: Map<string, any> = new Map();

    for (const step of workflow.steps) {
      // Check dependencies
      if (step.dependencies) {
        const dependencyResults = step.dependencies.map(dep => stepResults.get(dep));
        if (step.condition && !step.condition(dependencyResults)) {
          logger.info(`Skipping step ${step.id} due to unmet condition`);
          continue;
        }
      }

      logger.info(`Executing workflow step: ${step.id}`, {
        agentId: step.agentId,
        action: step.action
      });

      const stepResult = await this.executeWorkflowStep(step, stepResults, context);
      stepResults.set(step.id, stepResult);
      result.results.push(stepResult);

      // Store agent insights
      if (!result.agentInsights[step.agentId]) {
        result.agentInsights[step.agentId] = [];
      }
      result.agentInsights[step.agentId].push(stepResult);
    }

    // Generate conclusions and recommendations
    result.conclusions = this.generateConclusions(workflow, stepResults);
    result.recommendations = this.generateRecommendations(workflow, stepResults);
  }

  private async executeWorkflowStep(
    step: OrchestrationStep, 
    previousResults: Map<string, any>, 
    context?: any
  ): Promise<any> {
    const agent = agentFactory.getAgent(step.agentId);
    if (!agent) {
      throw new Error(`Agent ${step.agentId} not found`);
    }

    // Build query based on step action and parameters
    const query = this.buildStepQuery(step, previousResults, context);
    
    // Create agent context
    const agentContext = {
      conversationId: uuidv4(),
      userId: 'orchestrator',
      dataSourceId: agent.dataSourceId,
      semanticModel: agent.semanticModel,
      history: [],
      metadata: {
        workflowStep: step.id,
        stepParameters: step.parameters,
        previousResults: Object.fromEntries(previousResults)
      }
    };

    const response = await agent.processQuery(query, agentContext);
    
    return {
      stepId: step.id,
      agentId: step.agentId,
      query,
      response: response.content,
      data: response.data,
      confidence: response.confidence,
      metadata: response.metadata
    };
  }

  private buildStepQuery(
    step: OrchestrationStep, 
    previousResults: Map<string, any>, 
    context?: any
  ): string {
    const { action, parameters } = step;

    switch (action) {
      case 'analyze':
        return this.buildAnalysisQuery(parameters, context);
      
      case 'question':
        return this.buildQuestionQuery(parameters, previousResults, context);
      
      case 'compare':
        return this.buildComparisonQuery(parameters, previousResults, context);
      
      default:
        return `Perform ${action} analysis with parameters: ${JSON.stringify(parameters)}`;
    }
  }

  private buildAnalysisQuery(parameters: any, context?: any): string {
    if (parameters.analysisType === 'revenue-gaps') {
      return "Identify months and regions where NCC revenue was significantly below average. Focus on the lowest performing months by region.";
    }
    
    if (parameters.groupBy === 'region') {
      return `Analyze ${parameters.metric || 'performance'} by region. Show top and bottom performing regions with specific numbers.`;
    }

    if (parameters.analysisType === 'bottom-performers') {
      return `Identify the bottom 20% performing ${parameters.groupBy || 'entities'} and provide specific metrics for why they're underperforming.`;
    }

    return `Perform ${parameters.analysisType || 'general'} analysis grouped by ${parameters.groupBy || 'default metrics'}.`;
  }

  private buildQuestionQuery(parameters: any, previousResults: Map<string, any>, context?: any): string {
    if (parameters.analysisType === 'won-deals-coverage') {
      const revenueGaps = this.extractRevenueGaps(previousResults);
      return `I've identified revenue gaps in the following regions/months: ${JSON.stringify(revenueGaps)}. Can you check if there were Won pipeline deals in those same regions and months that could fill or explain these gaps? Compare the Won deal values to the revenue shortfalls.`;
    }

    if (parameters.analysisType === 'attendance-correlation') {
      const lowPerformers = this.extractLowPerformers(previousResults);
      return `These offices are underperforming in NCC revenue: ${JSON.stringify(lowPerformers)}. Is there a correlation with low attendance rates in these same offices? Show attendance patterns for these specific offices.`;
    }

    return `Based on previous analysis results, please analyze: ${JSON.stringify(parameters)}`;
  }

  private buildComparisonQuery(parameters: any, previousResults: Map<string, any>, context?: any): string {
    return `Compare and correlate the following data sets: ${JSON.stringify(Object.fromEntries(previousResults))}`;
  }

  private extractRevenueGaps(previousResults: Map<string, any>): any {
    // Extract revenue gap information from previous step results
    for (const [stepId, result] of previousResults) {
      if (result.stepId === 'identify-revenue-gaps' && result.data) {
        return result.data.slice(0, 5); // Top 5 revenue gaps
      }
    }
    return [];
  }

  private extractLowPerformers(previousResults: Map<string, any>): any {
    // Extract low performer information from previous step results
    for (const [stepId, result] of previousResults) {
      if (result.stepId === 'identify-low-performers' && result.data) {
        return result.data.slice(0, 3); // Top 3 low performers
      }
    }
    return [];
  }

  private generateConclusions(workflow: OrchestrationWorkflow, stepResults: Map<string, any>): string[] {
    const conclusions: string[] = [];

    if (workflow.id === 'revenue-gap-analysis') {
      conclusions.push('Revenue gap analysis completed with pipeline correlation check');
      // Add specific conclusions based on results
    }

    return conclusions;
  }

  private generateRecommendations(workflow: OrchestrationWorkflow, stepResults: Map<string, any>): string[] {
    const recommendations: string[] = [];

    if (workflow.id === 'revenue-gap-analysis') {
      recommendations.push('Monitor pipeline conversion rates in underperforming regions');
      recommendations.push('Investigate sales team performance in regions with persistent gaps');
    }

    return recommendations;
  }

  // Public methods for accessing orchestration results
  getOrchestrationResult(orchestrationId: string): OrchestrationResult | undefined {
    return this.activeOrchestrations.get(orchestrationId);
  }

  getAvailableWorkflows(): OrchestrationWorkflow[] {
    return Array.from(this.workflows.values());
  }

  async startAgentConversation(
    query: string, 
    primaryAgentId: string, 
    secondaryAgentIds: string[]
  ): Promise<string> {
    const conversationId = this.conversationManager.startConversation(
      primaryAgentId,
      secondaryAgentIds,
      'User Query Discussion',
      query
    );

    logger.info('Agent conversation started', {
      conversationId,
      primaryAgent: primaryAgentId,
      secondaryAgents: secondaryAgentIds,
      query
    });

    return conversationId;
  }

  getConversationResult(conversationId: string): any {
    return this.conversationManager.getConversation(conversationId);
  }
}

export const orchestrator = new BeaconOrchestrator();