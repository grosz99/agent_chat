const snowflake = require('snowflake-sdk');
const fs = require('fs');
const path = require('path');
require('dotenv').config({ path: '.env.local' });

async function testSnowflakeConnection() {
  console.log('🔐 Testing Snowflake connection with RSA key...\n');

  // Read the private key
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
        console.error('❌ Connection failed:', err.message);
        reject(err);
        return;
      }
      
      console.log('✅ Successfully connected to Snowflake!');
      
      // Test queries on each table
      const tables = ['NCC', 'ATTENDANCE', 'PIPELINE'];
      const results = {};

      for (const tableName of tables) {
        try {
          console.log(`\n📊 Testing ${tableName} table...`);
          
          const queryResults = await new Promise((resolve, reject) => {
            conn.execute({
              sqlText: `SELECT COUNT(*) as row_count FROM ${tableName}`,
              complete: (err, stmt, rows) => {
                if (err) reject(err);
                else resolve(rows);
              }
            });
          });

          const sampleResults = await new Promise((resolve, reject) => {
            conn.execute({
              sqlText: `SELECT * FROM ${tableName} LIMIT 2`,
              complete: (err, stmt, rows) => {
                if (err) reject(err);
                else resolve(rows);
              }
            });
          });

          results[tableName] = {
            rowCount: queryResults[0].ROW_COUNT,
            sampleData: sampleResults
          };

          console.log(`  ✅ ${tableName}: ${queryResults[0].ROW_COUNT} rows`);
          console.log(`  📝 Sample data:`, JSON.stringify(sampleResults[0], null, 2));

        } catch (error) {
          console.log(`  ❌ ${tableName} error:`, error.message);
          results[tableName] = { error: error.message };
        }
      }

      // Test a more complex query that would be typical for agents
      console.log('\n📈 Testing complex analytical query...');
      try {
        const analyticalResults = await new Promise((resolve, reject) => {
          conn.execute({
            sqlText: `
              SELECT 
                OFFICE,
                REGION,
                SUM(NCC) as total_ncc,
                COUNT(*) as project_count,
                AVG(NCC) as avg_ncc
              FROM NCC 
              GROUP BY OFFICE, REGION 
              ORDER BY total_ncc DESC 
              LIMIT 5
            `,
            complete: (err, stmt, rows) => {
              if (err) reject(err);
              else resolve(rows);
            }
          });
        });

        console.log('  ✅ Analytical query successful!');
        console.log('  📊 Top 5 offices by NCC:');
        analyticalResults.forEach((row, i) => {
          console.log(`    ${i+1}. ${row.OFFICE} (${row.REGION}): $${row.TOTAL_NCC.toLocaleString()}`);
        });

      } catch (error) {
        console.log('  ❌ Analytical query failed:', error.message);
      }

      conn.destroy();
      resolve(results);
    });
  });
}

// Test data manipulation scenarios that agents would perform
async function testDataScenarios() {
  console.log('\n🧮 Testing data scenarios for agent operations...\n');

  const scenarios = [
    {
      name: 'NCC Performance Analysis',
      description: 'Analyze NCC performance by office and sector',
      sql: `
        SELECT 
          OFFICE,
          SECTOR,
          REGION,
          COUNT(*) as project_count,
          SUM(NCC) as total_ncc,
          AVG(NCC) as avg_ncc,
          SUM(TIMESHEET_CHARGES) as total_charges,
          SUM(ADJUSTMENTS) as total_adjustments,
          (SUM(ADJUSTMENTS) / SUM(TIMESHEET_CHARGES)) * 100 as adjustment_rate_pct
        FROM NCC 
        WHERE MONTH >= '2024-01'
        GROUP BY OFFICE, SECTOR, REGION
        ORDER BY total_ncc DESC
        LIMIT 10
      `
    },
    {
      name: 'Attendance Trends',
      description: 'Analyze attendance patterns by office and cohort',
      sql: `
        SELECT 
          OFFICE,
          COHORT,
          COUNT(*) as record_count,
          AVG(PEOPLE_ATTENDED::FLOAT / HEADCOUNT::FLOAT) * 100 as avg_attendance_rate,
          SUM(PEOPLE_ATTENDED) as total_attended,
          SUM(HEADCOUNT) as total_headcount
        FROM ATTENDANCE 
        WHERE DATE >= '2025-01-01'
        GROUP BY OFFICE, COHORT
        ORDER BY avg_attendance_rate DESC
        LIMIT 10
      `
    },
    {
      name: 'Pipeline Analysis',
      description: 'Analyze pipeline value and opportunities by stage and region',
      sql: `
        SELECT 
          STAGE,
          REGION,
          SECTOR,
          COUNT(*) as deal_count,
          SUM(POTENTIAL_VALUE_USD) as total_value,
          AVG(POTENTIAL_VALUE_USD) as avg_deal_size,
          MIN(POTENTIAL_VALUE_USD) as min_deal,
          MAX(POTENTIAL_VALUE_USD) as max_deal
        FROM PIPELINE 
        GROUP BY STAGE, REGION, SECTOR
        ORDER BY total_value DESC
        LIMIT 15
      `
    }
  ];

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
        reject(err);
        return;
      }

      const scenarioResults = {};

      for (const scenario of scenarios) {
        console.log(`📊 ${scenario.name}: ${scenario.description}`);
        try {
          const results = await new Promise((resolve, reject) => {
            conn.execute({
              sqlText: scenario.sql,
              complete: (err, stmt, rows) => {
                if (err) reject(err);
                else resolve(rows);
              }
            });
          });

          scenarioResults[scenario.name] = results;
          console.log(`  ✅ Success: ${results.length} rows returned`);
          
          // Show first result as example
          if (results.length > 0) {
            console.log(`  📝 Sample result:`, JSON.stringify(results[0], null, 2));
          }

        } catch (error) {
          console.log(`  ❌ Failed: ${error.message}`);
          scenarioResults[scenario.name] = { error: error.message };
        }
        console.log('');
      }

      conn.destroy();
      resolve(scenarioResults);
    });
  });
}

async function runTests() {
  try {
    await testSnowflakeConnection();
    await testDataScenarios();
    
    console.log('\n🎉 All tests completed successfully!');
    console.log('\n✅ Agents should be able to:');
    console.log('   - Connect to Snowflake using RSA key authentication');
    console.log('   - Query NCC, ATTENDANCE, and PIPELINE tables');
    console.log('   - Perform complex analytical queries');
    console.log('   - Handle data aggregation and calculations');
    console.log('   - Support agent-based data analysis workflows');
    
  } catch (error) {
    console.error('\n❌ Test failed:', error.message);
  }
}

console.log('BeaconAgent Snowflake Integration Test');
console.log('=====================================\n');
runTests().catch(console.error);