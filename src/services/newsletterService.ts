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

  // Admin : Envoi direct d'annonce/campagne via l'API Brevo v3 (/v3/smtp/email) ou proxy
  async sendViaWorker(payload: {
    subject: string;
    htmlContent: string;
    recipients: Array<{ email: string; name?: string } | string>;
    senderEmail?: string;
    senderName?: string;
    apiKey?: string;
  }): Promise<SendCampaignResponse> {
    try {
      // 1. Récupérer les clés et paramètres
      const settings = await this.getBrevoSettings();
      let activeKey = (payload.apiKey || '').trim();
      if (!activeKey) {
        try {
          const stored = localStorage.getItem('dame_brevo_config');
          if (stored) {
            const parsed = JSON.parse(stored);
            activeKey = parsed.apiKey || '';
          }
        } catch {}
      }

      // Préparation et validation des destinataires
      const toList = (payload.recipients || [])
        .map(r => {
          if (typeof r === 'string') return { email: r.trim().toLowerCase() };
          return { email: r.email.trim().toLowerCase(), name: r.name || undefined };
        })
        .filter(r => r.email && r.email.includes('@'));

      if (toList.length === 0) {
        return {
          success: false,
          message: 'Aucun destinataire avec une adresse email valide n’a été sélectionné.',
          error: 'Destinataires manquants'
        };
      }

      const finalSenderEmail = payload.senderEmail || settings?.senderEmail || 'eglisedunazareendedame@gmail.com';
      const finalSenderName = payload.senderName || settings?.senderName || 'Église du Nazaréen de Damé';

      // 2. Appel direct à l'API Brevo v3 (/v3/smtp/email) si la clé est présente
      if (activeKey && activeKey.startsWith('xkeysib-')) {
        try {
          const directRes = await fetch('https://api.brevo.com/v3/smtp/email', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              'api-key': activeKey,
              'accept': 'application/json'
            },
            body: JSON.stringify({
              sender: { name: finalSenderName, email: finalSenderEmail },
              to: toList,
              subject: payload.subject,
              htmlContent: payload.htmlContent
            })
          });

          // En cas de réponse HTTP 200, 201 ou 204
          if (directRes.ok || directRes.status === 200 || directRes.status === 201 || directRes.status === 204) {
            let messageId: string | undefined = undefined;
            const ct = directRes.headers.get('content-type') || '';
            if (ct.includes('application/json')) {
              try {
                const bData = await directRes.json();
                messageId = bData?.messageId;
              } catch {}
            }
            return {
              success: true,
              message: `Annonce envoyée avec succès via l’API Brevo v3 (${toList.length} destinataire(s)) !`,
              sentCount: toList.length,
              brevoSent: true,
              brevoDetails: messageId ? { messageId } : undefined
            };
          }

          // En cas d'erreur de l'API Brevo
          let errorMsg = `Erreur API Brevo (Code HTTP ${directRes.status}).`;
          const ct = directRes.headers.get('content-type') || '';
          if (ct.includes('application/json')) {
            try {
              const errData = await directRes.json();
              if (errData?.message) {
                const rawMsg = errData.message;
                if (rawMsg.toLowerCase().includes('sender') || rawMsg.toLowerCase().includes('not valid')) {
                  errorMsg = `L’adresse email expéditeur (${finalSenderEmail}) n’est pas encore vérifiée dans votre compte Brevo. Rendez-vous sur Brevo > Expéditeurs & Domaines pour la valider.`;
                } else if (directRes.status === 401 || rawMsg.toLowerCase().includes('key')) {
                  errorMsg = 'Clé API Brevo invalide ou révoquée (Erreur 401). Veuillez vérifier votre clé API dans la configuration.';
                } else {
                  errorMsg = `Brevo : ${rawMsg}`;
                }
              }
            } catch {}
          }
          return {
            success: false,
            message: errorMsg,
            error: errorMsg
          };
        } catch (directErr: any) {
          console.warn('[NewsletterService] Échec appel direct Brevo SMTP, essai via le proxy...', directErr);
        }
      }

      // 3. Fallback via le backend /api/newsletter/send
      const res = await fetch('/api/newsletter/send', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...payload,
          recipients: toList,
          senderEmail: finalSenderEmail,
          senderName: finalSenderName
        })
      });

      // Gestion sûre sans plantage JSON pour 200/201/204
      if (res.ok || res.status === 200 || res.status === 201 || res.status === 204) {
        let resData: any = {};
        const contentType = res.headers.get('content-type') || '';
        if (contentType.includes('application/json')) {
          try {
            resData = await res.json();
          } catch {}
        }
        return {
          success: true,
          message: resData.message || `Annonce envoyée avec succès à ${toList.length} destinataire(s) !`,
          sentCount: toList.length,
          brevoSent: true,
          ...resData
        };
      }

      let errorMsg = 'Erreur lors de l’envoi de l’annonce.';
      const contentType = res.headers.get('content-type') || '';
      if (contentType.includes('application/json')) {
        try {
          const errData = await res.json();
          if (errData && (errData.error || errData.message)) {
            errorMsg = errData.error || errData.message;
          }
        } catch {}
      }

      return {
        success: false,
        message: errorMsg,
        error: errorMsg
      };
    } catch (err: any) {
      return {
        success: false,
        message: 'Impossible de joindre le service d’envoi Brevo : ' + (err?.message || String(err)),
        error: err?.message
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
    const keyToTest = (apiKey || '').trim() || (() => {
      try {
        const stored = localStorage.getItem('dame_brevo_config');
        return stored ? JSON.parse(stored)?.apiKey : '';
      } catch {
        return '';
      }
    })();

    // 1. Tenter via le proxy backend d'abord
    try {
      const res = await fetch('/api/newsletter/test-connection', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(keyToTest ? { apiKey: keyToTest } : {})
      });

      const contentType = res.headers.get('content-type') || '';
      if (res.ok || res.status === 200 || res.status === 201 || res.status === 204) {
        if (contentType.includes('application/json')) {
          try {
            const data = await res.json();
            return {
              success: true,
              message: data.message || 'Connexion à Brevo vérifiée avec succès !',
              account: data.account
            };
          } catch {
            // Ignorer l'erreur JSON et continuer avec le succès HTTP
          }
        }
        return { success: true, message: 'Connexion à Brevo vérifiée avec succès !' };
      }

      if (contentType.includes('application/json')) {
        try {
          const errData = await res.json();
          if (errData && (errData.error || errData.message)) {
            return { success: false, message: errData.error || errData.message, error: errData.error };
          }
        } catch {}
      }
    } catch {
      // Échec de communication avec le proxy local, tenter la validation directe
    }

    // 2. Si pas de proxy ou échec serveur, valider directement avec l'API Brevo v3
    if (keyToTest && keyToTest.startsWith('xkeysib-')) {
      try {
        const directRes = await fetch('https://api.brevo.com/v3/account', {
          headers: {
            'api-key': keyToTest,
            accept: 'application/json'
          }
        });

        if (directRes.ok || directRes.status === 200 || directRes.status === 204) {
          let directData: any = {};
          const ct = directRes.headers.get('content-type') || '';
          if (ct.includes('application/json')) {
            try {
              directData = await directRes.json();
            } catch {}
          }
          return {
            success: true,
            message: 'Connexion directe à l’API Brevo v3 validée avec succès !',
            account: {
              email: directData.email || 'Vérifié',
              companyName: directData.companyName || 'Église du Nazaréen de Damé',
              plan: directData.plan?.[0]?.type || 'Standard'
            }
          };
        }

        let errMsg = 'Clé API Brevo invalide ou refusée.';
        const ct = directRes.headers.get('content-type') || '';
        if (ct.includes('application/json')) {
          try {
            const errJson = await directRes.json();
            if (errJson.message) errMsg = errJson.message;
          } catch {}
        }
        return { success: false, message: errMsg, error: errMsg };
      } catch (directErr: any) {
        return {
          success: false,
          message: 'Erreur lors de la tentative de connexion directe à Brevo: ' + (directErr?.message || String(directErr)),
          error: directErr?.message
        };
      }
    }

    return {
      success: false,
      message: 'Veuillez renseigner une clé API Brevo v3 valide (commençant par xkeysib-).'
    };
  }
};
