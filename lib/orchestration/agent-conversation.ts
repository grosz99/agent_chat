import { v4 as uuidv4 } from 'uuid';
import { logger } from '../utils/logger';

export interface ConversationMessage {
  id: string;
  conversationId: string;
  fromAgentId: string;
  toAgentId: string;
  messageType: 'question' | 'response' | 'clarification' | 'analysis_request' | 'data_sharing';
  content: string;
  data?: any;
  metadata?: {
    analysisType?: string;
    region?: string;
    month?: string;
    sector?: string;
    urgency?: 'low' | 'medium' | 'high';
    requiresAction?: boolean;
  };
  timestamp: Date;
  responseToMessageId?: string;
}

export interface AgentConversation {
  id: string;
  participantAgentIds: string[];
  topic: string;
  status: 'active' | 'completed' | 'waiting_for_response';
  messages: ConversationMessage[];
  createdAt: Date;
  lastActivity: Date;
  initiatedBy: string;
  context?: any;
}

export class AgentConversationManager {
  private conversations: Map<string, AgentConversation> = new Map();
  private messageHandlers: Map<string, (message: ConversationMessage) => Promise<ConversationMessage | null>> = new Map();

  constructor() {
    logger.info('AgentConversationManager initialized');
  }

  // Register message handlers for different agent types
  registerMessageHandler(
    agentId: string, 
    handler: (message: ConversationMessage) => Promise<ConversationMessage | null>
  ): void {
    this.messageHandlers.set(agentId, handler);
    logger.debug(`Message handler registered for agent: ${agentId}`);
  }

  // Start a new conversation between agents
  startConversation(
    initiatingAgentId: string,
    targetAgentIds: string[],
    topic: string,
    initialMessage: string,
    context?: any
  ): string {
    const conversationId = uuidv4();
    const participantAgentIds = [initiatingAgentId, ...targetAgentIds];

    const conversation: AgentConversation = {
      id: conversationId,
      participantAgentIds,
      topic,
      status: 'active',
      messages: [],
      createdAt: new Date(),
      lastActivity: new Date(),
      initiatedBy: initiatingAgentId,
      context
    };

    // Create initial message
    const message: ConversationMessage = {
      id: uuidv4(),
      conversationId,
      fromAgentId: initiatingAgentId,
      toAgentId: targetAgentIds[0], // Send to first target initially
      messageType: 'question',
      content: initialMessage,
      timestamp: new Date(),
      metadata: context?.metadata
    };

    conversation.messages.push(message);
    this.conversations.set(conversationId, conversation);

    logger.info('Conversation started', {
      conversationId,
      topic,
      initiatingAgent: initiatingAgentId,
      targetAgents: targetAgentIds
    });

    // Process the initial message asynchronously
    this.processMessage(message);

    return conversationId;
  }

  // Send a message in an existing conversation
  async sendMessage(
    conversationId: string,
    fromAgentId: string,
    toAgentId: string,
    messageType: ConversationMessage['messageType'],
    content: string,
    data?: any,
    responseToMessageId?: string
  ): Promise<string> {
    const conversation = this.conversations.get(conversationId);
    if (!conversation) {
      throw new Error(`Conversation ${conversationId} not found`);
    }

    if (!conversation.participantAgentIds.includes(fromAgentId)) {
      throw new Error(`Agent ${fromAgentId} is not a participant in conversation ${conversationId}`);
    }

    const message: ConversationMessage = {
      id: uuidv4(),
      conversationId,
      fromAgentId,
      toAgentId,
      messageType,
      content,
      data,
      timestamp: new Date(),
      responseToMessageId
    };

    conversation.messages.push(message);
    conversation.lastActivity = new Date();
    conversation.status = 'waiting_for_response';

    logger.logAgentCommunication(fromAgentId, toAgentId, content, data);

    // Process the message
    await this.processMessage(message);

    return message.id;
  }

  // Process an incoming message and trigger handler if available
  private async processMessage(message: ConversationMessage): Promise<void> {
    const handler = this.messageHandlers.get(message.toAgentId);
    if (!handler) {
      logger.warn(`No message handler found for agent: ${message.toAgentId}`);
      return;
    }

    try {
      const response = await handler(message);
      
      if (response) {
        const conversation = this.conversations.get(message.conversationId);
        if (conversation) {
          conversation.messages.push(response);
          conversation.lastActivity = new Date();
          conversation.status = response.messageType === 'response' ? 'completed' : 'active';
          
          logger.info('Agent response processed', {
            conversationId: message.conversationId,
            responseFrom: response.fromAgentId,
            responseTo: response.toAgentId
          });
        }
      }
    } catch (error) {
      logger.error('Error processing message', { message, error });
    }
  }

  // Get conversation history
  getConversation(conversationId: string): AgentConversation | undefined {
    return this.conversations.get(conversationId);
  }

  // Get all conversations for an agent
  getConversationsForAgent(agentId: string): AgentConversation[] {
    return Array.from(this.conversations.values())
      .filter(conv => conv.participantAgentIds.includes(agentId));
  }

  // Get active conversations
  getActiveConversations(): AgentConversation[] {
    return Array.from(this.conversations.values())
      .filter(conv => conv.status === 'active' || conv.status === 'waiting_for_response');
  }

  // Mark conversation as completed
  completeConversation(conversationId: string): void {
    const conversation = this.conversations.get(conversationId);
    if (conversation) {
      conversation.status = 'completed';
      conversation.lastActivity = new Date();
      logger.info(`Conversation ${conversationId} marked as completed`);
    }
  }

  // Get conversation summary
  getConversationSummary(conversationId: string): any {
    const conversation = this.conversations.get(conversationId);
    if (!conversation) return null;

    return {
      id: conversation.id,
      topic: conversation.topic,
      status: conversation.status,
      participantCount: conversation.participantAgentIds.length,
      messageCount: conversation.messages.length,
      duration: conversation.lastActivity.getTime() - conversation.createdAt.getTime(),
      lastActivity: conversation.lastActivity,
      initiatedBy: conversation.initiatedBy
    };
  }

  // Clean up old conversations
  cleanupOldConversations(maxAgeHours: number = 24): void {
    const cutoffTime = new Date(Date.now() - maxAgeHours * 60 * 60 * 1000);
    let cleanedCount = 0;

    for (const [id, conversation] of this.conversations) {
      if (conversation.status === 'completed' && conversation.lastActivity < cutoffTime) {
        this.conversations.delete(id);
        cleanedCount++;
      }
    }

    if (cleanedCount > 0) {
      logger.info(`Cleaned up ${cleanedCount} old conversations`);
    }
  }
}

export const conversationManager = new AgentConversationManager();