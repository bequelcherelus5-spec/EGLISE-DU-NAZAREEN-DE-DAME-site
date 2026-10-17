import React, { useState, useEffect } from 'react';
import { 
  Sparkles, 
  Check, 
  X, 
  Trash2, 
  ExternalLink, 
  Heart, 
  MapPin, 
  CheckCircle2, 
  AlertCircle, 
  Loader2,
  Share2
} from 'lucide-react';
import { Testimony } from '../../pages/Testimonies';

export const TestimoniesManager: React.FC<{ onNavigate: (path: string) => void }> = ({ onNavigate }) => {
  const [testimonies, setTestimonies] = useState<Testimony[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<'all' | 'pending' | 'approved' | 'rejected'>('all');

  const fetchTestimonies = () => {
    fetch('/api/testimonies?admin=true')
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

  const handleUpdateStatus = async (id: string, status: 'approved' | 'rejected') => {
    try {
      const res = await fetch(`/api/testimonies/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status })
      });
      if (res.ok) {
        setTestimonies(prev => prev.map(t => t.id === id ? { ...t, status } : t));
      }
    } catch {
      alert('Erè pandan mizajou estati temwayaj la.');
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Èske w vle efase temwayaj sa a nèt ?')) return;
    try {
      const res = await fetch(`/api/testimonies/${id}`, { method: 'DELETE' });
      if (res.ok) {
        setTestimonies(prev => prev.filter(t => t.id !== id));
      }
    } catch {
      alert('Erè efasman.');
    }
  };

  const filtered = testimonies.filter(t => {
    if (filter === 'all') return true;
    return t.status === filter;
  });

  return (
    <div className="space-y-6">
      {/* Header bar */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 bg-white p-6 rounded-3xl border border-slate-200 shadow-sm">
        <div>
          <div className="inline-flex items-center space-x-1.5 px-3 py-1 rounded-full bg-amber-500/10 text-amber-700 text-xs font-bold uppercase tracking-wider mb-2">
            <Sparkles className="w-3.5 h-3.5" />
            <span>Opsyon 5 : Temwayaj Gras Bondye</span>
          </div>
          <h2 className="font-serif text-2xl font-bold text-slate-900">
            Valide &amp; Jere Temwayaj Fidèl yo
          </h2>
          <p className="text-xs text-slate-500 mt-1">
            Revize temwayaj manm yo soumèt, valide yo anvan yo parèt sou sit la pou glorifye Bondye.
          </p>
        </div>

        <button
          onClick={() => onNavigate('/temwayaj')}
          className="px-4 py-2.5 rounded-xl text-xs font-bold bg-slate-100 text-slate-700 hover:bg-slate-200 transition flex items-center space-x-1.5"
        >
          <ExternalLink className="w-4 h-4 text-slate-500" />
          <span>Wè Mur Témoignages Piblik</span>
        </button>
      </div>

      {/* Filter Tabs */}
      <div className="flex items-center space-x-2 border-b border-slate-200 pb-3">
        {[
          { id: 'all', label: `Tout (${testimonies.length})` },
          { id: 'pending', label: `⏳ An Atant (${testimonies.filter(t => t.status === 'pending').length})` },
          { id: 'approved', label: `✅ Apwouve (${testimonies.filter(t => t.status === 'approved').length})` },
          { id: 'rejected', label: `❌ Rejte (${testimonies.filter(t => t.status === 'rejected').length})` },
        ].map(tab => (
          <button
            key={tab.id}
            onClick={() => setFilter(tab.id as any)}
            className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition ${
              filter === tab.id
                ? 'bg-amber-500 text-slate-950'
                : 'bg-white text-slate-600 hover:bg-slate-100 border border-slate-200'
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* List */}
      {loading ? (
        <div className="py-20 text-center bg-white rounded-3xl border border-slate-200">
          <Loader2 className="w-8 h-8 animate-spin text-amber-500 mx-auto" />
          <p className="text-xs text-slate-500 mt-2 font-mono">Chajman temwayaj yo...</p>
        </div>
      ) : filtered.length === 0 ? (
        <div className="py-16 text-center bg-white rounded-3xl border border-dashed border-slate-300 p-8">
          <Sparkles className="w-12 h-12 text-slate-300 mx-auto mb-2" />
          <p className="text-xs text-slate-500">Pa gen temwayaj nan seksyon sa a.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          {filtered.map(t => (
            <div 
              key={t.id}
              className={`bg-white rounded-3xl p-6 border shadow-sm flex flex-col justify-between ${
                t.status === 'pending'
                  ? 'border-amber-400 ring-2 ring-amber-400/20'
                  : t.status === 'approved'
                  ? 'border-emerald-300'
                  : 'border-slate-200 opacity-60'
              }`}
            >
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className={`px-2.5 py-0.5 rounded text-[10px] font-extrabold uppercase tracking-wider ${
                    t.status === 'pending'
                      ? 'bg-amber-100 text-amber-800'
                      : t.status === 'approved'
                      ? 'bg-emerald-100 text-emerald-800'
                      : 'bg-rose-100 text-rose-800'
                  }`}>
                    {t.status === 'pending' ? '⏳ Atant Validasyon' : t.status === 'approved' ? '✅ Apwouve Piblik' : '❌ Rejte'}
                  </span>
                  <span className="text-[11px] text-slate-400 font-mono">
                    {new Date(t.createdAt).toLocaleDateString('fr-HT', { day: 'numeric', month: 'short', year: 'numeric' })}
                  </span>
                </div>

                <h3 className="font-serif font-bold text-slate-900 text-base">
                  « {t.title} »
                </h3>

                <p className="text-xs text-slate-700 bg-slate-50 p-3.5 rounded-xl border border-slate-100 leading-relaxed italic">
                  "{t.content}"
                </p>

                <div className="text-xs text-slate-500 flex items-center justify-between pt-1">
                  <span>Otè : <strong>{t.authorName}</strong> ({t.location || 'Damé'})</span>
                  <span className="flex items-center space-x-1 text-rose-500 font-bold">
                    <Heart className="w-3 h-3 fill-rose-500" />
                    <span>{t.likesCount || 0}</span>
                  </span>
                </div>
              </div>

              <div className="pt-4 mt-4 border-t border-slate-100 flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  {t.status !== 'approved' && (
                    <button
                      onClick={() => handleUpdateStatus(t.id, 'approved')}
                      className="px-3.5 py-1.5 rounded-xl bg-emerald-600 text-white hover:bg-emerald-700 text-xs font-bold flex items-center space-x-1"
                    >
                      <Check className="w-3.5 h-3.5" />
                      <span>Apwouve</span>
                    </button>
                  )}

                  {t.status !== 'rejected' && (
                    <button
                      onClick={() => handleUpdateStatus(t.id, 'rejected')}
                      className="px-3 py-1.5 rounded-xl bg-slate-100 text-slate-700 hover:bg-slate-200 text-xs font-bold flex items-center space-x-1"
                    >
                      <X className="w-3.5 h-3.5" />
                      <span>Rejte</span>
                    </button>
                  )}
                </div>

                <button
                  onClick={() => handleDelete(t.id)}
                  className="p-2 rounded-xl text-rose-600 hover:bg-rose-50 transition"
                  title="Efase temwayaj"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
