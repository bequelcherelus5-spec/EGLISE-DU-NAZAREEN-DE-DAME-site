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
      return Boolean(token && token.length > 10);
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

  // Connexion sécurisée (backend API ou Supabase Auth)
  async login(password: string, email?: string): Promise<{ success: boolean; message?: string; error?: string }> {
    // 1. Si Supabase Auth est configuré avec un compte email/mot de passe
    if (isSupabaseConfigured && supabase && email && email.includes('@')) {
      try {
        const { data, error } = await supabase.auth.signInWithPassword({
          email: email.trim(),
          password: password.trim()
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
        console.warn('Tentative Supabase échouée, bascule vers le serveur sécurisé');
      }
    }

    // 2. Authentification serveur sécurisée (sans exposer aucun mot de passe dans le bundle client)
    try {
      const res = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ password: password.trim(), email: email?.trim() })
      });

      const data = await res.json();
      if (res.ok && data.success && data.token) {
        sessionStorage.setItem(AUTH_TOKEN_KEY, data.token);
        sessionStorage.setItem(AUTH_USER_KEY, JSON.stringify(data.user || {
          name: 'Direction Pastorale',
          role: 'admin'
        }));
        return { success: true, message: 'Connexion réussie.' };
      }

      return {
        success: false,
        error: data.error || 'Code secret incorrect. Accès refusé.'
      };
    } catch (err: any) {
      return {
        success: false,
        error: 'Impossible de joindre le service d’authentification sécurisé.'
      };
    }
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
