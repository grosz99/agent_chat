import { NextRequest, NextResponse } from 'next/server';
import { AgentFactory } from '@/lib/agents/agent-factory';

export async function GET(request: NextRequest) {
  try {
    console.log('Testing agent initialization...');
    
    const factory = AgentFactory.getInstance();
    
    // Test agent creation for each data source
    const agentIds = ['ncc-financial', 'attendance-analytics', 'pipeline-analytics'];
    const results: any = {};
    
    for (const agentId of agentIds) {
      console.log(`Creating agent: ${agentId}...`);
      
      try {
        const agent = await factory.createAgent(agentId);
        
        if (!agent) {
          results[agentId] = {
            success: false,
            error: 'Agent creation returned null'
          };
          continue;
        }
        
        // Test simple interaction
        const response = await agent.processQuery(
          'Hello, can you tell me about your data source?',
          { 
            conversationId: 'test-conversation',
            userId: 'test-user', 
            dataSourceId: agentId,
            semanticModel: agent.semanticModel,
            history: [],
            metadata: {}
          }
        );
        
        results[agentId] = {
          success: true,
          agentName: agent.name,
          dataSourceId: agent.dataSourceId,
          response: response
        };
        
        console.log(`${agentId}: Agent created and tested successfully`);
        
      } catch (error) {
        console.error(`${agentId}: Agent creation failed:`, error);
        results[agentId] = {
          success: false,
          error: error instanceof Error ? error.message : 'Unknown error'
        };
      }
    }
    
    return NextResponse.json({
      success: true,
      message: 'Agent initialization test completed',
      results
    });
    
  } catch (error) {
    console.error('Agent test failed:', error);
    return NextResponse.json({
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error',
      details: error
    }, { status: 500 });
  }
}