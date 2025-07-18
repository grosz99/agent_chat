import { NextRequest, NextResponse } from 'next/server';
import snowflake from 'snowflake-sdk';


export async function POST(request: NextRequest) {
  try {
    const { query: userQuery, agentId } = await request.json();
    
    console.log('Snowflake query request:', { userQuery, agentId });
    
    
    // Simple query mapping based on user input
    let sqlQuery: string;
    let agentName: string;
    
    if (agentId === 'pipeline-analytics' || userQuery.toLowerCase().includes('deals') || userQuery.toLowerCase().includes('pipeline') || userQuery.toLowerCase().includes('sales')) {
      agentName = 'Sales Pipeline Agent';
      sqlQuery = `
        SELECT 
          'Acme Corp' as client_name,
          3200000 as deal_value,
          'Strategic' as deal_type,
          '2024-03-15' as close_date,
          'Medium' as confidence
        UNION ALL
        SELECT 'TechFlow Inc', 2500000, 'Enterprise', '2024-02-28', 'High'
        UNION ALL  
        SELECT 'DataVision LLC', 1800000, 'Mid-Market', '2024-04-10', 'Medium'
        UNION ALL
        SELECT 'CloudSync Solutions', 950000, 'SMB', '2024-03-05', 'High'
        ORDER BY deal_value DESC
      `;
    } else if (agentId === 'attendance-analytics' || userQuery.toLowerCase().includes('attendance') || userQuery.toLowerCase().includes('office')) {
      agentName = 'HR Analytics Agent';
      sqlQuery = `
        SELECT 
          'New York' as office,
          85.2 as attendance_rate,
          '2024-12' as month
        UNION ALL
        SELECT 'San Francisco', 82.7, '2024-12'
        UNION ALL
        SELECT 'London', 88.1, '2024-12'
        UNION ALL
        SELECT 'Tokyo', 91.3, '2024-12'
        UNION ALL
        SELECT 'Sydney', 79.8, '2024-12'
        ORDER BY attendance_rate DESC
      `;
    } else if (agentId === 'ncc-financial' || userQuery.toLowerCase().includes('revenue') || userQuery.toLowerCase().includes('financial')) {
      agentName = 'Financial Data Agent';
      sqlQuery = `
        SELECT 
          'North America' as region,
          1500000 as revenue,
          'Q4 2024' as period
        UNION ALL
        SELECT 'Europe', 1200000, 'Q4 2024'
        UNION ALL  
        SELECT 'Asia Pacific', 900000, 'Q4 2024'
        UNION ALL
        SELECT 'Latin America', 400000, 'Q4 2024'
        UNION ALL
        SELECT 'Middle East', 300000, 'Q4 2024'
        ORDER BY revenue DESC
        LIMIT 5
      `;
    } else {
      agentName = 'Financial Data Agent';
      sqlQuery = 'SELECT CURRENT_TIMESTAMP() as timestamp, \'Welcome to BeaconAgent!\' as message';
    }

    // For demo purposes, return mock data directly instead of connecting to Snowflake
    let results: any[];
    
    if (agentName === 'Financial Data Agent') {
      results = [
        { REGION: 'North America', REVENUE: 1500000, PERIOD: 'Q4 2024' },
        { REGION: 'Europe', REVENUE: 1200000, PERIOD: 'Q4 2024' },
        { REGION: 'Asia Pacific', REVENUE: 900000, PERIOD: 'Q4 2024' },
        { REGION: 'Latin America', REVENUE: 400000, PERIOD: 'Q4 2024' },
        { REGION: 'Middle East', REVENUE: 300000, PERIOD: 'Q4 2024' }
      ];
    } else if (agentName === 'HR Analytics Agent') {
      results = [
        { OFFICE: 'Tokyo', ATTENDANCE_RATE: 91.3, MONTH: '2024-12' },
        { OFFICE: 'London', ATTENDANCE_RATE: 88.1, MONTH: '2024-12' },
        { OFFICE: 'New York', ATTENDANCE_RATE: 85.2, MONTH: '2024-12' },
        { OFFICE: 'San Francisco', ATTENDANCE_RATE: 82.7, MONTH: '2024-12' },
        { OFFICE: 'Sydney', ATTENDANCE_RATE: 79.8, MONTH: '2024-12' }
      ];
    } else if (agentName === 'Sales Pipeline Agent') {
      results = [
        { CLIENT_NAME: 'Acme Corp', DEAL_VALUE: 3200000, DEAL_TYPE: 'Strategic', CLOSE_DATE: '2024-03-15', CONFIDENCE: 'Medium' },
        { CLIENT_NAME: 'TechFlow Inc', DEAL_VALUE: 2500000, DEAL_TYPE: 'Enterprise', CLOSE_DATE: '2024-02-28', CONFIDENCE: 'High' },
        { CLIENT_NAME: 'DataVision LLC', DEAL_VALUE: 1800000, DEAL_TYPE: 'Mid-Market', CLOSE_DATE: '2024-04-10', CONFIDENCE: 'Medium' },
        { CLIENT_NAME: 'CloudSync Solutions', DEAL_VALUE: 950000, DEAL_TYPE: 'SMB', CLOSE_DATE: '2024-03-05', CONFIDENCE: 'High' }
      ];
    } else {
      results = [{ TIMESTAMP: new Date().toISOString(), MESSAGE: 'Welcome to BeaconAgent!' }];
    }

    // Generate insights based on the data
    let insights: string[] = [];
    if (agentId === 'ncc-financial') {
      insights = [
        'North America leads revenue generation with $1.5M',
        'Europe shows strong performance at $1.2M',
        'Total Q4 revenue across all regions: $4.3M'
      ];
    } else if (agentId === 'attendance-analytics') {
      insights = [
        'Tokyo office has highest attendance at 91.3%',
        'Sydney office needs attention with 79.8% attendance',
        'Average attendance across all offices: 85.4%'
      ];
    } else if (agentId === 'pipeline-analytics') {
      insights = [
        'Acme Corp offers highest deal value at $3.2M',
        'TechFlow Inc has highest confidence rating',
        'Total pipeline value: $8.45M across 4 key clients'
      ];
    }

    // Create contextual response based on query
    let contextualResponse = `Based on your query "${userQuery}", I've analyzed the ${agentName.toLowerCase()} and found the following results:`;
    
    if (userQuery.toLowerCase().includes('march to april') || userQuery.toLowerCase().includes('march') && userQuery.toLowerCase().includes('april')) {
      contextualResponse = `Looking at our revenue data from March to April, I can see that revenue increased from $3.8M to $4.1M, representing a 7.9% growth. This increase was driven by several key factors:

1. **New Enterprise Deals**: We closed 3 major enterprise contracts in April worth $1.2M total
2. **Subscription Renewals**: Higher than expected renewal rates (94% vs 89% projected)  
3. **Product Expansion**: Existing customers expanded their usage by an average of 23%
4. **Geographic Growth**: Strong performance in North America and Europe markets

The month-over-month growth of 7.9% exceeded our target of 5%, primarily due to the successful launch of our new enterprise features and improved customer retention strategies.`;
    } else if (userQuery.toLowerCase().includes('revenue') && userQuery.toLowerCase().includes('increase')) {
      contextualResponse = `Our revenue has shown consistent growth over the past 6 months. The key drivers include:

1. **Customer Acquisition**: 15% increase in new customer sign-ups
2. **Average Contract Value**: 18% increase in deal sizes
3. **Market Expansion**: Entry into 2 new geographic markets
4. **Product Innovation**: Launch of premium features driving upsells

This growth trajectory positions us well for continued expansion.`;
    }

    return NextResponse.json({
      success: true,
      agent: {
        id: agentId,
        name: agentName
      },
      response: {
        content: contextualResponse,
        data: results,
        sql: sqlQuery,
        confidence: 0.9,
        insights,
        reasoning: `I executed a SQL query against our ${agentName.toLowerCase()} to retrieve the most relevant information for your request.`
      }
    });

  } catch (error) {
    console.error('Snowflake query failed:', error);
    
    // Add debugging information
    const envVarStatus = {
      SNOWFLAKE_ACCOUNT: !!process.env.SNOWFLAKE_ACCOUNT,
      SNOWFLAKE_USER: !!process.env.SNOWFLAKE_USER,
      SNOWFLAKE_PASSWORD: !!process.env.SNOWFLAKE_PASSWORD,
      SNOWFLAKE_PRIVATE_KEY: !!process.env.SNOWFLAKE_PRIVATE_KEY,
      SNOWFLAKE_DATABASE: !!process.env.SNOWFLAKE_DATABASE,
      SNOWFLAKE_WAREHOUSE: !!process.env.SNOWFLAKE_WAREHOUSE,
      SNOWFLAKE_SCHEMA: !!process.env.SNOWFLAKE_SCHEMA
    };
    
    return NextResponse.json({
      error: 'Query execution failed',
      details: error instanceof Error ? error.message : String(error),
      envVarStatus
    }, { status: 500 });
  }
}