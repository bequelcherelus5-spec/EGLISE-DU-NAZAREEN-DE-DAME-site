import React, { useState, useEffect } from 'react';
import { SEOHead } from '../components/SEOHead';
import { 
  Sparkles, 
  Heart, 
  MessageSquare, 
  ThumbsUp, 
  PlusCircle, 
  MapPin, 
  Calendar, 
  Send, 
  CheckCircle2, 
  AlertCircle, 
  Loader2, 
  X,
  Share2
} from 'lucide-react';

export interface Testimony {
  id: string;
  authorName: string;
  location?: string;
  title: string;
  content: string;
  category: 'guerison' | 'delivrance' | 'provision' | 'famille' | 'autre';
  status: 'pending' | 'approved' | 'rejected';
  createdAt: string;
  likesCount?: number;
}

export const Testimonies: React.FC<{ onNavigate: (path: string) => void }> = ({ onNavigate }) => {
  const [testimonies, setTestimonies] = useState<Testimony[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [likedIds, setLikedIds] = useState<string[]>([]);

  // Form state
  const [formData, setFormData] = useState({
    authorName: '',
    location: '3ème Section Damé',
    title: '',
    content: '',
    category: 'guerison' as Testimony['category']
  });
  const [submitting, setSubmitting] = useState(false);
  const [statusMsg, setStatusMsg] = useState<{ type: 'idle' | 'success' | 'error'; text: string }>({
    type: 'idle',
    text: ''
  });

  const fetchTestimonies = () => {
    fetch('/api/testimonies')
      .then(res => res.json())
      .then(data => {
        if (Array.isArray(data)) setTestimonies(data);
      })
      .catch(err => console.warn('Erreur chargement témoignages:', err))
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    fetchTestimonies();
  }, []);

  const handleLike = async (id: string) => {
    if (likedIds.includes(id)) return;
    try {
      const res = await fetch(`/api/testimonies/${id}/like`, { method: 'POST' });
      const data = await res.json();
      if (data.success) {
        setTestimonies(prev => prev.map(t => t.id === id ? { ...t, likesCount: data.likesCount } : t));
        setLikedIds(prev => [...prev, id]);
      }
    } catch (e) {
      console.warn('Like error:', e);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.authorName.trim() || !formData.title.trim() || !formData.content.trim()) {
      setStatusMsg({ type: 'error', text: 'Tanpri ranpli tout chan obligatwa yo.' });
      return;
    }

    setSubmitting(true);
    setStatusMsg({ type: 'idle', text: '' });

    try {
      const res = await fetch('/api/testimonies', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData)
      });
      const data = await res.json();
      if (res.ok && data.success) {
        setStatusMsg({ type: 'success', text: data.message });
        setFormData({
          authorName: '',
          location: '3ème Section Damé',
          title: '',
          content: '',
          category: 'guerison'
        });
        setTimeout(() => {
          setIsModalOpen(false);
          setStatusMsg({ type: 'idle', text: '' });
        }, 3000);
      } else {
        setStatusMsg({ type: 'error', text: data.error || 'Erè pandan anrejistreman temwayaj la.' });
      }
    } catch {
      setStatusMsg({ type: 'error', text: 'Erè koneksyon ak sèvè a.' });
    } finally {
      setSubmitting(false);
    }
  };

  const handleShareWhatsApp = (t: Testimony) => {
    const text = encodeURIComponent(
      `🙌 *Temwayaj Gras Bondye – Église du Nazaréen de Damé*\n\n« ${t.title} »\n\n_${t.content}_\n\n— *${t.authorName}* (${t.location || 'Damé'})\n\nLi lòt temwayaj sou sit legliz la : ${window.location.origin}/temwayaj\n« Sainteté à l'Éternel »`
    );
    window.open(`https://api.whatsapp.com/send?text=${text}`, '_blank');
  };

  const filtered = testimonies.filter(t => {
    if (selectedCategory === 'all') return true;
    return t.category === selectedCategory;
  });

  const categoryLabels: Record<string, string> = {
    guerison: 'Gerizon Mirakile',
    delivrance: 'Delivrans Espirityèl',
    provision: 'Pwovizyon & Finans',
    famille: 'Restorasyon Fanmi',
    autre: 'Lòt Gras Bondye'
  };

  return (
    <div className="space-y-12 pb-20">
      <SEOHead
        title="Temwayaj Gras Bondye | Église du Nazaréen de Damé"
        description="Dekouvri bèl temwayaj gerizon, delivrans ak favè Bondye nan lavi manm Église du Nazaréen de Damé, Haïti. Pataje temwayaj pa w pou glorifye Jezikri."
        path="/temwayaj"
      />

      {/* Header */}
      <section className="bg-gradient-to-b from-[#071322] to-[#0b1b33] text-white py-16 px-4 border-b border-amber-500/20">
        <div className="max-w-4xl mx-auto text-center space-y-4">
          <div className="inline-flex items-center space-x-2 px-3.5 py-1 rounded-full bg-amber-500/10 border border-amber-400/30 text-amber-300 text-xs font-bold uppercase tracking-widest">
            <Sparkles className="w-3.5 h-3.5" />
            <span>Rekonesans &amp; Bèl Zèv Bondye</span>
          </div>

          <h1 className="font-serif text-3xl sm:text-5xl font-extrabold text-white">
            Temwayaj Gras Bondye (Mur des Témoignages)
          </h1>

          <p className="text-slate-300 text-base sm:text-lg max-w-2xl mx-auto leading-relaxed">
            « Yo te venk li grasa san Ti Mouton an ak grasa pawòl temwayaj yo. » <span className="text-amber-400 italic font-serif">(Apokalips 12:11)</span>
            <br />
            Lè Bondye fè yon mirak nan lavi w, pa kenbe l sekrè — pataje l pou fòtifye lafwa frè ak sè w yo!
          </p>

          <div className="pt-3 flex flex-wrap items-center justify-center gap-3">
            <button
              onClick={() => setIsModalOpen(true)}
              className="px-6 py-3 rounded-xl font-bold text-xs bg-amber-500 text-slate-950 hover:bg-amber-400 transition shadow-lg shadow-amber-500/20 flex items-center space-x-2"
            >
              <PlusCircle className="w-4 h-4" />
              <span>Depoze Temwayaj Pa w la</span>
            </button>

            <button
              onClick={() => onNavigate('/priere')}
              className="px-6 py-3 rounded-xl font-bold text-xs bg-slate-800 text-slate-200 hover:bg-slate-700 transition flex items-center space-x-2 border border-slate-700"
            >
              <Heart className="w-4 h-4 text-rose-400" />
              <span>Espas Demann Priyè Sekrè</span>
            </button>
          </div>
        </div>
      </section>

      {/* Categories Filter */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-wrap items-center justify-center gap-2 border-b border-slate-200 pb-6">
          {[
            { id: 'all', label: 'Tout Temwayaj yo' },
            { id: 'guerison', label: 'Gerizon' },
            { id: 'delivrance', label: 'Delivrans' },
            { id: 'provision', label: 'Pwovizyon' },
            { id: 'famille', label: 'Fanmi' },
            { id: 'autre', label: 'Lòt Gras' }
          ].map(tab => (
            <button
              key={tab.id}
              onClick={() => setSelectedCategory(tab.id)}
              className={`px-4 py-2 rounded-xl text-xs font-bold transition ${
                selectedCategory === tab.id
                  ? 'bg-amber-500 text-slate-950 shadow-md'
                  : 'bg-white text-slate-700 hover:bg-slate-100 border border-slate-200'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* Grid of Testimonies */}
        <div className="mt-8">
          {loading ? (
            <div className="py-20 text-center">
              <Loader2 className="w-8 h-8 animate-spin text-amber-500 mx-auto" />
              <p className="text-xs text-slate-500 mt-2 font-mono">Chajman temwayaj yo...</p>
            </div>
          ) : filtered.length === 0 ? (
            <div className="py-16 text-center bg-white rounded-3xl border border-dashed border-slate-300 p-8">
              <Sparkles className="w-12 h-12 text-amber-400 mx-auto mb-3 opacity-60" />
              <h3 className="font-serif font-bold text-slate-800 text-base">Pa gen temwayaj nan kategori sa a pou kounye a.</h3>
              <p className="text-xs text-slate-500 mt-1">Fè premye pa a epi pataje sa Senyè a fè pou ou!</p>
              <button
                onClick={() => setIsModalOpen(true)}
                className="mt-4 px-5 py-2.5 rounded-xl text-xs font-bold bg-amber-500 text-slate-950 hover:bg-amber-400 transition"
              >
                Pataje yon Temwayaj
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filtered.map(t => (
                <div 
                  key={t.id}
                  className="bg-white rounded-3xl p-6 sm:p-7 shadow-lg border border-slate-200/90 flex flex-col justify-between hover:shadow-xl hover:border-amber-400/40 transition-all group"
                >
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <span className="text-[10px] font-bold uppercase tracking-wider px-2.5 py-1 rounded-full bg-amber-100 text-amber-800 border border-amber-200">
                        {categoryLabels[t.category] || t.category}
                      </span>
                      <span className="text-[11px] text-slate-400 font-mono">
                        {new Date(t.createdAt).toLocaleDateString('fr-HT', { day: 'numeric', month: 'short' })}
                      </span>
                    </div>

                    <h3 className="font-serif font-bold text-slate-900 text-base leading-snug group-hover:text-amber-800 transition">
                      « {t.title} »
                    </h3>

                    <p className="text-xs text-slate-600 leading-relaxed italic bg-slate-50 p-3.5 rounded-2xl border border-slate-100">
                      "{t.content}"
                    </p>
                  </div>

                  <div className="pt-4 mt-4 border-t border-slate-100 flex items-center justify-between">
                    <div>
                      <span className="block text-xs font-bold text-slate-900">
                        {t.authorName}
                      </span>
                      <span className="text-[11px] text-slate-400 flex items-center space-x-1">
                        <MapPin className="w-3 h-3 text-amber-500" />
                        <span>{t.location || 'Damé'}</span>
                      </span>
                    </div>

                    <div className="flex items-center space-x-2">
                      <button
                        onClick={() => handleLike(t.id)}
                        className={`inline-flex items-center space-x-1 px-3 py-1.5 rounded-full text-xs font-bold transition border ${
                          likedIds.includes(t.id)
                            ? 'bg-rose-50 text-rose-600 border-rose-200'
                            : 'bg-slate-50 hover:bg-rose-50 text-slate-600 hover:text-rose-600 border-slate-200'
                        }`}
                        title="Rann Bondye Glwa pou sa !"
                      >
                        <Heart className={`w-3.5 h-3.5 ${likedIds.includes(t.id) ? 'fill-rose-500 text-rose-500' : ''}`} />
                        <span>{t.likesCount || 0}</span>
                      </button>

                      <button
                        onClick={() => handleShareWhatsApp(t)}
                        className="p-1.5 rounded-full bg-emerald-50 hover:bg-emerald-100 text-emerald-700 transition"
                        title="Pataje sou WhatsApp"
                      >
                        <Share2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </section>

      {/* Modal Depoze Temwayaj */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 bg-slate-950/70 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-lg w-full p-6 sm:p-8 shadow-2xl border border-slate-200 space-y-5 animate-in zoom-in-95">
            <div className="flex items-center justify-between border-b pb-3">
              <div className="flex items-center space-x-2">
                <Sparkles className="w-5 h-5 text-amber-500" />
                <h3 className="font-serif font-bold text-slate-900 text-lg">
                  Depoze Temwayaj Gras Bondye
                </h3>
              </div>
              <button 
                onClick={() => setIsModalOpen(false)}
                className="p-1 text-slate-400 hover:text-slate-700 rounded-lg"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4 text-xs">
              <div>
                <label className="block font-bold text-slate-700 mb-1">Non ou / Siyati *</label>
                <input
                  type="text"
                  required
                  placeholder="Ex : Sè Marie / Frè Jean"
                  value={formData.authorName}
                  onChange={e => setFormData({ ...formData, authorName: e.target.value })}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 focus:outline-none focus:border-amber-400"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Vil / Zòn ou ye</label>
                  <input
                    type="text"
                    placeholder="Ex : 3èm Seksyon Damé, Mòl"
                    value={formData.location}
                    onChange={e => setFormData({ ...formData, location: e.target.value })}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 focus:outline-none focus:border-amber-400"
                  />
                </div>

                <div>
                  <label className="block font-bold text-slate-700 mb-1">Kategori Mirak la</label>
                  <select
                    value={formData.category}
                    onChange={e => setFormData({ ...formData, category: e.target.value as any })}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 focus:outline-none focus:border-amber-400 bg-white"
                  >
                    <option value="guerison">Gerizon Mirakile</option>
                    <option value="delivrance">Delivrans</option>
                    <option value="provision">Pwovizyon & Finans</option>
                    <option value="famille">Restorasyon Fanmi</option>
                    <option value="autre">Lòt Favè</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">Tit Temwayaj la *</label>
                <input
                  type="text"
                  required
                  placeholder="Ex : Kijan Jezi te libere m nan lopital la"
                  value={formData.title}
                  onChange={e => setFormData({ ...formData, title: e.target.value })}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 focus:outline-none focus:border-amber-400"
                />
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">Detay sou sa Bondye fè pou ou a *</label>
                <textarea
                  rows={4}
                  required
                  placeholder="Eksplike kijan sitiyasyon an te ye, kijan lapriyè te fèt, ak kòman Bondye te manifeste pouvwa Li..."
                  value={formData.content}
                  onChange={e => setFormData({ ...formData, content: e.target.value })}
                  className="w-full p-3 rounded-xl border border-slate-300 focus:outline-none focus:border-amber-400 leading-relaxed"
                />
              </div>

              {statusMsg.type === 'success' && (
                <div className="p-3 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-800 flex items-center space-x-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600 flex-shrink-0" />
                  <span>{statusMsg.text}</span>
                </div>
              )}

              {statusMsg.type === 'error' && (
                <div className="p-3 rounded-xl bg-rose-50 border border-rose-200 text-rose-800 flex items-center space-x-2">
                  <AlertCircle className="w-4 h-4 text-rose-600 flex-shrink-0" />
                  <span>{statusMsg.text}</span>
                </div>
              )}

              <div className="pt-2 flex items-center justify-end space-x-2">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2 rounded-xl text-slate-600 hover:bg-slate-100 font-bold"
                >
                  Anile
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="px-5 py-2.5 rounded-xl font-bold bg-amber-500 text-slate-950 hover:bg-amber-400 transition flex items-center space-x-2 shadow-md disabled:opacity-50"
                >
                  {submitting ? (
                    <>
                      <Loader2 className="w-3.5 h-3.5 animate-spin" />
                      <span>Anrejistreman...</span>
                    </>
                  ) : (
                    <>
                      <Send className="w-3.5 h-3.5" />
                      <span>Voye Temwayaj la</span>
                    </>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
