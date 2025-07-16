import { NextRequest, NextResponse } from 'next/server';
import snowflake from 'snowflake-sdk';

export async function GET(request: NextRequest) {
  try {
    console.log('Testing Snowflake JWT connection...');
    
    // Environment variable check
    const requiredEnvVars = [
      'SNOWFLAKE_ACCOUNT',
      'SNOWFLAKE_USERNAME', 
      'SNOWFLAKE_DATABASE',
      'SNOWFLAKE_WAREHOUSE',
      'SNOWFLAKE_SCHEMA',
      'SNOWFLAKE_ROLE',
      'SNOWFLAKE_PRIVATE_KEY'
    ];
    
    const envCheck = requiredEnvVars.map(envVar => {
      const value = process.env[envVar];
      return `${envVar}: ${value ? '✓' : '✗'}`;
    });
    
    console.log('Environment check:', envCheck);
    
    // Extract the private key and format it properly
    const privateKeyEnv = process.env.SNOWFLAKE_PRIVATE_KEY;
    if (!privateKeyEnv) {
      throw new Error('SNOWFLAKE_PRIVATE_KEY environment variable is not set');
    }
    
    // Clean up the private key format - remove quotes and normalize line breaks
    const privateKey = privateKeyEnv
      .replace(/^["']|["']$/g, '') // Remove surrounding quotes
      .replace(/\\n/g, '\n')       // Convert literal \n to actual newlines
      .trim();                     // Remove any extra whitespace
    
    const connectionConfig = {
      account: process.env.SNOWFLAKE_ACCOUNT!,
      username: process.env.SNOWFLAKE_USERNAME!,
      authenticator: 'SNOWFLAKE_JWT',
      privateKey: privateKey,
      database: process.env.SNOWFLAKE_DATABASE!,
      warehouse: process.env.SNOWFLAKE_WAREHOUSE!,
      schema: process.env.SNOWFLAKE_SCHEMA!,
      role: process.env.SNOWFLAKE_ROLE!
    };
    
    console.log('Creating Snowflake JWT connection with config:', {
      account: connectionConfig.account,
      username: connectionConfig.username,
      authenticator: connectionConfig.authenticator,
      database: connectionConfig.database,
      warehouse: connectionConfig.warehouse,
      schema: connectionConfig.schema,
      role: connectionConfig.role,
      hasPrivateKey: !!connectionConfig.privateKey
    });
    
    // Create connection
    const connection = snowflake.createConnection(connectionConfig);
    
    // Connect using promise wrapper
    await new Promise<void>((resolve, reject) => {
      connection.connect((err, conn) => {
        if (err) {
          console.error('Snowflake JWT connection error:', err);
          reject(err);
        } else {
          console.log('Successfully connected to Snowflake using JWT authentication');
          resolve();
        }
      });
    });
    
    // Test a simple query
    const queryResult = await new Promise<any>((resolve, reject) => {
      connection.execute({
        sqlText: 'SELECT current_version() as version, current_user() as user, current_role() as role',
        complete: (err, stmt, rows) => {
          if (err) {
            console.error('Query execution error:', err);
            reject(err);
          } else {
            console.log('Query successful, rows:', rows);
            resolve(rows);
          }
        }
      });
    });
    
    // Test connection to our specific tables
    const tableTestResult = await new Promise<any>((resolve, reject) => {
      connection.execute({
        sqlText: `
          SELECT table_name 
          FROM information_schema.tables 
          WHERE table_schema = '${process.env.SNOWFLAKE_SCHEMA}' 
          AND table_name IN ('NCC_AGENT', 'PIPELINE_AGENT', 'ATTENDANCE_AGENT')
          ORDER BY table_name
        `,
        complete: (err, stmt, rows) => {
          if (err) {
            console.error('Table test error:', err);
            reject(err);
          } else {
            console.log('Table test successful, available tables:', rows);
            resolve(rows);
          }
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
    
    return NextResponse.json({
      success: true,
      message: 'Snowflake JWT connection successful',
      connection: {
        version: queryResult?.[0],
        availableTables: tableTestResult
      }
    });
    
  } catch (error) {
    console.error('Snowflake JWT test failed:', error);
    return NextResponse.json({
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error',
      details: error
    }, { status: 500 });
  }
}