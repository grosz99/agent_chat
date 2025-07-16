import { FlexibleDataSourceAgent } from '../agents/flexible-data-agent';
import { agentFactory } from '../agents/agent-factory';
import { logger } from '../utils/logger';
import { v4 as uuidv4 } from 'uuid';

export interface AgentConversationTurn {
  id: string;
  agentId: string;
  agentName: string;
  role: 'initiator' | 'responder' | 'collaborator';
  message: string;
  query?: string;
  data?: any[];
  insights?: string[];
  questionsForOthers?: { agentId: string; question: string }[];
  timestamp: Date;
}

export interface AgentCollaboration {
  id: string;
  topic: string;
  participatingAgents: string[];
  conversationTurns: AgentConversationTurn[];
  status: 'active' | 'completed' | 'waiting';
  startTime: Date;
  endTime?: Date;
  finalInsights: string[];
  recommendations: string[];
}

export class AgentCollaborationManager {
  private activeCollaborations: Map<string, AgentCollaboration> = new Map();

  constructor() {
    logger.info('AgentCollaborationManager initialized');
  }

  async startCollaboration(
    topic: string,
    initialQuery: string,
    leadAgentId: string,
    collaboratingAgentIds: string[]
  ): Promise<string> {
    const collaborationId = uuidv4();
    const leadAgent = agentFactory.getAgent(leadAgentId);
    
    if (!leadAgent) {
      throw new Error(`Lead agent ${leadAgentId} not found`);
    }

    // Validate collaborating agents exist
    const collaboratingAgents = collaboratingAgentIds.map(id => {
      const agent = agentFactory.getAgent(id);
      if (!agent) throw new Error(`Collaborating agent ${id} not found`);
      return agent;
    });

    const collaboration: AgentCollaboration = {
      id: collaborationId,
      topic,
      participatingAgents: [leadAgentId, ...collaboratingAgentIds],
      conversationTurns: [],
      status: 'active',
      startTime: new Date(),
      finalInsights: [],
      recommendations: []
    };

    this.activeCollaborations.set(collaborationId, collaboration);

    logger.info('Agent collaboration started', {
      collaborationId,
      topic,
      leadAgent: leadAgent.name,
      collaboratingAgents: collaboratingAgents.map(a => a.name)
    });

    // Start the collaboration with the lead agent
    await this.processAgentTurn(
      collaboration,
      leadAgent,
      'initiator',
      `Analyze this query and determine what questions to ask other agents: ${initialQuery}`
    );

    return collaborationId;
  }

  private async processAgentTurn(
    collaboration: AgentCollaboration,
    agent: FlexibleDataSourceAgent,
    role: 'initiator' | 'responder' | 'collaborator',
    message: string,
    contextData?: any
  ): Promise<void> {
    try {
      logger.info(`Processing turn for agent: ${agent.name}`, {
        collaborationId: collaboration.id,
        role,
        message: message.substring(0, 100) + '...'
      });

      // Create enhanced context for this agent turn
      const agentContext = {
        conversationId: collaboration.id,
        userId: 'collaboration-manager',
        dataSourceId: agent.dataSourceId,
        semanticModel: agent.semanticModel,
        history: this.buildConversationHistory(collaboration),
        metadata: {
          collaborationTopic: collaboration.topic,
          role,
          otherAgents: collaboration.participatingAgents.filter(id => id !== agent.id),
          conversationContext: contextData
        }
      };

      // Build the agent's prompt based on role and context
      const agentPrompt = this.buildAgentPrompt(agent, role, message, collaboration, contextData);

      // Process through the agent
      const agentResponse = await agent.processQuery(agentPrompt, agentContext);

      // Parse the agent's response for insights and questions
      const parsedResponse = this.parseAgentResponse(agentResponse);

      // Create conversation turn
      const turn: AgentConversationTurn = {
        id: uuidv4(),
        agentId: agent.id,
        agentName: agent.name,
        role,
        message: parsedResponse.message,
        query: parsedResponse.query,
        data: agentResponse.data,
        insights: parsedResponse.insights,
        questionsForOthers: parsedResponse.questionsForOthers,
        timestamp: new Date()
      };

      collaboration.conversationTurns.push(turn);

      logger.info(`Agent turn completed: ${agent.name}`, {
        collaborationId: collaboration.id,
        hasData: !!agentResponse.data,
        hasQuestions: !!parsedResponse.questionsForOthers?.length,
        insights: parsedResponse.insights?.length || 0
      });

      // Process questions for other agents
      if (parsedResponse.questionsForOthers && parsedResponse.questionsForOthers.length > 0) {
        await this.processQuestionsForOtherAgents(collaboration, turn, parsedResponse.questionsForOthers);
      } else {
        // No more questions - collaboration is complete
        await this.completeCollaboration(collaboration);
      }

    } catch (error) {
      logger.error(`Error processing agent turn for ${agent.name}`, { error, collaborationId: collaboration.id });
      throw error;
    }
  }

