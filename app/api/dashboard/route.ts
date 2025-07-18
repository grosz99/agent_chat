import { NextRequest, NextResponse } from 'next/server';

export async function GET(request: NextRequest) {
  try {
    // Mock dashboard data for demo
    const dashboardData = {
      kpis: {
        totalRevenue: {
          value: 4300000,
          change: { value: 12.5, type: 'increase' as const }
        },
        revenueGrowth: {
          value: 12.5,
          change: { value: 3.2, type: 'increase' as const }
        },
        pipelineValue: {
          value: 8450000,
          change: { value: 8.7, type: 'increase' as const }
        },
        conversionRate: {
          value: 24.8,
          change: { value: -1.2, type: 'decrease' as const }
        }
      },
      trendData: [
        { month: 'Jan', revenue: 3200000, pipeline: 7200000 },
        { month: 'Feb', revenue: 3450000, pipeline: 7800000 },
        { month: 'Mar', revenue: 3800000, pipeline: 8100000 },
        { month: 'Apr', revenue: 4100000, pipeline: 8350000 },
        { month: 'May', revenue: 4300000, pipeline: 8450000 },
        { month: 'Jun', revenue: 4200000, pipeline: 8600000 }
      ]
    };

    return NextResponse.json({
      success: true,
      data: dashboardData
    });

  } catch (error) {
    console.error('Dashboard API error:', error);
    return NextResponse.json({
      error: 'Failed to fetch dashboard data',
      details: error instanceof Error ? error.message : String(error)
    }, { status: 500 });
  }
}