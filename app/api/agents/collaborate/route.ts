import { NextRequest, NextResponse } from 'next/server';
import { collaborationManager } from '@/lib/orchestration/agent-collaboration';
import { agentFactory } from '@/lib/agents/agent-factory';
import { logger } from '@/lib/utils/logger';

export async function POST(request: NextRequest) {
  try {
    const { topic, query, leadAgentId, collaboratingAgentIds } = await request.json();

    // Validate input
    if (!topic || !query || !leadAgentId) {
      return NextResponse.json(
        { error: 'Missing required fields: topic, query, leadAgentId' },
        { status: 400 }
      );
    }

    // Initialize agents if not already done
    await agentFactory.initialize();

    // Start the collaboration
    const collaborationId = await collaborationManager.startCollaboration(
      topic,
      query,
      leadAgentId,
      collaboratingAgentIds || []
    );

    logger.info('Agent collaboration started via API', {
      collaborationId,
      topic,
      leadAgentId,
      collaboratingAgentIds
    });

    return NextResponse.json({
      success: true,
      collaborationId,
      message: 'Agent collaboration started successfully'
    });

  } catch (error) {
    logger.error('Error starting agent collaboration', error);
    return NextResponse.json(
      { error: 'Failed to start agent collaboration', details: String(error) },
      { status: 500 }
    );
  }
}

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const collaborationId = searchParams.get('id');

    if (!collaborationId) {
      // Return all collaborations
      const collaborations = collaborationManager.getAllCollaborations();
      return NextResponse.json({
        success: true,
        collaborations: collaborations.map(c => collaborationManager.getCollaborationSummary(c.id))
      });
    }

    // Return specific collaboration
    const collaboration = collaborationManager.getCollaboration(collaborationId);
    if (!collaboration) {
      return NextResponse.json(
        { error: 'Collaboration not found' },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      collaboration: collaborationManager.getCollaborationSummary(collaborationId),
      fullDetails: collaboration
    });

  } catch (error) {
    logger.error('Error retrieving agent collaboration', error);
    return NextResponse.json(
      { error: 'Failed to retrieve collaboration', details: String(error) },
      { status: 500 }
    );
  }
}

export async function OPTIONS(request: NextRequest) {
  return new NextResponse(null, { status: 200 });
}