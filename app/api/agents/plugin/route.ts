import { NextRequest, NextResponse } from 'next/server';

export async function POST(request: NextRequest) {
  try {
    const { externalApp, query } = await request.json();
    
    console.log('Plugin API request:', { externalApp, query });
    
    // Simulate processing time for realistic demo
    await new Promise(resolve => setTimeout(resolve, 2000));
    
    // Mock response simulating pipeline data for external app
    const mockPipelineData = {
      client: 'TechFlow Inc',
      opportunity: 'Enterprise Analytics Platform',
      stage: 'Negotiation',
      value: '$2.5M',
      details: 'Multi-year contract for enterprise data analytics solution. Client requires implementation by Q2 2025 with ongoing support. High probability of additional modules purchase.',
      closeDate: '2024-02-28',
      confidence: 'High',
      contactPerson: 'Sarah Johnson, CTO',
      lastActivity: '2024-01-15',
      nextSteps: 'Final contract review scheduled for next week'
    };
    
    return NextResponse.json({
      success: true,
      timestamp: new Date().toISOString(),
      source: 'Pipeline Analytics Agent',
      externalApp,
      query,
      ...mockPipelineData
    });

  } catch (error) {
    console.error('Plugin API error:', error);
    return NextResponse.json({
      error: 'Failed to process external query',
      details: error instanceof Error ? error.message : String(error)
    }, { status: 500 });
  }
}