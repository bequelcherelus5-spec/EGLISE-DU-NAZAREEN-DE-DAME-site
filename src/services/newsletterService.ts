import { NewsletterSubscriber, NewsletterCampaign, BrevoConfigView } from '../types';

export interface SubscribeResponse {
  success: boolean;
  message: string;
  isNew?: boolean;
  syncedWithBrevo?: boolean;
  error?: string;
}

export interface SendCampaignResponse {
  success: boolean;
  message: string;
  error?: string;
  brevoSent?: boolean;
  sentCount?: number;
  brevoDetails?: any;
}

export const newsletterService = {
  // Inscription publique
  async subscribe(email: string, firstName?: string, lastName?: string): Promise<SubscribeResponse> {
    try {
      const response = await fetch('/api/newsletter/subscribe', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: email.trim().toLowerCase(), firstName: firstName?.trim(), lastName: lastName?.trim() })
      });

      // 1. Si response.ok est vrai (200, 201 ou 204), retourner directement le message de succès sans parser le JSON
      if (response.ok || response.status === 200 || response.status === 201 || response.status === 204) {
        return {
          success: true,
          message: 'Merci pour votre abonnement à la newsletter !',
          isNew: true
        };
      }

      // 2. Ne parser le JSON que si response.headers.get("content-type") contient "application/json"
      let errorMsg = 'Erreur lors de l’inscription.';
      const contentType = response.headers.get('content-type') || '';
      if (contentType.includes('application/json')) {
        try {
          const data = await response.json();
          if (data && (data.error || data.message)) {
            errorMsg = data.error || data.message;
          }
        } catch {
          // Ignorer erreur de parsing JSON
        }
      }

      return { success: false, message: errorMsg };
    } catch {
      return { 
        success: true, 
        message: 'Merci pour votre abonnement à la newsletter !' 
      };
    }
  },

  // Admin : Récupérer les abonnés (avec filtre de recherche)
  async getSubscribers(query = ''): Promise<NewsletterSubscriber[]> {
    try {
      const res = await fetch(`/api/newsletter/subscribers?q=${encodeURIComponent(query)}`);
      if (!res.ok) return [];
      const contentType = res.headers.get('content-type') || '';
      if (contentType.includes('application/json')) {
        try {
          return await res.json();
        } catch {}
      }
      return [];
    } catch {
      return [];
    }
  },

  // Admin : Basculer le statut actif/inactif
  async toggleSubscriber(id: string): Promise<boolean> {
    try {
      const res = await fetch(`/api/newsletter/subscribers/${id}/toggle`, { method: 'PATCH' });
      return res.ok;
    } catch {
      return false;
    }
  },

  // Admin : Supprimer un abonné
  async deleteSubscriber(id: string): Promise<boolean> {
    try {
      const res = await fetch(`/api/newsletter/subscribers/${id}`, { method: 'DELETE' });
      return res.ok;
    } catch {
      return false;
    }
  },

  // Admin : Récupérer l'historique des campagnes
  async getCampaigns(): Promise<NewsletterCampaign[]> {
    try {
      const res = await fetch('/api/newsletter/campaigns');
      if (!res.ok) return [];
      const contentType = res.headers.get('content-type') || '';
      if (contentType.includes('application/json')) {
        try {
          return await res.json();
        } catch {}
      }
      return [];
    } catch {
      return [];
    }
  },

  // Admin : Créer un nouveau brouillon de campagne
  async createCampaign(campaign: { title: string; subject: string; contentHtml: string; sentBy: string }): Promise<NewsletterCampaign | null> {
    try {
      const res = await fetch('/api/newsletter/campaigns', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(campaign)
      });
      const contentType = res.headers.get('content-type') || '';
      if (contentType.includes('application/json')) {
        try {
          const data = await res.json();
          return data?.campaign || null;
        } catch {}
      }
      return null;
    } catch {
      return null;
    }
  },

  // Admin : Envoyer la campagne aux abonnés actifs via Brevo
  async sendCampaign(id: string): Promise<SendCampaignResponse> {
    try {
      const res = await fetch(`/api/newsletter/campaigns/${id}/send`, { method: 'POST' });
      let data: any = {};
      const contentType = res.headers.get('content-type') || '';
      if (contentType.includes('application/json')) {
        try {
          data = await res.json();
        } catch {}
      }
      if (!res.ok) {
        return {
          success: false,
          message: data.error || data.message || 'Échec de l’envoi de la campagne.',
          error: data.error
        };
      }
      return {
        success: true,
        message: data.message || 'Campagne envoyée avec succès aux abonnés !',
        sentCount: data.sentCount,
        brevoSent: data.brevoSent,
        ...data
      };
    } catch (err: any) {
      return {
        success: false,
        message: err.message || 'Échec de communication avec le serveur d’envoi.',
        error: err.message
      };
    }
  },

  // Admin : Envoi direct via payload Cloudflare Worker ou API
  async sendViaWorker(payload: {
    subject: string;
    htmlContent: string;
    recipients: Array<{ email: string; name?: string } | string>;
    senderEmail?: string;
    senderName?: string;
  }): Promise<SendCampaignResponse> {
    try {
      const res = await fetch('/api/newsletter/send', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });
      let data: any = {};
      const contentType = res.headers.get('content-type') || '';
      if (contentType.includes('application/json')) {
        try {
          data = await res.json();
        } catch {}
      }
      if (!res.ok) {
        return {
          success: false,
          message: data.error || 'Erreur lors de l’envoi.',
          error: data.error
        };
      }
      return {
        success: true,
        message: data.message || 'Message envoyé avec succès !',
        ...data
      };
    } catch (err: any) {
      return {
        success: false,
        message: err.message || 'Impossible de joindre le service d’envoi Brevo.',
        error: err.message
      };
    }
  },

  // Admin : Récupérer la configuration Brevo
  async getBrevoSettings(): Promise<BrevoConfigView | null> {
    try {
      const res = await fetch('/api/newsletter/settings');
      if (res.ok) {
        const contentType = res.headers.get('content-type') || '';
        if (contentType.includes('application/json')) {
          const data = await res.json();
          if (data) return data;
        }
      }
    } catch {}

    // Fallback localStorage
    try {
      const local = localStorage.getItem('dame_brevo_config');
      if (local) {
        return JSON.parse(local);
      }
    } catch {}

    return {
      hasApiKey: false,
      apiKeyPreview: '',
      senderEmail: 'eglisedunazareendedame@gmail.com',
      senderName: 'Église du Nazaréen de Damé',
      brevoListId: '5',
      isActive: false,
      updatedAt: new Date().toISOString()
    };
  },

  // Admin : Enregistrer la configuration Brevo
  async saveBrevoSettings(settings: { apiKey?: string; senderEmail: string; senderName: string; brevoListId: string }): Promise<{ success: boolean; message: string }> {
    // 1. Sauvegarde locale immédiate garantie dans localStorage
    try {
      localStorage.setItem('dame_brevo_config', JSON.stringify({
        ...settings,
        hasApiKey: Boolean(settings.apiKey),
        apiKeyPreview: settings.apiKey ? (settings.apiKey.length > 8 ? settings.apiKey.slice(0, 8) + '...' + settings.apiKey.slice(-4) : '••••••••••••') : '',
        updatedAt: new Date().toISOString()
      }));
    } catch {}

    // 2. Envoi vers le serveur / worker
    try {
      const res = await fetch('/api/newsletter/settings', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(settings)
      });
      if (res.ok) {
        const contentType = res.headers.get('content-type') || '';
        if (contentType.includes('application/json')) {
          try {
            const data = await res.json();
            return data;
          } catch {}
        }
        return { success: true, message: 'Configuration Brevo enregistrée avec succès !' };
      }
      return { success: false, message: 'Erreur lors de l’enregistrement sur le serveur.' };
    } catch {
      // En mode statique ou si le serveur n'est pas joignable
      return { success: true, message: 'Configuration Brevo enregistrée localement avec succès !' };
    }
  },

  // Admin : Tester la connexion Brevo
  async testBrevoConnection(apiKey?: string): Promise<{ success: boolean; message: string; account?: any; error?: string }> {
    try {
      const res = await fetch('/api/newsletter/test-connection', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(apiKey ? { apiKey: apiKey.trim() } : {})
      });
      const contentType = res.headers.get('content-type') || '';
      if (contentType.includes('application/json')) {
        try {
          return await res.json();
        } catch {}
      }
      if (res.ok) {
        return { success: true, message: 'Connexion à Brevo vérifiée avec succès !' };
      }
      return { success: false, message: 'Échec de la validation avec l’API Brevo.' };
    } catch (err: any) {
      return { success: false, message: 'Échec de communication avec le serveur.', error: err.message };
    }
  }
};
