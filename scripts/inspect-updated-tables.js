const snowflake = require('snowflake-sdk');
const fs = require('fs');
const path = require('path');
require('dotenv').config({ path: '.env.local' });

async function inspectUpdatedTables() {
  const privateKeyPath = path.join(__dirname, '..', 'private_key.pem');
  const privateKey = fs.readFileSync(privateKeyPath, 'utf8');

  const connection = snowflake.createConnection({
    account: process.env.SNOWFLAKE_ACCOUNT,
    username: process.env.SNOWFLAKE_USERNAME,
    database: process.env.SNOWFLAKE_DATABASE,
    schema: process.env.SNOWFLAKE_SCHEMA,
    warehouse: process.env.SNOWFLAKE_WAREHOUSE,
    role: process.env.SNOWFLAKE_ROLE,
    authenticator: 'SNOWFLAKE_JWT',
    privateKey: privateKey,
    privateKeyPassphrase: undefined
  });

  return new Promise((resolve, reject) => {
    connection.connect(async (err, conn) => {
      if (err) {
        console.error('Connection failed:', err);
        reject(err);
        return;
      }
      console.log('Connected to Snowflake successfully');
      
      const targetTables = ['NCC_AGENT', 'PIPELINE_AGENT', 'ATTENDANCE_AGENT'];
      let results = {};
      let completed = 0;
      
      // Check each table
      targetTables.forEach(tableName => {
        // First get table schema
        conn.execute({
          sqlText: `DESCRIBE TABLE ${tableName}`,
          complete: (err, stmt, rows) => {
            if (err) {
              console.error(`Error describing table ${tableName}:`, err);
              results[tableName] = { error: err.message };
            } else {
              console.log(`\\n=== ${tableName} Table Schema ===`);
              console.log('Columns:');
              rows.forEach(row => {
                console.log(`- ${row.name} (${row.type}) ${row.null ? 'NULL' : 'NOT NULL'}`);
              });
              
              results[tableName] = {
                columns: rows.map(row => ({
                  name: row.name,
                  type: row.type,
                  nullable: row.null === 'Y',
                  default: row.default
                }))
              };
              
              // Get sample data
              conn.execute({
                sqlText: `SELECT * FROM ${tableName} LIMIT 3`,
                complete: (err2, stmt2, sampleRows) => {
                  if (err2) {
                    console.error(`Error getting sample data for ${tableName}:`, err2);
                    results[tableName].sampleError = err2.message;
                  } else {
                    console.log(`\\nSample data from ${tableName}:`);
                    console.log(JSON.stringify(sampleRows, null, 2));
                    results[tableName].sampleData = sampleRows;
                  }
                  
                  completed++;
                  if (completed === targetTables.length) {
                    conn.destroy();
                    resolve(results);
                  }
                }
              });
            }
            
            if (err) {
              completed++;
              if (completed === targetTables.length) {
                conn.destroy();
                resolve(results);
              }
            }
          }
        });
      });
    });
  });
}

inspectUpdatedTables()
  .then(results => {
    console.log('\\n=== INSPECTION COMPLETE ===');
    console.log('Results:', JSON.stringify(results, null, 2));
  })
  .catch(err => {
    console.error('Inspection failed:', err);
  });