  private buildAgentPrompt(
    agent: FlexibleDataSourceAgent,
    role: 'initiator' | 'responder' | 'collaborator',
    message: string,
    collaboration: AgentCollaboration,
    contextData?: any
  ): string {
    let prompt = `You are ${agent.name}, a specialized data analysis agent. `;

    if (role === 'initiator') {
      prompt += `You've been asked to lead an analysis on: "${collaboration.topic}".

Your task:
1. Analyze the query: "${message}"
2. Query your data source to get relevant insights
3. Identify what questions you need to ask other agents to get a complete picture
4. Format your response as JSON with:
   - "message": Your analysis and findings
   - "insights": Array of key insights from your data
   - "questionsForOthers": Array of {agentId, question} objects for other agents

Available other agents:`;

      collaboration.participatingAgents.forEach(agentId => {
        if (agentId !== agent.id) {
          const otherAgent = agentFactory.getAgent(agentId);
          if (otherAgent) {
            prompt += `\n- ${agentId}: ${otherAgent.name} - ${otherAgent.description}`;
          }
        }
      });

    } else if (role === 'responder') {
      prompt += `Another agent has asked you a question about "${collaboration.topic}".

Question: "${message}"

Your task:
1. Query your data source to answer this specific question
2. Provide detailed insights based on your data
3. If you discover patterns that need input from other agents, ask follow-up questions
4. Format your response as JSON with:
   - "message": Your answer and analysis
   - "insights": Array of key insights
   - "questionsForOthers": Array of follow-up questions for other agents (if any)

Context from previous conversation:`;
      
      collaboration.conversationTurns.forEach(turn => {
        prompt += `\n- ${turn.agentName}: ${turn.message.substring(0, 200)}...`;
      });
    }

    prompt += `\n\nIMPORTANT: Base your analysis on REAL data from your Snowflake tables. Always query your data source to provide factual insights.`;

    return prompt;
  }

  private buildConversationHistory(collaboration: AgentCollaboration): any[] {
    return collaboration.conversationTurns.map(turn => ({
      id: turn.id,
      role: 'assistant',
      content: `${turn.agentName}: ${turn.message}`,
      timestamp: turn.timestamp
    }));
  }

  private parseAgentResponse(agentResponse: any): {
    message: string;
    query?: string;
    insights?: string[];
    questionsForOthers?: { agentId: string; question: string }[];
  } {
    try {
      // Try to parse JSON response
      const jsonMatch = agentResponse.content.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        const parsed = JSON.parse(jsonMatch[0]);
        return {
          message: parsed.message || agentResponse.content,
          query: agentResponse.sql,
          insights: parsed.insights || [],
          questionsForOthers: parsed.questionsForOthers || []
        };
      }
    } catch (error) {
      logger.warn('Failed to parse agent response as JSON, using raw content');
    }

