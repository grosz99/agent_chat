import { NextRequest, NextResponse } from 'next/server';
import { agentFactory } from '@/lib/agents/agent-factory';
import { logger } from '@/lib/utils/logger';

export async function POST(request: NextRequest) {
  try {
    // Check environment variables first
    if (!process.env.ANTHROPIC_API_KEY) {
      return NextResponse.json(
        { error: 'ANTHROPIC_API_KEY not configured' },
        { status: 500 }
      );
    }

    const { agentId, query, context } = await request.json();

    // Validate input
    if (!agentId || !query) {
      return NextResponse.json(
        { error: 'Missing required fields: agentId, query' },
        { status: 400 }
      );
    }

    // Initialize agents if not already done
    try {
      await agentFactory.initialize();
    } catch (initError) {
      logger.error('Agent factory initialization failed', initError);
      return NextResponse.json(
        { error: 'Failed to initialize agents', details: String(initError) },
        { status: 500 }
      );
    }

    // Get the specified agent
    const agent = agentFactory.getAgent(agentId);
    if (!agent) {
      return NextResponse.json(
        { error: `Agent ${agentId} not found` },
        { status: 404 }
      );
    }

    // Create agent context
    const agentContext = {
      conversationId: context?.conversationId || 'api-query',
      userId: context?.userId || 'api-user',
      dataSourceId: agent.dataSourceId,
      semanticModel: agent.semanticModel,
      history: context?.history || [],
      metadata: context?.metadata || {}
    };

    // Process the query
    const response = await agent.processQuery(query, agentContext);

    logger.info('Agent query processed via API', {
      agentId,
      agentName: agent.name,
      queryLength: query.length,
      hasData: !!response.data,
      confidence: response.confidence
    });

    return NextResponse.json({
      success: true,
      agent: {
        id: agent.id,
        name: agent.name,
        description: agent.description,
        dataSourceId: agent.dataSourceId
      },
      response: {
        content: response.content,
        data: response.data,
        sql: response.sql,
        confidence: response.confidence,
        suggestions: response.suggestions,
        visualization: response.visualization,
        reasoning: response.reasoning,
        metadata: response.metadata
      }
    });

  } catch (error) {
    logger.error('Error processing agent query', error);
    return NextResponse.json(
      { error: 'Failed to process agent query', details: String(error) },
      { status: 500 }
    );
  }
}

export async function GET(request: NextRequest) {
  try {
    // Initialize agents if not already done
    await agentFactory.initialize();

    // Return list of available agents
    const agents = agentFactory.getAllAgents();
    const agentStatus = agentFactory.getAgentStatus();

    return NextResponse.json({
      success: true,
      agents: agents.map(agent => ({
        id: agent.id,
        name: agent.name,
        description: agent.description,
        type: agent.type,
        dataSourceId: agent.dataSourceId,
        capabilities: agent.capabilities.map(c => c.name),
        status: agentStatus[agent.dataSourceId]?.status || 'unknown'
      }))
    });

  } catch (error) {
    logger.error('Error retrieving agent list', error);
    return NextResponse.json(
      { error: 'Failed to retrieve agents', details: String(error) },
      { status: 500 }
    );
  }
}

export async function OPTIONS(request: NextRequest) {
  return new NextResponse(null, { status: 200 });
}