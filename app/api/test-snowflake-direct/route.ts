import { NextRequest, NextResponse } from 'next/server';
import snowflake from 'snowflake-sdk';

export async function GET(request: NextRequest) {
  try {
    console.log('Starting direct Snowflake connection test...');
    
    // Check environment variables - show all available first
    const allEnvVars = Object.keys(process.env).filter(key => key.startsWith('SNOWFLAKE_') || key.startsWith('ANTHROPIC_'));
    
    const requiredEnvs = [
      'SNOWFLAKE_ACCOUNT',
      'SNOWFLAKE_USER', 
      'SNOWFLAKE_DATABASE',
      'SNOWFLAKE_WAREHOUSE',
      'SNOWFLAKE_SCHEMA',
      'SNOWFLAKE_ROLE'
    ];

    const missing = requiredEnvs.filter(env => !process.env[env]);
    const available = requiredEnvs.filter(env => !!process.env[env]);
    
    if (missing.length > 0) {
      return NextResponse.json({
        error: 'Missing environment variables',
        missing,
        available,
        allSnowflakeEnvVars: allEnvVars,
        envVarDetails: allEnvVars.reduce((acc: any, key) => {
          acc[key] = process.env[key] ? 'SET' : 'NOT_SET';
          return acc;
        }, {}),
        nodeEnv: process.env.NODE_ENV
      }, { status: 400 });
    }

    // Try JWT authentication first
    let connectionConfig: any;
    
    if (process.env.SNOWFLAKE_PRIVATE_KEY) {
      console.log('Using JWT authentication with private key from env var');
      
      // Clean up the private key format
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
    } else if (process.env.SNOWFLAKE_PASSWORD) {
      console.log('Using password authentication');
      
      connectionConfig = {
        account: process.env.SNOWFLAKE_ACCOUNT,
        username: process.env.SNOWFLAKE_USER,
        password: process.env.SNOWFLAKE_PASSWORD,
        database: process.env.SNOWFLAKE_DATABASE,
        warehouse: process.env.SNOWFLAKE_WAREHOUSE,
        schema: process.env.SNOWFLAKE_SCHEMA,
        role: process.env.SNOWFLAKE_ROLE
      };
    } else {
      return NextResponse.json({
        error: 'No authentication method available',
        message: 'Need either SNOWFLAKE_PRIVATE_KEY or SNOWFLAKE_PASSWORD'
      }, { status: 400 });
    }

    console.log('Creating Snowflake connection with config:', {
      account: connectionConfig.account,
      username: connectionConfig.username,
      database: connectionConfig.database,
      warehouse: connectionConfig.warehouse,
      schema: connectionConfig.schema,
      role: connectionConfig.role,
      authenticator: connectionConfig.authenticator,
      hasPrivateKey: !!connectionConfig.privateKey,
      hasPassword: !!connectionConfig.password
    });

    // Create connection
    const connection = snowflake.createConnection(connectionConfig);

    // Test connection with timeout
    const connectionPromise = new Promise((resolve, reject) => {
      const timeout = setTimeout(() => {
        reject(new Error('Connection timeout after 8 seconds'));
      }, 8000); // 8 second timeout to stay under Vercel's 10 second limit

      connection.connect((err, conn) => {
        clearTimeout(timeout);
        if (err) {
          console.error('Snowflake connection error:', err);
          reject(err);
        } else {
          console.log('Snowflake connection successful');
          resolve(conn);
        }
      });
    });

    await connectionPromise;

    // Test simple query
    console.log('Testing simple query...');
    const queryPromise = new Promise((resolve, reject) => {
      const timeout = setTimeout(() => {
        reject(new Error('Query timeout after 5 seconds'));
      }, 5000);

      connection.execute({
        sqlText: 'SELECT CURRENT_VERSION() as version, CURRENT_USER() as user, CURRENT_DATABASE() as database',
        complete: (err, stmt, rows) => {
          clearTimeout(timeout);
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

    const queryResults = await queryPromise;

    // Close connection
    await new Promise<void>((resolve, reject) => {
      connection.destroy((err) => {
        if (err) {
          console.error('Error closing connection:', err);
          reject(err);
        } else {
          console.log('Connection closed successfully');
          resolve();
        }
      });
    });

    return NextResponse.json({
      success: true,
      message: 'Direct Snowflake connection successful',
      connectionInfo: {
        account: process.env.SNOWFLAKE_ACCOUNT,
        username: process.env.SNOWFLAKE_USER,
        database: process.env.SNOWFLAKE_DATABASE,
        warehouse: process.env.SNOWFLAKE_WAREHOUSE,
        schema: process.env.SNOWFLAKE_SCHEMA,
        role: process.env.SNOWFLAKE_ROLE,
        authMethod: connectionConfig.authenticator || 'password'
      },
      queryResults,
      timestamp: new Date().toISOString()
    });

  } catch (error) {
    console.error('Direct Snowflake test failed:', error);
    
    return NextResponse.json({
      error: 'Direct Snowflake connection failed',
      details: error instanceof Error ? error.message : String(error),
      stack: error instanceof Error ? error.stack : undefined,
      timestamp: new Date().toISOString()
    }, { status: 500 });
  }
}