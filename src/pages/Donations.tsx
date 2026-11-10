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
        description="Contribuez aux dîmes, offrandes et soutenez le projet CDEJ HA 0926 Compassion International à Damé via PayPal officiel, MonCash ou virement bancaire."
        path="/faire-un-don"
        image="/images/eglise/og-banner.svg"
      />

      {/* Hero Header */}
      <section className="bg-[#F7F4EE] text-stone-900 py-12 sm:py-16 px-4 border-b border-stone-200">
        <div className="max-w-5xl mx-auto text-center space-y-4">
          <div className="inline-flex items-center space-x-2 px-3.5 py-1 rounded-full bg-stone-100 border border-stone-200 text-amber-900 text-xs font-bold uppercase tracking-widest">
            <HeartHandshake className="w-3.5 h-3.5 text-amber-800" />
            <span>Soutien Financier &amp; Bénédictions Spirituelles</span>
          </div>

          <h1 className="font-serif text-3xl sm:text-5xl lg:text-6xl font-bold text-stone-900 leading-tight">
            Dîmes, Offrandes &amp; Dons en Ligne
          </h1>

          <p className="text-stone-700 text-base sm:text-lg max-w-3xl mx-auto leading-relaxed">
            Participez fidèlement à l’avancement du Royaume de Dieu, au ministère pastoral et à l’encadrement des enfants vulnérables de Damé à travers notre projet officiel <strong className="text-amber-900">CDEJ HA 0926</strong>.
          </p>

          <div className="flex flex-wrap items-center justify-center gap-3 text-xs font-medium text-stone-700 pt-2">
            <span className="flex items-center space-x-1.5 bg-white px-3.5 py-1.5 rounded-lg border border-stone-200 shadow-2xs">
              <ShieldCheck className="w-4 h-4 text-emerald-700" />
              <span>Module Officiel PayPal (USD)</span>
            </span>
            <span className="flex items-center space-x-1.5 bg-white px-3.5 py-1.5 rounded-lg border border-stone-200 shadow-2xs">
              <Lock className="w-4 h-4 text-amber-800" />
              <span>Digicel MonCash Haïti</span>
            </span>
            <span className="flex items-center space-x-1.5 bg-white px-3.5 py-1.5 rounded-lg border border-stone-200 shadow-2xs">
              <CheckCircle2 className="w-4 h-4 text-amber-800" />
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
          <div className="p-6 sm:p-8 rounded-2xl bg-[#FAF7F2] text-stone-900 border border-stone-200/90 shadow-2xs space-y-4">
            <p className="text-emerald-800 font-serif font-bold text-xs uppercase tracking-wider">
              Impact Concret à Damé
            </p>
            <h3 className="font-serif text-2xl font-bold text-stone-900">
              Où va votre soutien ?
            </h3>
            <p className="text-sm text-stone-700 leading-relaxed">
              Chaque contribution est affectée selon votre intention :
            </p>
            <ul className="space-y-2 text-xs text-stone-700">
              <li className="flex items-start space-x-2">
                <CheckCircle2 className="w-4 h-4 text-amber-800 flex-shrink-0 mt-0.5" />
                <span><strong>Culte &amp; Évangélisation :</strong> Frais de fonctionnement du sanctuaire, cellules de prière et diffusion.</span>
              </li>
              <li className="flex items-start space-x-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-800 flex-shrink-0 mt-0.5" />
                <span><strong>Enfance &amp; Éducation (CDEJ HA 0926) :</strong> Repas chauds, fournitures scolaires, soins médicaux des +200 enfants parrainés.</span>
              </li>
              <li className="flex items-start space-x-2">
                <CheckCircle2 className="w-4 h-4 text-stone-700 flex-shrink-0 mt-0.5" />
                <span><strong>Bâtiment &amp; Secours :</strong> Amélioration des infrastructures paroissiales et assistance aux veuves et orphelins de Damé.</span>
              </li>
            </ul>

            <div className="pt-2">
              <button
                onClick={() => onNavigate('/projets')}
                className="inline-flex items-center space-x-2 text-stone-900 hover:text-amber-900 text-xs font-serif font-bold"
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
