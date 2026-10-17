import React from 'react';
import { OFFICIAL_CHURCH_INFO } from '../data/churchData';
import { SEOHead } from '../components/SEOHead';
import { 
  Church, 
  History, 
  Compass, 
  Eye, 
  BookOpen, 
  UserCheck, 
  ShieldCheck, 
  Calendar, 
  Award,
  Sparkles,
  MapPin,
  CheckCircle2
} from 'lucide-react';

interface AboutProps {
  onNavigate: (path: string) => void;
}

export const About: React.FC<AboutProps> = ({ onNavigate }) => {
  const articlesOfFaith = [
    { title: 'Le Dieu Trinité', desc: 'Nous croyons en un seul Dieu, Créateur de toutes choses, éternellement existant en trois personnes : Père, Fils et Saint-Esprit.' },
    { title: 'Jésus-Christ Sauveur', desc: 'Jésus-Christ est vrai Dieu et vrai homme, mort pour nos péchés et ressuscité pour notre justification.' },
    { title: 'Le Saint-Esprit', desc: 'Le Saint-Esprit régénère, sanctifie, console et accorde la puissance divine pour mener une vie sainte.' },
    { title: 'Les Saintes Écritures', desc: 'La Bible est la Parole inspirée de Dieu, règle suprême et infaillible de foi et de conduite chrétienne.' },
    { title: 'L’Entière Sanctification', desc: 'L’œuvre de la grâce de Dieu par laquelle le croyant est purifié de tout péché originel et rempli de l’amour de Dieu (1 Thess. 5:23).' },
    { title: 'L’Église et les Sacrements', desc: 'Le corps de Christ rassemblé pour le culte, l’évangélisation, le Saint Baptême et la Sainte Cène.' }
  ];

  return (
    <div className="space-y-16 pb-16">
      <SEOHead 
        title="À Propos – Histoire, Mission, Vision & Doctrine | Église de Damé"
        description="Découvrez l'histoire de l'Église du Nazaréen de Damé depuis 1979, notre mission, vision, doctrine de sainteté et la direction pastorale."
        path="/a-propos"
        image="/images/pasteur/pasteur-cherelus.svg"
      />

      {/* Page Header */}
      <section className="bg-gradient-to-b from-[#071322] to-[#0b1b33] text-white py-16 px-4 border-b border-amber-500/20">
        <div className="max-w-4xl mx-auto text-center space-y-4">
          <div className="inline-flex items-center space-x-2 px-3.5 py-1 rounded-full bg-amber-500/10 border border-amber-400/30 text-amber-300 text-xs font-bold uppercase tracking-widest">
            <History className="w-3.5 h-3.5" />
            <span>Notre Identité &amp; Héritage</span>
          </div>

          <h1 className="font-serif text-3xl sm:text-5xl font-extrabold text-white">
            Histoire, Mission &amp; Doctrine
          </h1>

          <p className="text-slate-300 text-base sm:text-lg max-w-2xl mx-auto leading-relaxed">
            Fondée en 1979 dans la 3ème Section Damé, notre Église perpétue la sainte proclamation de l'Évangile et de la sainteté biblique au service du peuple haïtien.
          </p>
        </div>
      </section>

      {/* Section 1: Histoire & Origines */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 items-center">
          <div className="lg:col-span-7 space-y-5">
            <span className="text-xs font-bold text-amber-600 uppercase tracking-widest bg-amber-50 px-3 py-1 rounded-full">
              Les Origines de Damé
            </span>
            <h2 className="font-serif text-3xl font-extrabold text-slate-900">
              Une foi semée en 1979 au cœur du Nord-Ouest
            </h2>
            <p className="text-slate-700 leading-relaxed text-sm sm:text-base">
              L'histoire de l’<strong>Église du Nazaréen de Damé</strong> a débuté en <strong>1979</strong>, lorsqu'un serviteur dévoué et zélé pour le Royaume de Dieu, le frère <strong>Saurel ALCINÉ</strong>, animé par la conviction que la 3ème Section Damé (Commune de Môle-Saint-Nicolas) avait besoin de la lumière salvatrice de Jésus-Christ, a rassemblé les premiers fidèles pour la prière et la proclamation de la Parole.
            </p>
            <p className="text-slate-700 leading-relaxed text-sm sm:text-base">
              Malgré les défis géographiques et matériels de la région, la petite assemblée a grandi dans la prière, la sainteté de vie et la solidarité chrétienne. De case de prière en sanctuaire permanent, le Seigneur a affermi Son œuvre d’année en année.
            </p>
            <p className="text-slate-700 leading-relaxed text-sm sm:text-base">
              En <strong>2003</strong>, le Seigneur a appelé le <strong>Pasteur Bequel CHERELUS</strong> à assumer la charge pastorale principale de l'assemblée. Depuis plus de 23 ans, sous son ministère pastoral fidèle et visionnaire, l’Église a franchi des paliers majeurs : consolidation des sept ministères, implantation du grand projet d'encadrement des enfants avec Compassion International (CDEJ HA 0926) et rayonnement spirituel dans toute la presqu'île du Nord-Ouest.
            </p>
          </div>

          <div className="lg:col-span-5">
            <div className="bg-slate-900 text-white rounded-3xl p-8 shadow-2xl border border-amber-500/30 space-y-6">
              <h3 className="font-serif font-bold text-amber-300 text-xl border-b border-slate-800 pb-3">
                Repères Chronologiques
              </h3>

              <div className="space-y-4">
                <div className="flex items-start space-x-3">
                  <div className="w-9 h-9 rounded-full bg-amber-500 text-slate-950 font-black flex items-center justify-center text-xs flex-shrink-0">
                    1979
                  </div>
                  <div>
                    <h4 className="font-bold text-white text-sm">Fondation de l'Église</h4>
                    <p className="text-xs text-slate-400">Fondée par Saurel ALCINÉ à la 3ème Section Damé.</p>
                  </div>
                </div>

                <div className="flex items-start space-x-3">
                  <div className="w-9 h-9 rounded-full bg-amber-500 text-slate-950 font-black flex items-center justify-center text-xs flex-shrink-0">
                    2003
                  </div>
                  <div>
                    <h4 className="font-bold text-white text-sm">Arrivée du Pasteur Bequel CHERELUS</h4>
                    <p className="text-xs text-slate-400">Installation pastorale et impulsion pour le développement communautaire.</p>
                  </div>
                </div>

                <div className="flex items-start space-x-3">
                  <div className="w-9 h-9 rounded-full bg-amber-500 text-slate-950 font-black flex items-center justify-center text-xs flex-shrink-0">
                    2026
                  </div>
                  <div>
                    <h4 className="font-bold text-white text-sm">Aujourd'hui &amp; Demain</h4>
                    <p className="text-xs text-slate-400">Centre CDEJ HA 0926 actif, 7 ministères et rayonnement numérique officiel.</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Section 2: Mission & Vision */}
      <section className="bg-slate-900 text-white py-16 border-y border-amber-500/20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {/* Mission */}
            <div className="bg-slate-950/80 rounded-2xl p-8 border border-slate-800 space-y-4">
              <div className="w-12 h-12 rounded-xl bg-amber-500/20 text-amber-400 flex items-center justify-center">
                <Compass className="w-6 h-6" />
              </div>
              <h2 className="font-serif text-2xl font-bold text-white">Notre Mission Divine</h2>
              <p className="text-slate-300 text-sm leading-relaxed">
                Notre mission est d'obéir fidèlement à la Grande Commission de Jésus-Christ (Matthieu 28:19-20) en faisant des disciples semejants à Christ au sein de notre communauté de Damé et dans toutes les nations.
              </p>
              <ul className="space-y-2 text-xs text-slate-300">
                <li className="flex items-center space-x-2">
                  <CheckCircle2 className="w-4 h-4 text-amber-400" />
                  <span>Proclamer l'Évangile pur du salut par grâce au moyen de la foi.</span>
                </li>
                <li className="flex items-center space-x-2">
                  <CheckCircle2 className="w-4 h-4 text-amber-400" />
                  <span>Enseigner et vivre l’entière sanctification dans la piété pratique.</span>
                </li>
                <li className="flex items-center space-x-2">
                  <CheckCircle2 className="w-4 h-4 text-amber-400" />
                  <span>Soutenir les orphelins, veuves et démunis par des œuvres d’amour concrètes.</span>
                </li>
              </ul>
            </div>

            {/* Vision */}
            <div className="bg-slate-950/80 rounded-2xl p-8 border border-slate-800 space-y-4">
              <div className="w-12 h-12 rounded-xl bg-amber-500/20 text-amber-400 flex items-center justify-center">
                <Eye className="w-6 h-6" />
              </div>
              <h2 className="font-serif text-2xl font-bold text-white">Notre Vision Spirituelle</h2>
              <p className="text-slate-300 text-sm leading-relaxed">
                Être une Église modèle de sainteté, un phare spirituel et un centre de transformation sociale pour la 3ème Section Damé, la Commune de Môle-Saint-Nicolas et l’ensemble du Département du Nord-Ouest.
              </p>
              <ul className="space-y-2 text-xs text-slate-300">
                <li className="flex items-center space-x-2">
                  <CheckCircle2 className="w-4 h-4 text-amber-400" />
                  <span>Une jeunesse consacrée, éduquée et prête pour le leadership d’avenir.</span>
                </li>
                <li className="flex items-center space-x-2">
                  <CheckCircle2 className="w-4 h-4 text-amber-400" />
                  <span>Des familles équilibrées, sanctifiées et marchant dans la crainte de Dieu.</span>
                </li>
                <li className="flex items-center space-x-2">
                  <CheckCircle2 className="w-4 h-4 text-amber-400" />
                  <span>Un partenariat d’impact pérenne avec Compassion International (CDEJ HA 0926).</span>
                </li>
              </ul>
            </div>
          </div>
        </div>
      </section>

      {/* Section 3: Doctrine & Articles de Foi */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center max-w-3xl mx-auto mb-12 space-y-2">
          <span className="text-xs font-bold uppercase tracking-widest text-amber-600 bg-amber-50 px-3 py-1 rounded-full">
            Doctrine &amp; Foi Biblique
          </span>
          <h2 className="font-serif text-3xl font-extrabold text-slate-900">
            Notre Doctrine et Articles de Foi
          </h2>
          <p className="text-sm text-slate-600">
            En tant que membre de l'Église du Nazaréen mondiale, notre théologie puise dans les Saintes Écritures et le mouvement de sainteté biblique.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {articlesOfFaith.map((item, idx) => (
            <div key={idx} className="bg-white rounded-2xl p-6 shadow-md border border-slate-200 hover:border-amber-400 transition">
              <span className="text-amber-500 font-serif font-black text-2xl">
                0{idx + 1}
              </span>
              <h3 className="font-serif font-bold text-slate-900 text-lg mt-1 mb-2">
                {item.title}
              </h3>
              <p className="text-xs text-slate-600 leading-relaxed">
                {item.desc}
              </p>
            </div>
          ))}
        </div>

        {/* Motto Callout */}
        <div className="mt-12 bg-amber-50 border-2 border-amber-300 rounded-2xl p-6 text-center max-w-2xl mx-auto">
          <p className="font-serif text-xl sm:text-2xl font-bold text-amber-900">
            « SAINTETÉ À L’ÉTERNEL »
          </p>
          <p className="text-xs text-amber-800 mt-1 font-medium">
            (Exode 28:36 — Hébreux 12:14)
          </p>
          <p className="text-xs text-amber-900 mt-2">
            La sainteté n’est pas un fardeau légaliste, mais l’amour parfait versé dans nos cœurs par le Saint-Esprit, nous permettant de vivre victorieusement dans la pureté et la justice.
          </p>
        </div>
      </section>

      {/* Section 4: Direction Pastorale & Sceau Officiel */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="bg-gradient-to-br from-slate-900 to-[#0b1b33] rounded-3xl p-8 sm:p-12 text-white shadow-2xl border border-amber-500/30">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
            <div className="lg:col-span-8 space-y-4">
              <span className="text-xs font-bold text-amber-400 uppercase tracking-widest">
                Gouvernance Ecclésiale &amp; Sceau Légal
              </span>
              <h2 className="font-serif text-2xl sm:text-3xl font-bold text-white">
                La Direction Pastorale de Damé
              </h2>
              <p className="text-sm text-slate-300 leading-relaxed">
                L'Église du Nazaréen de Damé est administrée conformément au Manuel International de l'Église du Nazaréen. Elle est dirigée par :
              </p>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">
                <div className="bg-slate-950/60 p-4 rounded-xl border border-slate-800">
                  <h4 className="font-serif font-bold text-amber-300 text-base">Pasteur Bequel CHERELUS</h4>
                  <p className="text-xs text-slate-300">Pasteur Titulaire &amp; Prédicateur en Chef</p>
                  <p className="text-[11px] text-slate-400 mt-1">Conduit le troupeau, dispense les sacrements et assure l'autorité pastorale depuis 2003.</p>
                </div>

                <div className="bg-slate-950/60 p-4 rounded-xl border border-slate-800">
                  <h4 className="font-serif font-bold text-amber-300 text-base">Conseil des Diacres &amp; Anciens</h4>
                  <p className="text-xs text-slate-300">Administration et Secrétariat d'Église</p>
                  <p className="text-[11px] text-slate-400 mt-1">Veille à la bonne gestion temporelle, aux finances, aux secours fraternels et à la discipline chrétienne.</p>
                </div>
              </div>

              <div className="pt-4 flex flex-wrap gap-4">
                <button
                  onClick={() => onNavigate('/ministeres')}
                  className="px-5 py-2.5 rounded-lg text-xs font-bold bg-amber-400 text-slate-950 hover:bg-amber-300 transition"
                >
                  Découvrir les Comités de Ministères
                </button>
                <button
                  onClick={() => onNavigate('/contact')}
                  className="px-5 py-2.5 rounded-lg text-xs font-bold bg-slate-800 text-slate-200 hover:bg-slate-700 transition"
                >
                  Contacter le Pastorat
                </button>
              </div>
            </div>

            {/* Official Seal Emblem Card */}
            <div className="lg:col-span-4 flex flex-col items-center justify-center p-6 bg-slate-950/70 rounded-2xl border border-amber-500/20 text-center space-y-3">
              <div className="w-36 h-36 rounded-full p-1 bg-gradient-to-br from-amber-300 via-amber-500 to-amber-700 shadow-xl shadow-amber-500/20">
                <div className="w-full h-full bg-black rounded-full p-1 flex items-center justify-center overflow-hidden">
                  <img 
                    src="/images/eglise/sceau-officiel.svg" 
                    alt="Sceau Officiel de l’Église du Nazaréen de Damé" 
                    className="w-full h-full object-contain"
                  />
                </div>
              </div>
              <div>
                <h4 className="font-serif font-bold text-amber-300 text-sm">Sceau Officiel de l’Église</h4>
                <p className="text-[11px] text-slate-400 mt-0.5">« Église du Nazaréen de Damé »</p>
                <p className="text-[10px] text-amber-400/80 font-mono mt-1">« Sainteté à l’Éternel »</p>
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};
