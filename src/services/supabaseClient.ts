import { createClient, SupabaseClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || '';
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || '';

// Nou fòse kreyasyon kliyan an si varyab yo pa vid pou evite bloke koneksyon an
export const isSupabaseConfigured = Boolean(supabaseUrl && supabaseAnonKey);

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
    projectUrl: supabaseUrl ? supabaseUrl : 'Non configuré',
    hasAnonKey: Boolean(supabaseAnonKey && supabaseAnonKey.length > 10)
  };
}
