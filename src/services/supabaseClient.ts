import { createClient, SupabaseClient } from '@supabase/supabase-js';

// Nettoyage et lecture sécurisée des variables d'environnement Cloudflare / Vite
const cleanEnvVar = (val: unknown): string => {
  if (!val || typeof val !== 'string') return '';
  return val.trim().replace(/^["']|["']$/g, '');
};

const resolveEnvVar = (key: string): string => {
  // 1. Vite / Cloudflare Pages build-time injection
  const fromMeta = cleanEnvVar(import.meta.env[key]);
  if (fromMeta) return fromMeta;

  // 2. Global window injection si disponible
  if (typeof window !== 'undefined' && (window as any).__ENV__?.[key]) {
    const fromWin = cleanEnvVar((window as any).__ENV__[key]);
    if (fromWin) return fromWin;
  }

  // 3. Fallback stockage navigateur (permet la configuration directe depuis le Secrétariat)
  if (typeof window !== 'undefined' && window.localStorage) {
    try {
      const stored = localStorage.getItem(`dame_${key.toLowerCase()}`);
      if (stored) return cleanEnvVar(stored);
    } catch {
      // Ignorer
    }
  }

  return '';
};

function formatSupabaseUrl(rawUrl: string): string {
  let cleaned = cleanEnvVar(rawUrl);
  if (!cleaned) return '';
  if (!cleaned.startsWith('http://') && !cleaned.startsWith('https://')) {
    cleaned = `https://${cleaned}`;
  }
  return cleaned.replace(/\/+$/, '');
}

let activeUrl = formatSupabaseUrl(resolveEnvVar('VITE_SUPABASE_URL'));
let activeAnonKey = resolveEnvVar('VITE_SUPABASE_ANON_KEY');

function checkConfigured(url: string, key: string): boolean {
  return Boolean(
    url &&
    key &&
    (url.includes('supabase.co') || url.startsWith('http')) &&
    !url.includes('your-project') &&
    key.length > 20 &&
    !key.includes('your-anon-key')
  );
}

export let isSupabaseConfigured = checkConfigured(activeUrl, activeAnonKey);

function buildClient(url: string, key: string): SupabaseClient | null {
  if (!checkConfigured(url, key)) return null;
  try {
    return createClient(url, key, {
      auth: {
        persistSession: true,
        autoRefreshToken: true,
      },
    });
  } catch (err) {
    console.error('[SupabaseClient] Erreur initialisation client:', err);
    return null;
  }
}

export let supabase: SupabaseClient | null = buildClient(activeUrl, activeAnonKey);

export interface CloudDbStatus {
  isConfigured: boolean;
  projectUrl: string;
  hasAnonKey: boolean;
}

export function getSupabaseStatus(): CloudDbStatus {
  return {
    isConfigured: isSupabaseConfigured,
    projectUrl: activeUrl
      ? activeUrl.replace(/^https?:\/\//, '').split('.')[0] + '.supabase.co'
      : 'Non configuré',
    hasAnonKey: Boolean(activeAnonKey && activeAnonKey.length > 20),
  };
}

// Permet au secrétariat de sauvegarder ou tester manuellement les clés Supabase
export function setRuntimeSupabaseCredentials(url: string, key: string): boolean {
  const formatted = formatSupabaseUrl(url);
  const cleanedKey = cleanEnvVar(key);

  if (!checkConfigured(formatted, cleanedKey)) {
    return false;
  }

  activeUrl = formatted;
  activeAnonKey = cleanedKey;
  isSupabaseConfigured = true;
  supabase = buildClient(formatted, cleanedKey);

  if (typeof window !== 'undefined' && window.localStorage) {
    localStorage.setItem('dame_vite_supabase_url', formatted);
    localStorage.setItem('dame_vite_supabase_anon_key', cleanedKey);
  }

  return true;
}

// Test de connexion direct avec la table 'projects' de Supabase
export async function testSupabaseConnection(): Promise<{ success: boolean; message: string; count?: number }> {
  if (!isSupabaseConfigured || !supabase) {
    return {
      success: false,
      message: 'Supabase n’est pas configuré. Veuillez vérifier VITE_SUPABASE_URL et VITE_SUPABASE_ANON_KEY.',
    };
  }

  try {
    const { data, count, error } = await supabase
      .from('projects')
      .select('id, title, status', { count: 'exact', head: false })
      .limit(5);

    if (error) {
      return {
        success: false,
        message: `Erreur Supabase: ${error.message}${error.hint ? ' (' + error.hint + ')' : ''}`,
      };
    }

    return {
      success: true,
      message: `Connexion Supabase réussie ! Table 'projects' accessible (${count ?? data?.length ?? 0} projet(s) trouvés).`,
      count: count ?? data?.length ?? 0,
    };
  } catch (err: any) {
    return {
      success: false,
      message: `Exception réseau Supabase: ${err?.message || String(err)}`,
    };
  }
}

