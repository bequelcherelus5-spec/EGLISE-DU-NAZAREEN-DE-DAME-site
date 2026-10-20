import React, { useState } from 'react';
import { 
  HeartHandshake, 
  ShieldCheck, 
  CreditCard, 
  Smartphone, 
  Building2, 
  Heart, 
  CheckCircle2, 
  Copy, 
  Check, 
  ExternalLink, 
  Sparkles, 
  FileText, 
  HelpCircle,
  Gift
} from 'lucide-react';
import { PayPalDonationButton } from './PayPalDonationButton';
import { OFFICIAL_CHURCH_INFO } from '../data/churchData';

interface DonationSectionProps {
  onNavigate?: (path: string) => void;
  variant?: 'full' | 'compact';
}

export const DonationSection: React.FC<DonationSectionProps> = ({ 
  onNavigate, 
  variant = 'full' 
}) => {
  const [activeTab, setActiveTab] = useState<'paypal' | 'mobile' | 'bank'>('paypal');
  const [copiedKey, setCopiedKey] = useState<string | null>(null);

  const copyToClipboard = (text: string, key: string) => {
    navigator.clipboard.writeText(text);
    setCopiedKey(key);
    setTimeout(() => setCopiedKey(null), 2500);
  };

  const donationCategories = [
    {
      id: 'dimes',
      title: 'Dîmes & Offrandes Générales',
      verse: 'Malachie 3:10',
      description: 'Pour le service du culte, le sanctuaire, les ministères spirituels et l’édification de l’assemblée de Damé.',
      icon: Heart,
      color: 'from-amber-500/20 to-amber-600/30 border-amber-500/30 text-amber-400',
    },
    {
      id: 'cdej',
      title: 'Projet CDEJ HA 0926 (Enfance)',
      verse: 'Matthieu 25:40',
      description: 'Parrainage, soutien nutritionnel, écolage, santé et formation chrétienne pour plus de 265 enfants à Damé.',
      icon: HeartHandshake,
      color: 'from-emerald-500/20 to-emerald-600/30 border-emerald-500/30 text-emerald-400',
    },
    {
      id: 'chantiers',
      title: 'Chantiers & Action Sociale',
      verse: 'Aggée 1:8',
      description: 'Aménagement du temple, bancs, énergie solaire, secours aux familles démunies et aide d’urgence.',
      icon: Building2,
      color: 'from-indigo-500/20 to-indigo-600/30 border-indigo-500/30 text-indigo-400',
    },
  ];

  return (
    <section id="dons-et-offrandes" className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
      <div className="bg-gradient-to-b from-slate-900 via-slate-900 to-[#071322] rounded-3xl p-6 sm:p-10 lg:p-12 text-white border-2 border-amber-500/30 shadow-2xl relative overflow-hidden">
        {/* Glow décoratif */}
        <div className="absolute top-0 right-1/4 w-96 h-96 bg-amber-500/10 rounded-full blur-3xl pointer-events-none" />

        {/* Header de la section */}
        <div className="text-center max-w-3xl mx-auto space-y-4 relative z-10">
          <div className="inline-flex items-center space-x-2 px-3.5 py-1.5 rounded-full bg-amber-500/10 border border-amber-400/30 text-amber-300 text-xs font-bold uppercase tracking-widest">
            <Gift className="w-3.5 h-3.5 text-amber-400" />
            <span>Soutien Spirituel &amp; Financier Officiel</span>
          </div>

          <h2 className="font-serif text-2xl sm:text-4xl lg:text-5xl font-extrabold text-white leading-tight">
            Dîmes, Offrandes &amp; Soutien aux Œuvres
          </h2>

          <p className="text-sm sm:text-base text-slate-300 leading-relaxed max-w-2xl mx-auto">
            « Chacun de vous donne comme il l'a résolu en son cœur, sans tristesse ni contrainte; car Dieu aime celui qui donne avec joie. » (2 Corinthiens 9:7)
          </p>

          <p className="text-xs sm:text-sm text-amber-300/90 font-medium">
            Votre générosité fait vivre le ministère pastoral, soutient le projet holistique <strong>CDEJ HA 0926 (Compassion International)</strong> et transforme la 3ème Section Damé.
          </p>
        </div>

        {/* 3 Grands Axes de Soutien */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-8 pb-10 relative z-10">
          {donationCategories.map((cat) => {
            const Icon = cat.icon;
            return (
              <div 
                key={cat.id}
                className={`p-5 rounded-2xl bg-gradient-to-br ${cat.color} border backdrop-blur-sm space-y-3 transition hover:scale-[1.01]`}
              >
                <div className="flex items-center justify-between">
                  <div className="p-2.5 rounded-xl bg-slate-950/80 text-amber-400 shadow">
                    <Icon className="w-5 h-5" />
                  </div>
                  <span className="text-[10px] font-bold font-mono text-slate-400 uppercase tracking-wider bg-slate-950/60 px-2 py-0.5 rounded">
                    {cat.verse}
                  </span>
                </div>
                <h3 className="font-serif text-base sm:text-lg font-bold text-white">
                  {cat.title}
                </h3>
                <p className="text-xs text-slate-300 leading-relaxed">
                  {cat.description}
                </p>
              </div>
            );
          })}
        </div>

        {/* Système de Choix du Mode de Don */}
        <div className="bg-slate-950/90 rounded-2xl border border-slate-800 p-6 sm:p-8 max-w-3xl mx-auto relative z-10 space-y-6">
          <div className="flex flex-wrap items-center justify-center gap-2 border-b border-slate-800 pb-4">
            <button
              onClick={() => setActiveTab('paypal')}
              className={`px-4 py-2.5 rounded-xl text-xs font-bold transition flex items-center space-x-2 ${
                activeTab === 'paypal'
                  ? 'bg-amber-500 text-slate-950 shadow-md font-extrabold'
                  : 'bg-slate-900 text-slate-300 hover:bg-slate-800'
              }`}
            >
              <CreditCard className="w-4 h-4" />
              <span>PayPal &amp; Cartes Bancaires (USD)</span>
            </button>

            <button
              onClick={() => setActiveTab('mobile')}
              className={`px-4 py-2.5 rounded-xl text-xs font-bold transition flex items-center space-x-2 ${
                activeTab === 'mobile'
                  ? 'bg-amber-500 text-slate-950 shadow-md font-extrabold'
                  : 'bg-slate-900 text-slate-300 hover:bg-slate-800'
              }`}
            >
              <Smartphone className="w-4 h-4" />
              <span>MonCash &amp; Natcash (Haïti)</span>
            </button>

            <button
              onClick={() => setActiveTab('bank')}
              className={`px-4 py-2.5 rounded-xl text-xs font-bold transition flex items-center space-x-2 ${
                activeTab === 'bank'
                  ? 'bg-amber-500 text-slate-950 shadow-md font-extrabold'
                  : 'bg-slate-900 text-slate-300 hover:bg-slate-800'
              }`}
            >
              <Building2 className="w-4 h-4" />
              <span>Zelle &amp; Virement Bancaire</span>
            </button>
          </div>

          {/* ONGLET 1: PAYPAL BOUTON OFFICIEL HÉBERGÉ (J6F3GVMK9T27Y) */}
          {activeTab === 'paypal' && (
            <div className="space-y-6 animate-in fade-in duration-200">
              <div className="text-center space-y-1.5">
                <div className="inline-flex items-center space-x-1.5 text-xs font-bold text-amber-400">
                  <ShieldCheck className="w-4 h-4 text-emerald-400" />
                  <span>Module Officiel PayPal Hosted Buttons (ID : J6F3GVMK9T27Y)</span>
                </div>
                <h4 className="font-serif text-lg font-bold text-white">
                  Paiement sécurisé par PayPal ou Carte Internationale
                </h4>
                <p className="text-xs text-slate-400 max-w-md mx-auto">
                  Entrez librement le montant en USD que vous souhaitez verser pour les dîmes, offrandes ou le projet CDEJ HA 0926.
                </p>
              </div>

              {/* Bouton officiel PayPal intégré */}
              <div className="p-4 sm:p-6 rounded-2xl bg-slate-900/90 border border-slate-700/80 shadow-inner max-w-md mx-auto">
                <PayPalDonationButton 
                  buttonId="J6F3GVMK9T27Y"
                  containerId="paypal-container-J6F3GVMK9T27Y"
                />
              </div>

              <div className="p-4 rounded-xl bg-slate-900/60 border border-slate-800 text-[11px] text-slate-400 space-y-1 text-center">
                <p>
                  ✓ Reçu de don immédiat délivré par courriel par PayPal.
                </p>
                <p>
                  ✓ Aucun frais caché pour le donateur, transaction cryptée SSL 256 bits.
                </p>
              </div>
            </div>
          )}

          {/* ONGLET 2: TRANSFERTS MOBILES EN HAÏTI (MONCASH & NATCASH) */}
          {activeTab === 'mobile' && (
            <div className="space-y-5 animate-in fade-in duration-200">
              <div className="text-center space-y-1">
                <h4 className="font-serif text-lg font-bold text-white">
                  Transferts Mobiles en Haïti (HTG)
                </h4>
                <p className="text-xs text-slate-400">
                  Numéros officiels autorisés par le Pasteur Titulaire et le Secrétariat paroissial :
                </p>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {/* MonCash Digicel */}
                <div className="p-4 rounded-2xl bg-rose-950/20 border border-rose-500/30 space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="px-2.5 py-0.5 rounded text-[11px] font-bold bg-rose-600 text-white">
                      Digicel MonCash
                    </span>
                    <span className="text-[10px] text-rose-300 font-mono">HTG</span>
                  </div>
                  <div>
                    <span className="text-xs text-slate-400 block font-medium">Bénéficiaire Officiel :</span>
                    <span className="text-sm font-bold text-white block">Pasteur Bequel CHERELUS</span>
                    <span className="text-xs text-slate-400 block">Église du Nazaréen de Damé</span>
                  </div>
                  <div className="flex items-center justify-between bg-slate-950/90 p-2.5 rounded-xl border border-slate-800">
                    <span className="font-mono text-sm font-bold text-amber-400">+509 48 59 60 89</span>
                    <button
                      onClick={() => copyToClipboard('+50948596089', 'moncash1')}
                      className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs flex items-center space-x-1"
                      title="Copier le numéro"
                    >
                      {copiedKey === 'moncash1' ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                    </button>
                  </div>
                  <p className="text-[10px] text-slate-400">
                    Mentionnez en note : « Dîme » ou « Projet CDEJ Damé ».
                  </p>
                </div>

                {/* Natcash Natcom */}
                <div className="p-4 rounded-2xl bg-blue-950/20 border border-blue-500/30 space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="px-2.5 py-0.5 rounded text-[11px] font-bold bg-blue-600 text-white">
                      Natcom Natcash
                    </span>
                    <span className="text-[10px] text-blue-300 font-mono">HTG</span>
                  </div>
                  <div>
                    <span className="text-xs text-slate-400 block font-medium">Bénéficiaire Officiel :</span>
                    <span className="text-sm font-bold text-white block">Direction Pastorale Damé</span>
                    <span className="text-xs text-slate-400 block">Commune Môle-Saint-Nicolas</span>
                  </div>
                  <div className="flex items-center justify-between bg-slate-950/90 p-2.5 rounded-xl border border-slate-800">
                    <span className="font-mono text-sm font-bold text-amber-400">+509 41 87 23 23</span>
                    <button
                      onClick={() => copyToClipboard('+50941872323', 'natcash1')}
                      className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs flex items-center space-x-1"
                      title="Copier le numéro"
                    >
                      {copiedKey === 'natcash1' ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                    </button>
                  </div>
                  <p className="text-[10px] text-slate-400">
                    Envoyez un SMS de confirmation au Secrétariat pour recevoir votre reçu.
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* ONGLET 3: ZELLE & VIREMENTS DIASPORA */}
          {activeTab === 'bank' && (
            <div className="space-y-4 animate-in fade-in duration-200">
              <div className="text-center space-y-1">
                <h4 className="font-serif text-lg font-bold text-white">
                  Diaspora (USA, Canada, Europe) &amp; Virements
                </h4>
                <p className="text-xs text-slate-400">
                  Pour les dons importants, parrainages annuels ou chantiers de construction :
                </p>
              </div>

              <div className="p-4 rounded-2xl bg-slate-900 border border-slate-800 space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-amber-400 uppercase tracking-wide">
                    Zelle Transfer (USA)
                  </span>
                  <span className="text-[10px] font-mono text-slate-400">Sans frais</span>
                </div>
                <div className="flex items-center justify-between bg-slate-950 p-2.5 rounded-xl border border-slate-800 text-xs font-mono">
                  <span className="text-slate-200">eglisedunazareendedame@gmail.com</span>
                  <button
                    onClick={() => copyToClipboard('eglisedunazareendedame@gmail.com', 'zelle')}
                    className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200"
                    title="Copier l'identifiant Zelle"
                  >
                    {copiedKey === 'zelle' ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                  </button>
                </div>
                <p className="text-[11px] text-slate-400">
                  Nom du compte : <strong>Église du Nazaréen de Damé (Support Mission)</strong>
                </p>
              </div>

              <div className="p-4 rounded-2xl bg-slate-900 border border-slate-800 space-y-2 text-xs">
                <span className="font-bold text-white block">Virement Bancaire International (IBAN / SWIFT / Unibank / SOGEBANK) :</span>
                <p className="text-slate-400 text-[11px] leading-relaxed">
                  Pour obtenir les coordonnées bancaires institutionnelles complètes (RIB/SWIFT de la mission nazaréenne), veuillez contacter directement le secrétariat officiel de l'Église.
                </p>
                {onNavigate && (
                  <button
                    onClick={() => onNavigate('/contact')}
                    className="inline-flex items-center space-x-1.5 text-amber-400 hover:text-amber-300 font-bold text-xs pt-1"
                  >
                    <span>Contacter le Secrétariat pour les coordonnées bancaires ›</span>
                  </button>
                )}
              </div>
            </div>
          )}

          {/* Engagement de transparence et contact */}
          <div className="border-t border-slate-800/80 pt-4 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs text-slate-400">
            <div className="flex items-center space-x-2">
              <ShieldCheck className="w-4 h-4 text-emerald-400 flex-shrink-0" />
              <span>Gestion financière transparente et contrôlée par le Comité Paroissial.</span>
            </div>
            {onNavigate && (
              <button
                onClick={() => onNavigate('/contact')}
                className="text-amber-400 hover:text-amber-300 font-semibold"
              >
                Demander un reçu fiscal ou d'Église ›
              </button>
            )}
          </div>
        </div>
      </div>
    </section>
  );
};
