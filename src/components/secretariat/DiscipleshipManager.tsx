import React, { useState, useEffect } from 'react';
import { 
  Heart, 
  Phone, 
  MessageSquare, 
  UserCheck, 
  Check, 
  Trash2, 
  Loader2, 
  Sparkles, 
  Calendar, 
  MapPin,
  ExternalLink 
} from 'lucide-react';

interface DiscipleshipRecord {
  id: string;
  fullName: string;
  phone: string;
  email?: string;
  address?: string;
  decisionDate: string;
  needs: string[];
  notes?: string;
  status: 'new' | 'contacted' | 'baptized';
  createdAt: string;
}

export const DiscipleshipManager: React.FC<{ onNavigate: (path: string) => void }> = ({ onNavigate }) => {
  const [list, setList] = useState<DiscipleshipRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<'all' | 'new' | 'contacted' | 'baptized'>('all');

  const fetchRecords = () => {
    fetch('/api/discipleship')
      .then(res => res.json())
      .then(data => {
        if (Array.isArray(data)) setList(data);
      })
      .catch(err => console.warn('Erreur discipleship:', err))
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    fetchRecords();
  }, []);

  const handleUpdateStatus = async (id: string, status: 'new' | 'contacted' | 'baptized') => {
    try {
      const res = await fetch(`/api/discipleship/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status })
      });
      if (res.ok) {
        setList(prev => prev.map(item => item.id === id ? { ...item, status } : item));
      }
    } catch {
      alert('Erè pandan mizajou estati a.');
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Èske w vle retire enskripsyon sa a ?')) return;
    try {
      const res = await fetch(`/api/discipleship/${id}`, { method: 'DELETE' });
      if (res.ok) {
        setList(prev => prev.filter(item => item.id !== id));
      }
    } catch {
      alert('Erè efasman.');
    }
  };

  const filtered = list.filter(item => {
    if (filter === 'all') return true;
    return item.status === filter;
  });

  return (
    <div className="space-y-6">
      {/* Header bar */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 bg-white p-6 rounded-3xl border border-slate-200 shadow-sm">
        <div>
          <div className="inline-flex items-center space-x-1.5 px-3 py-1 rounded-full bg-amber-500/10 text-amber-700 text-xs font-bold uppercase tracking-wider mb-2">
            <Heart className="w-3.5 h-3.5 text-rose-500" />
            <span>Opsyon 17 : Nouvo Kwayan &amp; Disipila</span>
          </div>
          <h2 className="font-serif text-2xl font-bold text-slate-900">
            Suivi Pastoral Nouveaux Convertis
          </h2>
          <p className="text-xs text-slate-500 mt-1">
            Moun ki bay lavi yo bay Jezi oswa ki mande batèm ak klas disipila nan Église du Nazaréen de Damé.
          </p>
        </div>

        <button
          onClick={() => onNavigate('/nouvo-kwayan')}
          className="px-4 py-2.5 rounded-xl text-xs font-bold bg-slate-100 text-slate-700 hover:bg-slate-200 transition flex items-center space-x-1.5"
        >
          <ExternalLink className="w-4 h-4 text-slate-500" />
          <span>Wè Fòmilè Piblik</span>
        </button>
      </div>

      {/* Filter Tabs */}
      <div className="flex items-center space-x-2 border-b border-slate-200 pb-3">
        {[
          { id: 'all', label: `Tout (${list.length})` },
          { id: 'new', label: `🔥 Nouvo (${list.filter(i => i.status === 'new').length})` },
          { id: 'contacted', label: `📞 Kontakte (${list.filter(i => i.status === 'contacted').length})` },
          { id: 'baptized', label: `✝️ Batize / Entegre (${list.filter(i => i.status === 'baptized').length})` },
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
          <p className="text-xs text-slate-500 mt-2 font-mono">Chajman lis nouvo kwayan yo...</p>
        </div>
      ) : filtered.length === 0 ? (
        <div className="py-16 text-center bg-white rounded-3xl border border-dashed border-slate-300 p-8">
          <UserCheck className="w-12 h-12 text-slate-300 mx-auto mb-2" />
          <p className="text-xs text-slate-500">Pa gen okenn enskripsyon nan seksyon sa a.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          {filtered.map(item => {
            const cleanPhone = item.phone.replace(/[^0-9]/g, '');
            const waText = encodeURIComponent(
              `Bonjour bienaimé(e) *${item.fullName}* ! Se ak gwo lajwa nou salye w nan non Senyè Jezi depi Église du Nazaréen de Damé (Pasteur Bequel CHERELUS). Nou te resevwa desizyon w pou mache ak Kris la e nou la pou nou akonpanye w nan lapriyè ak klas fòmasyon disipila. Èske w disponib pou yon ti echanj jodi a ?`
            );
            const waUrl = `https://wa.me/${cleanPhone.startsWith('509') ? cleanPhone : '509' + cleanPhone}?text=${waText}`;

            return (
              <div 
                key={item.id}
                className={`bg-white rounded-3xl p-6 border shadow-sm flex flex-col justify-between ${
                  item.status === 'new' ? 'border-amber-400 ring-2 ring-amber-400/20' : 'border-slate-200'
                }`}
              >
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <span className={`px-2.5 py-0.5 rounded text-[10px] font-extrabold uppercase tracking-wider ${
                      item.status === 'new'
                        ? 'bg-rose-100 text-rose-800'
                        : item.status === 'contacted'
                        ? 'bg-blue-100 text-blue-800'
                        : 'bg-emerald-100 text-emerald-800'
                    }`}>
                      {item.status === 'new' ? '🔥 Nouvo Converti' : item.status === 'contacted' ? '📞 Kontakte' : '✝️ Batize / Disip'}
                    </span>
                    <span className="text-[11px] text-slate-400 font-mono">
                      {new Date(item.createdAt).toLocaleDateString('fr-HT', { day: 'numeric', month: 'short' })}
                    </span>
                  </div>

                  <h3 className="font-serif font-bold text-slate-900 text-lg">
                    {item.fullName}
                  </h3>

                  <div className="space-y-1.5 text-xs text-slate-600">
                    <p className="flex items-center space-x-1.5">
                      <Phone className="w-3.5 h-3.5 text-amber-500" />
                      <a href={`tel:${item.phone}`} className="hover:underline font-mono font-bold">
                        {item.phone}
                      </a>
                    </p>
                    {item.address && (
                      <p className="flex items-center space-x-1.5">
                        <MapPin className="w-3.5 h-3.5 text-slate-400" />
                        <span>{item.address}</span>
                      </p>
                    )}
                  </div>

                  {/* Needs Badges */}
                  <div className="flex flex-wrap gap-1.5 pt-1">
                    {item.needs?.map(need => (
                      <span key={need} className="px-2 py-0.5 rounded bg-slate-100 text-slate-700 text-[10px] font-bold">
                        {need === 'baptism' ? 'Demann Batèm' : need === 'class' ? 'Klas Nouvo Kwayan' : need === 'bible' ? 'Bezwen Bib' : need}
                      </span>
                    ))}
                  </div>

                  {item.notes && (
                    <p className="text-xs text-slate-500 bg-slate-50 p-3 rounded-xl italic">
                      "{item.notes}"
                    </p>
                  )}
                </div>

                <div className="pt-4 mt-4 border-t border-slate-100 flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    <a
                      href={waUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="px-3.5 py-1.5 rounded-xl bg-emerald-600 text-white hover:bg-emerald-700 text-xs font-bold flex items-center space-x-1 shadow-sm"
                    >
                      <MessageSquare className="w-3.5 h-3.5" />
                      <span>WhatsApp</span>
                    </a>

                    {item.status === 'new' && (
                      <button
                        onClick={() => handleUpdateStatus(item.id, 'contacted')}
                        className="px-3 py-1.5 rounded-xl bg-slate-100 text-slate-700 hover:bg-slate-200 text-xs font-bold"
                      >
                        Make Kontakte
                      </button>
                    )}

                    {item.status === 'contacted' && (
                      <button
                        onClick={() => handleUpdateStatus(item.id, 'baptized')}
                        className="px-3 py-1.5 rounded-xl bg-amber-500 text-slate-950 hover:bg-amber-400 text-xs font-bold"
                      >
                        Make Batize
                      </button>
                    )}
                  </div>

                  <button
                    onClick={() => handleDelete(item.id)}
                    className="p-2 rounded-xl text-rose-600 hover:bg-rose-50 transition"
                    title="Efase dosye sa a"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};
