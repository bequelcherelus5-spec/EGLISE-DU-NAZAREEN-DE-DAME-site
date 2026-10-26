import { NewsletterSubscriber, NewsletterCampaign, BrevoConfigView } from '../types';
import { supabase, getActiveSupabaseClient } from './supabaseClient';

// Helper pour résoudre la clé API Brevo avec fallback environnement, window.__ENV__ ou localStorage
export function getResolvedBrevoApiKey(): string {
  // 1. Variable d'environnement Vite (import.meta.env.VITE_BREVO_API_KEY)
  const metaKey = typeof import.meta !== 'undefined' && import.meta.env
    ? (import.meta.env.VITE_BREVO_API_KEY || (import.meta.env as any).BREVO_API_KEY || '')
    : '';
  if (metaKey && typeof metaKey === 'string' && metaKey.trim().startsWith('xkeysib-')) {
    return metaKey.trim();
  }

  // 2. Global window si présent (Cloudflare Workers / window.__ENV__)
  if (typeof window !== 'undefined') {
    const winKey = (window as any).__ENV__?.VITE_BREVO_API_KEY || (window as any).__ENV__?.BREVO_API_KEY;
    if (winKey && typeof winKey === 'string' && winKey.trim().startsWith('xkeysib-')) {
      return winKey.trim();
    }

    // 3. Configuration de secours enregistrée dans localStorage par le Secrétariat
    try {
      const storedConfig = localStorage.getItem('dame_brevo_config');
      if (storedConfig) {
        const parsed = JSON.parse(storedConfig);
        if (parsed.apiKey && typeof parsed.apiKey === 'string' && parsed.apiKey.trim().startsWith('xkeysib-')) {
          return parsed.apiKey.trim();
        }
      }
      const directStoredKey = 
        localStorage.getItem('dame_brevo_api_key') || 
        localStorage.getItem('brevo_api_key') ||
        localStorage.getItem('VITE_BREVO_API_KEY');
      if (directStoredKey && directStoredKey.trim().startsWith('xkeysib-')) {
        return directStoredKey.trim();
      }
    } catch {
      // Ignorer
    }
  }

  console.warn('[Brevo] Avertissement : Variable VITE_BREVO_API_KEY non définie.');
  return '';
}

export function getResolvedBrevoSenderEmail(): string {
  const meta = typeof import.meta !== 'undefined' && import.meta.env
    ? (import.meta.env.VITE_BREVO_SENDER_EMAIL || (import.meta.env as any).BREVO_SENDER_EMAIL || '')
    : '';
  if (meta && typeof meta === 'string' && meta.includes('@')) return meta.trim();

  if (typeof window !== 'undefined') {
    const win = (window as any).__ENV__?.VITE_BREVO_SENDER_EMAIL;
    if (win && typeof win === 'string' && win.includes('@')) return win.trim();
    try {
      const stored = localStorage.getItem('dame_brevo_config');
      if (stored) {
        const parsed = JSON.parse(stored);
        if (parsed.senderEmail && parsed.senderEmail.includes('@')) return parsed.senderEmail.trim();
      }
    } catch {}
  }
  return 'eglisedunazareendedame@gmail.com';
}

