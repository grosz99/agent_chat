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
      key: supabaseKey ? 'SET' : 'NOT SET'
    });

    if (!supabaseUrl || !supabaseKey) {
      throw new Error(`Missing Supabase configuration - URL: ${supabaseUrl ? 'SET' : 'NOT SET'}, KEY: ${supabaseKey ? 'SET' : 'NOT SET'}`);
    }

    this.supabase = createClient(supabaseUrl, supabaseKey);
  }

  async testConnection() {
    try {
      const { data, error } = await this.supabase
        .from('NCC')
        .select('*')
        .limit(1);

      if (error) throw error;
      
      return { 
        status: 'success', 
        message: 'Database connection successful',
        sample_data: data 
      };
    } catch (error: any) {
      return { 
        status: 'error', 
        message: `Database connection failed: ${error.message}` 
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