const snowflake = require('snowflake-sdk');
const fs = require('fs');
const path = require('path');
require('dotenv').config({ path: '.env.local' });

async function testUpdatedTables() {
  console.log('🔄 Testing updated table names: ncc_agent, pipeline_agent, attendance_agent\n');

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
      
      // Test queries on each updated table
      const tables = ['NCC_AGENT', 'ATTENDANCE_AGENT', 'PIPELINE_AGENT'];
      const results = {};

      for (const tableName of tables) {
        try {
          console.log(`\n📊 Testing ${tableName} table...`);
          
          // Test if table exists and get count
          const queryResults = await new Promise((resolve, reject) => {
            conn.execute({
              sqlText: `SELECT COUNT(*) as row_count FROM ${tableName}`,
              complete: (err, stmt, rows) => {
                if (err) reject(err);
                else resolve(rows);
              }
            });
          });

          // Get sample data
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

      // Test agent-specific analytical queries
      console.log('\n🤖 Testing agent-specific analytical queries...\n');

      // NCC Agent query
      if (!results.NCC_AGENT?.error) {
        try {
          console.log('📊 NCC Agent - Financial Performance Analysis:');
          const nccResults = await new Promise((resolve, reject) => {
            conn.execute({
              sqlText: `
                SELECT 
                  OFFICE,
                  REGION,
                  SUM(NCC) as total_ncc,
                  COUNT(*) as project_count,
                  AVG(NCC) as avg_ncc,
                  SUM(TIMESHEET_CHARGES) as total_charges,
                  (SUM(ADJUSTMENTS) / SUM(TIMESHEET_CHARGES)) * 100 as adjustment_rate_pct
                FROM NCC_AGENT 
                GROUP BY OFFICE, REGION 
                ORDER BY total_ncc DESC 
                LIMIT 3
              `,
              complete: (err, stmt, rows) => {
                if (err) reject(err);
                else resolve(rows);
              }
            });
          });

          console.log('  ✅ Query successful! Top 3 performing offices:');
          nccResults.forEach((row, i) => {
            console.log(`    ${i+1}. ${row.OFFICE} (${row.REGION}): $${row.TOTAL_NCC.toLocaleString()} NCC, ${row.PROJECT_COUNT} projects`);
          });
        } catch (error) {
          console.log('  ❌ NCC query failed:', error.message);
        }
        console.log('');
      }

      // Attendance Agent query
      if (!results.ATTENDANCE_AGENT?.error) {
        try {
          console.log('📊 Attendance Agent - Office Attendance Analysis:');
          const attendanceResults = await new Promise((resolve, reject) => {
            conn.execute({
              sqlText: `
                SELECT 
                  OFFICE,
                  COHORT,
                  AVG(PEOPLE_ATTENDED::FLOAT / HEADCOUNT::FLOAT) * 100 as avg_attendance_rate,
                  COUNT(*) as record_count,
                  SUM(PEOPLE_ATTENDED) as total_attended
                FROM ATTENDANCE_AGENT 
                GROUP BY OFFICE, COHORT
                ORDER BY avg_attendance_rate DESC
                LIMIT 3
              `,
              complete: (err, stmt, rows) => {
                if (err) reject(err);
                else resolve(rows);
              }
            });
          });

          console.log('  ✅ Query successful! Top 3 attendance rates:');
          attendanceResults.forEach((row, i) => {
            console.log(`    ${i+1}. ${row.OFFICE} - ${row.COHORT}: ${row.AVG_ATTENDANCE_RATE.toFixed(1)}% attendance rate`);
          });
        } catch (error) {
          console.log('  ❌ Attendance query failed:', error.message);
        }
        console.log('');
      }

      // Pipeline Agent query
      if (!results.PIPELINE_AGENT?.error) {
        try {
          console.log('📊 Pipeline Agent - Sales Pipeline Analysis:');
          const pipelineResults = await new Promise((resolve, reject) => {
            conn.execute({
              sqlText: `
                SELECT 
                  STAGE,
                  REGION,
                  COUNT(*) as deal_count,
                  SUM(POTENTIAL_VALUE_USD) as total_value,
                  AVG(POTENTIAL_VALUE_USD) as avg_deal_size
                FROM PIPELINE_AGENT 
                GROUP BY STAGE, REGION
                ORDER BY total_value DESC
                LIMIT 3
              `,
              complete: (err, stmt, rows) => {
                if (err) reject(err);
                else resolve(rows);
              }
            });
          });

          console.log('  ✅ Query successful! Top 3 pipeline segments:');
          pipelineResults.forEach((row, i) => {
            console.log(`    ${i+1}. ${row.STAGE} in ${row.REGION}: $${row.TOTAL_VALUE.toLocaleString()} (${row.DEAL_COUNT} deals)`);
          });
        } catch (error) {
          console.log('  ❌ Pipeline query failed:', error.message);
        }
        console.log('');
      }

      conn.destroy();
      resolve(results);
    });
  });
}

async function runTest() {
  try {
    await testUpdatedTables();
    
    console.log('\n🎉 Table name update verification complete!');
    console.log('\n✅ Updated agents should now use:');
    console.log('   - NCC_AGENT table for financial data');
    console.log('   - ATTENDANCE_AGENT table for attendance tracking');
    console.log('   - PIPELINE_AGENT table for sales pipeline data');
    
  } catch (error) {
    console.error('\n❌ Test failed:', error.message);
  }
}

console.log('BeaconAgent Updated Table Names Test');
console.log('===================================\n');
runTest().catch(console.error);