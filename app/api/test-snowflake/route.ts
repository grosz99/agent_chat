import { NextResponse } from 'next/server';
import snowflake from 'snowflake-sdk';

export async function GET() {
  try {
    console.log('Testing Snowflake connection...');
    
    // Check environment variables
    const requiredEnvs = {
      SNOWFLAKE_ACCOUNT: process.env.SNOWFLAKE_ACCOUNT,
      SNOWFLAKE_USER: process.env.SNOWFLAKE_USER,
      SNOWFLAKE_PASSWORD: process.env.SNOWFLAKE_PASSWORD,
      SNOWFLAKE_DATABASE: process.env.SNOWFLAKE_DATABASE,
      SNOWFLAKE_WAREHOUSE: process.env.SNOWFLAKE_WAREHOUSE,
      SNOWFLAKE_SCHEMA: process.env.SNOWFLAKE_SCHEMA,
      SNOWFLAKE_ROLE: process.env.SNOWFLAKE_ROLE
    };

    console.log('Environment check:', Object.keys(requiredEnvs).map(key => 
      `${key}: ${requiredEnvs[key as keyof typeof requiredEnvs] ? '✓' : '✗'}`
    ));

    const missingEnvs = Object.entries(requiredEnvs).filter(([_, value]) => !value);
    if (missingEnvs.length > 0) {
      return NextResponse.json({
        error: 'Missing environment variables',
        missing: missingEnvs.map(([key]) => key)
      }, { status: 400 });
    }

    // Create connection
    const connectionConfig = {
      account: process.env.SNOWFLAKE_ACCOUNT!,
      username: process.env.SNOWFLAKE_USER!,
      password: process.env.SNOWFLAKE_PASSWORD!,
      database: process.env.SNOWFLAKE_DATABASE!,
      schema: process.env.SNOWFLAKE_SCHEMA!,
      warehouse: process.env.SNOWFLAKE_WAREHOUSE!,
      role: process.env.SNOWFLAKE_ROLE!
    };

    console.log('Creating Snowflake connection with config:', {
      account: connectionConfig.account,
      username: connectionConfig.username,
      database: connectionConfig.database,
      warehouse: connectionConfig.warehouse,
      schema: connectionConfig.schema,
      role: connectionConfig.role,
      hasPassword: !!connectionConfig.password
    });

    const connection = snowflake.createConnection(connectionConfig);

    // Test connection
    const connectResult = await new Promise((resolve, reject) => {
      connection.connect((err, conn) => {
        if (err) {
          console.error('Snowflake connection error:', err);
          reject(err);
        } else {
          console.log('Snowflake connection successful');
          resolve(conn);
        }
      });
    });

    console.log('Connection established, testing simple query...');

    // Test simple query
    const queryResult = await new Promise((resolve, reject) => {
      connection.execute({
        sqlText: 'SELECT CURRENT_VERSION() as version, CURRENT_USER() as user, CURRENT_DATABASE() as database',
        complete: (err, stmt, rows) => {
          if (err) {
            console.error('Query error:', err);
            reject(err);
          } else {
            console.log('Query successful, rows:', rows);
            resolve(rows);
          }
        }
      });
    });

    // Test table access
    console.log('Testing table access...');
    const tableTestResult = await new Promise((resolve, reject) => {
      connection.execute({
        sqlText: 'SELECT COUNT(*) as count FROM NCC_AGENT LIMIT 1',
        complete: (err, stmt, rows) => {
          if (err) {
            console.error('Table test error:', err);
            resolve({ error: err.message });
          } else {
            console.log('Table test successful, rows:', rows);
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
      connection: 'established',
      basicQuery: queryResult,
      tableTest: tableTestResult,
      timestamp: new Date().toISOString()
    });

  } catch (error) {
    console.error('Snowflake test failed:', error);
    return NextResponse.json({
      error: 'Snowflake connection failed',
      details: String(error),
      message: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 });
  }
}