    // Fallback to raw response
    return {
      message: agentResponse.content,
      query: agentResponse.sql,
      insights: [],
      questionsForOthers: []
    };
  }

  private async processQuestionsForOtherAgents(
    collaboration: AgentCollaboration,
    askingTurn: AgentConversationTurn,
    questions: { agentId: string; question: string }[]
  ): Promise<void> {
    for (const { agentId, question } of questions) {
      const targetAgent = agentFactory.getAgent(agentId);
      if (!targetAgent) {
        logger.warn(`Target agent ${agentId} not found for question`);
        continue;
      }

      // Add context about who's asking and why
      const contextualQuestion = `${askingTurn.agentName} asks: "${question}"
      
Context: This relates to our analysis of "${collaboration.topic}".
${askingTurn.agentName} found: ${askingTurn.insights?.join(', ') || 'No specific insights listed'}`;

      await this.processAgentTurn(
        collaboration,
        targetAgent,
        'responder',
        contextualQuestion,
        {
          askingAgent: askingTurn.agentName,
          originalQuestion: question,
          context: askingTurn.insights
        }
      );
    }
  }

  private async completeCollaboration(collaboration: AgentCollaboration): Promise<void> {
    collaboration.status = 'completed';
    collaboration.endTime = new Date();

    // Generate final insights by combining all agent insights
    collaboration.finalInsights = this.generateFinalInsights(collaboration);
    collaboration.recommendations = this.generateRecommendations(collaboration);

    logger.info(`Collaboration completed: ${collaboration.topic}`, {
      collaborationId: collaboration.id,
      totalTurns: collaboration.conversationTurns.length,
      duration: collaboration.endTime.getTime() - collaboration.startTime.getTime(),
      finalInsights: collaboration.finalInsights.length
    });
  }

  private generateFinalInsights(collaboration: AgentCollaboration): string[] {
    const allInsights: string[] = [];

    collaboration.conversationTurns.forEach(turn => {
      if (turn.insights) {
        allInsights.push(...turn.insights.map(insight => `${turn.agentName}: ${insight}`));
      }
    });

    // Add summary insights
    allInsights.push(`Collaboration Summary: ${collaboration.conversationTurns.length} agents participated in analyzing "${collaboration.topic}"`);

    return allInsights;
  }

  private generateRecommendations(collaboration: AgentCollaboration): string[] {
    const recommendations: string[] = [];

    // Extract recommendations based on the conversation
    if (collaboration.topic.toLowerCase().includes('revenue') || collaboration.topic.toLowerCase().includes('gap')) {
      recommendations.push('Monitor revenue trends monthly and establish pipeline coverage ratios');
      recommendations.push('Implement cross-agent alerting when revenue gaps exceed pipeline capacity');
    }

    if (collaboration.topic.toLowerCase().includes('attendance')) {
      recommendations.push('Investigate correlation between attendance and performance metrics');
      recommendations.push('Consider flexible work arrangements for underperforming offices');
    }

    recommendations.push('Continue regular agent collaborations for comprehensive business insights');

    return recommendations;
  }

  // Public methods for accessing collaboration results
  getCollaboration(collaborationId: string): AgentCollaboration | undefined {
    return this.activeCollaborations.get(collaborationId);
  }

  getAllCollaborations(): AgentCollaboration[] {
    return Array.from(this.activeCollaborations.values());
  }

  getCollaborationSummary(collaborationId: string): any {
    const collaboration = this.activeCollaborations.get(collaborationId);
    if (!collaboration) return null;

    return {
      id: collaboration.id,
      topic: collaboration.topic,
      status: collaboration.status,
      participantCount: collaboration.participatingAgents.length,
      turnCount: collaboration.conversationTurns.length,
      duration: collaboration.endTime 
        ? collaboration.endTime.getTime() - collaboration.startTime.getTime()
        : Date.now() - collaboration.startTime.getTime(),
      insights: collaboration.finalInsights,
      recommendations: collaboration.recommendations
    };
  }
}

export const collaborationManager = new AgentCollaborationManager();