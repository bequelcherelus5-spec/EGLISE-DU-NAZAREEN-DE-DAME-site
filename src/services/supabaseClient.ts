import { createClient, SupabaseClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || '';
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || '';

export const isSupabaseConfigured = Boolean(
  supabaseUrl &&
  supabaseAnonKey &&
  supabaseUrl.includes('supabase.co') &&
  !supabaseUrl.includes('your-project')
);

export const supabase: SupabaseClient | null = isSupabaseConfigured
  ? createClient(supabaseUrl, supabaseAnonKey)
  : null;

export interface CloudDbStatus {
  isConfigured: boolean;
  projectUrl: string;
  hasAnonKey: boolean;
}

export function getSupabaseStatus(): CloudDbStatus {
  return {
    isConfigured: isSupabaseConfigured,
    projectUrl: supabaseUrl ? supabaseUrl.replace(/https:\/\//, '').split('.')[0] + '.supabase.co' : 'Non configuré',
    hasAnonKey: Boolean(supabaseAnonKey && supabaseAnonKey.length > 20)
  };
}
