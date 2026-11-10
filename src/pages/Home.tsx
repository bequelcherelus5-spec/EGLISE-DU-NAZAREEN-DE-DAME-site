import React, { useState, useEffect } from 'react';
import { 
  OFFICIAL_CHURCH_INFO, 
  OFFICIAL_MINISTRIES, 
  OFFICIAL_SERVICES, 
  OFFICIAL_PROJECT_CDEJ 
} from '../data/churchData';
import { mediaService, ChurchMedia } from '../services/mediaService';
import { SEOHead } from '../components/SEOHead';
import { DonationSection } from '../components/DonationSection';
import { DailyVerseWidget } from '../components/DailyVerseWidget';
import churchSealImg from '../assets/images/regenerated_image_1792011564270.x-icon';
import { 
  Calendar, 
  Clock, 
  MapPin, 
  Heart, 
  Users, 
  ArrowRight, 
  Play, 
  BookOpen, 
  Sparkles, 
  ShieldCheck, 
  Quote, 
  Youtube, 
  ExternalLink,
  ChevronRight,
  HandHeart,
  HeartHandshake,
  Headphones,
  Lock,
  CalendarPlus,
  CheckCircle2
} from 'lucide-react';

interface HomeProps {
  onNavigate: (path: string) => void;
}

export const Home: React.FC<HomeProps> = ({ onNavigate }) => {
  const [latestMedia, setLatestMedia] = useState<ChurchMedia[]>([]);

  useEffect(() => {
    mediaService.getAllMedia().then((items) => {
      setLatestMedia(items);
    }).catch(() => {});
  }, []);
  return (
    <div className="space-y-16 pb-16">
      <SEOHead 
        title="Église du Nazaréen de Damé – Site Officiel | Haïti"
        description="Site officiel de l'Église du Nazaréen de Damé, Haïti. Fondée en 1979 par Saurel ALCINÉ — Pasteur Bequel CHERELUS. Culte, ministères et projet CDEJ HA 0926."
        path="/"
        image="/images/eglise/og-banner.svg"
      />

      {/* 1. HERO SECTION : AUTHENTIQUE, PASTORALE ET DIGNE */}
      <section className="bg-[#FAF7F2] border-b border-stone-200/80 text-stone-900 pt-10 pb-16">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-3xl mx-auto space-y-4">
            
            {/* Sceau Officiel de l’Église */}
            <div className="flex justify-center mb-2">
              <div className="w-24 h-24 sm:w-28 sm:h-28 rounded-full p-1 bg-white border border-stone-300/80 shadow-2xs">
                <img 
                  src={churchSealImg} 
                  alt="Sceau Officiel de l’Église du Nazaréen de Damé" 
                  className="w-full h-full object-contain"
                />
              </div>
            </div>

            {/* Devise Biblique Unboxed */}
            <p className="font-serif italic text-amber-900 text-xs sm:text-sm tracking-wider">
              « {OFFICIAL_CHURCH_INFO.motto} » <span className="text-stone-400 not-italic font-sans text-xs">· Exode 28:36</span>
            </p>

            {/* Titre Principal */}
            <h1 className="font-serif text-3xl sm:text-4xl lg:text-5xl font-bold tracking-tight text-stone-900 leading-tight">
              Église du Nazaréen de Damé
            </h1>

            {/* Texte d'Accueil Pastoral & Historique */}
            <p className="text-sm sm:text-base text-stone-700 leading-relaxed max-w-2xl mx-auto">
              Une communauté chrétienne vivante consacrée à l'adoration, à la sainteté biblique et au relèvement holistique de notre communauté.
              Fondée en <strong className="text-stone-900">1979</strong> par le frère <strong className="text-stone-900">Saurel ALCINÉ</strong>, sous la direction pastorale du Pasteur <strong className="text-stone-900">Bequel CHERELUS</strong> depuis 2003.
            </p>

            {/* Emplacement */}
            <div className="pt-1">
              <a
                href={OFFICIAL_CHURCH_INFO.googleMapsUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center space-x-1.5 text-xs text-stone-600 hover:text-amber-900 transition underline underline-offset-4 decoration-stone-300"
                title="Localiser l'Église sur Google Maps"
              >
                <MapPin className="w-3.5 h-3.5 text-amber-800" />
                <span>3ème Section Damé, Commune de Môle-Saint-Nicolas, Nord-Ouest, Haïti (Google Maps ›)</span>
              </a>
            </div>

            {/* Deux Actions Principales Humaines (Au lieu du chapelet de 7 boutons AI) */}
            <div className="pt-4 flex flex-wrap items-center justify-center gap-3">
              <button
                onClick={() => onNavigate('/evenements')}
                className="px-6 py-2.5 rounded-lg font-serif font-bold text-xs sm:text-sm bg-stone-900 text-white hover:bg-stone-800 shadow-2xs transition flex items-center space-x-2"
              >
                <Calendar className="w-4 h-4 text-amber-300" />
                <span>Horaires des Cultes</span>
              </button>

              <button
                onClick={() => onNavigate('/faire-un-don')}
                className="px-6 py-2.5 rounded-lg font-serif font-bold text-xs sm:text-sm bg-white hover:bg-stone-50 text-stone-900 border border-stone-300 shadow-2xs transition flex items-center space-x-2"
              >
                <HeartHandshake className="w-4 h-4 text-amber-700" />
                <span>Dîmes &amp; Faire un Don</span>
              </button>
            </div>

            {/* Lien discret de prière */}
            <div className="pt-1">
              <button
                onClick={() => onNavigate('/priere')}
                className="text-xs text-stone-600 hover:text-amber-800 transition font-medium inline-flex items-center space-x-1.5"
              >
                <Heart className="w-3.5 h-3.5 text-amber-700" />
                <span>Besoin de prière ? Déposer une requête confidentielle (Espas Sekrè) ›</span>
              </button>
            </div>

          </div>
        </div>
      </section>

      {/* 2. RUBAN D'ACCÈS RAPIDE AUX ACTIVITÉS (ÉDITORIAL ET AÉRÉ) */}
      <section className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 -mt-8 relative z-20">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
          
          {/* Card 1: Dimanche & Rotation */}
          <div className="bg-white rounded-xl p-5 border border-stone-200/90 shadow-2xs flex flex-col justify-between">
            <div>
              <div className="flex items-center justify-between text-xs text-stone-500 mb-2 font-mono">
                <span>Chaque Dimanche</span>
                <Clock className="w-3.5 h-3.5 text-stone-400" />
              </div>
              <h3 className="font-serif font-bold text-stone-900 text-base mb-1.5">
                Culte d’Adoration &amp; Louange
              </h3>
              <p className="text-xs text-stone-600 leading-relaxed mb-3">
                <strong className="text-stone-800">07h00 - 08h00 :</strong> École du Dimanche<br />
                <strong className="text-stone-900">08h00 - 11h30 :</strong> Grand Culte avec rotation mensuelle des 5 ministères.
              </p>
            </div>
            <div className="pt-3 border-t border-stone-100 flex items-center justify-between">
              <a
                href="https://calendar.google.com/calendar/render?action=TEMPLATE&text=Culte+d%27Adoration+%E2%80%93+%C3%89glise+du+Nazar%C3%A9en+de+Dam%C3%A9&details=Grand+Culte+d%27Adoration+et+de+Louange.+Pasteur+Bequel+CHERELUS.&location=3%C3%A8me+Section+Dam%C3%A9%2C+M%C3%B4le-Saint-Nicolas%2C+Ha%C3%AFti"
                target="_blank"
                rel="noopener noreferrer"
                className="text-[11px] font-semibold text-stone-700 hover:text-amber-800 transition flex items-center space-x-1"
                title="Ajouter à Google Calendar"
              >
                <CalendarPlus className="w-3.5 h-3.5 text-amber-700" />
                <span>Google Calendar</span>
              </a>
              <button
                onClick={() => onNavigate('/evenements')}
                className="text-[11px] font-semibold text-amber-900 hover:text-amber-950 flex items-center space-x-1"
              >
                <span>Détails ›</span>
              </button>
            </div>
          </div>

          {/* Card 2: Prière & Étude */}
          <div className="bg-white rounded-xl p-5 border border-stone-200/90 shadow-2xs flex flex-col justify-between">
            <div>
              <div className="flex items-center justify-between text-xs text-stone-500 mb-2 font-mono">
                <span>Mardi &amp; Jeudi</span>
                <Users className="w-3.5 h-3.5 text-stone-400" />
              </div>
              <h3 className="font-serif font-bold text-stone-900 text-base mb-1.5">
                Prière &amp; Étude Biblique
              </h3>
              <p className="text-xs text-stone-600 leading-relaxed mb-3">
                <strong className="text-stone-800">Mardi 16h00 :</strong> Réunion de Prière &amp; Intercession<br />
                <strong className="text-stone-800">Jeudi 16h00 :</strong> Étude approfondie de la Parole de Dieu.
              </p>
            </div>
            <div className="pt-3 border-t border-stone-100 flex items-center justify-between">
              <span className="text-[11px] text-stone-500 font-serif italic">Sanctification &amp; Foi</span>
              <button
                onClick={() => onNavigate('/evenements')}
                className="text-[11px] font-semibold text-amber-900 hover:text-amber-950 flex items-center space-x-1"
              >
                <span>Agenda complet ›</span>
              </button>
            </div>
          </div>

          {/* Card 3: Jeunesse JNI */}
          <div className="bg-white rounded-xl p-5 border border-stone-200/90 shadow-2xs flex flex-col justify-between">
            <div>
              <div className="flex items-center justify-between text-xs text-stone-500 mb-2 font-mono">
                <span>Chaque Samedi</span>
                <BookOpen className="w-3.5 h-3.5 text-stone-400" />
              </div>
              <h3 className="font-serif font-bold text-stone-900 text-base mb-1.5">
                Jeunesse Nazaréenne (JNI)
              </h3>
              <p className="text-xs text-stone-600 leading-relaxed mb-3">
                <strong className="text-stone-800">Samedi à 15h00 :</strong> Rencontre des jeunes, chorale, louange fervente, débats bibliques et fraternité chrétienne.
              </p>
            </div>
            <div className="pt-3 border-t border-stone-100 flex items-center justify-between">
              <span className="text-[11px] text-stone-500 font-serif italic">Génération d'impact</span>
              <button
                onClick={() => onNavigate('/ministeres')}
                className="text-[11px] font-semibold text-amber-900 hover:text-amber-950 flex items-center space-x-1"
              >
                <span>Voir la JNI ›</span>
              </button>
            </div>
          </div>

        </div>
      </section>

      {/* 2.5. VÈSÈ JOUNEN AN (CHAK 24 TAN) & MEDITASYON PASTORAL */}
      <DailyVerseWidget />


      {/* 3. MOT DE BIENVENUE DU PASTEUR PRINCIPAL */}
      <section className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="bg-[#FAF7F2] rounded-2xl p-6 sm:p-10 text-stone-900 border border-stone-200/90 shadow-2xs">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
            {/* Pastoral Official Portrait */}
            <div className="lg:col-span-4 flex justify-center">
              <div className="rounded-xl overflow-hidden bg-white border border-stone-300/80 p-2 shadow-2xs max-w-[260px]">
                <img
                  src="/images/pasteur/pasteur-cherelus.svg"
                  alt="Pasteur Bequel CHERELUS"
                  className="w-full h-72 object-cover rounded-lg"
                />
                <div className="text-center pt-2.5">
                  <p className="font-serif font-bold text-stone-900 text-sm">Pasteur Bequel CHERELUS</p>
                  <p className="text-[11px] text-stone-600">Pasteur titulaire depuis 2003</p>
                </div>
              </div>
            </div>

            {/* Pastoral Message Text */}
            <div className="lg:col-span-8 space-y-3.5">
              <p className="text-amber-900 text-xs font-serif font-bold uppercase tracking-wider">
                Message Pastoral
              </p>

              <h2 className="font-serif text-2xl sm:text-3xl font-bold text-stone-900 leading-snug">
                « Une Église consacrée à la Sainteté et au service de notre communauté de Damé »
              </h2>

              <p className="text-stone-700 text-sm sm:text-base leading-relaxed">
                « Chers visiteurs, frères et sœurs en Jésus-Christ, c’est avec une joie profonde et une gratitude sincère envers le Seigneur que nous vous accueillons sur le site officiel de l’<strong>Église du Nazaréen de Damé</strong>.
              </p>

              <p className="text-stone-700 text-sm sm:text-base leading-relaxed">
                Depuis son implantation en 1979 par le frère Saurel ALCINÉ, Dieu n'a cessé de déverser Sa grâce sur notre assemblée. Notre vocation demeure inébranlable : proclamer la doctrine de la sainteté biblique, nourrir les âmes par la prédication fidèle des Écritures et transformer la vie de notre jeunesse à travers notre partenariat avec Compassion International (CDEJ HA 0926).
              </p>

              <div className="p-3.5 rounded-xl bg-white border border-stone-200 text-xs sm:text-sm text-stone-800 italic font-serif">
                « Que le Dieu de paix vous sanctifie Lui-même tout entiers, et que votre esprit, votre âme et votre corps soient gardés irrépréhensibles. » <span className="not-italic font-sans text-xs text-amber-900 block mt-1">— 1 Thessaloniciens 5:23</span>
              </div>

              <div className="pt-2 flex flex-wrap items-center gap-3">
                <button
                  onClick={() => onNavigate('/a-propos')}
                  className="px-5 py-2.5 rounded-lg text-xs font-bold bg-stone-900 text-white hover:bg-stone-800 shadow-2xs transition"
                >
                  Histoire de l'Église
                </button>
                <button
                  onClick={() => onNavigate('/contact')}
                  className="px-5 py-2.5 rounded-lg text-xs font-semibold bg-white border border-stone-300 text-stone-800 hover:bg-stone-50 shadow-2xs transition"
                >
                  Contact &amp; Accueil Pastoral
                </button>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 4. SECTION VEDETTE : COMPASSION INTERNATIONAL CDEJ HA 0926 */}
      <section className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="bg-white rounded-2xl p-6 sm:p-10 border border-stone-200/90 shadow-2xs">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
            <div className="lg:col-span-7 space-y-4">
              <p className="text-xs font-serif font-bold uppercase tracking-wider text-emerald-800">
                Action Sociale • Partenariat avec Compassion International
              </p>

              <h2 className="font-serif text-2xl sm:text-3xl font-bold text-stone-900">
                Centre de Développement de l’Enfant (CDEJ HA 0926)
              </h2>

              <p className="text-sm text-stone-700 leading-relaxed">
                Le <strong>CDEJ HA 0926</strong> est le projet social chrétien de l’Église du Nazaréen de Damé. En partenariat avec Compassion International, nous accompagnons plus de 200 enfants parrainés, organisons des cliniques mobiles chaque année pour plus de 200 bénéficiaires, animons des clubs chaque mercredi, vendredi et samedi, et réunissons les familles au Club des Parents chaque dernier vendredi du mois.
              </p>

              {/* Statistics Grid */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
                {OFFICIAL_PROJECT_CDEJ.metrics.map((m, idx) => (
                  <div key={idx} className="bg-[#FAF7F2] p-3.5 rounded-xl border border-stone-200/80">
                    <span className="block text-xl font-bold text-stone-900 font-serif leading-tight">
                      {m.value}
                    </span>
                    <span className="text-xs text-stone-800 font-semibold block mt-0.5">
                      {m.label}
                    </span>
                    {m.sublabel && (
                      <span className="text-[11px] text-stone-500 block mt-0.5">
                        {m.sublabel}
                      </span>
                    )}
                  </div>
                ))}
              </div>

              <div className="pt-2">
                <button
                  onClick={() => onNavigate('/projets')}
                  className="inline-flex items-center space-x-2 px-5 py-2.5 rounded-lg text-xs font-serif font-bold bg-stone-900 text-white hover:bg-stone-800 shadow-2xs transition"
                >
                  <HeartHandshake className="w-4 h-4 text-amber-300" />
                  <span>Découvrir le projet CDEJ HA 0926</span>
                </button>
              </div>
            </div>

            {/* Banner preview */}
            <div className="lg:col-span-5">
              <div className="rounded-xl overflow-hidden border border-stone-200 shadow-2xs">
                <img
                  src={OFFICIAL_PROJECT_CDEJ.bannerImage}
                  alt="Projet CDEJ HA 0926 Compassion International"
                  className="w-full h-auto object-cover"
                />
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 4.5. SECTION DÎMES, OFFRANDES & SOUTIEN AUX PROJETS (PAYPAL & DIGICEL MONCASH) */}
      <DonationSection onNavigate={onNavigate} />

      {/* 5. LES 7 MINISTÈRES OFFICIELS D'ÉGLISE */}
      <section className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center max-w-2xl mx-auto mb-8 space-y-1.5">
          <p className="text-xs font-serif font-bold uppercase tracking-widest text-amber-900">
            Organisation Ecclésiale
          </p>
          <h2 className="font-serif text-2xl sm:text-3xl font-bold text-stone-900">
            Les 7 Ministères de l’Église de Damé
          </h2>
          <p className="text-xs sm:text-sm text-stone-600">
            Chaque membre trouve sa place pour grandir spirituellement, servir le Seigneur et soutenir la communauté.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {OFFICIAL_MINISTRIES.map((m) => (
            <div
              key={m.id}
              className="bg-white rounded-xl p-5 border border-stone-200/90 shadow-2xs flex flex-col justify-between group"
            >
              <div>
                <div className="flex items-center justify-between mb-2">
                  <span className="text-xs text-stone-500 font-mono">
                    {m.schedule}
                  </span>
                  <span className="text-[11px] font-serif font-bold text-amber-900">
                    {m.name.slice(0, 2).toUpperCase()}
                  </span>
                </div>

                <h3 className="font-serif font-bold text-stone-900 text-base group-hover:text-amber-900 transition">
                  {m.name}
                </h3>
                <p className="text-xs text-stone-600 mt-1.5 leading-relaxed">
                  {m.shortDescription}
                </p>
                <div className="mt-3 p-2.5 rounded-lg bg-[#FAF7F2] text-[11px] text-stone-700 italic border border-stone-200/60">
                  {m.verse}
                </div>
              </div>

              <button
                onClick={() => onNavigate('/ministeres')}
                className="mt-4 pt-2.5 border-t border-stone-100 text-xs font-semibold text-stone-800 group-hover:text-amber-900 flex items-center justify-between"
              >
                <span>Détails du ministère</span>
                <ChevronRight className="w-3.5 h-3.5 text-stone-400 group-hover:text-amber-900" />
              </button>
            </div>
          ))}
        </div>
      </section>

      {/* 6. DERNIÈRES PRÉDICATIONS & MÉDIAS */}
      <section className="bg-[#FAF7F2] py-12 border-y border-stone-200/80">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col md:flex-row items-start md:items-end justify-between mb-8 gap-4">
            <div>
              <p className="text-xs font-serif font-bold uppercase tracking-wider text-amber-900">
                Médiathèque Officielle
              </p>
              <h2 className="font-serif text-2xl sm:text-3xl font-bold text-stone-900 mt-1">
                Prédications, Vidéos &amp; Événements
              </h2>
            </div>
            <button
              onClick={() => onNavigate('/media')}
              className="text-xs font-serif font-bold text-stone-900 hover:text-amber-900 flex items-center space-x-1"
            >
              <span>Toutes les publications vidéo ›</span>
            </button>
          </div>

          {latestMedia.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
              {latestMedia.slice(0, 3).map((item) => (
                <div key={item.id} className="bg-white rounded-xl overflow-hidden border border-stone-200/90 shadow-2xs flex flex-col justify-between">
                  <div>
                    <div className="h-44 bg-stone-100 relative flex items-center justify-center overflow-hidden">
                      <img
                        src={item.thumbnail || '/images/eglise/sceau-officiel.png'}
                        alt={item.title}
                        className="w-full h-full object-cover"
                      />
                      <div className="absolute inset-0 bg-stone-950/25 flex items-center justify-center">
                        <div className="w-11 h-11 rounded-full bg-stone-900/90 text-white flex items-center justify-center shadow-md">
                          <Play className="w-4 h-4 ml-0.5 fill-current" />
                        </div>
                      </div>
                      {item.duration && (
                        <span className="absolute bottom-2 right-2 bg-stone-900/90 text-white text-[10px] font-mono px-2 py-0.5 rounded">
                          {item.duration}
                        </span>
                      )}
                    </div>

                    <div className="p-4">
                      <p className="text-[11px] font-mono uppercase tracking-wide text-stone-500">
                        {item.category || item.type}
                      </p>
                      <h3 className="font-serif font-bold text-stone-900 text-base mt-1 line-clamp-2">
                        {item.title}
                      </h3>
                      {item.speaker && (
                        <p className="text-xs text-stone-600 mt-1">
                          Prédicateur : {item.speaker}
                        </p>
                      )}
                    </div>
                  </div>

                  <div className="p-4 pt-0">
                    <button
                      onClick={() => onNavigate('/media')}
                      className="w-full py-2 rounded-lg text-xs font-serif font-bold bg-stone-900 text-white hover:bg-stone-800 transition flex items-center justify-center space-x-2 shadow-2xs"
                    >
                      <span>Écouter &amp; Visionner</span>
                    </button>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="bg-white rounded-2xl p-6 sm:p-8 text-center border border-stone-200/90 shadow-2xs max-w-xl mx-auto space-y-3">
              <div className="w-12 h-12 rounded-full bg-[#FAF7F2] border border-stone-200 flex items-center justify-center mx-auto text-amber-900">
                <Play className="w-5 h-5 ml-0.5" />
              </div>
              <div className="space-y-1">
                <h3 className="font-serif text-lg font-bold text-stone-900">
                  Médiathèque de l’Église de Damé
                </h3>
                <p className="text-xs sm:text-sm text-stone-600 leading-relaxed">
                  L'espace de diffusion est prêt. Retrouvez ici les enregistrements des cultes, vidéos et louanges dès leur publication officielle.
                </p>
              </div>
              <div className="pt-2 flex flex-wrap justify-center gap-2.5">
                <button
                  onClick={() => onNavigate('/media')}
                  className="px-5 py-2.5 rounded-lg bg-stone-900 text-white font-serif font-bold text-xs hover:bg-stone-800 shadow-2xs transition"
                >
                  Accéder à l'espace Media
                </button>
                <button
                  onClick={() => onNavigate('/secretariat')}
                  className="px-5 py-2.5 rounded-lg bg-white border border-stone-300 text-stone-800 font-semibold text-xs hover:bg-stone-50 transition flex items-center space-x-1.5"
                >
                  <Lock className="w-3.5 h-3.5 text-stone-500" />
                  <span>Secrétariat</span>
                </button>
              </div>
            </div>
          )}
        </div>
      </section>

      {/* 7. APPEL AU DÉFI BIBLIQUE INTERACTIF */}
      <section className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="bg-[#FAF7F2] rounded-2xl p-6 sm:p-8 text-stone-900 border border-stone-200/90 shadow-2xs flex flex-col md:flex-row items-center justify-between gap-6">
          <div className="space-y-1.5 max-w-2xl text-center md:text-left">
            <p className="text-xs font-serif font-bold uppercase tracking-wider text-amber-900">
              Édification &amp; Découverte
            </p>
            <h2 className="font-serif text-2xl sm:text-3xl font-bold text-stone-900">
              Testez vos connaissances avec nos Jeux Bibliques
            </h2>
            <p className="text-xs sm:text-sm text-stone-700 leading-relaxed">
              Quiz sur les Saintes Écritures, devinettes de personnages, doctrine de sainteté et classement des meilleurs scores. Une belle opportunité pour petits et grands.
            </p>
          </div>

          <button
            onClick={() => onNavigate('/jeux-bibliques')}
            className="px-6 py-3 rounded-lg text-xs font-serif font-bold bg-stone-900 text-white hover:bg-stone-800 shadow-2xs transition flex items-center space-x-2 shrink-0"
          >
            <span>Participer au Défi Biblique</span>
            <ArrowRight className="w-4 h-4 text-amber-300" />
          </button>
        </div>
      </section>
    </div>
  );
};
