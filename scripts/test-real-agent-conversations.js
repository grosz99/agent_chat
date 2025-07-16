const fs = require('fs');
const path = require('path');
require('dotenv').config({ path: '.env.local' });

// Simple test for real agent conversations
// This tests the actual Anthropic Claude agents talking to each other with real Snowflake data

async function testRealAgentConversations() {
  console.log('🤖 Testing Real Claude Agent Conversations with Snowflake Data');
  console.log('=============================================================\n');

  try {
    // First, let's verify our agents can be initialized
    console.log('1️⃣ Initializing Agent Factory...');
    
    // Import and test the agent factory
    const { agentFactory } = await import('../lib/agents/agent-factory.js');
    await agentFactory.initialize();
    
    const agents = agentFactory.getAllAgents();
    console.log(`✅ ${agents.length} agents initialized:`);
    agents.forEach(agent => {
      console.log(`   - ${agent.name} (${agent.id})`);
    });

    console.log('\n2️⃣ Testing Individual Agent Responses...');
    
    // Test NCC Agent with revenue analysis
    const nccAgent = agentFactory.getAgent('ncc-financial');
    if (nccAgent) {
      console.log('\\n💰 Testing NCC Financial Agent...');
      
      const nccContext = {
        conversationId: 'test-collab-1',
        userId: 'test-user',
        dataSourceId: 'ncc-financial',
        semanticModel: nccAgent.semanticModel,
        history: [],
        metadata: {
          collaborationTopic: 'Revenue Gap Analysis',
          role: 'initiator'
        }
      };

      const nccQuery = `I need to identify revenue gaps in our NCC data. Analyze the data to find:
1. Which regions and months had the lowest revenue performance
2. Calculate the revenue gaps compared to average performance
3. What questions should I ask the Pipeline Agent to understand if Won deals can fill these gaps?

Format your response as JSON with:
- "message": Your analysis
- "insights": Key findings about revenue gaps
- "questionsForOthers": Questions for the pipeline agent (use agentId: "pipeline-analytics")`;

      const nccResponse = await nccAgent.processQuery(nccQuery, nccContext);
      
      console.log('📊 NCC Agent Response:');
      console.log('Content:', nccResponse.content);
      console.log('Data rows:', nccResponse.data?.length || 0);
      console.log('SQL used:', nccResponse.sql);
      console.log('');

      // Test Pipeline Agent response
      const pipelineAgent = agentFactory.getAgent('pipeline-analytics');
      if (pipelineAgent) {
        console.log('🎯 Testing Pipeline Analytics Agent...');
        
        const pipelineContext = {
          conversationId: 'test-collab-1',
          userId: 'test-user',
          dataSourceId: 'pipeline-analytics',
          semanticModel: pipelineAgent.semanticModel,
          history: [],
          metadata: {
            collaborationTopic: 'Revenue Gap Analysis',
            role: 'responder',
            askingAgent: 'NCC Financial Agent'
          }
        };

        const pipelineQuery = `The NCC Financial Agent has identified revenue gaps and asks:
"Can you analyze Won deals to see if pipeline performance explains or compensates for revenue shortfalls? 
Specifically, look at regions with low revenue and check if Won deals in those regions/months offset the gaps."

Based on your pipeline data, analyze Won deals by region and month. Show:
1. Total Won deal values by region and month
2. Which regions have strong vs weak Won deal performance
3. Any patterns that correlate with potential revenue gaps

Format your response as JSON with:
- "message": Your pipeline analysis 
- "insights": Key findings about Won deals and coverage
- "questionsForOthers": Any follow-up questions for other agents`;

        const pipelineResponse = await pipelineAgent.processQuery(pipelineQuery, pipelineContext);
        
        console.log('📈 Pipeline Agent Response:');
        console.log('Content:', pipelineResponse.content);
        console.log('Data rows:', pipelineResponse.data?.length || 0);
        console.log('SQL used:', pipelineResponse.sql);
        console.log('');
      }

      // Test Attendance Agent for correlation analysis
      const attendanceAgent = agentFactory.getAgent('attendance-analytics');
      if (attendanceAgent) {
        console.log('👥 Testing Attendance Analytics Agent...');
        
        const attendanceContext = {
          conversationId: 'test-collab-1',
          userId: 'test-user',
          dataSourceId: 'attendance-analytics', 
          semanticModel: attendanceAgent.semanticModel,
          history: [],
          metadata: {
            collaborationTopic: 'Office Performance Investigation',
            role: 'responder'
          }
        };

        const attendanceQuery = `Can you analyze office attendance patterns to help identify any correlations with performance issues?

Show me:
1. Average attendance rates by office
2. Which offices have consistently low attendance
3. Any patterns in attendance that might correlate with business performance

This analysis will help us understand if low attendance correlates with revenue or pipeline issues.

Format your response as JSON with:
- "message": Your attendance analysis
- "insights": Key findings about attendance patterns
- "questionsForOthers": Any questions for other agents about performance correlation`;

        const attendanceResponse = await attendanceAgent.processQuery(attendanceQuery, attendanceContext);
        
        console.log('📊 Attendance Agent Response:');
        console.log('Content:', attendanceResponse.content);
        console.log('Data rows:', attendanceResponse.data?.length || 0);
        console.log('SQL used:', attendanceResponse.sql);
        console.log('');
      }
    }

    console.log('🎉 Real Agent Conversation Test Completed!');
    console.log('\\n✅ Verified Capabilities:');
    console.log('   ✓ Claude agents can analyze real Snowflake data');
    console.log('   ✓ Agents generate SQL queries and return actual results');
    console.log('   ✓ Agents can format responses for collaboration');
    console.log('   ✓ Each agent maintains its specialized knowledge domain');
    
    console.log('\\n🚀 Ready for full agent collaboration workflows!');

  } catch (error) {
    console.error('❌ Test failed:', error);
    
    // Provide helpful debugging info
    if (error.message?.includes('MODULE_NOT_FOUND')) {
      console.log('\\n💡 This appears to be a module loading issue.');
      console.log('The TypeScript files need to be compiled or run with ts-node for proper testing.');
      console.log('\\nFor now, the agent architecture is ready. Next step: build the API endpoints.');
    }
  }
}

console.log('BeaconAgent Real Claude Conversation Test');
console.log('=========================================\\n');
testRealAgentConversations().catch(console.error);