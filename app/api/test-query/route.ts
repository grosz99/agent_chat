import { NextRequest, NextResponse } from 'next/server';
import snowflake from 'snowflake-sdk';

export async function GET(request: NextRequest) {
  try {
    console.log('Testing Snowflake query execution...');
    
    const privateKey = process.env.SNOWFLAKE_PRIVATE_KEY!
      .replace(/\\n/g, '\n')
      .replace(/-----BEGIN PRIVATE KEY-----\s*/, '-----BEGIN PRIVATE KEY-----\n')
      .replace(/\s*-----END PRIVATE KEY-----/, '\n-----END PRIVATE KEY-----');
    
    const connectionConfig = {
      account: process.env.SNOWFLAKE_ACCOUNT!,
      username: process.env.SNOWFLAKE_USER!,
      authenticator: 'SNOWFLAKE_JWT',
      privateKey: privateKey,
      database: process.env.SNOWFLAKE_DATABASE!,
      warehouse: process.env.SNOWFLAKE_WAREHOUSE!,
      schema: process.env.SNOWFLAKE_SCHEMA!,
      role: process.env.SNOWFLAKE_ROLE!
    };
    
    const connection = snowflake.createConnection(connectionConfig);
    
    // Connect
    await new Promise<void>((resolve, reject) => {
      connection.connect((err, conn) => {
        if (err) {
          reject(err);
        } else {
          resolve();
        }
      });
    });
    
    console.log('Connected to Snowflake successfully');
    
    // Test query on each agent table to see structure and sample data
    const tables = ['NCC_AGENT', 'PIPELINE_AGENT', 'ATTENDANCE_AGENT'];
    const results: any = {};
    
    for (const tableName of tables) {
      console.log(`Querying ${tableName}...`);
      
      // Get table structure
      const structureResult = await new Promise<any>((resolve, reject) => {
        connection.execute({
          sqlText: `DESCRIBE TABLE ${tableName}`,
          complete: (err, stmt, rows) => {
            if (err) {
              console.error(`Structure query error for ${tableName}:`, err);
              reject(err);
            } else {
              resolve(rows);
            }
          }
        });
      });
      
      // Get sample data (first 3 rows)
      const dataResult = await new Promise<any>((resolve, reject) => {
        connection.execute({
          sqlText: `SELECT * FROM ${tableName} LIMIT 3`,
          complete: (err, stmt, rows) => {
            if (err) {
              console.error(`Data query error for ${tableName}:`, err);
              reject(err);
            } else {
              resolve(rows);
            }
          }
        });
      });
      
      results[tableName] = {
        structure: structureResult,
        sampleData: dataResult,
        rowCount: dataResult?.length || 0
      };
      
      console.log(`${tableName}: ${dataResult?.length || 0} rows retrieved`);
    }
    
    // Close connection
    await new Promise<void>((resolve, reject) => {
      connection.destroy((err) => {
        if (err) reject(err);
        else resolve();
      });
    });
    
    return NextResponse.json({
      success: true,
      message: 'Query execution successful',
      results
    });
    
  } catch (error) {
    console.error('Query test failed:', error);
    return NextResponse.json({
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error',
      details: error
    }, { status: 500 });
  }
}