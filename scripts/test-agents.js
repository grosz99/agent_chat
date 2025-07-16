const { agentFactory } = require('../lib/agents/agent-factory');
require('dotenv').config({ path: '.env.local' });

async function testAgents() {
  try {
    console.log('🚀 Initializing Agent Factory...');
    await agentFactory.initialize();
    
    console.log('📊 Available agents:');
    const agents = agentFactory.getAllAgents();
    agents.forEach(agent => {
      console.log(`  - ${agent.name} (${agent.id})`);
    });

    console.log('\n🔍 Testing each agent with sample queries...\n');

    // Test NCC Financial Agent
    const nccAgent = agentFactory.getAgent('ncc-financial');
    if (nccAgent) {
      console.log('Testing NCC Financial Agent...');
      try {
        const nccContext = {
          conversationId: 'test-1',
          userId: 'test-user',
          dataSourceId: 'ncc-financial',
          semanticModel: nccAgent.semanticModel,
          history: [],
          metadata: {}
        };

        const nccResponse = await nccAgent.processQuery(
          'Show me total NCC by office for the last 3 months',
          nccContext
        );
        
        console.log('✅ NCC Agent Response:');
        console.log('Content:', nccResponse.content);
        console.log('Data rows:', nccResponse.data?.length || 0);
        console.log('Confidence:', nccResponse.confidence);
        console.log('SQL:', nccResponse.sql);
      } catch (error) {
        console.log('❌ NCC Agent Error:', error.message);
      }
      console.log('');
    }

    // Test Attendance Agent
    const attendanceAgent = agentFactory.getAgent('attendance-analytics');
    if (attendanceAgent) {
      console.log('Testing Attendance Analytics Agent...');
      try {
        const attendanceContext = {
          conversationId: 'test-2',
          userId: 'test-user',
          dataSourceId: 'attendance-analytics',
          semanticModel: attendanceAgent.semanticModel,
          history: [],
          metadata: {}
        };

        const attendanceResponse = await attendanceAgent.processQuery(
          'What is the average attendance rate by office?',
          attendanceContext
        );
        
        console.log('✅ Attendance Agent Response:');
        console.log('Content:', attendanceResponse.content);
        console.log('Data rows:', attendanceResponse.data?.length || 0);
        console.log('Confidence:', attendanceResponse.confidence);
        console.log('SQL:', attendanceResponse.sql);
      } catch (error) {
        console.log('❌ Attendance Agent Error:', error.message);
      }
      console.log('');
    }

    // Test Pipeline Agent
    const pipelineAgent = agentFactory.getAgent('pipeline-analytics');
    if (pipelineAgent) {
      console.log('Testing Pipeline Analytics Agent...');
      try {
        const pipelineContext = {
          conversationId: 'test-3',
          userId: 'test-user',
          dataSourceId: 'pipeline-analytics',
          semanticModel: pipelineAgent.semanticModel,
          history: [],
          metadata: {}
        };

        const pipelineResponse = await pipelineAgent.processQuery(
          'Show me the total pipeline value by region and stage',
          pipelineContext
        );
        
        console.log('✅ Pipeline Agent Response:');
        console.log('Content:', pipelineResponse.content);
        console.log('Data rows:', pipelineResponse.data?.length || 0);
        console.log('Confidence:', pipelineResponse.confidence);
        console.log('SQL:', pipelineResponse.sql);
      } catch (error) {
        console.log('❌ Pipeline Agent Error:', error.message);
      }
      console.log('');
    }

    // Test Python execution
    console.log('🐍 Testing Python analysis capabilities...');
    if (nccAgent) {
      try {
        // Get some data first
        const nccContext = {
          conversationId: 'test-python',
          userId: 'test-user',
          dataSourceId: 'ncc-financial',
          semanticModel: nccAgent.semanticModel,
          history: [],
          metadata: {}
        };

        const pythonResponse = await nccAgent.processQuery(
          'Analyze NCC performance by office and calculate adjustment rates using Python',
          nccContext
        );
        
        console.log('✅ Python Analysis Response:');
        console.log('Content:', pythonResponse.content);
        console.log('Has analysis result:', !!pythonResponse.metadata?.analysisType);
        console.log('Python logs:', pythonResponse.metadata?.pythonLogs);
      } catch (error) {
        console.log('❌ Python Analysis Error:', error.message);
      }
    }

    console.log('\n📈 Agent Factory Health Check:');
    const health = await agentFactory.healthCheck();
    Object.keys(health).forEach(agentId => {
      const status = health[agentId];
      console.log(`  ${agentId}: ${status.healthy ? '✅' : '❌'} ${status.status}`);
    });

    console.log('\n🎉 Agent testing completed!');

  } catch (error) {
    console.error('❌ Agent testing failed:', error);
  } finally {
    // Cleanup
    agentFactory.dispose();
  }
}

// Run the test
console.log('BeaconAgent System Test');
console.log('=======================\n');
testAgents().catch(console.error);