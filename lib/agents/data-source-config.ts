import { SemanticModel } from '@/types/agent';

export interface DataSourceConfig {
  id: string;
  name: string;
  description: string;
  type: 'snowflake' | 'postgres' | 'mysql' | 'api';
  connectionConfig: any;
  semanticModel: SemanticModel;
  pythonLibraries?: string[];
  customCode?: string;
}

export const dataSourceConfigs: DataSourceConfig[] = [
  {
    id: 'ncc-financial',
    name: 'NCC Financial Data',
    description: 'Net Cash Collected financial data by office, region, sector, and project',
    type: 'snowflake',
    connectionConfig: {
      account: process.env.SNOWFLAKE_ACCOUNT,
      username: process.env.SNOWFLAKE_USERNAME,
      authenticator: 'SNOWFLAKE_JWT',
      privateKey: process.env.SNOWFLAKE_PRIVATE_KEY?.replace(/^["']|["']$/g, '').replace(/\\n/g, '\n').trim(),
      database: process.env.SNOWFLAKE_DATABASE,
      warehouse: process.env.SNOWFLAKE_WAREHOUSE,
      schema: process.env.SNOWFLAKE_SCHEMA,
      role: process.env.SNOWFLAKE_ROLE,
    },
    semanticModel: {
      id: 'ncc-model',
      name: 'NCC Financial Model',
      description: 'Net Cash Collected financial performance tracking by office, region, sector, and project',
      tables: [
        {
          name: 'NCC_AGENT',
          schema: 'DATA',
          columns: [
            { name: 'SECTOR', dataType: 'VARCHAR(16777216)', description: 'Industry sector' },
            { name: 'MONTH', dataType: 'VARCHAR(16777216)', description: 'Month in YYYY-MM format' },
            { name: 'CLIENT', dataType: 'VARCHAR(16777216)', description: 'Client identifier' },
            { name: 'PROJECT_ID', dataType: 'VARCHAR(16777216)', description: 'Project identifier' },
            { name: 'NCC', dataType: 'NUMBER(38,0)', description: 'Net Cash Collected amount' },
            { name: 'REGION', dataType: 'VARCHAR(16777216)', description: 'Geographic region' },
            { name: 'SYSTEM', dataType: 'VARCHAR(16777216)', description: 'System type (Oracle, Workday, etc.)' },
            { name: 'REGION_STANDARD', dataType: 'VARCHAR(16777216)', description: 'Standardized region name' },
          ],
        },
      ],
      relationships: [],
      metrics: [
        {
          id: 'total_ncc',
          name: 'Total NCC',
          description: 'Sum of all Net Cash Collected',
          formula: 'SUM(NCC)',
          dataType: 'currency',
          aggregation: 'sum',
        },
        {
          id: 'total_ncc_by_system',
          name: 'Total NCC by System',
          description: 'Sum of NCC grouped by system type',
          formula: 'SUM(NCC) GROUP BY SYSTEM',
          dataType: 'currency',
          aggregation: 'sum',
        },
        {
          id: 'average_ncc',
          name: 'Average NCC',
          description: 'Average Net Cash Collected per project',
          formula: 'AVG(NCC)',
          dataType: 'currency',
          aggregation: 'avg',
        },
      ],
      dimensions: [
        {
          id: 'system',
          name: 'System',
          description: 'System type (Oracle, Workday, etc.)',
          table: 'NCC_AGENT',
          column: 'SYSTEM',
          dataType: 'VARCHAR',
        },
        {
          id: 'region',
          name: 'Region',
          description: 'Geographic region',
          table: 'NCC_AGENT',
          column: 'REGION',
          dataType: 'VARCHAR',
        },
        {
          id: 'sector',
          name: 'Sector',
          description: 'Industry sector',
          table: 'NCC_AGENT',
          column: 'SECTOR',
          dataType: 'VARCHAR',
        },
        {
          id: 'month',
          name: 'Month',
          description: 'Month of financial data',
          table: 'NCC_AGENT',
          column: 'MONTH',
          dataType: 'VARCHAR',
          hierarchies: ['Year', 'Quarter', 'Month'],
        },
      ],
    },
    pythonLibraries: ['pandas', 'numpy', 'matplotlib', 'seaborn', 'plotly'],
    customCode: `
# NCC Financial analysis functions
import pandas as pd
import numpy as np

def ncc_performance_by_office(df):
    """Analyze NCC performance by office"""
    return df.groupby('OFFICE').agg({
        'NCC': ['sum', 'mean', 'count'],
        'TIMESHEET_CHARGES': 'sum',
        'ADJUSTMENTS': 'sum'
    }).reset_index()

def ncc_performance_by_region(df):
    """Analyze NCC performance by region"""
    return df.groupby('REGION').agg({
        'NCC': ['sum', 'mean', 'count'],
        'TIMESHEET_CHARGES': 'sum',
        'ADJUSTMENTS': 'sum'
    }).reset_index()

def ncc_performance_by_sector(df):
    """Analyze NCC performance by sector"""
    return df.groupby('SECTOR').agg({
        'NCC': ['sum', 'mean', 'count'],
        'TIMESHEET_CHARGES': 'sum',
        'ADJUSTMENTS': 'sum'
    }).reset_index()

def monthly_ncc_trend(df):
    """Analyze monthly NCC trends"""
    return df.groupby('MONTH').agg({
        'NCC': 'sum',
        'TIMESHEET_CHARGES': 'sum',
        'ADJUSTMENTS': 'sum'
    }).reset_index().sort_values('MONTH')

def adjustment_analysis(df):
    """Analyze adjustment patterns"""
    df['ADJUSTMENT_RATE'] = df['ADJUSTMENTS'] / df['TIMESHEET_CHARGES']
    return df.groupby(['OFFICE', 'SECTOR']).agg({
        'ADJUSTMENT_RATE': ['mean', 'std'],
        'ADJUSTMENTS': ['sum', 'count']
    }).reset_index()
`,
  },
  {
    id: 'attendance-analytics',
    name: 'Attendance Analytics',
    description: 'Office attendance tracking and analysis by cohort and organization',
    type: 'snowflake',
    connectionConfig: {
      account: process.env.SNOWFLAKE_ACCOUNT,
      username: process.env.SNOWFLAKE_USERNAME,
      authenticator: 'SNOWFLAKE_JWT',
      privateKey: process.env.SNOWFLAKE_PRIVATE_KEY?.replace(/^["']|["']$/g, '').replace(/\\n/g, '\n').trim(),
      database: process.env.SNOWFLAKE_DATABASE,
      warehouse: process.env.SNOWFLAKE_WAREHOUSE,
      schema: process.env.SNOWFLAKE_SCHEMA,
      role: process.env.SNOWFLAKE_ROLE,
    },
    semanticModel: {
      id: 'attendance-model',
      name: 'Attendance Analytics Model',
      description: 'Office attendance tracking and analysis',
      tables: [
        {
          name: 'ATTENDANCE_AGENT',
          schema: 'DATA',
          columns: [
            { name: 'OFFICE', dataType: 'VARCHAR(16777216)', description: 'Office location' },
            { name: 'DATE', dataType: 'DATE', description: 'Date of attendance record' },
            { name: 'HEADCOUNT', dataType: 'NUMBER(38,0)', description: 'Total headcount for the office' },
            { name: 'PEOPLE_ATTENDED', dataType: 'NUMBER(38,0)', description: 'Number of people who attended' },
            { name: 'COHORT', dataType: 'VARCHAR(16777216)', description: 'Employee cohort/level' },
            { name: 'ORG', dataType: 'VARCHAR(16777216)', description: 'Organization identifier' },
            { name: 'MONTH', dataType: 'VARCHAR(16777216)', description: 'Month in YYYY-MM format' },
            { name: 'REGION_STANDARD', dataType: 'VARCHAR(16777216)', description: 'Standardized region name' },
          ],
        },
      ],
      relationships: [],
      metrics: [
        {
          id: 'attendance_rate',
          name: 'Attendance Rate',
          description: 'Percentage of people who attended',
          formula: 'AVG(PEOPLE_ATTENDED / HEADCOUNT)',
          dataType: 'percentage',
          aggregation: 'avg',
        },
        {
          id: 'total_attendance',
          name: 'Total Attendance',
          description: 'Sum of all people attended',
          formula: 'SUM(PEOPLE_ATTENDED)',
          dataType: 'number',
          aggregation: 'sum',
        },
        {
          id: 'total_headcount',
          name: 'Total Headcount',
          description: 'Sum of all headcount',
          formula: 'SUM(HEADCOUNT)',
          dataType: 'number',
          aggregation: 'sum',
        },
      ],
      dimensions: [
        {
          id: 'office',
          name: 'Office',
          description: 'Office location',
          table: 'ATTENDANCE_AGENT',
          column: 'OFFICE',
          dataType: 'VARCHAR',
        },
        {
          id: 'cohort',
          name: 'Cohort',
          description: 'Employee cohort/level',
          table: 'ATTENDANCE_AGENT',
          column: 'COHORT',
          dataType: 'VARCHAR',
        },
        {
          id: 'organization',
          name: 'Organization',
          description: 'Organization identifier',
          table: 'ATTENDANCE_AGENT',
          column: 'ORG',
          dataType: 'VARCHAR',
        },
        {
          id: 'date',
          name: 'Date',
          description: 'Date of attendance',
          table: 'ATTENDANCE_AGENT',
          column: 'DATE',
          dataType: 'DATE',
          hierarchies: ['Year', 'Quarter', 'Month', 'Week', 'Day'],
        },
      ],
    },
    pythonLibraries: ['pandas', 'numpy', 'matplotlib', 'seaborn', 'plotly'],
    customCode: `
# Attendance analytics functions
import pandas as pd
import numpy as np

def attendance_rate_by_office(df):
    """Calculate attendance rates by office"""
    df['ATTENDANCE_RATE'] = df['PEOPLE_ATTENDED'] / df['HEADCOUNT']
    return df.groupby('OFFICE').agg({
        'ATTENDANCE_RATE': ['mean', 'std'],
        'PEOPLE_ATTENDED': 'sum',
        'HEADCOUNT': 'sum'
    }).reset_index()

def attendance_rate_by_cohort(df):
    """Calculate attendance rates by cohort"""
    df['ATTENDANCE_RATE'] = df['PEOPLE_ATTENDED'] / df['HEADCOUNT']
    return df.groupby('COHORT').agg({
        'ATTENDANCE_RATE': ['mean', 'std'],
        'PEOPLE_ATTENDED': 'sum',
        'HEADCOUNT': 'sum'
    }).reset_index()

def daily_attendance_trends(df):
    """Analyze daily attendance trends"""
    df['DATE'] = pd.to_datetime(df['DATE'])
    df['ATTENDANCE_RATE'] = df['PEOPLE_ATTENDED'] / df['HEADCOUNT']
    return df.groupby('DATE').agg({
        'ATTENDANCE_RATE': 'mean',
        'PEOPLE_ATTENDED': 'sum',
        'HEADCOUNT': 'sum'
    }).reset_index().sort_values('DATE')

def weekly_attendance_patterns(df):
    """Analyze weekly attendance patterns"""
    df['DATE'] = pd.to_datetime(df['DATE'])
    df['WEEKDAY'] = df['DATE'].dt.day_name()
    df['ATTENDANCE_RATE'] = df['PEOPLE_ATTENDED'] / df['HEADCOUNT']
    return df.groupby('WEEKDAY').agg({
        'ATTENDANCE_RATE': ['mean', 'std'],
        'PEOPLE_ATTENDED': 'sum'
    }).reset_index()

def office_capacity_analysis(df):
    """Analyze office capacity utilization"""
    df['ATTENDANCE_RATE'] = df['PEOPLE_ATTENDED'] / df['HEADCOUNT']
    return df.groupby(['OFFICE', 'COHORT']).agg({
        'ATTENDANCE_RATE': ['mean', 'max', 'min'],
        'HEADCOUNT': 'mean',
        'PEOPLE_ATTENDED': 'mean'
    }).reset_index()
`,
  },
  {
    id: 'pipeline-analytics',
    name: 'Pipeline Analytics',
    description: 'Sales pipeline and opportunity tracking by region, sector, and stage',
    type: 'snowflake',
    connectionConfig: {
      account: process.env.SNOWFLAKE_ACCOUNT,
      username: process.env.SNOWFLAKE_USERNAME,
      authenticator: 'SNOWFLAKE_JWT',
      privateKey: process.env.SNOWFLAKE_PRIVATE_KEY?.replace(/^["']|["']$/g, '').replace(/\\n/g, '\n').trim(),
      database: process.env.SNOWFLAKE_DATABASE,
      warehouse: process.env.SNOWFLAKE_WAREHOUSE,
      schema: process.env.SNOWFLAKE_SCHEMA,
      role: process.env.SNOWFLAKE_ROLE,
    },
    semanticModel: {
      id: 'pipeline-model',
      name: 'Pipeline Analytics Model',
      description: 'Sales pipeline and opportunity analysis',
      tables: [
        {
          name: 'PIPELINE_AGENT',
          schema: 'DATA',
          columns: [
            { name: 'OPPORTUNITY_ID', dataType: 'VARCHAR(16777216)', description: 'Opportunity identifier' },
            { name: 'STAGE', dataType: 'VARCHAR(16777216)', description: 'Pipeline stage' },
            { name: 'SECTOR', dataType: 'VARCHAR(16777216)', description: 'Industry sector' },
            { name: 'EXPECTED_CLOSE_DATE', dataType: 'TIMESTAMP_NTZ(9)', description: 'Expected close date' },
            { name: 'POTENTIAL_VALUE_USD', dataType: 'NUMBER(38,0)', description: 'Potential value in USD' },
            { name: 'REGION', dataType: 'VARCHAR(16777216)', description: 'Geographic region' },
            { name: 'REGION_STANDARD', dataType: 'VARCHAR(16777216)', description: 'Standardized region name' },
            { name: 'MONTH', dataType: 'VARCHAR(16777216)', description: 'Month in YYYY-MM format' },
          ],
        },
      ],
      relationships: [],
      metrics: [
        {
          id: 'total_pipeline_value',
          name: 'Total Pipeline Value',
          description: 'Sum of all potential values',
          formula: 'SUM(POTENTIAL_VALUE_USD)',
          dataType: 'currency',
          aggregation: 'sum',
        },
        {
          id: 'average_deal_size',
          name: 'Average Deal Size',
          description: 'Average potential value per deal',
          formula: 'AVG(POTENTIAL_VALUE_USD)',
          dataType: 'currency',
          aggregation: 'avg',
        },
        {
          id: 'deal_count',
          name: 'Deal Count',
          description: 'Total number of deals',
          formula: 'COUNT(*)',
          dataType: 'number',
          aggregation: 'count',
        },
      ],
      dimensions: [
        {
          id: 'opportunity_id',
          name: 'Opportunity ID',
          description: 'Opportunity identifier',
          table: 'PIPELINE_AGENT',
          column: 'OPPORTUNITY_ID',
          dataType: 'VARCHAR',
        },
        {
          id: 'stage',
          name: 'Stage',
          description: 'Pipeline stage',
          table: 'PIPELINE_AGENT',
          column: 'STAGE',
          dataType: 'VARCHAR',
        },
        {
          id: 'sector',
          name: 'Sector',
          description: 'Industry sector',
          table: 'PIPELINE_AGENT',
          column: 'SECTOR',
          dataType: 'VARCHAR',
        },
        {
          id: 'region',
          name: 'Region',
          description: 'Geographic region',
          table: 'PIPELINE_AGENT',
          column: 'REGION',
          dataType: 'VARCHAR',
        },
        {
          id: 'expected_close_date',
          name: 'Expected Close Date',
          description: 'Expected close date',
          table: 'PIPELINE_AGENT',
          column: 'EXPECTED_CLOSE_DATE',
          dataType: 'TIMESTAMP_NTZ',
          hierarchies: ['Year', 'Quarter', 'Month', 'Week'],
        },
      ],
    },
    pythonLibraries: ['pandas', 'numpy', 'matplotlib', 'seaborn', 'plotly'],
    customCode: `
# Pipeline analytics functions
import pandas as pd
import numpy as np

def pipeline_value_by_stage(df):
    """Analyze pipeline value by stage"""
    return df.groupby('STAGE').agg({
        'POTENTIAL_VALUE_USD': ['sum', 'mean', 'count'],
        'COMPANY': 'count'
    }).reset_index()

def pipeline_value_by_region(df):
    """Analyze pipeline value by region"""
    return df.groupby('REGION').agg({
        'POTENTIAL_VALUE_USD': ['sum', 'mean', 'count'],
        'COMPANY': 'count'
    }).reset_index()

def pipeline_value_by_sector(df):
    """Analyze pipeline value by sector"""
    return df.groupby('SECTOR').agg({
        'POTENTIAL_VALUE_USD': ['sum', 'mean', 'count'],
        'COMPANY': 'count'
    }).reset_index()

def pipeline_closure_timeline(df):
    """Analyze pipeline closure timeline"""
    df['EXPECTED_CLOSE_DATE'] = pd.to_datetime(df['EXPECTED_CLOSE_DATE'])
    df['CLOSE_MONTH'] = df['EXPECTED_CLOSE_DATE'].dt.to_period('M')
    return df.groupby('CLOSE_MONTH').agg({
        'POTENTIAL_VALUE_USD': 'sum',
        'COMPANY': 'count'
    }).reset_index()

def win_rate_analysis(df):
    """Analyze win rates by various dimensions"""
    won_deals = df[df['STAGE'] == 'Won']
    total_deals = df[df['STAGE'].isin(['Won', 'Lost'])]
    
    win_rate_by_sector = won_deals.groupby('SECTOR')['POTENTIAL_VALUE_USD'].sum() / total_deals.groupby('SECTOR')['POTENTIAL_VALUE_USD'].sum()
    win_rate_by_region = won_deals.groupby('REGION')['POTENTIAL_VALUE_USD'].sum() / total_deals.groupby('REGION')['POTENTIAL_VALUE_USD'].sum()
    
    return {
        'by_sector': win_rate_by_sector.fillna(0),
        'by_region': win_rate_by_region.fillna(0)
    }

def top_opportunities(df, n=10):
    """Get top N opportunities by potential value"""
    return df.nlargest(n, 'POTENTIAL_VALUE_USD')[['COMPANY', 'STAGE', 'SECTOR', 'REGION', 'POTENTIAL_VALUE_USD']]
`,
  },
];

export function getDataSourceConfig(id: string): DataSourceConfig | undefined {
  return dataSourceConfigs.find(config => config.id === id);
}

export function listDataSources(): DataSourceConfig[] {
  return dataSourceConfigs;
}