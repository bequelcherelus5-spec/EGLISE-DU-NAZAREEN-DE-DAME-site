import React, { useState } from 'react';
import { OFFICIAL_MINISTRIES, OFFICIAL_CHURCH_INFO, SUNDAY_ROTATION_RULES } from '../data/churchData';
import { SEOHead } from '../components/SEOHead';
import { 
  Users, 
  Calendar, 
  Clock, 
  BookOpen, 
  Sparkles, 
  Send, 
  CheckCircle2, 
  Heart, 
  Shield, 
  Flame, 
  Compass, 
  Smile,
  ChevronRight,
  Sun,
  Award
} from 'lucide-react';

interface MinistriesProps {
  onNavigate: (path: string) => void;
}

export const Ministries: React.FC<MinistriesProps> = ({ onNavigate }) => {
  const [selectedMinistry, setSelectedMinistry] = useState<string>(OFFICIAL_MINISTRIES[0].slug);
  const [joinModalOpen, setJoinModalOpen] = useState(false);
  const [joinForm, setJoinForm] = useState({
    name: '',
    phone: '',
    email: '',
    ministry: OFFICIAL_MINISTRIES[0].name,
    note: ''
  });
  const [submitted, setSubmitted] = useState(false);

  const active = OFFICIAL_MINISTRIES.find(m => m.slug === selectedMinistry) || OFFICIAL_MINISTRIES[0];

  const handleJoinSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitted(true);
    setTimeout(() => {
      setSubmitted(false);
      setJoinModalOpen(false);
      setJoinForm({
        name: '',
        phone: '',
        email: '',
        ministry: OFFICIAL_MINISTRIES[0].name,
        note: ''
      });
    }, 2500);
  };

  return (
    <div className="space-y-16 pb-16">
      <SEOHead 
        title="Ministères & Rotation des Dimanches – Église du Nazaréen de Damé"
        description="Organisation des ministères et rotation officielle des dimanches à l’Église de Damé : 1er Dimanche (Global), 2ème (Dames), 3ème (Jeunesse), 4ème (Enfants), 5ème (Famille)."
        path="/ministeres"
        image="/images/ministeres/ministere-badge.svg"
      />

      {/* Header */}
      <section className="bg-gradient-to-b from-[#071322] to-[#0b1b33] text-white py-16 px-4 border-b border-amber-500/20">
        <div className="max-w-4xl mx-auto text-center space-y-4">
          <div className="inline-flex items-center space-x-2 px-3.5 py-1 rounded-full bg-amber-500/10 border border-amber-400/30 text-amber-300 text-xs font-bold uppercase tracking-widest">
            <Users className="w-3.5 h-3.5" />
            <span>Service &amp; Vocation Chrétienne</span>
          </div>

          <h1 className="font-serif text-3xl sm:text-5xl font-extrabold text-white">
            Les Ministères &amp; la Rotation des Dimanches
          </h1>

          <p className="text-slate-300 text-base sm:text-lg max-w-2xl mx-auto leading-relaxed">
            Une organisation officielle consacrant chaque dimanche du mois à un ministère dédié, et le 5ème dimanche à la famille chrétienne.
          </p>
        </div>
      </section>

      {/* SECTION OFFICIELLE : RÈGLE DE ROTATION DES DIMANCHES */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 -mt-8 relative z-20">
        <div className="bg-white rounded-3xl p-6 sm:p-8 shadow-2xl border-2 border-amber-500/30">
          <div className="flex flex-col md:flex-row items-start md:items-center justify-between pb-6 border-b border-slate-100 gap-4">
            <div>
              <div className="inline-flex items-center space-x-2 px-3 py-1 rounded-full bg-amber-100 text-amber-900 text-xs font-bold mb-1">
                <Sun className="w-3.5 h-3.5 text-amber-600" />
                <span>Règle Officielle des Cultes du Dimanche</span>
              </div>
              <h2 className="font-serif text-2xl sm:text-3xl font-extrabold text-slate-900">
                Calendrier Mensuel de Célébration par Ministère
              </h2>
            </div>
            <p className="text-xs text-slate-500 max-w-md">
              Chaque ministère conduit le culte avec ferveur selon l'ordre ecclésial établi sous la direction pastorale de Bequel CHERELUS.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4 pt-6">
            {SUNDAY_ROTATION_RULES.map((rule) => (
              <div 
                key={rule.sundayNumber}
                onClick={() => {
                  const m = OFFICIAL_MINISTRIES.find(item => item.id === rule.ministryId);
                  if (m) {
                    setSelectedMinistry(m.slug);
                    window.scrollTo({ top: 580, behavior: 'smooth' });
                  }
                }}
                className={`p-4 rounded-2xl border cursor-pointer hover:shadow-lg transition-all duration-200 flex flex-col justify-between ${
                  rule.sundayNumber === 5 
                    ? 'bg-gradient-to-br from-purple-50 to-purple-100/50 border-purple-200 hover:border-purple-400' 
                    : 'bg-slate-50 border-slate-200 hover:border-amber-400'
                }`}
              >
                <div>
                  <span className={`inline-block text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full ${rule.badgeColor}`}>
                    {rule.title}
                  </span>
                  <h4 className="font-serif font-bold text-slate-900 text-base mt-2">
                    {rule.theme}
                  </h4>
                  <p className="text-xs text-slate-600 mt-2 leading-relaxed">
                    {rule.description}
                  </p>
                </div>
                <div className="pt-3 mt-3 border-t border-slate-200/60 flex items-center justify-between text-[11px] font-bold text-amber-700">
                  <span>En savoir plus</span>
                  <ChevronRight className="w-3.5 h-3.5" />
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Navigation Pills */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-wrap items-center justify-center gap-2 border-b border-slate-200 pb-4">
          {OFFICIAL_MINISTRIES.map((m) => {
            const isSelected = selectedMinistry === m.slug;
            return (
              <button
                key={m.slug}
                onClick={() => setSelectedMinistry(m.slug)}
                className={`px-4 py-2 rounded-xl text-xs sm:text-sm font-bold transition-all shadow-sm ${
                  isSelected
                    ? 'bg-amber-500 text-slate-950 shadow-amber-500/20 scale-105'
                    : 'bg-white text-slate-700 hover:bg-slate-100 border border-slate-200'
                }`}
              >
                {m.name}
              </button>
            );
          })}
        </div>
      </section>

      {/* Detailed Ministry Showcase */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="bg-white rounded-3xl p-8 sm:p-12 shadow-xl border border-slate-200 grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
          <div className="lg:col-span-7 space-y-5">
            <div className="flex items-center space-x-3">
              <span className="text-xs font-bold uppercase tracking-widest text-amber-600 bg-amber-50 px-3 py-1 rounded-md border border-amber-200">
                {active.schedule}
              </span>
              <span className="text-xs text-slate-500 font-medium">
                Responsable : {active.leader}
              </span>
            </div>

            <h2 className="font-serif text-3xl sm:text-4xl font-extrabold text-slate-900">
              {active.name}
            </h2>

            <p className="text-sm sm:text-base text-slate-700 leading-relaxed">
              {active.description}
            </p>

            <div className="bg-amber-50/80 border-l-4 border-amber-500 p-4 rounded-r-xl text-xs sm:text-sm text-slate-800 italic font-serif">
              {active.verse}
            </div>

            <div className="pt-2 flex flex-wrap gap-4">
              <button
                onClick={() => {
                  setJoinForm(prev => ({ ...prev, ministry: active.name }));
                  setJoinModalOpen(true);
                }}
                className="px-6 py-3 rounded-xl text-xs font-bold bg-slate-900 text-amber-300 hover:bg-slate-800 transition flex items-center space-x-2"
              >
                <span>Rejoindre ou Soutenir ce Ministère</span>
                <ChevronRight className="w-4 h-4" />
              </button>

              <button
                onClick={() => onNavigate('/evenements')}
                className="px-6 py-3 rounded-xl text-xs font-bold bg-slate-100 text-slate-800 hover:bg-slate-200 transition"
              >
                Voir les horaires complets
              </button>
            </div>
          </div>

          <div className="lg:col-span-5 flex justify-center">
            <div className="relative group max-w-sm w-full">
              <div className="rounded-2xl overflow-hidden border-2 border-amber-500/40 shadow-2xl bg-slate-950 p-2">
                <img
                  src={active.image}
                  alt={active.name}
                  className="w-full h-72 object-cover rounded-xl"
                />
                <div className="p-3 text-center">
                  <p className="text-xs text-slate-400 font-medium">Église du Nazaréen de Damé</p>
                  <p className="text-amber-400 font-serif font-bold text-sm">« Sainteté à l’Éternel »</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Grid of all 7 ministries */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <h3 className="font-serif text-2xl font-bold text-slate-900 mb-6">
          Vue d'ensemble des 7 Ministères
        </h3>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {OFFICIAL_MINISTRIES.map((m) => (
            <div
              key={m.id}
              onClick={() => {
                setSelectedMinistry(m.slug);
                window.scrollTo({ top: 380, behavior: 'smooth' });
              }}
              className={`p-6 rounded-2xl cursor-pointer transition-all border ${
                selectedMinistry === m.slug
                  ? 'bg-slate-900 text-white border-amber-400 shadow-xl scale-[1.02]'
                  : 'bg-white text-slate-800 border-slate-200 hover:border-amber-400/50 shadow-sm'
              }`}
            >
              <div className="flex items-center justify-between mb-2">
                <span className={`text-[11px] font-bold px-2 py-0.5 rounded ${
                  selectedMinistry === m.slug ? 'bg-amber-500 text-slate-950' : 'bg-slate-100 text-slate-600'
                }`}>
                  {m.schedule}
                </span>
              </div>
              <h4 className="font-serif font-bold text-base mt-2">{m.name}</h4>
              <p className={`text-xs mt-2 leading-relaxed ${
                selectedMinistry === m.slug ? 'text-slate-300' : 'text-slate-600'
              }`}>
                {m.shortDescription}
              </p>
            </div>
          ))}
        </div>
      </section>

      {/* Join Ministry Modal */}
      {joinModalOpen && (
        <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-4 animate-in fade-in duration-150">
          <div className="bg-white rounded-3xl max-w-lg w-full p-6 sm:p-8 shadow-2xl border border-amber-500/40 space-y-4">
            <div className="flex items-center justify-between border-b pb-3">
              <h3 className="font-serif font-bold text-slate-900 text-lg">
                S'engager dans un Ministère
              </h3>
              <button
                onClick={() => setJoinModalOpen(false)}
                className="text-slate-400 hover:text-slate-600 text-xl font-bold"
              >
                ✕
              </button>
            </div>

            {submitted ? (
              <div className="py-8 text-center space-y-2">
                <CheckCircle2 className="w-12 h-12 text-emerald-500 mx-auto" />
                <h4 className="font-serif font-bold text-slate-900 text-lg">
                  Merci pour votre engagement !
                </h4>
                <p className="text-xs text-slate-600">
                  Votre demande a été transmise au secrétariat de l’Église. Le responsable du ministère prendra contact avec vous.
                </p>
              </div>
            ) : (
              <form onSubmit={handleJoinSubmit} className="space-y-3">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Ministère choisi</label>
                  <select
                    value={joinForm.ministry}
                    onChange={(e) => setJoinForm({ ...joinForm, ministry: e.target.value })}
                    className="w-full px-3 py-2 text-xs rounded-lg border border-slate-300 focus:outline-none focus:border-amber-500"
                  >
                    {OFFICIAL_MINISTRIES.map(m => (
                      <option key={m.id} value={m.name}>{m.name}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Votre Nom &amp; Prénom *</label>
                  <input
                    type="text"
                    required
                    value={joinForm.name}
                    onChange={(e) => setJoinForm({ ...joinForm, name: e.target.value })}
                    placeholder="Ex: Frère Pierre Jean"
                    className="w-full px-3 py-2 text-xs rounded-lg border border-slate-300 focus:outline-none focus:border-amber-500"
                  />
                </div>

                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">Téléphone *</label>
                    <input
                      type="tel"
                      required
                      value={joinForm.phone}
                      onChange={(e) => setJoinForm({ ...joinForm, phone: e.target.value })}
                      placeholder="+509 ..."
                      className="w-full px-3 py-2 text-xs rounded-lg border border-slate-300 focus:outline-none focus:border-amber-500"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">Email</label>
                    <input
                      type="email"
                      value={joinForm.email}
                      onChange={(e) => setJoinForm({ ...joinForm, email: e.target.value })}
                      placeholder="email@..."
                      className="w-full px-3 py-2 text-xs rounded-lg border border-slate-300 focus:outline-none focus:border-amber-500"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Message ou motivation</label>
                  <textarea
                    rows={3}
                    value={joinForm.note}
                    onChange={(e) => setJoinForm({ ...joinForm, note: e.target.value })}
                    placeholder="Pourquoi souhaitez-vous servir dans ce ministère ?"
                    className="w-full px-3 py-2 text-xs rounded-lg border border-slate-300 focus:outline-none focus:border-amber-500"
                  />
                </div>

                <div className="pt-2 flex justify-end space-x-2">
                  <button
                    type="button"
                    onClick={() => setJoinModalOpen(false)}
                    className="px-4 py-2 rounded-lg text-xs font-semibold text-slate-600 hover:bg-slate-100"
                  >
                    Annuler
                  </button>
                  <button
                    type="submit"
                    className="px-5 py-2 rounded-lg text-xs font-bold bg-amber-500 text-slate-950 hover:bg-amber-400"
                  >
                    Envoyer ma demande
                  </button>
                </div>
              </form>
            )}
          </div>
        </div>
      )}
    </div>
  );
};
