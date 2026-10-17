import React, { useState, useEffect } from 'react';
import { 
  Scroll, 
  Check, 
  Trash2, 
  MessageSquare, 
  Phone, 
  ExternalLink, 
  Loader2, 
  Clock, 
  CheckCircle2, 
  Mail,
  User 
} from 'lucide-react';

interface DocRequest {
  id: string;
  fullName: string;
  docType: 'recommendation' | 'baptism_certificate' | 'dedication_certificate' | 'membership_certificate';
  phone: string;
  email?: string;
  purpose: string;
  additionalInfo?: string;
  status: 'pending' | 'processing' | 'ready' | 'delivered';
  createdAt: string;
}

export const DocRequestsManager: React.FC<{ onNavigate: (path: string) => void }> = ({ onNavigate }) => {
  const [requests, setRequests] = useState<DocRequest[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<'all' | 'pending' | 'processing' | 'ready' | 'delivered'>('all');

  const fetchRequests = () => {
    fetch('/api/document-requests')
      .then(res => res.json())
      .then(data => {
        if (Array.isArray(data)) setRequests(data);
      })
      .catch(err => console.warn('Erreur document requests:', err))
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    fetchRequests();
  }, []);

  const handleUpdateStatus = async (id: string, status: DocRequest['status']) => {
    try {
      const res = await fetch(`/api/document-requests/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status })
      });
      if (res.ok) {
        setRequests(prev => prev.map(r => r.id === id ? { ...r, status } : r));
      }
    } catch {
      alert('Erè pandan mizajou.');
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Èske w vle efase demann sa a ?')) return;
    try {
      const res = await fetch(`/api/document-requests/${id}`, { method: 'DELETE' });
      if (res.ok) {
        setRequests(prev => prev.filter(r => r.id !== id));
      }
    } catch {
      alert('Erè efasman.');
    }
  };

  const docTypeLabels: Record<string, string> = {
    recommendation: 'Lèt Rekòmandasyon Pastorale',
    baptism_certificate: 'Sètifika Batèm',
    dedication_certificate: 'Atestasyon Dedikas Pitit',
    membership_certificate: 'Sètifika Manm Fidèl'
  };

  const filtered = requests.filter(r => {
    if (filter === 'all') return true;
    return r.status === filter;
  });

  return (
    <div className="space-y-6">
      {/* Header bar */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 bg-white p-6 rounded-3xl border border-slate-200 shadow-sm">
        <div>
          <div className="inline-flex items-center space-x-1.5 px-3 py-1 rounded-full bg-amber-500/10 text-amber-700 text-xs font-bold uppercase tracking-wider mb-2">
            <Scroll className="w-3.5 h-3.5" />
            <span>Opsyon 6 : Demann Sètifika &amp; Dokiman Pastoraux</span>
          </div>
          <h2 className="font-serif text-2xl font-bold text-slate-900">
            Jesyon Demann Dokiman Ofisyèl
          </h2>
          <p className="text-xs text-slate-500 mt-1">
            Trete demann lèt rekòmandasyon, sètifika batèm, ak dokiman pou manm legliz la.
          </p>
        </div>

        <button
          onClick={() => onNavigate('/demann-dokiman')}
          className="px-4 py-2.5 rounded-xl text-xs font-bold bg-slate-100 text-slate-700 hover:bg-slate-200 transition flex items-center space-x-1.5"
        >
          <ExternalLink className="w-4 h-4 text-slate-500" />
          <span>Wè Fòmilè Piblik</span>
        </button>
      </div>

      {/* Filter Tabs */}
      <div className="flex items-center space-x-2 border-b border-slate-200 pb-3">
        {[
          { id: 'all', label: `Tout (${requests.length})` },
          { id: 'pending', label: `⏳ An Kou (${requests.filter(r => r.status === 'pending').length})` },
          { id: 'ready', label: `✅ Pare pou Pran (${requests.filter(r => r.status === 'ready').length})` },
          { id: 'delivered', label: `📦 Delivre (${requests.filter(r => r.status === 'delivered').length})` },
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
          <p className="text-xs text-slate-500 mt-2 font-mono">Chajman demann yo...</p>
        </div>
      ) : filtered.length === 0 ? (
        <div className="py-16 text-center bg-white rounded-3xl border border-dashed border-slate-300 p-8">
          <Scroll className="w-12 h-12 text-slate-300 mx-auto mb-2" />
          <p className="text-xs text-slate-500">Pa gen okenn demann dokiman nan seksyon sa a.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          {filtered.map(r => {
            const cleanPhone = r.phone.replace(/[^0-9]/g, '');
            const waText = encodeURIComponent(
              `Bonjour *${r.fullName}* ! Se Sekretarya Église du Nazaréen de Damé (Pasteur Bequel CHERELUS) kap enfòme w konsènan demann dokiman w la : *${docTypeLabels[r.docType]}*.\n\nEstati kounye a : *${r.status === 'ready' ? 'DOKIMAN OU AN PARE POU PRAN NAN SEKRETARYA A' : 'NAP TRETE L'}*.\n\nTanpri kontakte nou pou plis detay.`
            );
            const waUrl = `https://wa.me/${cleanPhone.startsWith('509') ? cleanPhone : '509' + cleanPhone}?text=${waText}`;

            return (
              <div 
                key={r.id}
                className="bg-white rounded-3xl p-6 border border-slate-200 shadow-sm flex flex-col justify-between"
              >
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <span className={`px-2.5 py-0.5 rounded text-[10px] font-extrabold uppercase tracking-wider ${
                      r.status === 'pending'
                        ? 'bg-amber-100 text-amber-800'
                        : r.status === 'ready'
                        ? 'bg-emerald-100 text-emerald-800'
                        : 'bg-slate-100 text-slate-700'
                    }`}>
                      {r.status === 'pending' ? '⏳ Ankou' : r.status === 'ready' ? '✅ Pare pou Remèt' : 'Delivre'}
                    </span>
                    <span className="text-[11px] text-slate-400 font-mono">
                      {new Date(r.createdAt).toLocaleDateString('fr-HT', { day: 'numeric', month: 'short' })}
                    </span>
                  </div>

                  <h3 className="font-serif font-bold text-slate-900 text-base">
                    {r.fullName}
                  </h3>

                  <div className="p-3 rounded-xl bg-amber-50 text-xs text-amber-900 font-bold border border-amber-200">
                    📜 {docTypeLabels[r.docType] || r.docType}
                  </div>

                  <div className="space-y-1 text-xs text-slate-600">
                    <p><strong>Motif :</strong> {r.purpose}</p>
                    <p className="flex items-center space-x-1.5">
                      <Phone className="w-3.5 h-3.5 text-amber-500" />
                      <span className="font-mono">{r.phone}</span>
                    </p>
                    {r.email && (
                      <p className="flex items-center space-x-1.5">
                        <Mail className="w-3.5 h-3.5 text-slate-400" />
                        <span>{r.email}</span>
                      </p>
                    )}
                  </div>

                  {r.additionalInfo && (
                    <p className="text-xs text-slate-500 bg-slate-50 p-2.5 rounded-xl italic">
                      Nòt : {r.additionalInfo}
                    </p>
                  )}
                </div>

                <div className="pt-4 mt-4 border-t border-slate-100 flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    <a
                      href={waUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="px-3 py-1.5 rounded-xl bg-emerald-600 text-white hover:bg-emerald-700 text-xs font-bold flex items-center space-x-1"
                    >
                      <MessageSquare className="w-3.5 h-3.5" />
                      <span>WhatsApp</span>
                    </a>

                    {r.status !== 'ready' && (
                      <button
                        onClick={() => handleUpdateStatus(r.id, 'ready')}
                        className="px-3 py-1.5 rounded-xl bg-amber-500 text-slate-950 hover:bg-amber-400 text-xs font-bold"
                      >
                        Make Pare
                      </button>
                    )}

                    {r.status === 'ready' && (
                      <button
                        onClick={() => handleUpdateStatus(r.id, 'delivered')}
                        className="px-3 py-1.5 rounded-xl bg-slate-800 text-white hover:bg-slate-700 text-xs font-bold"
                      >
                        Make Delivre
                      </button>
                    )}
                  </div>

                  <button
                    onClick={() => handleDelete(r.id)}
                    className="p-2 rounded-xl text-rose-600 hover:bg-rose-50 transition"
                    title="Efase demann sa a"
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
