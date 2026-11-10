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
      <div className="bg-[#FAF8F5] rounded-3xl p-6 sm:p-10 lg:p-12 text-stone-900 border border-stone-200 shadow-sm relative overflow-hidden">
        {/* Header de la section */}
        <div className="text-center max-w-3xl mx-auto space-y-3 relative z-10">
          <div className="inline-flex items-center space-x-2 px-3.5 py-1 rounded-full bg-stone-100 border border-stone-200 text-amber-900 text-xs font-bold uppercase tracking-widest">
            <Gift className="w-3.5 h-3.5 text-amber-800" />
            <span>Soutien Spirituel &amp; Financier Officiel</span>
          </div>

          <h2 className="font-serif text-2xl sm:text-4xl lg:text-5xl font-bold text-stone-900 leading-tight">
            Dîmes, Offrandes &amp; Soutien aux Œuvres
          </h2>

          <p className="text-sm sm:text-base text-stone-700 leading-relaxed max-w-2xl mx-auto">
            « Chacun de vous donne comme il l'a résolu en son cœur, sans tristesse ni contrainte; car Dieu aime celui qui donne avec joie. » (2 Corinthiens 9:7)
          </p>

          <p className="text-xs sm:text-sm text-stone-600 font-medium">
            Votre générosité fait vivre le ministère pastoral, soutient le projet holistique <strong className="text-stone-900">CDEJ HA 0926 (Compassion International)</strong> et transforme la 3ème Section Damé.
          </p>
        </div>

        {/* 3 Grands Axes de Soutien */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-8 pb-10 relative z-10">
          {donationCategories.map((cat) => {
            const Icon = cat.icon;
            return (
              <div 
                key={cat.id}
                className="p-5 rounded-2xl bg-white border border-stone-200 space-y-3 transition hover:shadow-xs shadow-2xs"
              >
                <div className="flex items-center justify-between">
                  <div className="p-2.5 rounded-xl bg-amber-50 text-amber-900 border border-amber-200">
                    <Icon className="w-5 h-5" />
                  </div>
                  <span className="text-[10px] font-bold font-serif text-stone-600 uppercase tracking-wider bg-stone-100 px-2 py-0.5 rounded border border-stone-200">
                    {cat.verse}
                  </span>
                </div>
                <h3 className="font-serif text-base sm:text-lg font-bold text-stone-900">
                  {cat.title}
                </h3>
                <p className="text-xs text-stone-600 leading-relaxed">
                  {cat.description}
                </p>
              </div>
            );
          })}
        </div>

        {/* Système de Choix du Mode de Don */}
        <div className="bg-white rounded-2xl border border-stone-200 p-6 sm:p-8 max-w-3xl mx-auto relative z-10 space-y-6 shadow-sm">
          <div 
            className="flex flex-wrap items-center justify-center gap-2 border-b border-stone-100 pb-4"
            style={{ writingMode: 'horizontal-tb', direction: 'ltr' }}
          >
            <button
              onClick={() => setActiveTab('paypal')}
              className={`px-4 py-2 rounded-lg text-xs font-semibold transition flex flex-row items-center space-x-2 whitespace-nowrap ${
                activeTab === 'paypal'
                  ? 'bg-amber-800 text-white shadow-xs font-bold'
                  : 'bg-stone-100 text-stone-700 hover:bg-stone-200'
              }`}
              style={{ writingMode: 'horizontal-tb', direction: 'ltr' }}
            >
              <CreditCard className="w-4 h-4 flex-shrink-0" />
              <span className="whitespace-nowrap">PayPal &amp; Cartes Bancaires (USD)</span>
            </button>

            <button
              onClick={() => setActiveTab('mobile')}
              className={`px-4 py-2 rounded-lg text-xs font-semibold transition flex flex-row items-center space-x-2 whitespace-nowrap ${
                activeTab === 'mobile'
                  ? 'bg-amber-800 text-white shadow-xs font-bold'
                  : 'bg-stone-100 text-stone-700 hover:bg-stone-200'
              }`}
              style={{ writingMode: 'horizontal-tb', direction: 'ltr' }}
            >
              <Smartphone className="w-4 h-4 flex-shrink-0" />
              <span className="whitespace-nowrap">Digicel MonCash (Haïti)</span>
            </button>

            <button
              onClick={() => setActiveTab('bank')}
              className={`px-4 py-2 rounded-lg text-xs font-semibold transition flex flex-row items-center space-x-2 whitespace-nowrap ${
                activeTab === 'bank'
                  ? 'bg-amber-800 text-white shadow-xs font-bold'
                  : 'bg-stone-100 text-stone-700 hover:bg-stone-200'
              }`}
              style={{ writingMode: 'horizontal-tb', direction: 'ltr' }}
            >
              <Building2 className="w-4 h-4 flex-shrink-0" />
              <span className="whitespace-nowrap">Zelle &amp; Virement Bancaire</span>
            </button>
          </div>

          {/* ONGLET 1: PAYPAL HOSTED BUTTONS & CARTES BANCAIRES */}
          {activeTab === 'paypal' && (
            <div className="space-y-6 animate-in fade-in duration-200 w-full" style={{ writingMode: 'horizontal-tb' }}>
              {/* Module officiel PayPal Hosted Buttons */}
              <div className="p-4 sm:p-6 rounded-2xl bg-[#FAF8F5] border border-stone-200 shadow-2xs max-w-xl mx-auto w-full">
                <PayPalDonationButton 
                  buttonId="J6F3GVMK9T27Y"
                  containerId="paypal-container-J6F3GVMK9T27Y"
                  label="DONATION POUR L'EGLISE ET LE CDEND"
                />
              </div>

              <div className="p-3.5 rounded-xl bg-stone-50 border border-stone-200 text-[11px] text-stone-600 space-y-1 text-center">
                <p>
                  ✓ Reçu de don immédiat délivré par courriel par PayPal.
                </p>
                <p>
                  ✓ Aucun frais caché pour le donateur, transaction cryptée SSL 256 bits.
                </p>
              </div>
            </div>
          )}

          {/* ONGLET 2: TRANSFERT MOBILE EN HAÏTI (MONCASH UNIQUEMENT) */}
          {activeTab === 'mobile' && (
            <div className="space-y-5 animate-in fade-in duration-200">
              <div className="text-center space-y-1">
                <h4 className="font-serif text-lg font-bold text-stone-900">
                  Transfert Mobile en Haïti (Digicel MonCash)
                </h4>
                <p className="text-xs text-stone-600">
                  Numéro officiel autorisé par le Pasteur Titulaire et le Secrétariat paroissial :
                </p>
              </div>

              <div className="max-w-md mx-auto">
                {/* MonCash Digicel */}
                <div className="p-5 rounded-2xl bg-white border border-stone-200 space-y-3 shadow-2xs">
                  <div className="flex items-center justify-between">
                    <span className="px-3 py-1 rounded-lg text-xs font-bold bg-rose-700 text-white">
                      Digicel MonCash Officiel
                    </span>
                    <span className="text-xs text-stone-500 font-mono font-bold">HTG</span>
                  </div>
                  <div>
                    <span className="text-xs text-stone-500 block font-medium">Bénéficiaire Officiel :</span>
                    <span className="text-sm sm:text-base font-bold text-stone-900 block">Pasteur Bequel CHERELUS</span>
                    <span className="text-xs text-stone-600 block">Église du Nazaréen de Damé (HA 0926)</span>
                  </div>
                  <div className="flex items-center justify-between bg-[#FAF8F5] p-3 rounded-xl border border-stone-200">
                    <span className="font-mono text-base font-bold text-stone-900 tracking-wider">+509 48 59 60 89</span>
                    <button
                      onClick={() => copyToClipboard('+50948596089', 'moncash1')}
                      className="px-3 py-1.5 rounded-lg bg-stone-100 hover:bg-stone-200 text-stone-800 text-xs font-bold flex items-center space-x-1.5 transition"
                      title="Copier le numéro"
                    >
                      {copiedKey === 'moncash1' ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
                      <span>{copiedKey === 'moncash1' ? 'Copié' : 'Copier'}</span>
                    </button>
                  </div>
                  <p className="text-[11px] text-stone-500 text-center pt-1">
                    Mentionnez en note : « Dîme » ou « Projet Sonorisation &amp; Temple ».
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* ONGLET 3: ZELLE & VIREMENTS DIASPORA */}
          {activeTab === 'bank' && (
            <div className="space-y-4 animate-in fade-in duration-200">
              <div className="text-center space-y-1">
                <h4 className="font-serif text-lg font-bold text-stone-900">
                  Diaspora (USA, Canada, Europe) &amp; Virements
                </h4>
                <p className="text-xs text-stone-600">
                  Pour les dons importants, parrainages annuels ou chantiers de construction :
                </p>
              </div>

              <div className="p-4 rounded-2xl bg-[#FAF8F5] border border-stone-200 space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-amber-900 uppercase tracking-wide">
                    Zelle Transfer (USA)
                  </span>
                  <span className="text-[10px] font-mono text-stone-500">Sans frais</span>
                </div>
                <div className="flex items-center justify-between bg-white p-2.5 rounded-xl border border-stone-200 text-xs font-mono">
                  <span className="text-stone-800 font-semibold">contact@eglisedunazareendedame.org</span>
                  <button
                    onClick={() => copyToClipboard('contact@eglisedunazareendedame.org', 'zelle')}
                    className="p-1.5 rounded-lg bg-stone-100 hover:bg-stone-200 text-stone-700"
                    title="Copier l'identifiant Zelle"
                  >
                    {copiedKey === 'zelle' ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
                  </button>
                </div>
                <p className="text-[11px] text-stone-600">
                  Nom du compte : <strong className="text-stone-900">Église du Nazaréen de Damé (Support Mission)</strong>
                </p>
              </div>

              <div className="p-4 rounded-2xl bg-[#FAF8F5] border border-stone-200 space-y-2 text-xs">
                <span className="font-bold text-stone-900 block">Virement Bancaire International (IBAN / SWIFT / Unibank / SOGEBANK) :</span>
                <p className="text-stone-600 text-[11px] leading-relaxed">
                  Pour obtenir les coordonnées bancaires institutionnelles complètes (RIB/SWIFT de la mission nazaréenne), veuillez contacter directement le secrétariat officiel de l'Église.
                </p>
                {onNavigate && (
                  <button
                    onClick={() => onNavigate('/contact')}
                    className="inline-flex items-center space-x-1.5 text-amber-800 hover:text-amber-950 font-bold text-xs pt-1"
                  >
                    <span>Contacter le Secrétariat pour les coordonnées bancaires ›</span>
                  </button>
                )}
              </div>
            </div>
          )}

          {/* Engagement de transparence et contact */}
          <div className="border-t border-stone-100 pt-4 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs text-stone-600">
            <div className="flex items-center space-x-2">
              <ShieldCheck className="w-4 h-4 text-emerald-700 flex-shrink-0" />
              <span>Gestion financière transparente et contrôlée par le Comité Paroissial.</span>
            </div>
            {onNavigate && (
              <button
                onClick={() => onNavigate('/contact')}
                className="text-amber-800 hover:text-amber-950 font-semibold"
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
