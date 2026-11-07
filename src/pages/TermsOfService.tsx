import React from 'react';
import { SEOHead } from '../components/SEOHead';
import { FileText, Shield, HeartHandshake, Church, ArrowLeft, Mail, Phone, MapPin } from 'lucide-react';
import { useLanguage } from '../context/LanguageContext';

interface TermsOfServiceProps {
  onNavigate: (path: string) => void;
}

export const TermsOfService: React.FC<TermsOfServiceProps> = ({ onNavigate }) => {
  const { currentLang } = useLanguage();
  const isCreole = currentLang === 'ht';

  return (
    <div className="min-h-screen bg-slate-50 text-slate-800 py-12 px-4 sm:px-6 lg:px-8">
      <SEOHead
        title={isCreole ? "Kondisyon Itilizasyon & Mansyon Legal – Legliz Nazaréen Damé" : "Conditions d’Utilisation & Mentions Légales – Église du Nazaréen de Damé"}
        description="Conditions officielles d’utilisation, mentions légales et règles éthiques du site officiel de l'Église du Nazaréen de Damé, Haïti."
        path="/conditions"
      />

      <div className="max-w-4xl mx-auto space-y-8">
        <button
          onClick={() => onNavigate('/')}
          className="inline-flex items-center space-x-2 text-xs sm:text-sm font-bold text-amber-600 hover:text-amber-700 transition"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>{isCreole ? 'Retounen sou Akèy' : 'Retour à l’accueil'}</span>
        </button>

        <div className="bg-gradient-to-br from-[#071322] via-[#0b1b33] to-[#112442] text-white rounded-3xl p-8 sm:p-12 shadow-2xl border border-amber-500/30 space-y-4">
          <div className="inline-flex items-center space-x-2 px-3 py-1 rounded-full bg-amber-500/20 text-amber-300 text-xs font-bold border border-amber-400/40">
            <Church className="w-4 h-4 text-amber-400" />
            <span>Église du Nazaréen de Damé • Fondée en 1979</span>
          </div>
          <h1 className="font-serif text-2xl sm:text-4xl font-extrabold text-white tracking-tight">
            {isCreole ? 'Kondisyon Jeneral Itilizasyon & Mansyon Legal' : 'Conditions Générales d’Utilisation & Mentions Légales'}
          </h1>
          <p className="text-xs sm:text-sm text-slate-300 max-w-2xl leading-relaxed">
            {isCreole
              ? 'Règ ak prensip ki gouvène itilizasyon sit entènèt ofisyèl www.eglisedunazareendedame.org ak sèvis kominotè nou yo.'
              : 'Règles régissant la consultation et l’utilisation du site officiel www.eglisedunazareendedame.org.'}
          </p>
        </div>

        <div className="bg-white rounded-3xl p-6 sm:p-10 shadow-lg border border-slate-200/80 space-y-8 text-sm leading-relaxed text-slate-700">
          
          <section className="space-y-3">
            <h2 className="text-lg font-serif font-bold text-slate-900 border-b border-slate-100 pb-2">
              1. Mentions Légales &amp; Direction Pastorale
            </h2>
            <p>
              Le site <strong>www.eglisedunazareendedame.org</strong> est édité par l’Église du Nazaréen de Damé, institution chrétienne protestante évangélique située à la 3ème Section Damé, Commune de Môle-Saint-Nicolas, Département du Nord-Ouest, République d’Haïti.
            </p>
            <p>
              <strong>Directeur de publication et autorité pastorale :</strong> Pasteur Bequel CHERELUS, Pasteur Principal depuis 2003.
            </p>
            <p>
              <strong>Fondateur historique :</strong> Frère Saurel ALCINÉ (Fondation en 1979).
            </p>
          </section>

          <section className="space-y-3">
            <h2 className="text-lg font-serif font-bold text-slate-900 border-b border-slate-100 pb-2">
              2. Mission, Doctrine &amp; Utilisation du Site
            </h2>
            <p>
              Ce site a pour vocation la proclamation de l’Évangile de Jésus-Christ, l’édification spirituelle des croyants selon la doctrine de la sanctification entière (« Sainteté à l’Éternel »), la transparence administrative du Secrétariat et le soutien aux enfants parrainés via le Centre CDEJ HA 0926 en partenariat avec Compassion International.
            </p>
          </section>

          <section className="space-y-3">
            <h2 className="text-lg font-serif font-bold text-slate-900 border-b border-slate-100 pb-2">
              3. Propriété Intellectuelle
            </h2>
            <p>
              L’ensemble des contenus présents sur le site (sceau officiel, emblèmes, textes historiques, prédications, enregistrements audio et vidéo, programmes de jeunesse JNI) sont la propriété de l’Église du Nazaréen de Damé ou utilisés avec autorisation. Toute reproduction intégrale ou partielle sans mention de source est interdite.
            </p>
          </section>

          <section className="space-y-3">
            <h2 className="text-lg font-serif font-bold text-slate-900 border-b border-slate-100 pb-2">
              4. Dîmes, Dons &amp; Soutien aux Projets
            </h2>
            <p>
              Les contributions financières (via PayPal, virement bancaire ou MonCash) sont affectées avec intégrité aux œuvres du ministère, à l’entretien du temple, aux secours d’urgence et à l’éducation des enfants du CDEJ. Tout donateur peut obtenir un reçu ou une attestation sur simple demande au Secrétariat.
            </p>
          </section>

          <section className="space-y-3">
            <h2 className="text-lg font-serif font-bold text-slate-900 border-b border-slate-100 pb-2">
              5. Contact &amp; Secrétariat
            </h2>
            <div className="bg-slate-50 p-4 rounded-2xl border border-slate-200 text-xs space-y-1.5">
              <p><strong>Église du Nazaréen de Damé</strong></p>
              <p>3ème Section Damé, Commune de Môle-Saint-Nicolas, Nord-Ouest, Haïti</p>
              <p>Email officiel : <a href="mailto:eglisedunazareendedame@gmail.com" className="text-amber-600 underline">eglisedunazareendedame@gmail.com</a></p>
              <p>Téléphone pastoral : <a href="tel:+50948596089" className="text-amber-600 underline">+509 48596089</a></p>
            </div>
          </section>

        </div>
      </div>
    </div>
  );
};
