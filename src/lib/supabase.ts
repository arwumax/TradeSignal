import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  console.error('Missing Supabase environment variables:');
  console.error('VITE_SUPABASE_URL:', supabaseUrl ? 'Present' : 'Missing');
  console.error('VITE_SUPABASE_ANON_KEY:', supabaseAnonKey ? 'Present' : 'Missing');
  console.error('Please check your .env file and ensure both VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY are set with your actual Supabase project credentials.');
  console.error('You can find these values in your Supabase project settings under "API".');
  throw new Error('Missing Supabase environment variables. Please check your .env file and set VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY with your actual Supabase project credentials.');
}

// Check for placeholder values first
if (supabaseUrl.includes('your-project-id') || supabaseUrl.includes('your_supabase') || 
    supabaseAnonKey.includes('your_supabase') || supabaseAnonKey.includes('your-supabase')) {
  console.error('Placeholder values detected in environment variables.');
  console.error('Please replace the placeholder values in your .env file with your actual Supabase project credentials.');
  console.error('You can find these values in your Supabase project settings under "API".');
  throw new Error('Please replace the placeholder values in your .env file with your actual Supabase project credentials. You can find these in your Supabase project settings under "API".');
}

// Validate URL format
if (!supabaseUrl.startsWith('https://') || !supabaseUrl.includes('.supabase.co')) {
  console.error('Invalid VITE_SUPABASE_URL format. Expected format: https://your-project-id.supabase.co');
  console.error('Current value:', supabaseUrl);
  throw new Error('Invalid VITE_SUPABASE_URL format. Please check your Supabase project URL.');
}

// Validate anon key format (basic check)
if (!supabaseAnonKey.startsWith('eyJ')) {
  console.error('Invalid VITE_SUPABASE_ANON_KEY format. The anon key should start with "eyJ"');
  throw new Error('Invalid VITE_SUPABASE_ANON_KEY format. Please check your Supabase anon key.');
}

console.log('Supabase configuration:');
console.log('URL:', supabaseUrl);
console.log('Anon Key:', `${supabaseAnonKey.substring(0, 20)}...`);

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

export type Database = {
  public: {
    Tables: {
      stock_analyses: {
        Row: {
          id: string;
          symbol: string;
          analysis_type: 'historical' | 'support_resistance' | 'combined' | 'trend_and_sr';
          analysis_text: string;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          symbol: string;
          analysis_type: 'historical' | 'support_resistance' | 'combined' | 'trend_and_sr';
          analysis_text: string;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          symbol?: string;
          analysis_type?: 'historical' | 'support_resistance' | 'combined' | 'trend_and_sr';
          analysis_text?: string;
          created_at?: string;
          updated_at?: string;
        };
      };
    };
  };
};