import React from 'react';
import { SEOHead } from '../components/SEOHead';
import { ShieldCheck, Lock, Eye, FileText, Mail, Phone, MapPin, ExternalLink, ArrowLeft } from 'lucide-react';
import { useLanguage } from '../context/LanguageContext';

interface PrivacyPolicyProps {
  onNavigate: (path: string) => void;
}

export const PrivacyPolicy: React.FC<PrivacyPolicyProps> = ({ onNavigate }) => {
  const { currentLang } = useLanguage();
  const isCreole = currentLang === 'ht';

  return (
    <div className="min-h-screen bg-slate-50 text-slate-800 py-12 px-4 sm:px-6 lg:px-8">
      <SEOHead
        title={isCreole ? "Règleman sou Vi Prive & Konfidansyalite – Legliz Nazaréen Damé" : "Politique de Confidentialité & AdSense – Église du Nazaréen de Damé"}
        description="Politique officielle de protection de la vie privée, gestion des cookies, Google Analytics et Google AdSense (pub-7382968203880435) pour l'Église du Nazaréen de Damé."
        path="/confidentialite"
      />

      <div className="max-w-4xl mx-auto space-y-8">
        {/* Breadcrumb / Back button */}
        <button
          onClick={() => onNavigate('/')}
          className="inline-flex items-center space-x-2 text-xs sm:text-sm font-bold text-amber-600 hover:text-amber-700 transition"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>{isCreole ? 'Retounen sou Akèy' : 'Retour à l’accueil'}</span>
        </button>

        {/* Header Hero */}
        <div className="bg-gradient-to-br from-[#071322] via-[#0b1b33] to-[#112442] text-white rounded-3xl p-8 sm:p-12 shadow-2xl border border-amber-500/30 space-y-4">
          <div className="inline-flex items-center space-x-2 px-3 py-1 rounded-full bg-amber-500/20 text-amber-300 text-xs font-bold border border-amber-400/40">
            <ShieldCheck className="w-4 h-4 text-amber-400" />
            <span>{isCreole ? 'Pwoteksyon Done & Konfòmite Google' : 'Protection des Données & Conformité Google'}</span>
          </div>
          <h1 className="font-serif text-2xl sm:text-4xl font-extrabold text-white tracking-tight">
            {isCreole ? 'Règleman sou Vi Prive & Jesyon Cookie' : 'Politique de Confidentialité & Cookies'}
          </h1>
          <p className="text-xs sm:text-sm text-slate-300 max-w-2xl leading-relaxed">
            {isCreole
              ? 'Legliz Nazaréen de Damé pran angajman pou pwoteje enfòmasyon pèsonèl ou lè w ap itilize sit ofisyèl nou an (www.eglisedunazareendedame.org).'
              : 'L’Église du Nazaréen de Damé s’engage à protéger la vie privée des fidèles et des visiteurs de son site officiel (www.eglisedunazareendedame.org).'}
          </p>
          <p className="text-2xs text-amber-400/80 font-mono">
            {isCreole ? 'Dènye mizajou : 7 Novanm 2026' : 'Dernière mise à jour : 7 Novembre 2026'} • Réf. Éditeur AdSense : pub-7382968203880435
          </p>
        </div>

        {/* Content Card */}
        <div className="bg-white rounded-3xl p-6 sm:p-10 shadow-lg border border-slate-200/80 space-y-8 text-sm leading-relaxed text-slate-700">
          
          {/* Section 1: Qui sommes-nous ? */}
          <section className="space-y-3">
            <h2 className="text-lg font-serif font-bold text-slate-900 flex items-center gap-2 border-b border-slate-100 pb-2">
              <span className="w-7 h-7 rounded-lg bg-amber-100 text-amber-800 flex items-center justify-center text-xs font-bold">1</span>
              <span>{isCreole ? 'Kiyès nou ye ?' : 'Qui sommes-nous ?'}</span>
            </h2>
            <p>
              {isCreole
                ? 'Sit entènèt www.eglisedunazareendedame.org se sit ofisyèl Église du Nazaréen de Damé, ki te fonde an 1979 nan 3èm Seksyon Damé, Komin Mòl Sen Nikola, Depatman Nòdwès, Ayiti, anba direksyon pastoral Pasteur Bequel CHERELUS.'
                : 'Le site www.eglisedunazareendedame.org est la plateforme numérique officielle de l’Église du Nazaréen de Damé, congrégation chrétienne protestante fondée en 1979 à la 3ème Section Damé, Commune de Môle-Saint-Nicolas, Département du Nord-Ouest, Haïti, sous la direction pastorale du Pasteur Bequel CHERELUS.'}
            </p>
          </section>

          {/* Section 2: Données collectées */}
          <section className="space-y-3">
            <h2 className="text-lg font-serif font-bold text-slate-900 flex items-center gap-2 border-b border-slate-100 pb-2">
              <span className="w-7 h-7 rounded-lg bg-amber-100 text-amber-800 flex items-center justify-center text-xs font-bold">2</span>
              <span>{isCreole ? 'Ki done nou kolekte ?' : 'Quelles données collectons-nous ?'}</span>
            </h2>
            <p>
              {isCreole
                ? 'Nou kolekte sèlman enfòmasyon ou chwazi pataje avèk nou pou bezwen ministè legliz la :'
                : 'Nous ne collectons que les informations strictement nécessaires à la vie de la communauté et aux services spirituels :'
              }
            </p>
            <ul className="list-disc list-inside space-y-1.5 pl-2 text-slate-600">
              <li><strong>Newsletter :</strong> {isCreole ? 'Adrès imèl ak prenon ou pou w resevwa mesaj edifikasyon ak anons legliz la.' : 'Votre adresse email et prénom pour recevoir les enseignements et annonces de culte.'}</li>
              <li><strong>Priyè Sekrè :</strong> {isCreole ? 'Mesaj priyè ou soumèt konfidansyèlman pou ekip pastoral la.' : 'Les intentions de prière envoyées en toute discrétion à l’équipe pastorale.'}</li>
              <li><strong>Fòm Kontak & Dokiman :</strong> {isCreole ? 'Non, nimewo telefòn ak detay demann sètifika legliz la.' : 'Nom, coordonnées téléphoniques et détails de vos demandes administratives (baptême, mariage, etc.).'}</li>
            </ul>
          </section>

          {/* Section 3: Google AdSense & Cookies Publicitaires (CRITIQUE POUR L'APPROBATION) */}
          <section className="space-y-3 bg-amber-50/70 p-6 rounded-2xl border border-amber-200">
            <h2 className="text-lg font-serif font-bold text-amber-950 flex items-center gap-2">
              <span className="w-7 h-7 rounded-lg bg-amber-500 text-slate-950 flex items-center justify-center text-xs font-bold">3</span>
              <span>Google AdSense &amp; Cookies Publicitaires Tiers</span>
            </h2>
            <p className="text-amber-900">
              Notre site participe au programme <strong>Google AdSense</strong> (Référence éditeur : <code>pub-7382968203880435</code>) pour soutenir financièrement les œuvres sociales, le projet CDEJ HA 0926 et la diffusion de l’Évangile.
            </p>
            <div className="space-y-2 text-xs text-amber-950 leading-relaxed">
              <p>
                • <strong>Utilisation des cookies par les fournisseurs tiers :</strong> Des fournisseurs tiers, y compris Google, utilisent des cookies pour diffuser des annonces sur notre site Web en fonction des visites antérieures des internautes sur notre site ou sur d'autres sites.
              </p>
              <p>
                • <strong>Cookies publicitaires Google :</strong> Grâce aux cookies publicitaires, Google et ses partenaires adaptent les annonces diffusées auprès de nos visiteurs en fonction de leur navigation sur notre site et/ou d'autres sites du Web.
              </p>
              <p>
                • <strong>Désactivation de la publicité personnalisée :</strong> Vous pouvez à tout moment choisir de désactiver les annonces personnalisées en consultant la page officielle de <a href="https://adssettings.google.com" target="_blank" rel="noopener noreferrer" className="text-amber-700 font-bold underline">Paramètres des annonces Google (Google Ads Settings)</a>. Vous pouvez également refuser l’utilisation des cookies tiers dédiés à la publicité personnalisée en consultant le site <a href="https://www.aboutads.info" target="_blank" rel="noopener noreferrer" className="text-amber-700 font-bold underline">www.aboutads.info</a>.
              </p>
            </div>
          </section>

          {/* Section 4: Google Analytics (G-MH4MPNFSSS) */}
          <section className="space-y-3">
            <h2 className="text-lg font-serif font-bold text-slate-900 flex items-center gap-2 border-b border-slate-100 pb-2">
              <span className="w-7 h-7 rounded-lg bg-amber-100 text-amber-800 flex items-center justify-center text-xs font-bold">4</span>
              <span>Statistiques &amp; Google Analytics</span>
            </h2>
            <p>
              Notre site utilise <strong>Google Analytics 4</strong> (identifiant de mesure : <code>G-MH4MPNFSSS</code>) afin de mesurer l’audience, les pages les plus visitées (prédications, études bibliques, informations de culte) et améliorer l’accessibilité du site. Les adresses IP sont anonymisées conformément aux règles de confidentialité.
            </p>
          </section>

          {/* Section 5: Fichier ads.txt et transparence */}
          <section className="space-y-3">
            <h2 className="text-lg font-serif font-bold text-slate-900 flex items-center gap-2 border-b border-slate-100 pb-2">
              <span className="w-7 h-7 rounded-lg bg-amber-100 text-amber-800 flex items-center justify-center text-xs font-bold">5</span>
              <span>Transparence &amp; Fichier ads.txt</span>
            </h2>
            <p>
              Conformément aux normes IAB Tech Lab et aux exigences de Google AdSense, notre fichier officiel <code>ads.txt</code> est publiquement accessible à l'adresse racine :
            </p>
            <div className="p-3 bg-slate-100 rounded-xl font-mono text-xs text-slate-800">
              <a href="/ads.txt" target="_blank" className="text-amber-600 underline font-bold">
                https://www.eglisedunazareendedame.org/ads.txt
              </a>
              <div className="mt-1 text-slate-600">google.com, pub-7382968203880435, DIRECT, f08c47fec0942fa0</div>
            </div>
          </section>

          {/* Section 6: Vos droits et coordonnées */}
          <section className="space-y-3 border-t border-slate-100 pt-6">
            <h2 className="text-lg font-serif font-bold text-slate-900 flex items-center gap-2">
              <span className="w-7 h-7 rounded-lg bg-amber-100 text-amber-800 flex items-center justify-center text-xs font-bold">6</span>
              <span>{isCreole ? 'Dwa ou & Kontak Sekretarya' : 'Vos droits & Contact officiel'}</span>
            </h2>
            <p>
              {isCreole
                ? 'Ou gen tout dwa pou mande retire imèl ou oswa modifye nenpòt enfòmasyon ou soumèt sou sit la. Ou ka kontakte Sekretarya Jeneral la dirèkteman :'
                : 'Conformément aux lois sur la protection des données, vous disposez d’un droit d’accès, de rectification et de suppression de vos données personnelles. Pour toute question relative à cette politique ou pour supprimer votre adresse email de nos listes, vous pouvez nous écrire :'
              }
            </p>
            <div className="bg-slate-50 p-4 rounded-2xl border border-slate-200 grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
              <div className="flex items-center space-x-2">
                <Mail className="w-4 h-4 text-amber-600 flex-shrink-0" />
                <span><strong>Email :</strong> eglisedunazareendedame@gmail.com</span>
              </div>
              <div className="flex items-center space-x-2">
                <Phone className="w-4 h-4 text-amber-600 flex-shrink-0" />
                <span><strong>Téléphone :</strong> +509 48596089</span>
              </div>
              <div className="flex items-start space-x-2 sm:col-span-2">
                <MapPin className="w-4 h-4 text-amber-600 flex-shrink-0 mt-0.5" />
                <span><strong>Adresse :</strong> 3ème Section Damé, Commune de Môle-Saint-Nicolas, Département du Nord-Ouest, Haïti</span>
              </div>
            </div>
          </section>
        </div>
      </div>
    </div>
  );
};