export function getResolvedBrevoListId(): string {
  const meta = typeof import.meta !== 'undefined' && import.meta.env
    ? (import.meta.env.VITE_BREVO_LIST_ID || (import.meta.env as any).BREVO_LIST_ID || '')
    : '';
  if (meta && typeof meta === 'string' && meta.trim()) return meta.trim();

  if (typeof window !== 'undefined') {
    const win = (window as any).__ENV__?.VITE_BREVO_LIST_ID;
    if (win && typeof win === 'string' && win.trim()) return win.trim();
    try {
      const stored = localStorage.getItem('dame_brevo_config');
      if (stored) {
        const parsed = JSON.parse(stored);
        if (parsed.brevoListId) return String(parsed.brevoListId).trim();
      }
    } catch {}
  }
  return '5';
}

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
  // Inscription publique avec fallback Supabase & LocalStorage (parfaitement compatible domaine public www.eglisedunazareendedame.org et restrictions CORS)
  async subscribe(email: string, firstName?: string, lastName?: string): Promise<SubscribeResponse> {
    const cleanEmail = email.trim().toLowerCase();
    const cleanFn = firstName?.trim() || '';
    const cleanLn = lastName?.trim() || '';

    if (!cleanEmail || !cleanEmail.includes('@')) {
      return { success: false, message: 'Veuillez saisir une adresse email valide.' };
    }

    // Fonction de persistance de secours (LocalStorage + Supabase table 'newsletter_subscribers')
    const persistLocallyAndSupabase = async () => {
      // A. Sauvegarde locale garantie dans localStorage
      try {
        const stored = localStorage.getItem('dame_local_subscribers') || localStorage.getItem('dame_subscribers');
        let list: any[] = stored ? JSON.parse(stored) : [];
        const exists = list.some((s: any) => s.email?.toLowerCase() === cleanEmail);
        if (!exists) {
          list.unshift({
            id: 'sub-' + Date.now(),
            email: cleanEmail,
            firstName: cleanFn,
            lastName: cleanLn,
            isActive: true,
            subscribedAt: new Date().toISOString()
          });
          localStorage.setItem('dame_local_subscribers', JSON.stringify(list));
        }
      } catch (e) {
        console.warn('[Newsletter] Erreur sauvegarde locale:', e);
      }

      // B. Synchronisation directe dans la table Supabase 'newsletter_subscribers'
      const client = getActiveSupabaseClient() || supabase;
      if (client) {
        try {
          await client
            .from('newsletter_subscribers')
            .upsert([
              {
                email: cleanEmail,
                first_name: cleanFn || null,
                last_name: cleanLn || null,
                is_active: true,
                subscribed_at: new Date().toISOString()
              }
            ], { onConflict: 'email' });
        } catch (e) {
          console.warn('[Newsletter] Exception insertion Supabase:', e);
        }
      }

      // C. Si une clé API Brevo est disponible en direct, ajouter le contact dans Brevo et l'associer à la Liste 5
      const brevoKey = getResolvedBrevoApiKey();
      if (brevoKey) {
        try {
          const targetListId = parseInt(getResolvedBrevoListId() || '5', 10) || 5;
          const brevoContactRes = await fetch('https://api.brevo.com/v3/contacts', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              'api-key': brevoKey,
              accept: 'application/json'
            },
            body: JSON.stringify({
              email: cleanEmail,
              attributes: {
                PRENOM: cleanFn || undefined,
                NOM: cleanLn || undefined
              },
              listIds: [targetListId],
              updateEnabled: true
            })
          });

          // Si le contact existait déjà ou pour garantir l'appartenance à la Liste 5
          if (!brevoContactRes.ok) {
            try {
              await fetch(`https://api.brevo.com/v3/contacts/lists/${targetListId}/contacts/add`, {
                method: 'POST',
                headers: {
                  'Content-Type': 'application/json',
                  'api-key': brevoKey,
                  accept: 'application/json'
                },
                body: JSON.stringify({ emails: [cleanEmail] })
              });
            } catch {}
          }
        } catch {}
      }
    };

    try {
      const response = await fetch('/api/newsletter/subscribe', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: cleanEmail, firstName: cleanFn, lastName: cleanLn })
      });

      // 1. Si response.ok est vrai (200, 201 ou 204), succès confirmé
      if (response.ok || response.status === 200 || response.status === 201 || response.status === 204) {
        await persistLocallyAndSupabase();
        return {
          success: true,
          message: 'Merci pour votre abonnement à la newsletter !',
          isNew: true
        };
      }

      // 2. Si l'API retourne un statut non-200 (ex: 404 sur Cloudflare Pages statique), basculer sur le fallback Supabase & Local
      await persistLocallyAndSupabase();
      return {
        success: true,
        message: 'Merci pour votre abonnement à la newsletter !',
        isNew: true
      };
    } catch {
      // 3. En cas de blocage CORS ou échec de réseau sur le domaine public www.eglisedunazareendedame.org
      await persistLocallyAndSupabase();
      return { 
        success: true, 
        message: 'Merci pour votre abonnement à la newsletter !', 
        isNew: true 
      };
    }
  },

  // Admin : Récupérer les abonnés réels (agrégation /api, Supabase 'newsletter_subscribers', et local)
  async getSubscribers(query = ''): Promise<NewsletterSubscriber[]> {
    const subscribersMap = new Map<string, NewsletterSubscriber>();

    // 1. Tenter via /api/newsletter/subscribers
    try {
      const res = await fetch(`/api/newsletter/subscribers?q=${encodeURIComponent(query)}`);
      if (res.ok) {
        const contentType = res.headers.get('content-type') || '';
        if (contentType.includes('application/json')) {
          const data = await res.json();
          if (Array.isArray(data)) {
            for (const s of data) {
              if (s && s.email) {
                subscribersMap.set(s.email.toLowerCase().trim(), {
                  id: s.id || 'sub-' + s.email,
                  email: s.email.toLowerCase().trim(),
                  firstName: s.firstName || '',
                  lastName: s.lastName || '',
                  isActive: s.isActive !== false,
                  subscribedAt: s.subscribedAt || new Date().toISOString()
                });
              }
            }
          }
        }
      }
    } catch {}

    // 2. Récupérer depuis Supabase (table 'newsletter_subscribers')
    const client = getActiveSupabaseClient() || supabase;
    if (client) {
      try {
        let qb = client.from('newsletter_subscribers').select('*');
        if (query) {
          qb = qb.or(`email.ilike.%${query}%,first_name.ilike.%${query}%,last_name.ilike.%${query}%`);
        }
        const { data, error } = await qb;
        if (!error && Array.isArray(data)) {
          for (const row of data) {
            const email = (row.email || '').toLowerCase().trim();
            if (email && !subscribersMap.has(email)) {
              subscribersMap.set(email, {
                id: row.id ? String(row.id) : 'supa-' + email,
                email,
                firstName: row.first_name || '',
                lastName: row.last_name || '',
                isActive: row.active ?? row.is_active ?? true,
                subscribedAt: row.created_at || row.subscribed_at || new Date().toISOString()
              });
            }
          }
        }
      } catch (e) {
        console.warn('[Newsletter] Fallback Supabase getSubscribers:', e);
      }
    }

    // 3. Récupérer depuis localStorage
    if (typeof window !== 'undefined') {
      try {
        const local = localStorage.getItem('dame_local_subscribers') || localStorage.getItem('dame_subscribers');
        if (local) {
          const parsed = JSON.parse(local);
          if (Array.isArray(parsed)) {
            for (const s of parsed) {
              const email = (s.email || '').toLowerCase().trim();
              if (email && !subscribersMap.has(email)) {
                subscribersMap.set(email, {
                  id: s.id || 'local-' + email,
                  email,
                  firstName: s.firstName || '',
                  lastName: s.lastName || '',
                  isActive: s.isActive !== false,
                  subscribedAt: s.subscribedAt || new Date().toISOString()
                });
              }
            }
          }
        }
      } catch {}
    }

    const all = Array.from(subscribersMap.values());
    if (!query) return all;
    const qLower = query.toLowerCase().trim();
    return all.filter(s =>
      s.email.toLowerCase().includes(qLower) ||
      (s.firstName && s.firstName.toLowerCase().includes(qLower)) ||
      (s.lastName && s.lastName.toLowerCase().includes(qLower))
    );
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
      if (!activeKey) {
        activeKey = getResolvedBrevoApiKey();
      }

      const finalSenderEmail = (payload.senderEmail || settings?.senderEmail || getResolvedBrevoSenderEmail() || 'eglisedunazareendedame@gmail.com').trim().toLowerCase();
      const finalSenderName = payload.senderName || settings?.senderName || 'Église du Nazaréen de Damé';
      const targetListId = parseInt(settings?.brevoListId || getResolvedBrevoListId() || '5', 10) || 5;

      // 2. Préparation et validation des destinataires (EXCLUSION STRICTE DE L'EXPÉDITEUR)
      let toList = (payload.recipients || [])
        .map(r => {
          if (typeof r === 'string') return { email: r.trim().toLowerCase() };
          return { email: r.email.trim().toLowerCase(), name: r.name || undefined };
        })
        .filter(r => r.email && r.email.includes('@') && r.email.toLowerCase() !== finalSenderEmail);

      // Si aucun destinataire fourni ou filtré, récupérer automatiquement les abonnés réels
      if (toList.length === 0) {
        const allSubs = await this.getSubscribers();
        toList = allSubs
          .filter(s => s.isActive && s.email.toLowerCase().trim() !== finalSenderEmail)
          .map(s => ({
            email: s.email.trim().toLowerCase(),
            name: `${s.firstName || ''} ${s.lastName || ''}`.trim() || undefined
          }));
      }

      // 3. Appel direct à l'API Brevo v3 si la clé est présente
      if (activeKey && activeKey.startsWith('xkeysib-')) {
        // A. Essayer d'abord la création et diffusion via l'API Campagnes Brevo (ciblant la Liste 5)
        try {
          const campRes = await fetch('https://api.brevo.com/v3/emailCampaigns', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              'api-key': activeKey,
              'accept': 'application/json'
            },
            body: JSON.stringify({
              name: `Annonce Damé - ${payload.subject.slice(0, 35)} - ${Date.now()}`,
              subject: payload.subject,
              sender: { name: finalSenderName, email: finalSenderEmail },
              type: 'classic',
              htmlContent: payload.htmlContent,
              recipients: { listIds: [targetListId] }
            })
          });

          if (campRes.ok || campRes.status === 201) {
            const campData = await campRes.json();
            const campId = campData?.id;
            if (campId) {
              const sendNowRes = await fetch(`https://api.brevo.com/v3/emailCampaigns/${campId}/sendNow`, {
                method: 'POST',
                headers: {
                  'Content-Type': 'application/json',
                  'api-key': activeKey,
                  'accept': 'application/json'
                }
              });
              if (sendNowRes.ok || sendNowRes.status === 204 || sendNowRes.status === 200) {
                return {
                  success: true,
                  message: `Annonce diffusée avec succès à tous les abonnés de la liste Brevo #${targetListId} (${toList.length > 0 ? toList.length : 'tous les'} destinataire(s)) !`,
                  sentCount: toList.length,
                  brevoSent: true,
                  brevoDetails: { campaignId: campId }
                };
              }
            }
          }
        } catch (campErr: any) {
          console.warn('[Brevo Campaign] Bascule vers envoi SMTP direct:', campErr);
        }

        // B. Envoi direct via l'API Brevo SMTP (/v3/smtp/email) vers toList
        if (toList.length > 0) {
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
                message: `Annonce envoyée avec succès via l’API Brevo v3 (${toList.length} abonné(s) destinataire(s)) !`,
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
      }

      // 4. Fallback via le backend /api/newsletter/send
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

    // Fallback localStorage ou résolution globale (VITE_BREVO_API_KEY, window.__ENV__, localStorage)
    let localParsed: any = null;
    try {
      const local = localStorage.getItem('dame_brevo_config');
      if (local) {
        localParsed = JSON.parse(local);
        if (localParsed && (localParsed.hasApiKey || localParsed.apiKey)) {
          return localParsed;
        }
      }
    } catch {}

    const resolvedKey = getResolvedBrevoApiKey();
    const resolvedSenderEmail = getResolvedBrevoSenderEmail();
    const resolvedListId = getResolvedBrevoListId();

    if (resolvedKey) {
      return {
        hasApiKey: true,
        apiKeyPreview: resolvedKey.length > 8 ? resolvedKey.slice(0, 8) + '...' + resolvedKey.slice(-4) : '••••••••••••',
        senderEmail: localParsed?.senderEmail || resolvedSenderEmail,
        senderName: localParsed?.senderName || 'Église du Nazaréen de Damé',
        brevoListId: localParsed?.brevoListId || resolvedListId,
        isActive: true,
        updatedAt: localParsed?.updatedAt || new Date().toISOString()
      };
    }

    if (localParsed) {
      return localParsed;
    }

    return {
      hasApiKey: false,
      apiKeyPreview: '',
      senderEmail: resolvedSenderEmail,
      senderName: 'Église du Nazaréen de Damé',
      brevoListId: resolvedListId,
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
      if (settings.apiKey && settings.apiKey.trim().startsWith('xkeysib-')) {
        localStorage.setItem('dame_brevo_api_key', settings.apiKey.trim());
      }
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
