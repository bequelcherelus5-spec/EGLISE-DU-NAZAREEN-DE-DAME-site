import React, { useState } from 'react';
import { SEOHead } from '../components/SEOHead';
import { 
  Heart, 
  Send, 
  CheckCircle2, 
  AlertCircle, 
  Loader2, 
  Sparkles, 
  Phone, 
  BookOpen, 
  Cross, 
  UserCheck, 
  Users, 
  MessageSquare 
} from 'lucide-react';

export const Discipleship: React.FC<{ onNavigate: (path: string) => void }> = ({ onNavigate }) => {
  const [formData, setFormData] = useState({
    fullName: '',
    phone: '',
    email: '',
    address: '3ème Section Damé',
    decisionDate: new Date().toISOString().split('T')[0],
    needs: ['baptism', 'class'] as string[],
    notes: ''
  });

  const [loading, setLoading] = useState(false);
  const [status, setStatus] = useState<{ type: 'idle' | 'success' | 'error'; message: string }>({
    type: 'idle',
    message: ''
  });

  const toggleNeed = (needId: string) => {
    setFormData(prev => {
      const exists = prev.needs.includes(needId);
      return {
        ...prev,
        needs: exists ? prev.needs.filter(n => n !== needId) : [...prev.needs, needId]
      };
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.fullName.trim() || !formData.phone.trim()) {
      setStatus({ type: 'error', message: 'Tanpri mete non w ak nimewo telefòn ou.' });
      return;
    }

    setLoading(true);
    setStatus({ type: 'idle', message: '' });

    try {
      const res = await fetch('/api/discipleship', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData)
      });
      const data = await res.json();
      if (res.ok && data.success) {
        setStatus({ type: 'success', message: data.message });
        setFormData({
          fullName: '',
          phone: '',
          email: '',
          address: '3ème Section Damé',
          decisionDate: new Date().toISOString().split('T')[0],
          needs: ['baptism', 'class'],
          notes: ''
        });
      } else {
        setStatus({ type: 'error', message: data.error || 'Erè pandan voye fòmilè a.' });
      }
    } catch {
      setStatus({ type: 'error', message: 'Erè koneksyon ak sèvè a.' });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-12 pb-20">
      <SEOHead
        title="Mwen Chwazi Jezi – Enskripsyon Nouvo Kwayan & Disipila | Damé"
        description="Felisitasyon pou desizyon w pou aksepte Jezi Kris kòm Sovè w ! Enskri pou klas disipila, batèm ak akonpayman pastoral nan Église du Nazaréen de Damé."
        path="/discipulat"
      />

      {/* Header */}
      <section className="bg-gradient-to-b from-[#071322] to-[#0b1b33] text-white py-16 px-4 border-b border-amber-500/20">
        <div className="max-w-4xl mx-auto text-center space-y-4">
          <div className="inline-flex items-center space-x-2 px-3.5 py-1 rounded-full bg-rose-500/10 border border-rose-400/30 text-rose-300 text-xs font-bold uppercase tracking-widest">
            <Heart className="w-3.5 h-3.5 text-rose-400" />
            <span>Nouvo Nesans nan Kris la</span>
          </div>

          <h1 className="font-serif text-3xl sm:text-5xl font-extrabold text-white">
            Mwen Chwazi Jezi Jodi a
          </h1>

          <p className="text-slate-300 text-base sm:text-lg max-w-2xl mx-auto leading-relaxed">
            « Si yon moun nan Kris la, li se yon nouvo kreyati. Tout ansyen bagay fin pase, men tout bagay vin tounen nouvo ! » <span className="text-amber-400 italic font-serif">(2 Korentyen 5:17)</span>
            <br />
            Nou kontan akeyi w nan gran fanmi Bondye a nan Damé.
          </p>
        </div>
      </section>

      {/* Form Section */}
      <section className="max-w-3xl mx-auto px-4 sm:px-6">
        <div className="bg-white rounded-3xl p-6 sm:p-10 shadow-xl border border-slate-200">
          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <h2 className="font-serif text-2xl font-bold text-slate-900">
                Fòmilè Enskripsyon Nouvo Kwayan &amp; Disipila
              </h2>
              <p className="text-xs text-slate-500 mt-1">
                Kite enfòmasyon w yo pou Pasteur Bequel CHERELUS ak ekip pastoral la ka rele w epi akonpanye w nan lafwa.
              </p>
            </div>

            {status.type !== 'idle' && (
              <div className={`p-4 rounded-2xl flex items-start space-x-3 text-xs leading-relaxed ${
                status.type === 'success' ? 'bg-emerald-50 text-emerald-900 border border-emerald-300' : 'bg-rose-50 text-rose-900 border border-rose-300'
              }`}>
                {status.type === 'success' ? <CheckCircle2 className="w-5 h-5 text-emerald-600 flex-shrink-0" /> : <AlertCircle className="w-5 h-5 text-rose-600 flex-shrink-0" />}
                <div>
                  <p className="font-bold">{status.type === 'success' ? 'Enskripsyon Reysi !' : 'Atansyon'}</p>
                  <p>{status.message}</p>
                </div>
              </div>
            )}

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-1">
                <label className="block text-xs font-bold text-slate-700">Non &amp; Prenon ou *</label>
                <input
                  type="text"
                  required
                  placeholder="Ex : Marie Nicole Joseph"
                  value={formData.fullName}
                  onChange={e => setFormData({ ...formData, fullName: e.target.value })}
                  className="w-full px-3.5 py-2.5 text-xs rounded-xl border border-slate-300 focus:outline-none focus:border-amber-500"
                />
              </div>

              <div className="space-y-1">
                <label className="block text-xs font-bold text-slate-700">Nimewo WhatsApp / Telefòn *</label>
                <input
                  type="tel"
                  required
                  placeholder="Ex : +509 48596089"
                  value={formData.phone}
                  onChange={e => setFormData({ ...formData, phone: e.target.value })}
                  className="w-full px-3.5 py-2.5 text-xs rounded-xl border border-slate-300 focus:outline-none focus:border-amber-500"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-1">
                <label className="block text-xs font-bold text-slate-700">Adrès / Seksyon nan Damé</label>
                <input
                  type="text"
                  placeholder="Ex : Damé Sant, toupre legliz la"
                  value={formData.address}
                  onChange={e => setFormData({ ...formData, address: e.target.value })}
                  className="w-full px-3.5 py-2.5 text-xs rounded-xl border border-slate-300 focus:outline-none focus:border-amber-500"
                />
              </div>

              <div className="space-y-1">
                <label className="block text-xs font-bold text-slate-700">Dat Desizyon ou</label>
                <input
                  type="date"
                  value={formData.decisionDate}
                  onChange={e => setFormData({ ...formData, decisionDate: e.target.value })}
                  className="w-full px-3.5 py-2.5 text-xs rounded-xl border border-slate-300 focus:outline-none focus:border-amber-500"
                />
              </div>
            </div>

            {/* Needs Options */}
            <div className="space-y-2">
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wide">
                Kisa ou ta renmen legliz la ede w fè kounye a ?
              </label>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                {[
                  { id: 'baptism', label: 'Mwen vle batize pa imèsyon' },
                  { id: 'class', label: 'Mwen vle antre nan klas disipila' },
                  { id: 'bible', label: 'Mwen pa gen yon Bib, mwen bezwen youn' },
                  { id: 'visit', label: 'Mwen ta renmen yon vizit pastoral lakay mwen' }
                ].map(item => {
                  const checked = formData.needs.includes(item.id);
                  return (
                    <button
                      key={item.id}
                      type="button"
                      onClick={() => toggleNeed(item.id)}
                      className={`p-3 rounded-xl border text-left text-xs font-semibold flex items-center space-x-2.5 transition ${
                        checked ? 'bg-amber-50 border-amber-500 text-slate-900 ring-1 ring-amber-400' : 'bg-slate-50 border-slate-200 text-slate-600'
                      }`}
                    >
                      <input type="checkbox" checked={checked} readOnly className="rounded text-amber-500" />
                      <span>{item.label}</span>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Notes */}
            <div className="space-y-1">
              <label className="block text-xs font-bold text-slate-700">Ti mesaj oswa temwayaj ou</label>
              <textarea
                rows={3}
                placeholder="Rakonte nou kijan ou te pran desizyon sa a..."
                value={formData.notes}
                onChange={e => setFormData({ ...formData, notes: e.target.value })}
                className="w-full p-3 text-xs rounded-xl border border-slate-300 focus:outline-none focus:border-amber-500"
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full py-3.5 rounded-xl text-xs font-bold uppercase tracking-wider bg-amber-500 text-slate-950 hover:bg-amber-400 transition shadow-lg shadow-amber-500/20 flex items-center justify-center space-x-2"
            >
              {loading ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span>Transmisyon...</span>
                </>
              ) : (
                <>
                  <Send className="w-4 h-4" />
                  <span>Konfime Enskripsyon m kòm Nouvo Kwayan</span>
                </>
              )}
            </button>
          </form>
        </div>
      </section>
    </div>
  );
};
