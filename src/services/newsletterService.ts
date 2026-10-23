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
      return await res.json();
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
      return await res.json();
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
      const data = await res.json();
      return data.campaign || null;
    } catch {
      return null;
    }
  },

  // Admin : Envoyer la campagne aux abonnés actifs via Brevo
  async sendCampaign(id: string): Promise<SendCampaignResponse> {
    try {
      const res = await fetch(`/api/newsletter/campaigns/${id}/send`, { method: 'POST' });
      const data = await res.json();
      if (!res.ok) {
        return {
          success: false,
          message: data.error || data.message || 'Échec de l’envoi de la campagne.',
          error: data.error
        };
      }
      return data;
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
      const data = await res.json();
      if (!res.ok) {
        return {
          success: false,
          message: data.error || 'Erreur lors de l’envoi.',
          error: data.error
        };
      }
      return data;
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
      if (!res.ok) return null;
      return await res.json();
    } catch {
      return null;
    }
  },

  // Admin : Enregistrer la configuration Brevo
  async saveBrevoSettings(settings: { apiKey?: string; senderEmail: string; senderName: string; brevoListId: string }): Promise<{ success: boolean; message: string }> {
    try {
      const res = await fetch('/api/newsletter/settings', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(settings)
      });
      return await res.json();
    } catch (err: any) {
      return { success: false, message: err.message || 'Erreur d’enregistrement' };
    }
  },

  // Admin : Tester la connexion Brevo
  async testBrevoConnection(): Promise<{ success: boolean; message: string; account?: any; error?: string }> {
    try {
      const res = await fetch('/api/newsletter/test-connection', { method: 'POST' });
      return await res.json();
    } catch (err: any) {
      return { success: false, message: 'Échec de communication avec le serveur.', error: err.message };
    }
  }
};
