import React, { useState, useEffect } from 'react';
import { SEOHead } from '../components/SEOHead';
import { OFFICIAL_CHURCH_INFO } from '../data/churchData';
import { 
  Heart, 
  Lock, 
  ShieldCheck, 
  Send, 
  CheckCircle2, 
  AlertCircle, 
  Loader2, 
  Sparkles, 
  Users, 
  Phone, 
  MessageSquare, 
  Clock, 
  Flame, 
  BookOpen, 
  Share2, 
  CalendarPlus,
  HelpCircle,
  ThumbsUp
} from 'lucide-react';

interface PublicPrayer {
  id: string;
  category: string;
  fullName: string;
  isAnonymous: boolean;
  message: string;
  createdAt: string;
  amenCount: number;
  isUrgent?: boolean;
}

interface PrayerRequestsProps {
  onNavigate: (path: string) => void;
}

const PRAYER_CATEGORIES = [
  { id: 'Santé & Guérison', label: 'Santé & Guérison', icon: '🩺' },
  { id: 'Famille & Foyer', label: 'Fanmi & Fwaye', icon: '👨‍👩‍👧‍👦' },
  { id: 'Délivrance & Combat Spirituel', label: 'Delivrans & Libète Espirityèl', icon: '🛡️' },
  { id: 'Travail, Finances & Emploi', label: 'Travay & Pwovizyon Finansye', icon: '💼' },
  { id: 'Jeunesse, Enfants & Études', label: 'Jenn Moun, Timoun & Lekòl', icon: '🎓' },
  { id: 'Paix, Voyage & Protection', label: 'Pwoteksyon & Vwayaj', icon: '🕊️' },
  { id: 'Action de Grâce & Témoignage', label: 'Aksyon de Gras & Rekonesans', icon: '🙌' },
  { id: 'Autre Fardeau Spirituel', label: 'Lòt Fado Espirityèl', icon: '✝️' }
];

