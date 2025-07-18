const snowflake = require('snowflake-sdk');
require('dotenv').config({ path: '.env.local' });

async function testConnection() {
  console.log('Testing Snowflake connection...');
  console.log('Account:', process.env.SNOWFLAKE_ACCOUNT);
  console.log('User:', process.env.SNOWFLAKE_USERNAME);
  console.log('Database:', process.env.SNOWFLAKE_DATABASE);
  console.log('Warehouse:', process.env.SNOWFLAKE_WAREHOUSE);
  
  let connectionConfig;
  
  if (process.env.SNOWFLAKE_PRIVATE_KEY) {
    // Clean up the private key format
    let privateKey = process.env.SNOWFLAKE_PRIVATE_KEY;
    
    // Replace pipe separators with newlines
    if (privateKey.includes('|')) {
      privateKey = privateKey.replace(/\|/g, '\n');
    }
    
    // Ensure proper PEM format
    if (!privateKey.includes('-----BEGIN')) {
      privateKey = `-----BEGIN PRIVATE KEY-----\n${privateKey}\n-----END PRIVATE KEY-----`;
    }
    
    // Clean up any extra whitespace and ensure proper newlines
    privateKey = privateKey
      .replace(/\r\n/g, '\n')  // Normalize line endings
      .replace(/\n+/g, '\n')   // Remove multiple consecutive newlines
      .trim();
    
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

  try {
    // Connect with timeout
    await new Promise((resolve, reject) => {
      const timeout = setTimeout(() => reject(new Error('Connection timeout')), 7000);
      connection.connect((err, conn) => {
        clearTimeout(timeout);
        if (err) reject(err);
        else resolve(conn);
      });
    });
    
    console.log('✅ Connected successfully!');
    
    // Test a simple query
    const results = await new Promise((resolve, reject) => {
      const timeout = setTimeout(() => reject(new Error('Query timeout')), 5000);
      connection.execute({
        sqlText: 'SELECT CURRENT_TIMESTAMP() as timestamp',
        complete: (err, stmt, rows) => {
          clearTimeout(timeout);
          if (err) reject(err);
          else resolve(rows);
        }
      });
    });
    
    console.log('✅ Query executed successfully:', results);
    
    // Close connection
    await new Promise((resolve, reject) => {
      connection.destroy((err) => {
        if (err) reject(err);
        else resolve();
      });
    });
    
    console.log('✅ Connection closed');
    
  } catch (error) {
    console.error('❌ Error:', error.message);
    console.error('Full error:', error);
  }
}

testConnection();