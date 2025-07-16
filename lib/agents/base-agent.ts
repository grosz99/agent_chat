import Anthropic from '@anthropic-ai/sdk';
import { v4 as uuidv4 } from 'uuid';
import { logger } from '../utils/logger';
import {
  Agent,
  AgentMessage,
  AgentContext,
  AgentResponse,
  AgentCapability,
  SemanticModel,
} from '@/types/agent';

export abstract class BaseAgent implements Agent {
  id: string;
  name: string;
  description: string;
  type: 'data-source' | 'orchestrator' | 'analyzer';
  capabilities: AgentCapability[];
  status: 'active' | 'idle' | 'error';
  lastActive?: Date;
  protected anthropic: Anthropic;
  protected context: AgentContext | null = null;

  constructor(config: {
    name: string;
    description: string;
    type: 'data-source' | 'orchestrator' | 'analyzer';
    capabilities: AgentCapability[];
  }) {
    this.id = uuidv4();
    this.name = config.name;
    this.description = config.description;
    this.type = config.type;
    this.capabilities = config.capabilities;
    this.status = 'idle';
    
    this.anthropic = new Anthropic({
      apiKey: process.env.ANTHROPIC_API_KEY!,
    });

    logger.info(`Agent initialized: ${this.name}`, {
      id: this.id,
      type: this.type,
      capabilities: this.capabilities.map(c => c.name),
    });
  }

  abstract processQuery(query: string, context: AgentContext): Promise<AgentResponse>;

  protected async callAnthropic(
    messages: AgentMessage[],
    systemPrompt: string,
    maxTokens: number = 4096
  ): Promise<string> {
    try {
      const formattedMessages = messages.map(msg => ({
        role: msg.role === 'user' ? 'user' as const : 'assistant' as const,
        content: msg.content,
      }));

      const response = await this.anthropic.messages.create({
        model: 'claude-3-opus-20240229',
        max_tokens: maxTokens,
        system: systemPrompt,
        messages: formattedMessages,
      });

      return response.content[0].type === 'text' ? response.content[0].text : '';
    } catch (error) {
      logger.error(`Anthropic API error in agent ${this.name}`, error);
      throw error;
    }
  }

  protected createSystemPrompt(semanticModel?: SemanticModel): string {
    let prompt = `You are ${this.name}, ${this.description}\n\n`;
    prompt += `Your capabilities include:\n`;
    
    this.capabilities.forEach(cap => {
      prompt += `- ${cap.name}: ${cap.description}\n`;
    });

    if (semanticModel) {
      prompt += `\n\nSemantic Model Information:\n`;
      prompt += `Database: ${semanticModel.name}\n`;
      prompt += `Description: ${semanticModel.description}\n\n`;
      
      prompt += `Available Tables:\n`;
      semanticModel.tables.forEach(table => {
        prompt += `- ${table.schema}.${table.name}: ${table.description || 'No description'}\n`;
        prompt += `  Columns:\n`;
        table.columns.forEach(col => {
          prompt += `    - ${col.name} (${col.dataType}): ${col.description || 'No description'}\n`;
        });
      });

      if (semanticModel.metrics.length > 0) {
        prompt += `\nAvailable Metrics:\n`;
        semanticModel.metrics.forEach(metric => {
          prompt += `- ${metric.name}: ${metric.description} (${metric.formula})\n`;
        });
      }

      if (semanticModel.dimensions.length > 0) {
        prompt += `\nAvailable Dimensions:\n`;
        semanticModel.dimensions.forEach(dim => {
          prompt += `- ${dim.name}: ${dim.description} (${dim.table}.${dim.column})\n`;
        });
      }
    }

    prompt += `\n\nIMPORTANT: Always provide accurate, helpful responses based on the available data. 
    If you generate SQL queries, ensure they are valid for Snowflake syntax.
    Include your reasoning and confidence level in your responses.`;

    return prompt;
  }

  updateStatus(status: 'active' | 'idle' | 'error'): void {
    this.status = status;
    this.lastActive = new Date();
    logger.debug(`Agent ${this.name} status updated to ${status}`);
  }

  hasCapability(capabilityName: string): boolean {
    return this.capabilities.some(cap => cap.name === capabilityName);
  }

  getCapability(capabilityName: string): AgentCapability | undefined {
    return this.capabilities.find(cap => cap.name === capabilityName);
  }

  protected createResponse(
    content: string,
    options: Partial<AgentResponse> = {}
  ): AgentResponse {
    return {
      agentId: this.id,
      content,
      confidence: 0.8,
      ...options,
    };
  }

  protected async logActivity(action: string, details?: any): Promise<void> {
    logger.info(`Agent Activity: ${this.name}`, {
      agentId: this.id,
      action,
      details,
      timestamp: new Date(),
    });
  }
}