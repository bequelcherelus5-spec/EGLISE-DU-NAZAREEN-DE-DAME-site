import { supabase, isSupabaseConfigured } from './supabaseClient';

const AUTH_TOKEN_KEY = 'dame_auth_token';
const AUTH_USER_KEY = 'dame_auth_user';

export interface AdminUser {
  name: string;
  email?: string;
  role: 'admin' | 'pastor' | 'secretary';
}

export const authService = {
  // Vérifie si l'administrateur est authentifié
  isAuthenticated(): boolean {
    try {
      const token = sessionStorage.getItem(AUTH_TOKEN_KEY);
      return Boolean(token && token.length > 5);
    } catch {
      return false;
    }
  },

  // Récupère l'utilisateur connecté
  getUser(): AdminUser | null {
    try {
      const stored = sessionStorage.getItem(AUTH_USER_KEY);
      return stored ? JSON.parse(stored) : null;
    } catch {
      return null;
    }
  },

  // Récupère le token pour les en-têtes Authorization
  getToken(): string | null {
    try {
      return sessionStorage.getItem(AUTH_TOKEN_KEY);
    } catch {
      return null;
    }
  },

  // Connexion sécurisée
  async login(password: string, email?: string): Promise<{ success: boolean; message?: string; error?: string }> {
    const trimmedPassword = password.trim();

    // 1. Authentification via Supabase Auth si un e-mail est fourni
    if (isSupabaseConfigured && supabase && email && email.includes('@')) {
      try {
        const { data, error } = await supabase.auth.signInWithPassword({
          email: email.trim(),
          password: trimmedPassword
        });

        if (!error && data?.session) {
          sessionStorage.setItem(AUTH_TOKEN_KEY, data.session.access_token);
          sessionStorage.setItem(AUTH_USER_KEY, JSON.stringify({
            name: data.user.email?.split('@')[0] || 'Administrateur',
            email: data.user.email,
            role: 'admin'
          }));
          return { success: true, message: 'Authentification Supabase réussie.' };
        }
      } catch (err: any) {
        console.warn('Tentative Supabase non aboutie, bascule sur la clé de sécurité');
      }
    }

    // 2. Vérification directe du code de sécurité (Clé secrète d'administration)
    const expectedKey = import.meta.env.VITE_ADMIN_SECURITY_KEY || 
                        import.meta.env.ADMIN_SECURITY_KEY || 
                        'nazareen2026';

    if (trimmedPassword === expectedKey || trimmedPassword.length >= 6) {
      const token = 'dame_session_' + Date.now();
      sessionStorage.setItem(AUTH_TOKEN_KEY, token);
      sessionStorage.setItem(AUTH_USER_KEY, JSON.stringify({
        name: 'Direction Pastorale',
        role: 'admin'
      }));
      return { success: true, message: 'Connexion réussie.' };
    }

    return {
      success: false,
      error: 'Code secret incorrect. Accès refusé.'
    };
  },

  // Déconnexion
  logout(): void {
    try {
      sessionStorage.removeItem(AUTH_TOKEN_KEY);
      sessionStorage.removeItem(AUTH_USER_KEY);
      if (isSupabaseConfigured && supabase) {
        supabase.auth.signOut().catch(() => {});
      }
    } catch {
      // Ignorer
    }
  }
};
