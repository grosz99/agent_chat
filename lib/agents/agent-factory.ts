import { FlexibleDataSourceAgent } from './flexible-data-agent';
import { BaseAgent } from './base-agent';
import { dataSourceConfigs, getDataSourceConfig } from './data-source-config';
import { logger } from '../utils/logger';
import { Agent } from '@/types/agent';

export class AgentFactory {
  private static instance: AgentFactory;
  private agents: Map<string, FlexibleDataSourceAgent> = new Map();
  private initialized: boolean = false;

  private constructor() {}

  static getInstance(): AgentFactory {
    if (!AgentFactory.instance) {
      AgentFactory.instance = new AgentFactory();
    }
    return AgentFactory.instance;
  }

  async initialize(): Promise<void> {
    if (this.initialized) return;

    logger.info('Initializing AgentFactory with data sources', {
      dataSourceCount: dataSourceConfigs.length,
    });

    for (const config of dataSourceConfigs) {
      try {
        const agent = new FlexibleDataSourceAgent(config);
        this.agents.set(config.id, agent);
        
        logger.info(`Agent created for data source: ${config.name}`, {
          dataSourceId: config.id,
          agentId: agent.id,
        });
      } catch (error) {
        logger.error(`Failed to create agent for data source: ${config.name}`, {
          error,
          dataSourceId: config.id,
        });
      }
    }

    this.initialized = true;
    logger.info('AgentFactory initialization complete', {
      totalAgents: this.agents.size,
    });
  }

  getAgent(dataSourceId: string): FlexibleDataSourceAgent | undefined {
    return this.agents.get(dataSourceId);
  }

  getAllAgents(): FlexibleDataSourceAgent[] {
    return Array.from(this.agents.values());
  }

  getAgentsByCapability(capability: string): FlexibleDataSourceAgent[] {
    return Array.from(this.agents.values()).filter(agent =>
      agent.hasCapability(capability)
    );
  }

  async createAgent(dataSourceId: string): Promise<FlexibleDataSourceAgent | null> {
    const config = getDataSourceConfig(dataSourceId);
    if (!config) {
      logger.error(`Data source config not found: ${dataSourceId}`);
      return null;
    }

    try {
      const agent = new FlexibleDataSourceAgent(config);
      this.agents.set(dataSourceId, agent);
      
      logger.info(`Dynamic agent created for data source: ${config.name}`, {
        dataSourceId,
        agentId: agent.id,
      });

      return agent;
    } catch (error) {
      logger.error(`Failed to create dynamic agent for data source: ${dataSourceId}`, error);
      return null;
    }
  }

  async removeAgent(dataSourceId: string): Promise<boolean> {
    const agent = this.agents.get(dataSourceId);
    if (agent) {
      agent.dispose();
      this.agents.delete(dataSourceId);
      
      logger.info(`Agent removed for data source: ${dataSourceId}`);
      return true;
    }
    return false;
  }

  getAgentStatus(): { [key: string]: any } {
    const status: { [key: string]: any } = {};
    
    this.agents.forEach((agent, dataSourceId) => {
      status[dataSourceId] = {
        id: agent.id,
        name: agent.name,
        status: agent.status,
        lastActive: agent.lastActive,
        capabilities: agent.capabilities.map(c => c.name),
      };
    });

    return status;
  }

  async refreshAgent(dataSourceId: string): Promise<boolean> {
    const agent = this.agents.get(dataSourceId);
    if (!agent) return false;

    try {
      // Update the agent's semantic model with fresh schema information
      // This could involve re-scanning the database schema
      const config = getDataSourceConfig(dataSourceId);
      if (config) {
        // For now, just log the refresh - in practice, you'd update the semantic model
        logger.info(`Agent refreshed for data source: ${dataSourceId}`);
        return true;
      }
    } catch (error) {
      logger.error(`Failed to refresh agent for data source: ${dataSourceId}`, error);
    }

    return false;
  }

  listAvailableDataSources(): Array<{
    id: string;
    name: string;
    description: string;
    type: string;
    hasAgent: boolean;
  }> {
    return dataSourceConfigs.map(config => ({
      id: config.id,
      name: config.name,
      description: config.description,
      type: config.type,
      hasAgent: this.agents.has(config.id),
    }));
  }

  async healthCheck(): Promise<{ [key: string]: any }> {
    const health: { [key: string]: any } = {};
    
    for (const [dataSourceId, agent] of this.agents) {
      try {
        // Basic health check - could be expanded to test database connectivity
        health[dataSourceId] = {
          status: agent.status,
          lastActive: agent.lastActive,
          healthy: agent.status !== 'error',
        };
      } catch (error) {
        health[dataSourceId] = {
          status: 'error',
          healthy: false,
          error: String(error),
        };
      }
    }

    return health;
  }

  dispose(): void {
    for (const agent of this.agents.values()) {
      agent.dispose();
    }
    this.agents.clear();
    this.initialized = false;
  }
}

export const agentFactory = AgentFactory.getInstance();