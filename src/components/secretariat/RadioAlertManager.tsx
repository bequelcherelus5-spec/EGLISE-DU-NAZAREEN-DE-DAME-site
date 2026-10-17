import React, { useState, useEffect } from 'react';
import { 
  Radio, 
  Megaphone, 
  Sparkles, 
  Save, 
  CheckCircle2, 
  AlertCircle, 
  Loader2, 
  HelpCircle, 
  ExternalLink,
  Volume2,
  Bell,
  Play,
  Info
} from 'lucide-react';

export const RadioAlertManager: React.FC = () => {
  // Radio State
  const [radioForm, setRadioForm] = useState({
    active: true,
    streamUrl: 'https://stream.zeno.fm/f3wvbbqmdg8uv',
    stationName: 'Radyo Nazaréen Damé (Web)',
    tagline: 'Louwanj, Adorasyon & Pawòl Bondye 24/7 depi Damé, Haïti',
    zenoStationId: 'eglise-nazareen-dame'
  });
  const [radioLoading, setRadioLoading] = useState(false);
  const [radioStatus, setRadioStatus] = useState<{ type: 'idle' | 'success' | 'error'; text: string }>({
    type: 'idle',
    text: ''
  });

  // Alert State
  const [alertForm, setAlertForm] = useState({
    active: false,
    title: 'Anons Espesyal Pasteur Bequel CHERELUS',
    message: 'Gwo sèvis priyè ak jèn espesyal vandredi sa a pou kominote Damé a.',
    badge: 'ANONS IJANT',
    linkUrl: '/evenements',
    level: 'urgent' as 'info' | 'warning' | 'urgent'
  });
  const [alertLoading, setAlertLoading] = useState(false);
  const [alertStatus, setAlertStatus] = useState<{ type: 'idle' | 'success' | 'error'; text: string }>({
    type: 'idle',
    text: ''
  });

  useEffect(() => {
    // Fetch current radio
    fetch('/api/radio')
      .then(res => res.json())
      .then(data => {
        if (data && data.streamUrl) setRadioForm(data);
      })
      .catch(() => {});

    // Fetch current alert
    fetch('/api/alert')
      .then(res => res.json())
      .then(data => {
        if (data && data.title) setAlertForm(data);
      })
      .catch(() => {});
  }, []);

  const handleSaveRadio = async (e: React.FormEvent) => {
    e.preventDefault();
    setRadioLoading(true);
    setRadioStatus({ type: 'idle', text: '' });
    try {
      const res = await fetch('/api/radio', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(radioForm)
      });
      const data = await res.json();
      if (res.ok && data.success) {
        setRadioStatus({ type: 'success', text: 'Konfigirasyon Radyo a anrejistre ak siksè !' });
      } else {
        setRadioStatus({ type: 'error', text: data.error || 'Erè anrejistreman.' });
      }
    } catch {
      setRadioStatus({ type: 'error', text: 'Erè koneksyon ak sèvè a.' });
    } finally {
      setRadioLoading(false);
    }
  };

  const handleSaveAlert = async (e: React.FormEvent) => {
    e.preventDefault();
    setAlertLoading(true);
    setAlertStatus({ type: 'idle', text: '' });
    try {
      const res = await fetch('/api/alert', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(alertForm)
      });
      const data = await res.json();
      if (res.ok && data.success) {
        setAlertStatus({ type: 'success', text: 'Banyè anons la mete a jou ak siksè !' });
      } else {
        setAlertStatus({ type: 'error', text: data.error || 'Erè anrejistreman.' });
      }
    } catch {
      setAlertStatus({ type: 'error', text: 'Erè koneksyon.' });
    } finally {
      setAlertLoading(false);
    }
  };

  return (
    <div className="space-y-10">
      {/* SECTION 1: WEB RADIO CONFIGURATION */}
      <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200 shadow-sm space-y-6">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 border-b border-slate-100 pb-4">
          <div>
            <div className="inline-flex items-center space-x-1.5 px-3 py-1 rounded-full bg-amber-500/10 text-amber-700 text-xs font-bold uppercase tracking-wider mb-1">
              <Radio className="w-3.5 h-3.5" />
              <span>Opsyon 3 : Station Radyo Web Chrétienne en direct</span>
            </div>
            <h2 className="font-serif text-2xl font-bold text-slate-900">
              Konfigirasyon Radyo Nazaréen Damé (Web 24/7)
            </h2>
            <p className="text-xs text-slate-500">
              Lè radyo a aktif, tout vizitè sou sit la ka koute louwanj, sèvis ak prèch an dirèk depi nenpòt kote nan mond lan.
            </p>
          </div>

          <div className="flex items-center space-x-2">
            <span className={`w-3 h-3 rounded-full ${radioForm.active ? 'bg-emerald-500 animate-ping' : 'bg-slate-300'}`} />
            <span className="text-xs font-bold text-slate-700">
              {radioForm.active ? 'Difizyon Aktif' : 'Difizyon Etenn'}
            </span>
          </div>
        </div>

        <form onSubmit={handleSaveRadio} className="space-y-4 text-xs">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block font-bold text-slate-700 mb-1">Non Estasyon an *</label>
              <input
                type="text"
                required
                value={radioForm.stationName}
                onChange={e => setRadioForm({ ...radioForm, stationName: e.target.value })}
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 focus:outline-none focus:border-amber-400"
              />
            </div>

            <div>
              <label className="block font-bold text-slate-700 mb-1">Slogan / Deskripsyon Kout</label>
              <input
                type="text"
                value={radioForm.tagline}
                onChange={e => setRadioForm({ ...radioForm, tagline: e.target.value })}
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 focus:outline-none focus:border-amber-400"
              />
            </div>
          </div>

          <div>
            <label className="block font-bold text-slate-700 mb-1">
              Lyen Stream Audio (URL Icecast / Shoutcast / Zeno.fm) *
            </label>
            <input
              type="url"
              required
              placeholder="https://stream.zeno.fm/..."
              value={radioForm.streamUrl}
              onChange={e => setRadioForm({ ...radioForm, streamUrl: e.target.value })}
              className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 focus:outline-none focus:border-amber-400 font-mono"
            />
            <p className="text-[11px] text-slate-400 mt-1">
              Pa egzanp : stream gratis Zeno.fm, Listen2MyRadio, oswa Caster.fm.
            </p>
          </div>

          <div className="flex items-center space-x-2 pt-2">
            <input
              type="checkbox"
              id="radioActive"
              checked={radioForm.active}
              onChange={e => setRadioForm({ ...radioForm, active: e.target.checked })}
              className="w-4 h-4 text-amber-500 rounded border-slate-300"
            />
            <label htmlFor="radioActive" className="font-bold text-slate-800 cursor-pointer">
              Aktive lektè radyo a sou tout paj sit la pou vizitè yo
            </label>
          </div>

          {radioStatus.type === 'success' && (
            <div className="p-3 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-800 flex items-center space-x-2">
              <CheckCircle2 className="w-4 h-4 text-emerald-600 flex-shrink-0" />
              <span>{radioStatus.text}</span>
            </div>
          )}

          {radioStatus.type === 'error' && (
            <div className="p-3 rounded-xl bg-rose-50 border border-rose-200 text-rose-800 flex items-center space-x-2">
              <AlertCircle className="w-4 h-4 text-rose-600 flex-shrink-0" />
              <span>{radioStatus.text}</span>
            </div>
          )}

          <div className="pt-2 flex justify-end">
            <button
              type="submit"
              disabled={radioLoading}
              className="px-6 py-2.5 rounded-xl font-bold bg-amber-500 text-slate-950 hover:bg-amber-400 transition flex items-center space-x-2 shadow-md disabled:opacity-50"
            >
              {radioLoading ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span>Anrejistreman...</span>
                </>
              ) : (
                <>
                  <Save className="w-4 h-4" />
                  <span>Anrejistre Konfigirasyon Radyo</span>
                </>
              )}
            </button>
          </div>
        </form>

        {/* COMPREHENSIVE FREE RADIO TUTORIAL IN CREOLE */}
        <div className="mt-6 p-6 rounded-2xl bg-gradient-to-br from-slate-950 to-[#0b1b33] text-white border border-amber-500/30 space-y-4">
          <div className="flex items-center space-x-2 text-amber-400 font-bold text-sm">
            <HelpCircle className="w-4 h-4" />
            <span>KONSÈY &amp; GID OFISYÈL : Kijan pou mete yon estasyon radyo sou sit la 100% GRATIS</span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-xs">
            <div className="p-4 rounded-xl bg-slate-900/80 border border-slate-800 space-y-2">
              <div className="w-6 h-6 rounded-full bg-amber-500 text-slate-950 flex items-center justify-center font-bold text-xs">
                1
              </div>
              <h4 className="font-bold text-white text-sm">Kreye kont sou Zeno.fm</h4>
              <p className="text-slate-300 leading-relaxed text-[11px]">
                Ale sou <strong>zeno.fm</strong> (oswa <strong>zenomedia.com</strong>). Kreye yon kont gratis kòm "Broadcaster". Li 100% gratis a vi, li pa gen limit moun ki ka koute, epi li ba w yon lyen stream dirèk (egzanp : <span className="font-mono text-amber-300">https://stream.zeno.fm/f3wvbbqmdg8uv</span>).
              </p>
            </div>

            <div className="p-4 rounded-xl bg-slate-900/80 border border-slate-800 space-y-2">
              <div className="w-6 h-6 rounded-full bg-amber-500 text-slate-950 flex items-center justify-center font-bold text-xs">
                2
              </div>
              <h4 className="font-bold text-white text-sm">Emèt depi Telefòn oswa Òdinatè</h4>
              <p className="text-slate-300 leading-relaxed text-[11px]">
                • <strong>Sou Telefòn Android :</strong> Telechaje aplikasyon gratis <em>Broadcast My Self</em> oswa <em>Larix Broadcaster</em> sou Play Store. Mete enfòmasyon Icecast Zeno.fm la.<br />
                • <strong>Sou Laptop nan Legliz la :</strong> Telechaje lojisyèl gratis <em>BUTT (Broadcast Using This Tool)</em> oswa <em>RadioDJ</em>. Konekte mikwo oswa bwat son legliz la.
              </p>
            </div>

            <div className="p-4 rounded-xl bg-slate-900/80 border border-slate-800 space-y-2">
              <div className="w-6 h-6 rounded-full bg-amber-500 text-slate-950 flex items-center justify-center font-bold text-xs">
                3
              </div>
              <h4 className="font-bold text-white text-sm">Kole Lyen an Isit la</h4>
              <p className="text-slate-300 leading-relaxed text-[11px]">
                Kopye "Direct Stream URL" Zeno.fm la, kole li nan chan ki anlè a, klike sou <strong>"Anrejistre"</strong>. Depi w peze Play sou sit la, tout manm legliz la an Ayiti ak nan dyaspora a ap koute sèvis la dirèkteman san peye senk kòb!
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* SECTION 2: URGENT ALERT BANNER */}
      <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200 shadow-sm space-y-6">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 border-b border-slate-100 pb-4">
          <div>
            <div className="inline-flex items-center space-x-1.5 px-3 py-1 rounded-full bg-rose-500/10 text-rose-700 text-xs font-bold uppercase tracking-wider mb-1">
              <Megaphone className="w-3.5 h-3.5" />
              <span>Opsyon 13 : Banyè Alèt &amp; Anons Ijan du Secrétariat</span>
            </div>
            <h2 className="font-serif text-2xl font-bold text-slate-900">
              Jesyon Flash Info &amp; Anons Espesyal
            </h2>
            <p className="text-xs text-slate-500">
              Lè banyè sa a aktif, li parèt tou dwat nan tèt tout paj sit la pou enfòme tout fidèl yo rapidman.
            </p>
          </div>

          <div className="flex items-center space-x-2">
            <span className={`w-3 h-3 rounded-full ${alertForm.active ? 'bg-rose-500 animate-ping' : 'bg-slate-300'}`} />
            <span className="text-xs font-bold text-slate-700">
              {alertForm.active ? 'Anons Vizib Sou Sit la' : 'Dezaktive'}
            </span>
          </div>
        </div>

        <form onSubmit={handleSaveAlert} className="space-y-4 text-xs">
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div>
              <label className="block font-bold text-slate-700 mb-1">Nivo Ijans</label>
              <select
                value={alertForm.level}
                onChange={e => setAlertForm({ ...alertForm, level: e.target.value as any })}
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 focus:outline-none focus:border-amber-400 bg-white"
              >
                <option value="urgent">🔴 Ijan (Wouj vivan)</option>
                <option value="warning">🟡 Avètisman (Zoranj)</option>
                <option value="info">🔵 Enfòmasyon Nòmal (Ble Fonse)</option>
              </select>
            </div>

            <div>
              <label className="block font-bold text-slate-700 mb-1">Tèks Badj la</label>
              <input
                type="text"
                placeholder="Ex : ANONS IJANT"
                value={alertForm.badge}
                onChange={e => setAlertForm({ ...alertForm, badge: e.target.value })}
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 focus:outline-none focus:border-amber-400"
              />
            </div>

            <div>
              <label className="block font-bold text-slate-700 mb-1">Lyen pou plis detay (opsyonèl)</label>
              <input
                type="text"
                placeholder="Ex : /evenements oswa /priere"
                value={alertForm.linkUrl}
                onChange={e => setAlertForm({ ...alertForm, linkUrl: e.target.value })}
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 focus:outline-none focus:border-amber-400 font-mono"
              />
            </div>
          </div>

          <div>
            <label className="block font-bold text-slate-700 mb-1">Tit Anons la *</label>
            <input
              type="text"
              required
              placeholder="Ex : Chanjman nan orè kil dimanch la"
              value={alertForm.title}
              onChange={e => setAlertForm({ ...alertForm, title: e.target.value })}
              className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 focus:outline-none focus:border-amber-400 font-bold"
            />
          </div>

          <div>
            <label className="block font-bold text-slate-700 mb-1">Mesaj Konplè Anons la *</label>
            <textarea
              rows={3}
              required
              placeholder="Eksplike klèman sa manm yo dwe konnen..."
              value={alertForm.message}
              onChange={e => setAlertForm({ ...alertForm, message: e.target.value })}
              className="w-full p-3 rounded-xl border border-slate-300 focus:outline-none focus:border-amber-400 leading-relaxed"
            />
          </div>

          <div className="flex items-center space-x-2 pt-2">
            <input
              type="checkbox"
              id="alertActive"
              checked={alertForm.active}
              onChange={e => setAlertForm({ ...alertForm, active: e.target.checked })}
              className="w-4 h-4 text-rose-600 rounded border-slate-300"
            />
            <label htmlFor="alertActive" className="font-bold text-slate-800 cursor-pointer">
              Afiche banyè sa a anlè nèt sou tout paj sit la kounye a
            </label>
          </div>

          {alertStatus.type === 'success' && (
            <div className="p-3 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-800 flex items-center space-x-2">
              <CheckCircle2 className="w-4 h-4 text-emerald-600 flex-shrink-0" />
              <span>{alertStatus.text}</span>
            </div>
          )}

          {alertStatus.type === 'error' && (
            <div className="p-3 rounded-xl bg-rose-50 border border-rose-200 text-rose-800 flex items-center space-x-2">
              <AlertCircle className="w-4 h-4 text-rose-600 flex-shrink-0" />
              <span>{alertStatus.text}</span>
            </div>
          )}

          <div className="pt-2 flex justify-end">
            <button
              type="submit"
              disabled={alertLoading}
              className="px-6 py-2.5 rounded-xl font-bold bg-slate-900 text-white hover:bg-slate-800 transition flex items-center space-x-2 shadow-md disabled:opacity-50"
            >
              {alertLoading ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span>Mizajou...</span>
                </>
              ) : (
                <>
                  <Save className="w-4 h-4 text-amber-400" />
                  <span>Mete Banyè a a Jou</span>
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
