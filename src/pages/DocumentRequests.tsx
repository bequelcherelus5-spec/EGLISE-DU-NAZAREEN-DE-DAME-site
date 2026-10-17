import React, { useState } from 'react';
import { SEOHead } from '../components/SEOHead';
import { 
  FileText, 
  Send, 
  CheckCircle2, 
  AlertCircle, 
  Loader2, 
  ShieldCheck, 
  Clock, 
  Building, 
  Scroll 
} from 'lucide-react';

export const DocumentRequests: React.FC<{ onNavigate: (path: string) => void }> = ({ onNavigate }) => {
  const [formData, setFormData] = useState({
    fullName: '',
    docType: 'recommendation' as 'recommendation' | 'baptism_certificate' | 'dedication_certificate' | 'membership_certificate',
    phone: '',
    email: '',
    purpose: '',
    additionalInfo: ''
  });

  const [loading, setLoading] = useState(false);
  const [status, setStatus] = useState<{ type: 'idle' | 'success' | 'error'; message: string }>({
    type: 'idle',
    message: ''
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.fullName.trim() || !formData.phone.trim() || !formData.purpose.trim()) {
      setStatus({ type: 'error', message: 'Tanpri ranpli non w, telefòn ou ak motif demann lan.' });
      return;
    }

    setLoading(true);
    setStatus({ type: 'idle', message: '' });

    try {
      const res = await fetch('/api/document-requests', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData)
      });
      const data = await res.json();
      if (res.ok && data.success) {
        setStatus({ type: 'success', message: data.message });
        setFormData({
          fullName: '',
          docType: 'recommendation',
          phone: '',
          email: '',
          purpose: '',
          additionalInfo: ''
        });
      } else {
        setStatus({ type: 'error', message: data.error || 'Erè pandan voye demann lan.' });
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
        title="Demann Sètifika & Dokiman Pastoral an Liy | Église du Nazaréen de Damé"
        description="Fè demann lèt rekòmandasyon pastoral, sètifika batèm, atestasyon dedikas pitit oswa sètifika manm nan sekretarya Église du Nazaréen de Damé."
        path="/documents-pastoraux"
      />

      <section className="bg-gradient-to-b from-[#071322] to-[#0b1b33] text-white py-16 px-4 border-b border-amber-500/20">
        <div className="max-w-4xl mx-auto text-center space-y-4">
          <div className="inline-flex items-center space-x-2 px-3.5 py-1 rounded-full bg-amber-500/10 border border-amber-400/30 text-amber-300 text-xs font-bold uppercase tracking-widest">
            <Scroll className="w-3.5 h-3.5" />
            <span>Sèvis Sekretarya &amp; Administrasyon</span>
          </div>

          <h1 className="font-serif text-3xl sm:text-5xl font-extrabold text-white">
            Demann Sètifika &amp; Dokiman Pastoral
          </h1>

          <p className="text-slate-300 text-base sm:text-lg max-w-2xl mx-auto leading-relaxed">
            Pou manm legliz la ki bezwen yon dokiman ofisyèl pou vwayaj, maryaj, anbochaj, oswa transfè nan yon lòt asanble.
          </p>
        </div>
      </section>

      <section className="max-w-3xl mx-auto px-4 sm:px-6">
        <div className="bg-white rounded-3xl p-6 sm:p-10 shadow-xl border border-slate-200">
          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <h2 className="font-serif text-2xl font-bold text-slate-900">
                Fòmilè Demann Ofisyèl
              </h2>
              <p className="text-xs text-slate-500 mt-1">
                Sekretarya a ap verifye rejis yo epi prepare dokiman an ak so ofisyèl legliz la ak siyati Pasteur Bequel CHERELUS.
              </p>
            </div>

            {status.type !== 'idle' && (
              <div className={`p-4 rounded-2xl flex items-start space-x-3 text-xs leading-relaxed ${
                status.type === 'success' ? 'bg-emerald-50 text-emerald-900 border border-emerald-300' : 'bg-rose-50 text-rose-900 border border-rose-300'
              }`}>
                {status.type === 'success' ? <CheckCircle2 className="w-5 h-5 text-emerald-600 flex-shrink-0" /> : <AlertCircle className="w-5 h-5 text-rose-600 flex-shrink-0" />}
                <div>
                  <p className="font-bold">{status.type === 'success' ? 'Demann Transmèt ak Siksè !' : 'Atansyon'}</p>
                  <p>{status.message}</p>
                </div>
              </div>
            )}

            {/* Doc Type Selector */}
            <div className="space-y-2">
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wide">
                Chwazi Kalite Dokiman ou Bezwen an *
              </label>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {[
                  { id: 'recommendation', title: 'Lèt Rekòmandasyon Pastoral', desc: 'Pou vwayaj, lekòl, viza oswa anbochaj' },
                  { id: 'baptism_certificate', title: 'Sètifika Batèm', desc: 'Prèv batèm pa imèsyon nan Damé' },
                  { id: 'dedication_certificate', title: 'Sètifika Dedikas Pitit', desc: 'Sètifika prezantasyon timoun devan Bondye' },
                  { id: 'membership_certificate', title: 'Atestasyon Manm Aktif', desc: 'Konfimasyon estati manm nan asanble a' }
                ].map(d => (
                  <button
                    key={d.id}
                    type="button"
                    onClick={() => setFormData({ ...formData, docType: d.id as any })}
                    className={`p-3.5 rounded-xl border text-left transition ${
                      formData.docType === d.id
                        ? 'bg-amber-50 border-amber-500 text-slate-900 ring-2 ring-amber-400/40'
                        : 'bg-slate-50 border-slate-200 text-slate-600 hover:border-slate-300'
                    }`}
                  >
                    <span className="block text-xs font-bold">{d.title}</span>
                    <span className="block text-[11px] text-slate-500">{d.desc}</span>
                  </button>
                ))}
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-1">
                <label className="block text-xs font-bold text-slate-700">Non &amp; Prenon ou *</label>
                <input
                  type="text"
                  required
                  placeholder="Ex : Frè Jean Claude Pierre"
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

            <div className="space-y-1">
              <label className="block text-xs font-bold text-slate-700">Motif oswa Rezon Demann lan *</label>
              <input
                type="text"
                required
                placeholder="Ex : Pou prezante nan anbasad, oswa pou maryaj nan yon lòt komin"
                value={formData.purpose}
                onChange={e => setFormData({ ...formData, purpose: e.target.value })}
                className="w-full px-3.5 py-2.5 text-xs rounded-xl border border-slate-300 focus:outline-none focus:border-amber-500"
              />
            </div>

            <div className="space-y-1">
              <label className="block text-xs font-bold text-slate-700">Lòt enfòmasyon ki ka ede (Dat batèm, non paran, elatriye)</label>
              <textarea
                rows={3}
                placeholder="Ex : Mwen te batize nan ane 2018 anba Pasteur Bequel CHERELUS..."
                value={formData.additionalInfo}
                onChange={e => setFormData({ ...formData, additionalInfo: e.target.value })}
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
                  <span>Transmisyon an kou...</span>
                </>
              ) : (
                <>
                  <Send className="w-4 h-4" />
                  <span>Voye Demann Dokiman an bay Sekretarya</span>
                </>
              )}
            </button>
          </form>
        </div>
      </section>
    </div>
  );
};