export const PrayerRequests: React.FC<PrayerRequestsProps> = ({ onNavigate }) => {
  const [activeTab, setActiveTab] = useState<'form' | 'wall' | 'whatsapp'>('form');

  // État formulaire
  const [formData, setFormData] = useState({
    category: 'Santé & Guérison',
    fullName: '',
    isAnonymous: false,
    phone: '',
    email: '',
    message: '',
    isUrgent: false,
    pastorOnly: true, // Vrai par défaut = Sekrè Pastoral
    requestCallback: false
  });

  const [loading, setLoading] = useState(false);
  const [status, setStatus] = useState<{ type: 'idle' | 'success' | 'error'; message: string }>({
    type: 'idle',
    message: ''
  });

  // Mur de Prières publiques
  const [publicPrayers, setPublicPrayers] = useState<PublicPrayer[]>([]);
  const [loadingWall, setLoadingWall] = useState(false);
  const [filterCategory, setFilterCategory] = useState<string>('all');
  const [prayedIds, setPrayedIds] = useState<Set<string>>(() => {
    try {
      const saved = localStorage.getItem('dame_prayed_prayers');
      return saved ? new Set(JSON.parse(saved)) : new Set();
    } catch {
      return new Set();
    }
  });

  // Charger le mur public
  const fetchPublicPrayers = async () => {
    setLoadingWall(true);
    try {
      const res = await fetch('/api/prayers/public');
      if (res.ok) {
        const data = await res.json();
        setPublicPrayers(data);
      }
    } catch (err) {
      console.warn('Erreur chargement mur prières:', err);
    } finally {
      setLoadingWall(false);
    }
  };

  useEffect(() => {
    if (activeTab === 'wall') {
      fetchPublicPrayers();
    }
  }, [activeTab]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.message.trim()) {
      setStatus({ type: 'error', message: 'Tanpri ekri entansyon oswa fado lapriyè ou a.' });
      return;
    }

    setLoading(true);
    setStatus({ type: 'idle', message: '' });

    try {
      const res = await fetch('/api/prayers', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData)
      });
      const data = await res.json();

      if (res.ok && data.success) {
        setStatus({ type: 'success', message: data.message });
        setFormData({
          category: 'Santé & Guérison',
          fullName: '',
          isAnonymous: false,
          phone: '',
          email: '',
          message: '',
          isUrgent: false,
          pastorOnly: true,
          requestCallback: false
        });
        // Si c'était public, recharger le mur
        if (!formData.pastorOnly) {
          fetchPublicPrayers();
        }
      } else {
        setStatus({ type: 'error', message: data.error || 'Erè pandan voye demann priyè a.' });
      }
    } catch {
      setStatus({
        type: 'error',
        message: 'Pa kapab kontakte sèvè a. Ou mèt kontakte Pasteur Bequel CHERELUS dirèkteman sou WhatsApp (+509 48596089).'
      });
    } finally {
      setLoading(false);
    }
  };

  const handlePrayFor = async (id: string) => {
    if (prayedIds.has(id)) return;

    // Optimistic UI update
    setPublicPrayers(prev => prev.map(p => p.id === id ? { ...p, amenCount: (p.amenCount || 0) + 1 } : p));
    const nextSet = new Set(prayedIds).add(id);
    setPrayedIds(nextSet);
    try {
      localStorage.setItem('dame_prayed_prayers', JSON.stringify(Array.from(nextSet)));
      await fetch(`/api/prayers/${id}/pray`, { method: 'POST' });
    } catch (e) {
      console.warn('Erreur incrément prière:', e);
    }
  };

  const filteredPrayers = publicPrayers.filter(p => {
    if (filterCategory === 'all') return true;
    return p.category === filterCategory;
  });

  const whatsappMessage = encodeURIComponent(
    `Bonjour Pasteur Bequel CHERELUS,\n\nJe vous contacte depuis le site officiel de l'Église du Nazaréen de Damé pour vous confier une requête de prière personnelle et fraternelle.\n\n« Sainteté à l'Éternel »`
  );

  return (
    <div className="space-y-12 pb-20">
      <SEOHead
        title="Espas Demann Priyè Sekrè & Mi Lapriyè | Église du Nazaréen de Damé"
        description="Konfye demann priyè w yo an sekrè bay Pasteur Bequel CHERELUS ak ekip pastoral la. Intercession fraternelle, prière pour les malades et communion spirituelle à Damé, Haïti."
        path="/priere"
      />

      {/* Hero Header */}
      <section className="bg-gradient-to-b from-[#071322] via-[#0b1b33] to-[#071322] text-white py-16 px-4 border-b border-amber-500/20 relative overflow-hidden">
        <div className="absolute inset-0 opacity-10 bg-[radial-gradient(#f59e0b_1px,transparent_1px)] [background-size:16px_16px] pointer-events-none" />

        <div className="max-w-4xl mx-auto text-center space-y-4 relative z-10">
          <div className="inline-flex items-center space-x-2 px-3.5 py-1 rounded-full bg-amber-500/10 border border-amber-400/30 text-amber-300 text-xs font-bold uppercase tracking-widest">
            <Lock className="w-3.5 h-3.5" />
            <span>Espas Lapriyè Sekrè &amp; Entècesyon Pastorale</span>
          </div>

          <h1 className="font-serif text-3xl sm:text-5xl font-extrabold text-white tracking-tight">
            Requêtes de Prière &amp; Espas Priyè Sekrè
          </h1>

          <p className="text-slate-300 text-base sm:text-lg max-w-2xl mx-auto leading-relaxed">
            « Lapriyè moun k’ap mache dwat devan Bondye gen anpil pouvwa lè l’ap lapriyè. » <span className="text-amber-400 font-serif italic">(Jak 5:16)</span>
            <br />
            Konfye fado ou yo nan tout sekirite ak konfidansyèlite bay Pasteur Bequel CHERELUS ak ekip lapriyè legliz la.
          </p>

          {/* Navigation Tabs */}
          <div className="pt-6 flex flex-wrap items-center justify-center gap-2">
            <button
              onClick={() => setActiveTab('form')}
              className={`px-5 py-2.5 rounded-xl text-xs font-bold transition flex items-center space-x-2 ${
                activeTab === 'form'
                  ? 'bg-amber-500 text-slate-950 shadow-lg shadow-amber-500/20'
                  : 'bg-slate-800 text-slate-300 hover:bg-slate-700 hover:text-white border border-slate-700'
              }`}
            >
              <Lock className="w-4 h-4" />
              <span>Voye yon Demann Priyè Sekrè</span>
            </button>

            <button
              onClick={() => setActiveTab('wall')}
              className={`px-5 py-2.5 rounded-xl text-xs font-bold transition flex items-center space-x-2 ${
                activeTab === 'wall'
                  ? 'bg-amber-500 text-slate-950 shadow-lg shadow-amber-500/20'
                  : 'bg-slate-800 text-slate-300 hover:bg-slate-700 hover:text-white border border-slate-700'
              }`}
            >
              <Users className="w-4 h-4" />
              <span>Mi Lapriyè Kominotè ({publicPrayers.length})</span>
            </button>

            <button
              onClick={() => setActiveTab('whatsapp')}
              className={`px-5 py-2.5 rounded-xl text-xs font-bold transition flex items-center space-x-2 ${
                activeTab === 'whatsapp'
                  ? 'bg-emerald-500 text-slate-950 shadow-lg shadow-emerald-500/20 font-bold'
                  : 'bg-slate-800 text-emerald-400 hover:bg-slate-700 border border-slate-700'
              }`}
            >
              <MessageSquare className="w-4 h-4" />
              <span>Liy WhatsApp Pasteur Bequel</span>
            </button>
          </div>
        </div>
      </section>

      {/* Main Content Area */}
      <section className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* TAB 1: FORMULAIRE DE DEMANDE DE PRIERE */}
        {activeTab === 'form' && (
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
            {/* Sidebar Informations de Confidentialité */}
            <div className="lg:col-span-4 space-y-6">
              <div className="bg-slate-900 rounded-3xl p-6 text-white border border-amber-500/30 shadow-xl space-y-4">
                <div className="w-12 h-12 rounded-2xl bg-amber-500/20 border border-amber-400/40 flex items-center justify-center text-amber-400">
                  <ShieldCheck className="w-6 h-6" />
                </div>
                <h3 className="font-serif font-bold text-lg text-amber-300">
                  Garanti 100% Konfidansyèl
                </h3>
                <p className="text-xs text-slate-300 leading-relaxed">
                  Lè ou chwazi opsyon <strong>« Sekrè Pastoral »</strong>, se sèlman Pasteur Bequel CHERELUS ak ekip entècesyon ofisyèl la ki gen aksè a entansyon ou a. Anyen pa pibliye sou entènèt.
                </p>
                <div className="pt-2 border-t border-slate-800 space-y-2 text-xs text-slate-400">
                  <div className="flex items-center space-x-2">
                    <CheckCircle2 className="w-3.5 h-3.5 text-amber-400 flex-shrink-0" />
                    <span>Lapriyè chak madi nan reyinyon entècesyon</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <CheckCircle2 className="w-3.5 h-3.5 text-amber-400 flex-shrink-0" />
                    <span>Posibilite pou rete totalman anonim</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <CheckCircle2 className="w-3.5 h-3.5 text-amber-400 flex-shrink-0" />
                    <span>Swivi pastoral sou demann ou</span>
                  </div>
                </div>
              </div>

              {/* Verset Biblique */}
              <div className="bg-gradient-to-br from-amber-50 to-amber-100/60 rounded-3xl p-6 border border-amber-200 shadow-sm space-y-2">
                <div className="flex items-center space-x-2 text-amber-800 font-bold text-xs uppercase tracking-wider">
                  <BookOpen className="w-4 h-4 text-amber-600" />
                  <span>Pwomès Biblik</span>
                </div>
                <p className="text-xs italic text-slate-700 leading-relaxed font-serif">
                  « Pa enkyete nou pou anyen. Men, nan tout sikonstans, mande Bondye sa nou bezwen nan lapriyè ak siplikasyon, ansanm ak aksyon de gras. »
                </p>
                <p className="text-[11px] font-bold text-amber-900 text-right">
                  — Filipyen 4:6
                </p>
              </div>
            </div>

            {/* Formulaire Principal */}
            <div className="lg:col-span-8 bg-white rounded-3xl p-6 sm:p-10 shadow-xl border border-slate-200">
              <form onSubmit={handleSubmit} className="space-y-6">
                <div>
                  <h2 className="text-xl font-serif font-bold text-slate-900">
                    Fòmilè Demann Priyè Sekrè &amp; Entècesyon
                  </h2>
                  <p className="text-xs text-slate-500 mt-1">
                    Konfye tout sa k’ap peze kè w. Bondye tande epi Li reponn lapriyè pitit Li yo nan Damé.
                  </p>
                </div>

                {status.type !== 'idle' && (
                  <div
                    className={`p-4 rounded-2xl flex items-start space-x-3 text-xs leading-relaxed animate-in fade-in ${
                      status.type === 'success'
                        ? 'bg-emerald-50 text-emerald-900 border border-emerald-300'
                        : 'bg-rose-50 text-rose-900 border border-rose-300'
                    }`}
                  >
                    {status.type === 'success' ? (
                      <CheckCircle2 className="w-5 h-5 text-emerald-600 flex-shrink-0 mt-0.5" />
                    ) : (
                      <AlertCircle className="w-5 h-5 text-rose-600 flex-shrink-0 mt-0.5" />
                    )}
                    <div>
                      <p className="font-bold">{status.type === 'success' ? 'Demann Transmèt ak Siksè !' : 'Atansyon'}</p>
                      <p>{status.message}</p>
                    </div>
                  </div>
                )}

                {/* Niveau de Confidentialité */}
                <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 space-y-3">
                  <label className="block text-xs font-bold text-slate-800 uppercase tracking-wide">
                    Ki nivo konfidansyèlite ou swete ?
                  </label>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <button
                      type="button"
                      onClick={() => setFormData({ ...formData, pastorOnly: true })}
                      className={`p-3.5 rounded-xl border text-left transition flex items-start space-x-3 ${
                        formData.pastorOnly
                          ? 'bg-amber-50 border-amber-500 text-slate-900 ring-2 ring-amber-400/40'
                          : 'bg-white border-slate-200 text-slate-600 hover:border-slate-300'
                      }`}
                    >
                      <Lock className={`w-4 h-4 mt-0.5 ${formData.pastorOnly ? 'text-amber-600' : 'text-slate-400'}`} />
                      <div>
                        <span className="block text-xs font-bold">Sekrè Pastoral (100% Konfidansyèl)</span>
                        <span className="block text-[11px] text-slate-500">Pou Pasteur ak ekip priyè a sèlman. Pa janm parèt piblik.</span>
                      </div>
                    </button>

                    <button
                      type="button"
                      onClick={() => setFormData({ ...formData, pastorOnly: false })}
                      className={`p-3.5 rounded-xl border text-left transition flex items-start space-x-3 ${
                        !formData.pastorOnly
                          ? 'bg-amber-50 border-amber-500 text-slate-900 ring-2 ring-amber-400/40'
                          : 'bg-white border-slate-200 text-slate-600 hover:border-slate-300'
                      }`}
                    >
                      <Users className={`w-4 h-4 mt-0.5 ${!formData.pastorOnly ? 'text-amber-600' : 'text-slate-400'}`} />
                      <div>
                        <span className="block text-xs font-bold">Piblik sou Mi Lapriyè Kominotè</span>
                        <span className="block text-[11px] text-slate-500">Tout manm legliz la ka wè entansyon an epi klike « Mwen Priye ».</span>
                      </div>
                    </button>
                  </div>
                </div>

                {/* Catégorie */}
                <div className="space-y-1.5">
                  <label className="block text-xs font-bold text-slate-700 uppercase tracking-wide">
                    Kategori oswa Domèn Priyè a
                  </label>
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                    {PRAYER_CATEGORIES.map(cat => (
                      <button
                        key={cat.id}
                        type="button"
                        onClick={() => setFormData({ ...formData, category: cat.id })}
                        className={`p-2.5 rounded-xl border text-xs font-semibold text-left transition flex items-center space-x-2 ${
                          formData.category === cat.id
                            ? 'bg-amber-500 text-slate-950 border-amber-600 shadow-sm'
                            : 'bg-white border-slate-200 text-slate-700 hover:bg-slate-50'
                        }`}
                      >
                        <span className="text-base">{cat.icon}</span>
                        <span className="truncate">{cat.label}</span>
                      </button>
                    ))}
                  </div>
                </div>

                {/* Option Anonyme */}
                <div className="flex items-center justify-between p-3 rounded-xl bg-slate-50 border border-slate-200">
                  <div>
                    <span className="block text-xs font-bold text-slate-800">Mwen vle rete anonim</span>
                    <span className="block text-[11px] text-slate-500">Non ou pap parèt ditou, menm si priyè a piblik.</span>
                  </div>
                  <input
                    type="checkbox"
                    checked={formData.isAnonymous}
                    onChange={(e) => setFormData({ ...formData, isAnonymous: e.target.checked })}
                    className="w-4 h-4 text-amber-500 rounded border-slate-300 focus:ring-amber-400 cursor-pointer"
                  />
                </div>

                {/* Coordonnées */}
                {!formData.isAnonymous && (
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div className="space-y-1">
                      <label className="block text-xs font-bold text-slate-700">
                        Non &amp; Prenon ou
                      </label>
                      <input
                        type="text"
                        placeholder="Ex : Frè Jean Pierre"
                        value={formData.fullName}
                        onChange={(e) => setFormData({ ...formData, fullName: e.target.value })}
                        className="w-full px-3.5 py-2.5 text-xs rounded-xl border border-slate-300 focus:outline-none focus:border-amber-500"
                      />
                    </div>

                    <div className="space-y-1">
                      <label className="block text-xs font-bold text-slate-700">
                        Nimewo WhatsApp / Telefòn (Opsyonèl)
                      </label>
                      <input
                        type="tel"
                        placeholder="Ex : +509 48596089"
                        value={formData.phone}
                        onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                        className="w-full px-3.5 py-2.5 text-xs rounded-xl border border-slate-300 focus:outline-none focus:border-amber-500"
                      />
                    </div>
                  </div>
                )}

                {/* Message Prière */}
                <div className="space-y-1.5">
                  <div className="flex items-center justify-between">
                    <label className="block text-xs font-bold text-slate-700 uppercase tracking-wide">
                      Deskripsyon Fado ou Entansyon Priyè a *
                    </label>
                    <span className="text-[10px] text-slate-400 font-mono">
                      {formData.message.length} karaktè
                    </span>
                  </div>
                  <textarea
                    rows={5}
                    required
                    placeholder="Ekri sa ki nan kè w : yon malad ki bezwen gerizon, yon sitiyasyon fanmi, yon konba espirityèl, yon travay, oswa yon bèl temwayaj rekonesans..."
                    value={formData.message}
                    onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                    className="w-full p-4 text-xs rounded-2xl border border-slate-300 focus:outline-none focus:border-amber-500 leading-relaxed font-sans"
                  />
                </div>

                {/* Options complémentaires : Urgence & Rappel */}
                <div className="space-y-2 pt-2">
                  <label className="flex items-center space-x-2.5 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={formData.isUrgent}
                      onChange={(e) => setFormData({ ...formData, isUrgent: e.target.checked })}
                      className="w-4 h-4 text-rose-500 rounded border-slate-300 focus:ring-rose-400 cursor-pointer"
                    />
                    <span className="text-xs font-semibold text-rose-700 flex items-center space-x-1">
                      <Flame className="w-3.5 h-3.5 text-rose-500" />
                      <span>Sitiyasyon Ijan (Bezwen entècesyon imedya jodi a menm)</span>
                    </span>
                  </label>

                  <label className="flex items-center space-x-2.5 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={formData.requestCallback}
                      onChange={(e) => setFormData({ ...formData, requestCallback: e.target.checked })}
                      className="w-4 h-4 text-amber-500 rounded border-slate-300 focus:ring-amber-400 cursor-pointer"
                    />
                    <span className="text-xs font-semibold text-slate-700">
                      Mwen ta renmen resevwa yon apèl oswa mesaj WhatsApp nan men Pasteur Bequel CHERELUS.
                    </span>
                  </label>
                </div>

                {/* Bouton de soumission */}
                <div className="pt-4 flex flex-col sm:flex-row items-center justify-between gap-4">
                  <button
                    type="submit"
                    disabled={loading}
                    className="w-full sm:w-auto px-8 py-3.5 rounded-xl text-xs font-bold uppercase tracking-wider bg-amber-500 text-slate-950 hover:bg-amber-400 transition shadow-lg shadow-amber-500/20 flex items-center justify-center space-x-2 disabled:opacity-50"
                  >
                    {loading ? (
                      <>
                        <Loader2 className="w-4 h-4 animate-spin" />
                        <span>Transmisyon an kou...</span>
                      </>
                    ) : (
                      <>
                        <Send className="w-4 h-4" />
                        <span>Voye Demann Priyè a bay Pasteur a</span>
                      </>
                    )}
                  </button>

                  <button
                    type="button"
                    onClick={() => onNavigate('/evenements')}
                    className="text-xs font-bold text-amber-700 hover:text-amber-800 transition flex items-center space-x-1"
                  >
                    <CalendarPlus className="w-3.5 h-3.5" />
                    <span>Wè Kalandriye Reyinyon Priyè yo ›</span>
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* TAB 2: MUR DE PRIERE COMMUNAUTAIRE */}
        {activeTab === 'wall' && (
          <div className="space-y-8">
            {/* Header du Mur */}
            <div className="bg-white rounded-3xl p-6 sm:p-8 shadow-md border border-slate-200 flex flex-col md:flex-row items-center justify-between gap-4">
              <div>
                <h2 className="text-xl font-serif font-bold text-slate-900 flex items-center space-x-2">
                  <Users className="w-5 h-5 text-amber-500" />
                  <span>Mi Lapriyè Kominotè &amp; Entècesyon</span>
                </h2>
                <p className="text-xs text-slate-600 mt-1">
                  Pote fado youn lòt nan lapriyè. Klike sou <strong>« Mwen Priye Pou Sa »</strong> pou ankouraje yon frè oswa yon sè nan Kris la.
                </p>
              </div>

              <button
                onClick={() => setActiveTab('form')}
                className="px-4 py-2 rounded-xl text-xs font-bold bg-amber-500 text-slate-950 hover:bg-amber-400 transition shadow flex items-center space-x-1.5 flex-shrink-0"
              >
                <Lock className="w-3.5 h-3.5" />
                <span>Mete yon Priyè Sekrè</span>
              </button>
            </div>

            {/* Filtres par Catégorie */}
            <div className="flex flex-wrap items-center gap-2">
              <button
                onClick={() => setFilterCategory('all')}
                className={`px-3 py-1.5 rounded-xl text-xs font-bold transition ${
                  filterCategory === 'all'
                    ? 'bg-amber-500 text-slate-950'
                    : 'bg-white text-slate-700 hover:bg-slate-100 border border-slate-200'
                }`}
              >
                Tout Priyè yo ({publicPrayers.length})
              </button>
              {PRAYER_CATEGORIES.map(cat => (
                <button
                  key={cat.id}
                  onClick={() => setFilterCategory(cat.id)}
                  className={`px-3 py-1.5 rounded-xl text-xs font-bold transition flex items-center space-x-1 ${
                    filterCategory === cat.id
                      ? 'bg-amber-500 text-slate-950'
                      : 'bg-white text-slate-700 hover:bg-slate-100 border border-slate-200'
                  }`}
                >
                  <span>{cat.icon}</span>
                  <span>{cat.label}</span>
                </button>
              ))}
            </div>

            {/* Liste des Prières */}
            {loadingWall ? (
              <div className="py-20 text-center space-y-3">
                <Loader2 className="w-8 h-8 text-amber-500 animate-spin mx-auto" />
                <p className="text-xs text-slate-500 font-medium">Chajman entansyon lapriyè yo...</p>
              </div>
            ) : filteredPrayers.length === 0 ? (
              <div className="bg-white rounded-3xl p-12 text-center border border-slate-200 space-y-4">
                <div className="w-14 h-14 rounded-full bg-amber-50 flex items-center justify-center text-amber-500 mx-auto">
                  <Heart className="w-6 h-6" />
                </div>
                <h3 className="font-serif font-bold text-base text-slate-900">
                  Pa gen entansyon piblik nan kategori sa a pou kounye a
                </h3>
                <p className="text-xs text-slate-500 max-w-md mx-auto">
                  Ou kapab premye moun ki pataje yon entansyon lapriyè oswa yon temwayaj pou kominote a priye avèk ou.
                </p>
                <button
                  onClick={() => setActiveTab('form')}
                  className="px-5 py-2.5 rounded-xl text-xs font-bold bg-amber-500 text-slate-950 hover:bg-amber-400 transition"
                >
                  Pataje yon entansyon kounye a
                </button>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {filteredPrayers.map((prayer) => {
                  const hasPrayed = prayedIds.has(prayer.id);
                  return (
                    <div
                      key={prayer.id}
                      className="bg-white rounded-2xl p-6 shadow-md border border-slate-200 flex flex-col justify-between hover:border-amber-400 transition space-y-4"
                    >
                      <div className="space-y-3">
                        <div className="flex items-center justify-between">
                          <span className="inline-flex items-center space-x-1 text-[11px] font-bold px-2.5 py-0.5 rounded-full bg-amber-50 text-amber-800 border border-amber-200">
                            <span>{prayer.category}</span>
                          </span>

                          {prayer.isUrgent && (
                            <span className="inline-flex items-center space-x-1 text-[10px] font-bold px-2 py-0.5 rounded-full bg-rose-100 text-rose-700">
                              <Flame className="w-3 h-3 text-rose-600" />
                              <span>Ijan</span>
                            </span>
                          )}
                        </div>

                        <p className="text-xs text-slate-800 leading-relaxed italic bg-slate-50 p-3.5 rounded-xl border border-slate-100">
                          « {prayer.message} »
                        </p>
                      </div>

                      <div className="pt-2 border-t border-slate-100 flex items-center justify-between">
                        <div className="text-[11px] text-slate-500">
                          <span className="font-bold text-slate-700 block">
                            {prayer.isAnonymous ? 'Frè / Sè Anonyme' : prayer.fullName}
                          </span>
                          <span className="text-[10px] text-slate-400 font-mono">
                            {new Date(prayer.createdAt).toLocaleDateString('fr-HT', {
                              day: 'numeric',
                              month: 'short',
                              year: 'numeric'
                            })}
                          </span>
                        </div>

                        {/* Bouton Mwen Priye Pou Sa */}
                        <button
                          onClick={() => handlePrayFor(prayer.id)}
                          className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition flex items-center space-x-1.5 ${
                            hasPrayed
                              ? 'bg-amber-100 text-amber-800 border border-amber-300'
                              : 'bg-slate-900 text-amber-400 hover:bg-amber-500 hover:text-slate-950 shadow-sm'
                          }`}
                          title="Cliquez pour indiquer que vous avez prié pour ce fardeau"
                        >
                          <Heart className={`w-3.5 h-3.5 ${hasPrayed ? 'fill-amber-600 text-amber-600' : 'text-amber-400'}`} />
                          <span>{hasPrayed ? 'Ou Priye Pou Sa' : 'Mwen Priye Pou Sa'}</span>
                          <span className="ml-1 px-1.5 py-0.2 rounded-full text-[10px] bg-amber-400/20 font-bold">
                            {prayer.amenCount || 0}
                          </span>
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        )}

        {/* TAB 3: CONTACT DIRECT WHATSAPP AVEC LE PASTEUR */}
        {activeTab === 'whatsapp' && (
          <div className="bg-slate-900 text-white rounded-3xl p-8 sm:p-12 border border-amber-500/30 shadow-2xl max-w-2xl mx-auto space-y-6 text-center">
            <div className="w-16 h-16 rounded-full bg-emerald-500/20 border border-emerald-400/40 flex items-center justify-center text-emerald-400 mx-auto">
              <MessageSquare className="w-8 h-8" />
            </div>

            <div className="space-y-2">
              <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider bg-emerald-500/10 text-emerald-300 border border-emerald-500/30">
                Liy Priyè Dirèk &amp; Konsèy Pastoral
              </span>
              <h2 className="text-2xl sm:text-3xl font-serif font-bold text-white">
                Priye Dirèkteman sou WhatsApp ak Pasteur Bequel CHERELUS
              </h2>
              <p className="text-xs sm:text-sm text-slate-300 max-w-lg mx-auto leading-relaxed">
                Si ou nan yon sitiyasyon ijan oswa ou bezwen yon priyè vokal dirèk ak konsèy pastoral, Pasteur Bequel CHERELUS disponib pou koute w ak renmen Kris la.
              </p>
            </div>

            <div className="p-4 rounded-2xl bg-slate-950 border border-slate-800 text-xs space-y-2">
              <div className="flex items-center justify-center space-x-2 text-amber-400 font-bold">
                <Phone className="w-4 h-4" />
                <span>Telefòn &amp; WhatsApp : +509 48596089</span>
              </div>
              <p className="text-slate-400 text-[11px]">
                Église du Nazaréen de Damé – 3ème Section Damé, Commune de Môle-Saint-Nicolas, Haïti
              </p>
            </div>

            <div className="pt-2 flex flex-col sm:flex-row items-center justify-center gap-3">
              <a
                href={`https://wa.me/50948596089?text=${whatsappMessage}`}
                target="_blank"
                rel="noopener noreferrer"
                className="w-full sm:w-auto px-8 py-3.5 rounded-xl text-xs font-bold uppercase tracking-wider bg-emerald-500 text-slate-950 hover:bg-emerald-400 transition shadow-lg shadow-emerald-500/20 flex items-center justify-center space-x-2"
              >
                <MessageSquare className="w-4 h-4" />
                <span>Louvri WhatsApp Pou Priye Kounye a</span>
              </a>

              <a
                href="tel:+50948596089"
                className="w-full sm:w-auto px-6 py-3.5 rounded-xl text-xs font-bold uppercase tracking-wider bg-slate-800 text-white hover:bg-slate-700 transition border border-slate-700 flex items-center justify-center space-x-2"
              >
                <Phone className="w-4 h-4 text-amber-400" />
                <span>Rele pa Telefòn</span>
              </a>
            </div>
          </div>
        )}
      </section>
    </div>
  );
};
