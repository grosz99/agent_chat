import { NextRequest, NextResponse } from 'next/server';

export async function POST(request: NextRequest) {
  try {
    const { query: userQuery, agentId } = await request.json();
    
    // Always return mock data for testing
    const mockData = [
      { region: 'North America', revenue: 1500000, period: 'Q4 2024' },
      { region: 'Europe', revenue: 1200000, period: 'Q4 2024' },
      { region: 'Asia Pacific', revenue: 900000, period: 'Q4 2024' }
    ];

    return NextResponse.json({
      result: {
        message: `Based on your query "${userQuery}", here are the results:`,
        data: mockData,
        agentId: agentId,
        insights: ['North America leads with $1.5M', 'Strong performance across regions'],
        chart: null
      }
    });

  } catch (error) {
    return NextResponse.json({
      error: 'Test API failed',
      details: error instanceof Error ? error.message : String(error)
    }, { status: 500 });
  }
}