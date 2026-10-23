/**
 * Cloudflare Worker pour l'Église du Nazaréen de Damé
 * Fichier : cloudflare/worker.js
 *
 * Gère le proxy sécurisé vers Brevo API (Contacts & Envoi SMTP Transactionnel / Campagnes)
 * et Supabase.
 *
 * Variables & Secrets requis dans Cloudflare :
 * - BREVO_API_KEY (Secret : npx wrangler secret put BREVO_API_KEY)
 * - BREVO_SENDER_EMAIL (Variable ou Secret : eglisedunazareendedame@gmail.com)
 * - BREVO_SENDER_NAME (Variable : Église du Nazaréen de Damé)
 * - BREVO_LIST_ID (Variable : 2)
 */

export default {
  async fetch(request, env, ctx) {
    const url = new URL(request.url);

    // En-têtes CORS universels pour l'application
    const origin = request.headers.get('Origin') || '*';
    const corsHeaders = {
      'Access-Control-Allow-Origin': origin,
      'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, PATCH, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type, Authorization, api-key',
      'Access-Control-Max-Age': '86400',
    };

    if (request.method === 'OPTIONS') {
      return new Response(null, { status: 204, headers: corsHeaders });
    }

    // 1. ROUTE : Inscription Newsletter (Formulaire public)
    if (url.pathname === '/api/newsletter/subscribe' && request.method === 'POST') {
      try {
        const body = await request.json();
        const { email, firstName, lastName } = body || {};

        if (!email || typeof email !== 'string' || !email.includes('@')) {
          return new Response(
            JSON.stringify({ success: false, error: 'Adresse email invalide.' }),
            { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
          );
        }

        const cleanEmail = email.trim().toLowerCase();
        const brevoKey = env.BREVO_API_KEY;
        const listId = parseInt(env.BREVO_LIST_ID || '2', 10);

        if (brevoKey) {
          const brevoRes = await fetch('https://api.brevo.com/v3/contacts', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              'api-key': brevoKey,
              accept: 'application/json',
            },
            body: JSON.stringify({
              email: cleanEmail,
              attributes: {
                PRENOM: firstName ? String(firstName).trim() : '',
                NOM: lastName ? String(lastName).trim() : '',
              },
              listIds: !isNaN(listId) && listId > 0 ? [listId] : [2],
              updateEnabled: true,
            }),
          });

          if (brevoRes.ok || brevoRes.status === 204 || brevoRes.status === 201) {
            return new Response(
              JSON.stringify({
                success: true,
                message: 'Merci pour votre abonnement à la newsletter !',
                isNew: true,
              }),
              { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
            );
          }

          let brevoData = null;
          const contentType = brevoRes.headers.get('content-type') || '';
          if (contentType.includes('application/json')) {
            try {
              brevoData = await brevoRes.json();
            } catch {}
          }

          if (brevoData && brevoData.code === 'duplicate_parameter') {
            return new Response(
              JSON.stringify({
                success: true,
                message: 'Merci pour votre abonnement à la newsletter !',
                isNew: false,
              }),
              { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
            );
          }

          return new Response(
            JSON.stringify({
              success: true,
              message: 'Merci pour votre inscription à la Newsletter de l’Église du Nazaréen de Damé !',
              isNew: true,
              brevo: brevoData,
            }),
            { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
          );
        }

        return new Response(
          JSON.stringify({
            success: true,
            message: 'Inscription enregistrée avec succès.',
            isNew: true,
          }),
          { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      } catch (err) {
        return new Response(
          JSON.stringify({ success: false, error: 'Erreur Worker inscription: ' + err.message }),
          { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }
    }

    // 2. ROUTE : Envoi de Campagne Newsletter via Brevo SMTP API
    if (
      (url.pathname === '/api/newsletter/send' || url.pathname === '/api/campaigns/send') &&
      request.method === 'POST'
    ) {
      try {
        const body = await request.json();
        const { subject, htmlContent, recipients, senderEmail, senderName } = body || {};

        if (!subject || !subject.trim()) {
          return new Response(
            JSON.stringify({ success: false, error: 'Le sujet de la campagne est requis.' }),
            { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
          );
        }
        if (!htmlContent || !htmlContent.trim()) {
          return new Response(
            JSON.stringify({ success: false, error: 'Le contenu de la campagne est vide.' }),
            { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
          );
        }

        if (!recipients || !Array.isArray(recipients) || recipients.length === 0) {
          return new Response(
            JSON.stringify({
              success: false,
              error: 'Aucun destinataire actif : la liste d’envoi est vide. Veuillez vérifier que des abonnés actifs existent.',
            }),
            { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
          );
        }

        const toList = [];
        for (const r of recipients) {
          if (typeof r === 'string' && r.includes('@')) {
            toList.push({ email: r.trim().toLowerCase() });
          } else if (r && typeof r === 'object' && r.email && r.email.includes('@')) {
            toList.push({
              email: r.email.trim().toLowerCase(),
              name: r.name ? String(r.name).trim() : undefined,
            });
          }
        }

        if (toList.length === 0) {
          return new Response(
            JSON.stringify({
              success: false,
              error: 'Aucune adresse email valide trouvée parmi les destinataires fournis.',
            }),
            { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
          );
        }

        const brevoKey = env.BREVO_API_KEY;
        if (!brevoKey) {
          return new Response(
            JSON.stringify({
              success: false,
              error: 'Clé API Brevo manquante (BREVO_API_KEY non définie dans les secrets Cloudflare). Configurez la clé avec : npx wrangler secret put BREVO_API_KEY',
            }),
            { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
          );
        }

        const finalSenderEmail =
          senderEmail || env.BREVO_SENDER_EMAIL || 'eglisedunazareendedame@gmail.com';
        const finalSenderName =
          senderName || env.BREVO_SENDER_NAME || 'Église du Nazaréen de Damé';

        const brevoPayload = {
          sender: {
            name: finalSenderName,
            email: finalSenderEmail,
          },
          to: toList,
          subject: subject.trim(),
          htmlContent: htmlContent,
        };

        const brevoRes = await fetch('https://api.brevo.com/v3/smtp/email', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'api-key': brevoKey,
            accept: 'application/json',
          },
          body: JSON.stringify(brevoPayload),
        });

        const brevoData = await brevoRes.json();

        if (!brevoRes.ok) {
          let errorMsg = 'Erreur lors de l’envoi avec Brevo.';
          if (brevoRes.status === 401) {
            errorMsg =
              'Clé API Brevo invalide ou révoquée (Erreur 401 non autorisé). Veuillez vérifier et renouveler votre clé API dans Brevo.';
          } else if (brevoRes.status === 400) {
            const rawMsg = brevoData?.message || JSON.stringify(brevoData);
            if (
              rawMsg.toLowerCase().includes('sender') ||
              rawMsg.toLowerCase().includes('not valid') ||
              rawMsg.toLowerCase().includes('unverified')
            ) {
              errorMsg = `L’adresse email expéditeur (${finalSenderEmail}) n’est pas vérifiée dans votre compte Brevo. Allez dans Brevo > Expéditeurs & IP pour la valider.`;
            } else {
              errorMsg = `Paramètres invalides pour l’API Brevo (Erreur 400) : ${rawMsg}`;
            }
          } else if (brevoRes.status === 402) {
            errorMsg =
              'Crédits emails épuisés sur le compte Brevo. Veuillez recharger votre quota d’envoi.';
          } else {
            errorMsg = `Erreur API Brevo (${brevoRes.status}) : ${brevoData?.message || 'Erreur inconnue'}`;
          }

          return new Response(
            JSON.stringify({
              success: false,
              error: errorMsg,
              brevoDetails: brevoData,
              status: brevoRes.status,
            }),
            { status: brevoRes.status >= 400 && brevoRes.status < 500 ? brevoRes.status : 502, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
          );
        }

        return new Response(
          JSON.stringify({
            success: true,
            message: `Campagne envoyée avec succès via Brevo à ${toList.length} destinataire(s) actif(s) !`,
            sentCount: toList.length,
            messageId: brevoData?.messageId,
            brevo: brevoData,
          }),
          { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      } catch (err) {
        return new Response(
          JSON.stringify({
            success: false,
            error: 'Erreur interne du Worker Cloudflare : ' + err.message,
          }),
          { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }
    }

    return env.ASSETS ? env.ASSETS.fetch(request) : new Response('Route non trouvée', { status: 404 });
  },
};
