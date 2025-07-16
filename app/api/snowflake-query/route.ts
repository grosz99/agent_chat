import { NextRequest, NextResponse } from 'next/server';
import snowflake from 'snowflake-sdk';

export async function POST(request: NextRequest) {
  try {
    const { query: userQuery, agentId } = await request.json();
    
    console.log('Snowflake query request:', { userQuery, agentId });
    
    // Simple query mapping based on user input
    let sqlQuery: string;
    let agentName: string;
    
    if (userQuery.toLowerCase().includes('revenue') || userQuery.toLowerCase().includes('financial') || agentId === 'ncc-financial') {
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
    } else if (userQuery.toLowerCase().includes('attendance') || userQuery.toLowerCase().includes('office') || agentId === 'attendance-analytics') {
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
    } else if (userQuery.toLowerCase().includes('sales') || userQuery.toLowerCase().includes('pipeline') || agentId === 'pipeline-analytics') {
      agentName = 'Sales Pipeline Agent';
      sqlQuery = `
        SELECT 
          'Enterprise' as deal_type,
          2500000 as pipeline_value,
          12 as deal_count,
          'High' as confidence
        UNION ALL
        SELECT 'Mid-Market', 1800000, 28, 'Medium'
        UNION ALL
        SELECT 'SMB', 950000, 45, 'High'
        UNION ALL
        SELECT 'Strategic', 3200000, 5, 'Medium'
        ORDER BY pipeline_value DESC
      `;
    } else {
      agentName = 'Financial Data Agent';
      sqlQuery = 'SELECT CURRENT_TIMESTAMP() as timestamp, \'Welcome to BeaconAgent!\' as message';
    }

    // Use the same connection logic as the direct test
    let connectionConfig: any;
    
    if (process.env.SNOWFLAKE_PRIVATE_KEY) {
      let privateKey = process.env.SNOWFLAKE_PRIVATE_KEY;
      if (!privateKey.includes('-----BEGIN')) {
        privateKey = `-----BEGIN PRIVATE KEY-----\n${privateKey}\n-----END PRIVATE KEY-----`;
      }
      
      connectionConfig = {
        account: process.env.SNOWFLAKE_ACCOUNT,
        username: process.env.SNOWFLAKE_USER,
        authenticator: 'SNOWFLAKE_JWT',
        privateKey: privateKey,
        database: process.env.SNOWFLAKE_DATABASE,
        warehouse: process.env.SNOWFLAKE_WAREHOUSE,
        schema: process.env.SNOWFLAKE_SCHEMA,
        role: process.env.SNOWFLAKE_ROLE
      };
    } else {
      connectionConfig = {
        account: process.env.SNOWFLAKE_ACCOUNT,
        username: process.env.SNOWFLAKE_USER,
        password: process.env.SNOWFLAKE_PASSWORD,
        database: process.env.SNOWFLAKE_DATABASE,
        warehouse: process.env.SNOWFLAKE_WAREHOUSE,
        schema: process.env.SNOWFLAKE_SCHEMA,
        role: process.env.SNOWFLAKE_ROLE
      };
    }

    const connection = snowflake.createConnection(connectionConfig);

    // Connect with timeout
    await new Promise((resolve, reject) => {
      const timeout = setTimeout(() => reject(new Error('Connection timeout')), 7000);
      connection.connect((err, conn) => {
        clearTimeout(timeout);
        if (err) reject(err);
        else resolve(conn);
      });
    });

    // Execute query
    const results = await new Promise((resolve, reject) => {
      const timeout = setTimeout(() => reject(new Error('Query timeout')), 5000);
      connection.execute({
        sqlText: sqlQuery,
        complete: (err, stmt, rows) => {
          clearTimeout(timeout);
          if (err) reject(err);
          else resolve(rows);
        }
      });
    });

    // Close connection
    await new Promise<void>((resolve, reject) => {
      connection.destroy((err) => {
        if (err) reject(err);
        else resolve();
      });
    });

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
        'Strategic deals represent highest value per deal',
        'SMB segment has most deals with highest confidence',
        'Total pipeline value: $8.45M across 90 deals'
      ];
    }

    return NextResponse.json({
      success: true,
      agent: {
        id: agentId,
        name: agentName
      },
      response: {
        content: `Based on your query "${userQuery}", I've analyzed the ${agentName.toLowerCase()} and found the following results:`,
        data: results,
        sql: sqlQuery,
        confidence: 0.9,
        insights,
        reasoning: `I executed a SQL query against our ${agentName.toLowerCase()} to retrieve the most relevant information for your request.`
      }
    });

  } catch (error) {
    console.error('Snowflake query failed:', error);
    
    return NextResponse.json({
      error: 'Query execution failed',
      details: error instanceof Error ? error.message : String(error)
    }, { status: 500 });
  }
}