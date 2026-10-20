import React from 'react';
import { SEOHead } from '../components/SEOHead';
import { DonationSection } from '../components/DonationSection';
import { 
  HeartHandshake, 
  ShieldCheck, 
  BookOpen, 
  Users, 
  MapPin, 
  Calendar,
  Sparkles,
  Quote,
  ArrowRight,
  CheckCircle2,
  Lock
} from 'lucide-react';
import { OFFICIAL_CHURCH_INFO, OFFICIAL_PROJECT_CDEJ } from '../data/churchData';

interface DonationsProps {
  onNavigate: (path: string) => void;
}

export const Donations: React.FC<DonationsProps> = ({ onNavigate }) => {
  return (
    <div className="space-y-16 pb-20">
      <SEOHead 
        title="Dîmes, Offrandes & Dons Sécurisés | Église du Nazaréen de Damé"
        description="Contribuez aux dîmes, offrandes et soutenez le projet CDEJ HA 0926 Compassion International à Damé via PayPal officiel, MonCash, Natcash ou virement bancaire."
        path="/faire-un-don"
        image="/images/eglise/og-banner.svg"
      />

      {/* Hero Header */}
      <section className="relative bg-gradient-to-b from-[#071322] via-[#0b1b33] to-[#112442] text-white py-16 sm:py-24 px-4 overflow-hidden border-b border-amber-500/20">
        <div className="max-w-5xl mx-auto text-center space-y-6 relative z-10">
          <div className="inline-flex items-center space-x-2 px-4 py-1.5 rounded-full bg-amber-500/10 border border-amber-400/40 text-amber-300 text-xs font-bold uppercase tracking-widest">
            <HeartHandshake className="w-4 h-4 text-amber-400" />
            <span>Soutien Financier &amp; Bénédictions Spirituelles</span>
          </div>

          <h1 className="font-serif text-3xl sm:text-5xl lg:text-6xl font-extrabold text-white leading-tight">
            Dîmes, Offrandes &amp; Dons en Ligne
          </h1>

          <p className="text-slate-300 text-base sm:text-lg md:text-xl max-w-3xl mx-auto leading-relaxed">
            Participez fidèlement à l’avancement du Royaume de Dieu, au ministère pastoral et à l’encadrement des enfants vulnérables de Damé à travers notre projet officiel <strong className="text-amber-400">CDEJ HA 0926</strong>.
          </p>

          <div className="flex flex-wrap items-center justify-center gap-4 text-xs font-medium text-slate-300 pt-2">
            <span className="flex items-center space-x-1.5 bg-slate-900/80 px-3.5 py-1.5 rounded-xl border border-slate-700">
              <ShieldCheck className="w-4 h-4 text-emerald-400" />
              <span>Module Officiel PayPal (USD)</span>
            </span>
            <span className="flex items-center space-x-1.5 bg-slate-900/80 px-3.5 py-1.5 rounded-xl border border-slate-700">
              <Lock className="w-4 h-4 text-amber-400" />
              <span>MonCash &amp; Natcash Haïti</span>
            </span>
            <span className="flex items-center space-x-1.5 bg-slate-900/80 px-3.5 py-1.5 rounded-xl border border-slate-700">
              <CheckCircle2 className="w-4 h-4 text-amber-400" />
              <span>Transparence &amp; Intégrité Chrétienne</span>
            </span>
          </div>
        </div>
      </section>

      {/* Module Principal de Don */}
      <DonationSection onNavigate={onNavigate} />

      {/* Fondements Bibliques et Témoignage pastoral */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {/* Card Biblique */}
          <div className="p-8 rounded-3xl bg-white border border-slate-200 shadow-sm space-y-4">
            <div className="inline-flex items-center space-x-2 text-amber-600 font-bold text-xs uppercase tracking-wider">
              <BookOpen className="w-4 h-4" />
              <span>Enseignement Nazaréen sur les Dîmes</span>
            </div>
            <h3 className="font-serif text-2xl font-bold text-slate-900">
              Pourquoi donnons-nous à l'Église ?
            </h3>
            <p className="text-sm text-slate-600 leading-relaxed">
              Dans l’Église du Nazaréen, nous croyons que la dîme appartient au Seigneur. Donner avec joie et régularité n'est pas une simple obligation matérielle, mais un acte d'adoration, d'obéissance et de reconnaissance pour les bienfaits de Dieu dans nos vies.
            </p>
            <div className="p-4 rounded-2xl bg-amber-50/80 border border-amber-200 text-xs text-amber-950 font-serif italic space-y-1">
              <p>« Apportez à la maison du trésor toutes les dîmes, afin qu'il y ait de la nourriture dans ma maison; mettez-moi de la sorte à l'épreuve, dit l'Éternel des armées... »</p>
              <p className="font-sans font-bold text-amber-800 text-right">— Malachie 3:10</p>
            </div>
          </div>

          {/* Card Impact CDEJ HA 0926 */}
          <div className="p-8 rounded-3xl bg-slate-900 text-white border border-amber-500/30 shadow-xl space-y-4">
            <div className="inline-flex items-center space-x-2 text-emerald-400 font-bold text-xs uppercase tracking-wider">
              <Users className="w-4 h-4" />
              <span>Impact Concret à Damé</span>
            </div>
            <h3 className="font-serif text-2xl font-bold text-white">
              Où va votre soutien ?
            </h3>
            <p className="text-sm text-slate-300 leading-relaxed">
              Chaque contribution est affectée selon votre intention :
            </p>
            <ul className="space-y-2 text-xs text-slate-300">
              <li className="flex items-start space-x-2">
                <CheckCircle2 className="w-4 h-4 text-amber-400 flex-shrink-0 mt-0.5" />
                <span><strong>Culte &amp; Évangélisation :</strong> Frais de fonctionnement du sanctuaire, cellules de prière et diffusion radio.</span>
              </li>
              <li className="flex items-start space-x-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-400 flex-shrink-0 mt-0.5" />
                <span><strong>Enfance &amp; Éducation (CDEJ HA 0926) :</strong> Repas chauds, fournitures scolaires, soins médicaux des 265+ enfants.</span>
              </li>
              <li className="flex items-start space-x-2">
                <CheckCircle2 className="w-4 h-4 text-indigo-400 flex-shrink-0 mt-0.5" />
                <span><strong>Bâtiment &amp; Secours :</strong> Amélioration des infrastructures paroissiales et assistance aux veuves et orphelins de Damé.</span>
              </li>
            </ul>

            <div className="pt-2">
              <button
                onClick={() => onNavigate('/projets')}
                className="inline-flex items-center space-x-2 text-amber-300 hover:text-amber-200 text-xs font-bold"
              >
                <span>Consulter tous les projets officiels de l'Église ›</span>
              </button>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};
