import { createClient, SupabaseClient } from '@supabase/supabase-js';

// Nettoyage sécurisé des chaînes d'environnement
const cleanEnvVar = (val: unknown): string => {
  if (!val || typeof val !== 'string') return '';
  return val.trim().replace(/^["']|["']$/g, '');
};

export function formatSupabaseUrl(rawUrl: string): string {
  let cleaned = cleanEnvVar(rawUrl);
  if (!cleaned) return '';
  if (!cleaned.startsWith('http://') && !cleaned.startsWith('https://')) {
    cleaned = `https://${cleaned}`;
  }
  return cleaned.replace(/\/+$/, '');
}

export function checkConfigured(url: string, key: string): boolean {
  return Boolean(
    url &&
    key &&
    (url.includes('supabase.co') || url.startsWith('http')) &&
    !url.includes('your-project') &&
    key.length > 20 &&
    !key.includes('your-anon-key')
  );
}

// Récupération avec accès statique direct pour le remplacement AST de Vite / Cloudflare Pages
function getResolvedSupabaseUrl(): string {
  // 1. Accès statique direct (remplacé par vite.config.ts define lors du build)
  const metaUrl = cleanEnvVar(import.meta.env.VITE_SUPABASE_URL);
  if (metaUrl) return formatSupabaseUrl(metaUrl);

  // 2. Window global si injecté par un script runtime
  if (typeof window !== 'undefined') {
    const winEnv = cleanEnvVar((window as any).__ENV__?.VITE_SUPABASE_URL || (window as any).__ENV__?.SUPABASE_URL);
    if (winEnv) return formatSupabaseUrl(winEnv);

    // 3. Configuration saisie manuellement ou sauvegardée dans le navigateur
    try {
      const stored = localStorage.getItem('dame_vite_supabase_url') || localStorage.getItem('dame_supabase_url');
      if (stored) return formatSupabaseUrl(stored);
    } catch {
      // Ignorer
    }
  }

  return '';
}

function getResolvedSupabaseKey(): string {
  // 1. Accès statique direct (remplacé par vite.config.ts define lors du build)
  const metaKey = cleanEnvVar(import.meta.env.VITE_SUPABASE_ANON_KEY);
  if (metaKey) return metaKey;

  // 2. Window global si injecté par un script runtime
  if (typeof window !== 'undefined') {
    const winEnv = cleanEnvVar((window as any).__ENV__?.VITE_SUPABASE_ANON_KEY || (window as any).__ENV__?.SUPABASE_ANON_KEY);
    if (winEnv) return winEnv;

    // 3. Configuration saisie manuellement ou sauvegardée dans le navigateur
    try {
      const stored = localStorage.getItem('dame_vite_supabase_anon_key') || localStorage.getItem('dame_supabase_anon_key');
      if (stored) return cleanEnvVar(stored);
    } catch {
      // Ignorer
    }
  }

  return '';
}

let activeUrl = getResolvedSupabaseUrl();
let activeAnonKey = getResolvedSupabaseKey();
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
  source: 'cloudflare' | 'local_storage' | 'none';
}

export function getSupabaseStatus(): CloudDbStatus {
  const hasMeta = Boolean(import.meta.env.VITE_SUPABASE_URL && import.meta.env.VITE_SUPABASE_ANON_KEY);
  return {
    isConfigured: isSupabaseConfigured,
    projectUrl: activeUrl
      ? activeUrl.replace(/^https?:\/\//, '').split('.')[0] + '.supabase.co'
      : 'Non configuré',
    hasAnonKey: Boolean(activeAnonKey && activeAnonKey.length > 20),
    source: hasMeta ? 'cloudflare' : (activeUrl ? 'local_storage' : 'none'),
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

// Test complet : lecture ET écriture sur la table 'projects' pour détecter les problèmes RLS
export async function testSupabaseConnection(): Promise<{ 
  success: boolean; 
  message: string; 
  count?: number;
  rlsBlocked?: boolean;
}> {
  if (!isSupabaseConfigured || !supabase) {
    return {
      success: false,
      message: 'Supabase pa konfigire. Verifye si varyab VITE_SUPABASE_URL ak VITE_SUPABASE_ANON_KEY mete kòrèkteman.',
      rlsBlocked: false,
    };
  }

  try {
    // 1. Tès lekti (SELECT)
    const { data, count, error: selectError } = await supabase
      .from('projects')
      .select('id, title, status', { count: 'exact', head: false })
      .limit(5);

    if (selectError) {
      return {
        success: false,
        message: `Erè Supabase (Lekti): ${selectError.message}${selectError.hint ? ' (' + selectError.hint + ')' : ''}`,
        rlsBlocked: selectError.code === '42501' || selectError.message.toLowerCase().includes('policy'),
      };
    }

    // 2. Tès ekriti (Test INSERT puis DELETE d'une ligne temporaire de diagnostic)
    const testCode = `DIAG-PING-${Date.now().toString().slice(-6)}`;
    const { data: insertData, error: insertError } = await supabase
      .from('projects')
      .insert([{
        code: testCode,
        title: '__DIAGNOSTIC_PING_TEST__',
        partner: 'Église du Nazaréen de Damé',
        category: 'Diagnostic',
        summary: 'Test temporaire de permissions d’écriture',
        full_description: 'Vérification RLS',
        status: 'planning',
      }])
      .select('id')
      .single();

    if (insertError) {
      const isRls = insertError.code === '42501' || insertError.message.toLowerCase().includes('policy');
      return {
        success: false,
        count: count ?? data?.length ?? 0,
        message: isRls 
          ? `Lekti mache (${count ?? data?.length ?? 0} pwojè), MEN RLS bloke ekriti a: "${insertError.message}". Tanpri aplike politik RLS la nan Supabase SQL Editor.`
          : `Lekti mache, men ekriti a echwe: ${insertError.message}`,
        rlsBlocked: isRls,
      };
    }

    // Nettoyage immédiat de la ligne de test
    if (insertData?.id) {
      await supabase.from('projects').delete().eq('id', insertData.id);
    }

    return {
      success: true,
      message: `Koneksyon Supabase reyisi 100% ! Lekti ak ekriti fonksyone byen nan tab 'projects' (${count ?? data?.length ?? 0} pwojè jwenn).`,
      count: count ?? data?.length ?? 0,
      rlsBlocked: false,
    };
  } catch (err: any) {
    return {
      success: false,
      message: `Erè rezo oswa koneksyon Supabase: ${err?.message || String(err)}`,
      rlsBlocked: false,
    };
  }
}

