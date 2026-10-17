import React, { useState, useEffect } from 'react';
import { 
  NewsletterSubscriber, 
  NewsletterCampaign, 
  BrevoConfigView 
} from '../types';
import { newsletterService } from '../services/newsletterService';
import { 
  Mail, 
  Send, 
  Search, 
  CheckCircle2, 
  XCircle, 
  AlertCircle, 
  Trash2, 
  RefreshCw, 
  UserCheck, 
  UserX, 
  Clock, 
  ShieldCheck,
  PlusCircle,
  FileText
} from 'lucide-react';

interface NewsletterManagerProps {
  brevoConfig?: BrevoConfigView | null;
  onRefreshBrevoConfig?: () => void;
}

export const NewsletterManager: React.FC<NewsletterManagerProps> = ({ 
  brevoConfig,
  onRefreshBrevoConfig 
}) => {
  // Subscribers state
  const [subscribers, setSubscribers] = useState<NewsletterSubscriber[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [subscribersLoading, setSubscribersLoading] = useState(false);
  const [subscriberActionMsg, setSubscriberActionMsg] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  // Campaigns state
  const [campaigns, setCampaigns] = useState<NewsletterCampaign[]>([]);
  const [campaignsLoading, setCampaignsLoading] = useState(false);
  const [sendingCampaignId, setSendingCampaignId] = useState<string | null>(null);
  const [sendResultMsg, setSendResultMsg] = useState<{ type: 'success' | 'error' | 'warning'; text: string; details?: string } | null>(null);

  // New Campaign Form
  const [showNewCampaignModal, setShowNewCampaignModal] = useState(false);
  const [campaignTitle, setCampaignTitle] = useState('');
  const [campaignSubject, setCampaignSubject] = useState('');
  const [campaignHtml, setCampaignHtml] = useState('');
  const [createLoading, setCreateLoading] = useState(false);

  // Load initial data
  useEffect(() => {
    loadSubscribers();
    loadCampaigns();
  }, []);

  const loadSubscribers = async (query = '') => {
    setSubscribersLoading(true);
    try {
      const data = await newsletterService.getSubscribers(query);
      setSubscribers(data);
    } catch {
      // Ignorer
    } finally {
      setSubscribersLoading(false);
    }
  };

  const loadCampaigns = async () => {
    setCampaignsLoading(true);
    try {
      const data = await newsletterService.getCampaigns();
      setCampaigns(data);
    } catch {
      // Ignorer
    } finally {
      setCampaignsLoading(false);
    }
  };

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    loadSubscribers(searchQuery);
  };

  const handleToggleSubscriber = async (id: string) => {
    const ok = await newsletterService.toggleSubscriber(id);
    if (ok) {
      loadSubscribers(searchQuery);
      setSubscriberActionMsg({ type: 'success', text: 'Statut de l’abonné mis à jour avec succès.' });
      setTimeout(() => setSubscriberActionMsg(null), 3500);
    } else {
      setSubscriberActionMsg({ type: 'error', text: 'Impossible de modifier le statut.' });
    }
  };

  const handleDeleteSubscriber = async (id: string, email: string) => {
    if (!window.confirm(`Êtes-vous sûr de vouloir supprimer définitivement l’abonné ${email} ?`)) {
      return;
    }
    const ok = await newsletterService.deleteSubscriber(id);
    if (ok) {
      loadSubscribers(searchQuery);
      setSubscriberActionMsg({ type: 'success', text: `Abonné ${email} supprimé avec succès.` });
      setTimeout(() => setSubscriberActionMsg(null), 3500);
    } else {
      setSubscriberActionMsg({ type: 'error', text: 'Erreur lors de la suppression de l’abonné.' });
    }
  };

  const handleCreateCampaign = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!campaignTitle.trim() || !campaignSubject.trim() || !campaignHtml.trim()) {
      setSendResultMsg({ type: 'error', text: 'Veuillez remplir le titre, l’objet et le contenu de la campagne.' });
      return;
    }

    setCreateLoading(true);
    setSendResultMsg(null);
    try {
      const created = await newsletterService.createCampaign({
        title: campaignTitle.trim(),
        subject: campaignSubject.trim(),
        contentHtml: campaignHtml.trim(),
        sentBy: 'Pasteur Bequel CHERELUS'
      });

      if (created) {
        setSendResultMsg({ type: 'success', text: 'Brouillon de campagne créé avec succès ! Prêt pour envoi.' });
        setCampaignTitle('');
        setCampaignSubject('');
        setCampaignHtml('');
        setShowNewCampaignModal(false);
        loadCampaigns();
      } else {
        setSendResultMsg({ type: 'error', text: 'Erreur lors de l’enregistrement de la campagne.' });
      }
    } catch {
      setSendResultMsg({ type: 'error', text: 'Échec de communication lors de la création.' });
    } finally {
      setCreateLoading(false);
    }
  };

  // Envoi avec Brevo : vérification stricte des abonnés actifs et diagnostic précis
  const handleSendCampaign = async (campaignId: string) => {
    const activeSubscribers = subscribers.filter(s => s.isActive);
    const activeCount = activeSubscribers.length;

    // Règle 1 : Aucun envoi s'il n'y a pas d'abonnés actifs
    if (activeCount === 0) {
      setSendResultMsg({
        type: 'error',
        text: 'Envoi refusé : aucun destinataire actif.',
        details: 'La liste d’abonnés ne contient aucun contact avec le statut "Actif". Seuls les abonnés actifs peuvent recevoir des emails.'
      });
      return;
    }

    const campaign = campaigns.find(c => c.id === campaignId);
    if (!campaign) return;

    if (!window.confirm(`Confirmez-vous l’envoi de la campagne « ${campaign.title} » à ${activeCount} abonné(s) actif(s) via l’API Brevo ?`)) {
      return;
    }

    setSendingCampaignId(campaignId);
    setSendResultMsg(null);

    try {
      // Appel du service officiel
      const res = await newsletterService.sendCampaign(campaignId);

      if (res.success) {
        setSendResultMsg({
          type: 'success',
          text: `Campagne envoyée avec succès via Brevo !`,
          details: `${res.sentCount || activeCount} email(s) ont été expédiés aux abonnés actifs.`
        });
        loadCampaigns();
      } else {
        // Traitement détaillé des causes de rejet Brevo
        let clearExplanation = res.message || 'Échec de l’envoi.';
        if (res.error?.includes('401') || res.error?.includes('invalide')) {
          clearExplanation = 'Erreur Clé API Brevo : La clé API fournie est invalide ou expirée. Veuillez la vérifier dans l’onglet Configuration Brevo.';
        } else if (res.error?.includes('expéditeur') || res.error?.includes('non vérifié') || res.error?.includes('sender')) {
          clearExplanation = `Erreur Expéditeur : L'adresse email d'envoi (${brevoConfig?.senderEmail || 'eglisedunazareendedame@gmail.com'}) n'a pas encore été vérifiée dans votre compte Brevo (Menu Expéditeurs & IP).`;
        } else if (res.error?.includes('destinataire')) {
          clearExplanation = 'Erreur Destinataires : Aucun destinataire actif n’a pu être joint.';
        }

        setSendResultMsg({
          type: 'error',
          text: 'Erreur lors de l’envoi avec Brevo',
          details: clearExplanation
        });
      }
    } catch (err: any) {
      setSendResultMsg({
        type: 'error',
        text: 'Erreur de connexion au serveur ou au Worker Cloudflare',
        details: err.message || 'Impossible d’établir la connexion avec l’API.'
      });
    } finally {
      setSendingCampaignId(null);
    }
  };

  const activeSubscribersCount = subscribers.filter(s => s.isActive).length;
  const inactiveSubscribersCount = subscribers.filter(s => !s.isActive).length;

  return (
    <div className="space-y-8">
      {/* Header Banner */}
      <div className="bg-gradient-to-r from-slate-900 to-indigo-950 rounded-3xl p-6 sm:p-8 text-white border border-slate-800 shadow-xl">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="space-y-2">
            <div className="inline-flex items-center space-x-2 px-3 py-1 rounded-full bg-amber-500/20 text-amber-300 text-xs font-bold uppercase tracking-wider">
              <Mail className="w-3.5 h-3.5" />
              <span>Gestion Officielle des Campagnes & Abonnés</span>
            </div>
            <h2 className="font-serif text-2xl sm:text-3xl font-bold text-white">
              Newsletter Manager
            </h2>
            <p className="text-slate-300 text-xs sm:text-sm max-w-2xl leading-relaxed">
              Supervision des abonnés réels inscrits sur le site, synchronisation Brevo API, 
              création et diffusion des lettres pastorales aux membres fidèles.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            <button
              onClick={() => setShowNewCampaignModal(true)}
              className="inline-flex items-center space-x-2 px-5 py-2.5 rounded-xl font-bold text-xs bg-amber-500 text-slate-950 hover:bg-amber-400 transition shadow-lg shadow-amber-500/20"
            >
              <PlusCircle className="w-4 h-4" />
              <span>Nouvelle Campagne</span>
            </button>
            <button
              onClick={() => { loadSubscribers(searchQuery); loadCampaigns(); }}
              className="inline-flex items-center space-x-2 px-4 py-2.5 rounded-xl font-bold text-xs bg-slate-800 text-slate-200 hover:bg-slate-700 transition border border-slate-700"
              title="Rafraîchir les données"
            >
              <RefreshCw className="w-3.5 h-3.5" />
              <span>Actualiser</span>
            </button>
          </div>
        </div>

        {/* Real Stats Counters */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mt-6 pt-6 border-t border-slate-800/80">
          <div className="p-3 rounded-2xl bg-slate-800/50 border border-slate-700/50">
            <span className="text-[11px] text-slate-400 uppercase tracking-wider block font-medium">Abonnés Réels</span>
            <span className="text-2xl font-bold text-amber-400 font-mono">{subscribers.length}</span>
          </div>
          <div className="p-3 rounded-2xl bg-slate-800/50 border border-slate-700/50">
            <span className="text-[11px] text-slate-400 uppercase tracking-wider block font-medium">Actifs (Prêts)</span>
            <span className="text-2xl font-bold text-emerald-400 font-mono">{activeSubscribersCount}</span>
          </div>
          <div className="p-3 rounded-2xl bg-slate-800/50 border border-slate-700/50">
            <span className="text-[11px] text-slate-400 uppercase tracking-wider block font-medium">Inactifs</span>
            <span className="text-2xl font-bold text-rose-400 font-mono">{inactiveSubscribersCount}</span>
          </div>
          <div className="p-3 rounded-2xl bg-slate-800/50 border border-slate-700/50">
            <span className="text-[11px] text-slate-400 uppercase tracking-wider block font-medium">Campagnes Envoyées</span>
            <span className="text-2xl font-bold text-sky-400 font-mono">
              {campaigns.filter(c => c.status === 'sent').length}
            </span>
          </div>
        </div>
      </div>

      {/* Global Notifications */}
      {sendResultMsg && (
        <div className={`p-4 rounded-2xl border flex items-start space-x-3 text-xs leading-relaxed ${
          sendResultMsg.type === 'success'
            ? 'bg-emerald-50 border-emerald-200 text-emerald-900'
            : sendResultMsg.type === 'warning'
            ? 'bg-amber-50 border-amber-200 text-amber-900'
            : 'bg-rose-50 border-rose-200 text-rose-900'
        }`}>
          {sendResultMsg.type === 'success' ? (
            <CheckCircle2 className="w-5 h-5 text-emerald-600 flex-shrink-0 mt-0.5" />
          ) : (
            <AlertCircle className="w-5 h-5 text-rose-600 flex-shrink-0 mt-0.5" />
          )}
          <div>
            <p className="font-bold text-sm">{sendResultMsg.text}</p>
            {sendResultMsg.details && <p className="mt-1 opacity-90">{sendResultMsg.details}</p>}
          </div>
        </div>
      )}

      {subscriberActionMsg && (
        <div className={`p-3 rounded-xl border text-xs flex items-center space-x-2 ${
          subscriberActionMsg.type === 'success'
            ? 'bg-emerald-50 border-emerald-200 text-emerald-800'
            : 'bg-rose-50 border-rose-200 text-rose-800'
        }`}>
          {subscriberActionMsg.type === 'success' ? (
            <CheckCircle2 className="w-4 h-4 text-emerald-600 flex-shrink-0" />
          ) : (
            <AlertCircle className="w-4 h-4 text-rose-600 flex-shrink-0" />
          )}
          <span>{subscriberActionMsg.text}</span>
        </div>
      )}

      {/* SECTION 1: Campaigns Management */}
      <div className="bg-white rounded-3xl p-6 sm:p-8 shadow-sm border border-slate-200 space-y-6">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 border-b pb-4">
          <div>
            <h3 className="font-serif text-xl font-bold text-slate-900 flex items-center space-x-2">
              <Send className="w-5 h-5 text-amber-500" />
              <span>Campagnes & Lettres Pastorales</span>
            </h3>
            <p className="text-xs text-slate-500">
              Les brouillons restent conservés. Seules les campagnes envoyées aux abonnés actifs sont archivées.
            </p>
          </div>
        </div>

        {campaignsLoading ? (
          <div className="py-8 text-center text-xs text-slate-400">Chargement des campagnes...</div>
        ) : campaigns.length === 0 ? (
          <div className="py-10 text-center border-2 border-dashed border-slate-200 rounded-2xl space-y-3">
            <FileText className="w-10 h-10 text-slate-300 mx-auto" />
            <p className="text-xs font-bold text-slate-600">Aucune campagne rédigée pour le moment.</p>
            <button
              onClick={() => setShowNewCampaignModal(true)}
              className="px-4 py-2 rounded-xl text-xs font-bold bg-amber-500 text-slate-950 hover:bg-amber-400 transition"
            >
              Rédiger le premier brouillon
            </button>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 text-slate-500 uppercase font-semibold text-[10px] tracking-wider border-b">
                <tr>
                  <th className="py-3 px-4">Titre de la Campagne</th>
                  <th className="py-3 px-4">Objet de l’Email</th>
                  <th className="py-3 px-4">Statut</th>
                  <th className="py-3 px-4">Destinataires Réels</th>
                  <th className="py-3 px-4">Date d'envoi</th>
                  <th className="py-3 px-4 text-right">Action Brevo</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {campaigns.map((c) => {
                  const isSendingThis = sendingCampaignId === c.id;
                  return (
                    <tr key={c.id} className="hover:bg-slate-50/80 transition">
                      <td className="py-3.5 px-4 font-bold text-slate-900">{c.title}</td>
                      <td className="py-3.5 px-4 text-slate-600 max-w-xs truncate">{c.subject}</td>
                      <td className="py-3.5 px-4">
                        <span className={`inline-flex items-center space-x-1 px-2.5 py-0.5 rounded-full text-[11px] font-bold ${
                          c.status === 'sent'
                            ? 'bg-emerald-100 text-emerald-800'
                            : 'bg-amber-100 text-amber-800'
                        }`}>
                          {c.status === 'sent' ? (
                            <>
                              <CheckCircle2 className="w-3 h-3 text-emerald-600" />
                              <span>Envoyée</span>
                            </>
                          ) : (
                            <>
                              <Clock className="w-3 h-3 text-amber-600" />
                              <span>Brouillon</span>
                            </>
                          )}
                        </span>
                      </td>
                      <td className="py-3.5 px-4 font-mono font-medium text-slate-700">
                        {c.status === 'sent' ? (
                          <span className="text-emerald-700 font-bold">{c.sentCount} contact(s) réels</span>
                        ) : (
                          <span className="text-slate-400 italic">— ({activeSubscribersCount} prêts)</span>
                        )}
                      </td>
                      <td className="py-3.5 px-4 text-slate-500">
                        {c.sentAt ? new Date(c.sentAt).toLocaleString('fr-FR') : 'Non expédiée'}
                      </td>
                      <td className="py-3.5 px-4 text-right">
                        {c.status !== 'sent' ? (
                          <button
                            onClick={() => handleSendCampaign(c.id)}
                            disabled={isSendingThis || activeSubscribersCount === 0}
                            className={`inline-flex items-center space-x-1.5 px-3.5 py-1.5 rounded-lg text-xs font-bold transition shadow-sm ${
                              activeSubscribersCount === 0
                                ? 'bg-slate-200 text-slate-400 cursor-not-allowed'
                                : isSendingThis
                                ? 'bg-amber-300 text-slate-700 cursor-wait'
                                : 'bg-amber-500 text-slate-950 hover:bg-amber-400'
                            }`}
                            title={activeSubscribersCount === 0 ? 'Aucun abonné actif pour recevoir l’envoi' : 'Envoyer immédiatement'}
                          >
                            {isSendingThis ? (
                              <>
                                <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                                <span>Envoi en cours...</span>
                              </>
                            ) : (
                              <>
                                <Send className="w-3.5 h-3.5" />
                                <span>Envoyer avec Brevo</span>
                              </>
                            )}
                          </button>
                        ) : (
                          <span className="text-[11px] text-slate-400 font-medium">Archivée</span>
                        )}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* SECTION 2: Real Subscribers Management */}
      <div className="bg-white rounded-3xl p-6 sm:p-8 shadow-sm border border-slate-200 space-y-6">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 border-b pb-4">
          <div>
            <h3 className="font-serif text-xl font-bold text-slate-900 flex items-center space-x-2">
              <UserCheck className="w-5 h-5 text-emerald-600" />
              <span>Gestion des Abonnés Réels ({subscribers.length})</span>
            </h3>
            <p className="text-xs text-slate-500">
              Synchronisé automatiquement lors des inscriptions publiques sur le site web.
            </p>
          </div>

          {/* Search Form */}
          <form onSubmit={handleSearchSubmit} className="flex items-center gap-2 w-full sm:w-auto">
            <div className="relative flex-grow sm:w-64">
              <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Rechercher email ou nom..."
                className="w-full pl-9 pr-3 py-2 text-xs rounded-xl border border-slate-200 bg-slate-50 focus:outline-none focus:border-amber-400 focus:bg-white transition"
              />
            </div>
            <button
              type="submit"
              className="px-3.5 py-2 rounded-xl text-xs font-bold bg-slate-900 text-white hover:bg-slate-800 transition"
            >
              Filtrer
            </button>
            {searchQuery && (
              <button
                type="button"
                onClick={() => { setSearchQuery(''); loadSubscribers(''); }}
                className="px-2.5 py-2 rounded-xl text-xs font-medium text-slate-500 hover:text-slate-800"
              >
                Effacer
              </button>
            )}
          </form>
        </div>

        {subscribersLoading ? (
          <div className="py-8 text-center text-xs text-slate-400">Chargement des abonnés...</div>
        ) : subscribers.length === 0 ? (
          <div className="py-10 text-center border-2 border-dashed border-slate-200 rounded-2xl space-y-2">
            <Mail className="w-8 h-8 text-slate-300 mx-auto" />
            <p className="text-xs font-bold text-slate-600">Aucun abonné enregistré.</p>
            <p className="text-[11px] text-slate-400">
              Les fidèles qui s'inscrivent via le formulaire Newsletter du site apparaîtront automatiquement ici.
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 text-slate-500 uppercase font-semibold text-[10px] tracking-wider border-b">
                <tr>
                  <th className="py-3 px-4">Adresse Email</th>
                  <th className="py-3 px-4">Prénom & Nom</th>
                  <th className="py-3 px-4">Statut</th>
                  <th className="py-3 px-4">Date d'inscription</th>
                  <th className="py-3 px-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {subscribers.map((s) => (
                  <tr key={s.id} className="hover:bg-slate-50/80 transition">
                    <td className="py-3 px-4 font-mono font-medium text-slate-900">{s.email}</td>
                    <td className="py-3 px-4 text-slate-700">
                      {(s.firstName || s.lastName) ? `${s.firstName || ''} ${s.lastName || ''}`.trim() : '—'}
                    </td>
                    <td className="py-3 px-4">
                      <span className={`inline-flex items-center space-x-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold ${
                        s.isActive ? 'bg-emerald-100 text-emerald-800' : 'bg-slate-100 text-slate-600'
                      }`}>
                        {s.isActive ? (
                          <>
                            <UserCheck className="w-3 h-3 text-emerald-600" />
                            <span>Actif</span>
                          </>
                        ) : (
                          <>
                            <UserX className="w-3 h-3 text-slate-400" />
                            <span>Inactif</span>
                          </>
                        )}
                      </span>
                    </td>
                    <td className="py-3 px-4 text-slate-500">
                      {new Date(s.subscribedAt).toLocaleDateString('fr-FR', {
                        year: 'numeric',
                        month: 'short',
                        day: 'numeric'
                      })}
                    </td>
                    <td className="py-3 px-4 text-right space-x-2">
                      <button
                        onClick={() => handleToggleSubscriber(s.id)}
                        className={`px-2.5 py-1 rounded text-[11px] font-bold transition ${
                          s.isActive 
                            ? 'bg-slate-100 text-slate-700 hover:bg-slate-200' 
                            : 'bg-emerald-50 text-emerald-700 hover:bg-emerald-100'
                        }`}
                        title={s.isActive ? 'Désactiver' : 'Activer'}
                      >
                        {s.isActive ? 'Désactiver' : 'Activer'}
                      </button>
                      <button
                        onClick={() => handleDeleteSubscriber(s.id, s.email)}
                        className="p-1 rounded text-slate-400 hover:text-rose-600 hover:bg-rose-50 transition"
                        title="Supprimer définitivement"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Modal : Rédiger une nouvelle campagne */}
      {showNewCampaignModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm">
          <div className="bg-white rounded-3xl max-w-2xl w-full p-6 sm:p-8 shadow-2xl border border-slate-200 space-y-6 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between border-b pb-4">
              <div>
                <h3 className="font-serif text-xl font-bold text-slate-900">
                  Nouvelle Campagne Newsletter
                </h3>
                <p className="text-xs text-slate-500">
                  Rédigez le message qui sera enregistré comme brouillon avant l’envoi officiel.
                </p>
              </div>
              <button
                onClick={() => setShowNewCampaignModal(false)}
                className="p-2 rounded-xl text-slate-400 hover:text-slate-600 hover:bg-slate-100"
              >
                <XCircle className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleCreateCampaign} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Titre interne de la campagne
                </label>
                <input
                  type="text"
                  required
                  placeholder="Ex : Lettre Pastorale - Novembre 2026"
                  value={campaignTitle}
                  onChange={(e) => setCampaignTitle(e.target.value)}
                  className="w-full px-3.5 py-2.5 text-xs rounded-xl border border-slate-300 focus:outline-none focus:border-amber-400"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Objet de l’email (reçu par les fidèles)
                </label>
                <input
                  type="text"
                  required
                  placeholder="Ex : Nouvelles et prières de l'Église du Nazaréen de Damé"
                  value={campaignSubject}
                  onChange={(e) => setCampaignSubject(e.target.value)}
                  className="w-full px-3.5 py-2.5 text-xs rounded-xl border border-slate-300 focus:outline-none focus:border-amber-400"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Contenu HTML / Texte de l'email
                </label>
                <textarea
                  rows={6}
                  required
                  placeholder="<p>Chers frères et sœurs en Christ,</p><p>Que la grâce de notre Seigneur soit avec vous...</p>"
                  value={campaignHtml}
                  onChange={(e) => setCampaignHtml(e.target.value)}
                  className="w-full p-3 font-mono text-xs rounded-xl border border-slate-300 focus:outline-none focus:border-amber-400"
                />
                <p className="text-[10px] text-slate-400 mt-1">
                  Vous pouvez utiliser du HTML simple (&lt;p&gt;, &lt;strong&gt;, &lt;br&gt;) ou du texte brut.
                </p>
              </div>

              <div className="flex items-center justify-end space-x-3 pt-4 border-t">
                <button
                  type="button"
                  onClick={() => setShowNewCampaignModal(false)}
                  className="px-4 py-2.5 rounded-xl text-xs font-bold text-slate-600 hover:bg-slate-100 transition"
                >
                  Annuler
                </button>
                <button
                  type="submit"
                  disabled={createLoading}
                  className="px-5 py-2.5 rounded-xl text-xs font-bold bg-amber-500 text-slate-950 hover:bg-amber-400 transition shadow-lg shadow-amber-500/20"
                >
                  {createLoading ? 'Enregistrement...' : 'Créer le brouillon'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
