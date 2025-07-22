// NCC Agent database integration - moved into BeaconAgent for Vercel deployment
import { createClient } from '@supabase/supabase-js';

interface NCCRecord {
  Client: string;
  Month: string;
  NCC: number;
  Office: string;
  Project_ID: string;
  Region: string;
  Sector: string;
  Timesheet_Charges: number;
  Adjustments: number;
}

export class NCCDatabase {
  private supabase;

  constructor() {
    const supabaseUrl = process.env.SUPABASE_URL;
    const supabaseKey = process.env.SUPABASE_KEY;

    console.log('Supabase config check:', {
      url: supabaseUrl ? 'SET' : 'NOT SET',
      key: supabaseKey ? 'SET' : 'NOT SET',
      keyLength: supabaseKey?.length,
      keyStart: supabaseKey?.substring(0, 20),
      keyEnd: supabaseKey?.substring(supabaseKey.length - 10),
      urlValue: supabaseUrl
    });

    if (!supabaseUrl || !supabaseKey) {
      throw new Error(`Missing Supabase configuration - URL: ${supabaseUrl ? 'SET' : 'NOT SET'}, KEY: ${supabaseKey ? 'SET' : 'NOT SET'}`);
    }

    this.supabase = createClient(supabaseUrl, supabaseKey);
  }

  async testConnection() {
    try {
      console.log('Testing basic Supabase connection...');
      
      // First test: basic connection (should work with any valid key)
      const { data: basicTest, error: basicError } = await this.supabase
        .from('_supabase_migrations') // System table that should exist
        .select('version')
        .limit(1);

      if (basicError) {
        console.error('Basic connection failed:', basicError);
        // If basic connection fails, try NCC table anyway
      }

      console.log('Testing NCC table access...');
      const { data, error } = await this.supabase
        .from('NCC')
        .select('*')
        .limit(1);

      console.log('Supabase NCC response:', { data, error });

      if (error) {
        console.error('NCC table error details:', error);
        
        // Return more specific error info
        return {
          status: 'error',
          message: `NCC table access failed: ${error.message}`,
          error_code: error.code,
          error_details: error.details,
          basic_connection: basicError ? 'failed' : 'success'
        };
      }
      
      return { 
        status: 'success', 
        message: 'Database connection successful',
        sample_data: data 
      };
    } catch (error: any) {
      console.error('Database connection error:', error);
      return { 
        status: 'error', 
        message: `Database connection failed: ${error.message}`,
        error_details: error
      };
    }
  }

  async queryData(query: string) {
    try {
      const { data, error } = await this.supabase
        .from('NCC')
        .select('*')
        .limit(10);

      if (error) throw error;

      return {
        data,
        count: data.length,
        table: 'NCC',
        status: 'success'
      };
    } catch (error: any) {
      return {
        error: `Query failed: ${error.message}`,
        status: 'error'
      };
    }
  }

  async getAllData() {
    try {
      const { data, error } = await this.supabase
        .from('NCC')
        .select('*');

      if (error) throw error;

      return {
        data,
        count: data.length,
        table: 'NCC',
        status: 'success'
      };
    } catch (error: any) {
      return {
        error: `Query failed: ${error.message}`,
        status: 'error'
      };
    }
  }
}