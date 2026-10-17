import React, { useState } from 'react';
import { 
  OFFICIAL_CHURCH_INFO, 
  OFFICIAL_MINISTRIES, 
  OFFICIAL_SERVICES, 
  OFFICIAL_PROJECT_CDEJ, 
  OFFICIAL_MEDIA 
} from '../data/churchData';
import { SEOHead } from '../components/SEOHead';
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
  return (
    <div className="space-y-16 pb-16">
      <SEOHead 
        title="Église du Nazaréen de Damé – Site Officiel | Haïti"
        description="Site officiel de l'Église du Nazaréen de Damé, Haïti. Fondée en 1979 par Saurel ALCINÉ — Pasteur Bequel CHERELUS. Culte, ministères et projet CDEJ HA 0926."
        path="/"
        image="/images/eglise/og-banner.svg"
      />

      {/* 1. HERO SECTION MAJESTUEUSE */}
      <section className="relative bg-gradient-to-b from-[#071322] via-[#0b1b33] to-[#112442] text-white pt-16 pb-24 overflow-hidden border-b border-amber-500/20">
        {/* Subtle background glow */}
        <div className="absolute inset-0 opacity-15 pointer-events-none">
          <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[700px] h-[700px] bg-amber-400 rounded-full blur-[140px]"></div>
        </div>

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <div className="text-center max-w-4xl mx-auto space-y-6">
            {/* Official Church Logo Seal Emblem */}
            <div className="flex justify-center mb-2">
              <div className="relative w-28 h-28 sm:w-36 sm:h-36 rounded-full p-1 bg-gradient-to-br from-amber-200 via-amber-500 to-amber-700 shadow-2xl shadow-amber-500/20 hover:scale-105 transition-transform duration-300">
                <div className="w-full h-full bg-black rounded-full p-1 flex items-center justify-center overflow-hidden">
                  <img 
                    src={churchSealImg} 
                    alt="Sceau Officiel de l’Église du Nazaréen de Damé" 
                    className="w-full h-full object-contain filter drop-shadow"
                  />
                </div>
              </div>
            </div>

            {/* Motto Badge */}
            <div className="inline-flex items-center space-x-2 px-4 py-1.5 rounded-full bg-amber-500/10 border border-amber-400/40 text-amber-300 shadow-sm animate-pulse">
              <Sparkles className="w-4 h-4 text-amber-400" />
              <span className="font-serif font-bold text-xs sm:text-sm tracking-widest uppercase">
                {OFFICIAL_CHURCH_INFO.motto}
              </span>
            </div>

            {/* Official Church Title */}
            <h1 className="font-serif text-3xl sm:text-5xl lg:text-6xl font-extrabold tracking-tight text-white leading-tight">
              Bienvenue à l’<span className="text-transparent bg-clip-text bg-gradient-to-r from-amber-200 via-amber-400 to-amber-100">Église du Nazaréen</span> de Damé
            </h1>

            {/* Subtitle with official history */}
            <p className="text-base sm:text-xl text-slate-300 max-w-3xl mx-auto leading-relaxed">
              Une communauté de foi vivante, ancrée dans la Parole de Dieu et la sainteté biblique.
              Fondée en <strong className="text-amber-400 font-semibold">1979</strong> par le frère <strong className="text-white font-semibold">Saurel ALCINÉ</strong>, sous la direction pastorale du Pasteur <strong className="text-amber-300 font-semibold">Bequel CHERELUS</strong> depuis 2003.
            </p>

            <a
              href="https://share.google/9kpd149ZpzHWNxOXI"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center justify-center space-x-2 text-xs sm:text-sm text-slate-300 hover:text-amber-400 transition group"
              title="Ouvrir l'emplacement sur Google Maps"
            >
              <MapPin className="w-4 h-4 text-amber-400 group-hover:scale-110 transition-transform" />
              <span className="underline decoration-dotted underline-offset-4">3ème Section Damé, Commune de Môle-Saint-Nicolas, Département du Nord-Ouest, Haïti (Google Maps ›)</span>
            </a>

            {/* Action Buttons */}
            <div className="pt-4 flex flex-wrap items-center justify-center gap-3">
              <button
                onClick={() => onNavigate('/priere')}
                className="px-6 py-3.5 rounded-xl font-bold text-sm bg-gradient-to-r from-amber-500 via-amber-400 to-amber-500 text-slate-950 hover:brightness-110 shadow-lg shadow-amber-500/25 transition flex items-center space-x-2 font-serif"
              >
                <Lock className="w-4 h-4 text-slate-950" />
                <span>Espas Priyè Sekrè</span>
              </button>

              <button
                onClick={() => onNavigate('/evenements')}
                className="px-6 py-3.5 rounded-xl font-bold text-sm bg-slate-900/80 hover:bg-slate-900 text-amber-300 border border-amber-500/40 shadow-md transition flex items-center space-x-2"
              >
                <Calendar className="w-4 h-4 text-amber-400" />
                <span>Kalandriye &amp; Cultes</span>
              </button>

              <button
                onClick={() => onNavigate('/temwayaj')}
                className="px-6 py-3.5 rounded-xl font-bold text-sm bg-slate-900/80 hover:bg-slate-900 text-amber-300 border border-amber-500/40 shadow-md transition flex items-center space-x-2"
              >
                <Sparkles className="w-4 h-4 text-amber-400" />
                <span>Temwayaj Gras Bondye</span>
              </button>

              <button
                onClick={() => onNavigate('/leson-biblik')}
                className="px-6 py-3.5 rounded-xl font-bold text-sm bg-slate-800/80 hover:bg-slate-800 text-white border border-slate-700 hover:border-amber-400 shadow-md transition flex items-center space-x-2"
              >
                <BookOpen className="w-4 h-4 text-amber-400" />
                <span>Leson Lekòl Dimanch</span>
              </button>

              <button
                onClick={() => onNavigate('/projets')}
                className="px-6 py-3.5 rounded-xl font-bold text-sm bg-slate-800/80 hover:bg-slate-800 text-white border border-slate-700 hover:border-amber-400/50 shadow-md transition flex items-center space-x-2"
              >
                <Heart className="w-4 h-4 text-rose-400" />
                <span>Projet CDEJ HA 0926</span>
              </button>

              <button
                onClick={() => onNavigate('/medias')}
                className="px-6 py-3.5 rounded-xl font-bold text-sm bg-slate-900/60 hover:bg-slate-900 text-slate-200 border border-slate-700 hover:border-amber-400 shadow-md transition flex items-center space-x-2"
              >
                <Headphones className="w-4 h-4 text-amber-400" />
                <span>Prédications &amp; Vidéos</span>
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* 2. HORAIRES DES CULTES & ACCUEIL EN UN COUP D'ŒIL */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 -mt-12 relative z-20">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Card 1: Dimanche & Rotation des Ministères */}
          <div className="bg-white rounded-2xl p-6 shadow-xl border-t-4 border-amber-500 flex flex-col justify-between">
            <div>
              <div className="flex items-center justify-between mb-3">
                <span className="text-xs font-bold uppercase tracking-wider text-amber-600 bg-amber-50 px-2.5 py-1 rounded">
                  Chaque Dimanche
                </span>
                <Clock className="w-5 h-5 text-amber-500" />
              </div>
              <h3 className="font-serif font-bold text-slate-900 text-lg mb-1">Culte &amp; Rotation des Ministères</h3>
              <div className="text-xs text-slate-600 space-y-1 mb-3">
                <p>07h00 - 08h00 : École du Dimanche</p>
                <p className="font-semibold text-slate-900">08h00 - 11h30 : Grand Culte</p>
                <div className="pt-2 text-[11px] space-y-0.5 border-t border-slate-100">
                  <p><strong className="text-amber-700">1er Dim. :</strong> Ministère Global</p>
                  <p><strong className="text-rose-600">2ème Dim. :</strong> Ministère des Dames</p>
                  <p><strong className="text-blue-600">3ème Dim. :</strong> Ministère de la Jeunesse (JNI)</p>
                  <p><strong className="text-emerald-600">4ème Dim. :</strong> Ministère des Enfants</p>
                  <p><strong className="text-purple-600">5ème Dim. :</strong> Dimanche de la Famille</p>
                </div>
              </div>
            </div>
            <div className="pt-3 border-t border-slate-100 space-y-2">
              <a
                href="https://calendar.google.com/calendar/render?action=TEMPLATE&text=Culte+d%27Adoration+%E2%80%93+%C3%89glise+du+Nazar%C3%A9en+de+Dam%C3%A9&details=Grand+Culte+d%27Adoration+et+de+Louange.+Pasteur+Bequel+CHERELUS.&location=3%C3%A8me+Section+Dam%C3%A9%2C+M%C3%B4le-Saint-Nicolas%2C+Ha%C3%AFti"
                target="_blank"
                rel="noopener noreferrer"
                className="w-full py-1.5 px-3 rounded-lg text-[11px] font-bold bg-amber-500 text-slate-950 hover:bg-amber-400 transition flex items-center justify-center space-x-1.5 shadow-sm"
                title="Ajouter automatiquement à Google Calendar"
              >
                <CalendarPlus className="w-3.5 h-3.5" />
                <span>Ajouter à mon Google Calendar</span>
              </a>

              <button
                onClick={() => onNavigate('/ministeres')}
                className="w-full text-center text-xs font-bold text-amber-600 hover:text-amber-700 flex items-center justify-center space-x-1"
              >
                <span>Détails des 7 ministères</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>

          {/* Card 2: Semaine */}
          <div className="bg-white rounded-2xl p-6 shadow-xl border-t-4 border-blue-600 flex flex-col justify-between">
            <div>
              <div className="flex items-center justify-between mb-3">
                <span className="text-xs font-bold uppercase tracking-wider text-blue-600 bg-blue-50 px-2.5 py-1 rounded">
                  Mardi &amp; Jeudi
                </span>
                <Users className="w-5 h-5 text-blue-600" />
              </div>
              <h3 className="font-serif font-bold text-slate-900 text-lg mb-1">Prière &amp; Étude Biblique</h3>
              <p className="text-xs text-slate-600 mb-3">
                Mardi 16h00 : Prière &amp; Intercession<br />
                <strong className="text-slate-800">Jeudi 16h00 : Étude des Écritures</strong>
              </p>
              <p className="text-xs text-slate-500">
                Moments d'affermissement dans la doctrine de la sainteté biblique.
              </p>
            </div>
            <button
              onClick={() => onNavigate('/evenements')}
              className="mt-4 text-xs font-bold text-blue-600 hover:text-blue-700 flex items-center space-x-1"
            >
              <span>Calendrier complet</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>

          {/* Card 3: Jeunesse & Samedi */}
          <div className="bg-white rounded-2xl p-6 shadow-xl border-t-4 border-indigo-600 flex flex-col justify-between">
            <div>
              <div className="flex items-center justify-between mb-3">
                <span className="text-xs font-bold uppercase tracking-wider text-indigo-600 bg-indigo-50 px-2.5 py-1 rounded">
                  Chaque Samedi
                </span>
                <Sparkles className="w-5 h-5 text-indigo-600" />
              </div>
              <h3 className="font-serif font-bold text-slate-900 text-lg mb-1">Jeunesse Nazaréenne (JNI)</h3>
              <p className="text-xs text-slate-600 mb-3">
                <strong className="text-slate-800">Samedi à partir de 15h00</strong>
              </p>
              <p className="text-xs text-slate-500">
                Chorale, débats bibliques, édification spirituelle et dynamisme pour Christ.
              </p>
            </div>
            <button
              onClick={() => onNavigate('/ministeres')}
              className="mt-4 text-xs font-bold text-indigo-600 hover:text-indigo-700 flex items-center space-x-1"
            >
              <span>Découvrir la JNI</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      </section>

      {/* 3. MOT DE BIENVENUE DU PASTEUR PRINCIPAL */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="bg-gradient-to-r from-slate-900 to-[#0b1b33] rounded-3xl p-8 sm:p-12 text-white shadow-2xl border border-amber-500/30">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
            {/* Pastoral Official Portrait Placeholder */}
            <div className="lg:col-span-4 flex justify-center">
              <div className="relative group">
                <div className="absolute -inset-1 bg-gradient-to-r from-amber-400 to-amber-600 rounded-2xl blur opacity-30 group-hover:opacity-60 transition duration-300"></div>
                <div className="relative rounded-2xl overflow-hidden bg-slate-950 border-2 border-amber-400/50 p-2 shadow-2xl">
                  <img
                    src="/images/pasteur/pasteur-cherelus.svg"
                    alt="Pasteur Bequel CHERELUS"
                    className="w-64 h-80 object-cover rounded-xl"
                  />
                  <div className="text-center pt-2">
                    <p className="font-serif font-bold text-amber-300 text-sm">Pasteur Bequel CHERELUS</p>
                    <p className="text-[11px] text-slate-400">Pasteur titulaire depuis 2003</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Pastoral Message Text */}
            <div className="lg:col-span-8 space-y-4">
              <div className="inline-flex items-center space-x-2 text-amber-400 text-xs font-bold uppercase tracking-wider">
                <Quote className="w-4 h-4" />
                <span>Message Pastoral Officiel</span>
              </div>

              <h2 className="font-serif text-2xl sm:text-3xl font-bold text-white">
                « Une Église consacrée à la Sainteté et au service de notre communauté de Damé »
              </h2>

              <p className="text-slate-300 text-sm sm:text-base leading-relaxed">
                « Chers visiteurs, frères et sœurs en Jésus-Christ, c’est avec une joie profonde et une gratitude infinie envers le Seigneur que nous vous accueillons sur le site officiel de l’<strong>Église du Nazaréen de Damé</strong>.
              </p>

              <p className="text-slate-300 text-sm sm:text-base leading-relaxed">
                Depuis son implantation en 1979 par le frère Saurel ALCINÉ, Dieu n'a cessé de déverser Sa grâce sur notre assemblée. Notre vocation demeure inébranlable : proclamer la doctrine de la sainteté biblique, nourrir les âmes par la prédication fidèle des Écritures et transformer concrètement la vie de notre jeunesse à travers notre partenariat avec Compassion International (CDEJ HA 0926).
              </p>

              <p className="text-amber-300/90 italic font-serif text-sm">
                « Que le Dieu de paix vous sanctifie Lui-même tout entiers, et que votre esprit, votre âme et votre corps soient gardés irrépréhensibles. » (1 Thessaloniciens 5:23)
              </p>

              <div className="pt-2 flex flex-wrap items-center gap-4">
                <button
                  onClick={() => onNavigate('/a-propos')}
                  className="px-5 py-2.5 rounded-lg text-xs font-bold bg-amber-400 text-slate-950 hover:bg-amber-300 transition"
                >
                  Lire l'histoire de l'Église
                </button>
                <button
                  onClick={() => onNavigate('/contact')}
                  className="px-5 py-2.5 rounded-lg text-xs font-bold bg-slate-800 text-slate-200 hover:bg-slate-700 transition"
                >
                  Demander un entretien pastoral
                </button>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 4. SECTION VEDETTE : COMPASSION INTERNATIONAL CDEJ HA 0926 */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="bg-slate-900 rounded-3xl p-8 sm:p-10 border-2 border-amber-500/30 shadow-2xl relative overflow-hidden">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
            <div className="lg:col-span-7 space-y-4">
              <div className="inline-flex items-center space-x-2 px-3 py-1 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/30 text-xs font-bold">
                <ShieldCheck className="w-3.5 h-3.5" />
                <span>Projet Social Majeur Actif • CDEJ HA 0926</span>
              </div>

              <h2 className="font-serif text-2xl sm:text-3xl font-bold text-white">
                Partenariat avec Compassion International
              </h2>

              <p className="text-sm text-slate-300 leading-relaxed">
                Le <strong>Centre de Développement de l’Enfant et du Jeune (CDEJ HA 0926)</strong> est le projet social actif de l’Église du Nazaréen de Damé. En partenariat avec Compassion International, nous délivrons plus de 265 enfants et familles de la 3ème Section Damé de la précarité au nom de Jésus.
              </p>

              {/* Statistics Grid */}
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 pt-2">
                {OFFICIAL_PROJECT_CDEJ.metrics.slice(0, 6).map((m, idx) => (
                  <div key={idx} className="bg-slate-950/80 p-3 rounded-xl border border-slate-800">
                    <span className="block text-xl font-extrabold text-amber-400 font-serif">
                      {m.value}
                    </span>
                    <span className="text-[11px] text-slate-400 font-medium">
                      {m.label}
                    </span>
                  </div>
                ))}
              </div>

              <div className="pt-2">
                <button
                  onClick={() => onNavigate('/projets')}
                  className="inline-flex items-center space-x-2 px-5 py-2.5 rounded-lg text-xs font-bold bg-amber-400 text-slate-950 hover:bg-amber-300 transition"
                >
                  <HeartHandshake className="w-4 h-4" />
                  <span>En savoir plus sur le projet CDEJ</span>
                </button>
              </div>
            </div>

            {/* Banner preview */}
            <div className="lg:col-span-5">
              <div className="rounded-2xl overflow-hidden border border-amber-500/40 shadow-xl">
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

      {/* 5. LES 7 MINISTÈRES OFFICIELS D'ÉGLISE */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center max-w-3xl mx-auto mb-10 space-y-2">
          <span className="text-xs font-bold uppercase tracking-widest text-amber-600 bg-amber-50 px-3 py-1 rounded-full border border-amber-200">
            Structure Ecclésiale
          </span>
          <h2 className="font-serif text-3xl font-extrabold text-slate-900">
            Les 7 Ministères de l’Église de Damé
          </h2>
          <p className="text-sm text-slate-600">
            Chaque membre trouve sa place pour grandir spirituellement, servir le Seigneur et soutenir les frères et sœurs.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {OFFICIAL_MINISTRIES.map((m) => (
            <div
              key={m.id}
              className="bg-white rounded-2xl p-6 shadow-md hover:shadow-xl transition-all border border-slate-100 flex flex-col justify-between group"
            >
              <div>
                <div className="flex items-center justify-between mb-3">
                  <span className="text-xs font-bold text-amber-700 bg-amber-50 px-2.5 py-1 rounded-md border border-amber-200">
                    {m.schedule}
                  </span>
                  <div className="w-8 h-8 rounded-full bg-slate-900 text-amber-400 flex items-center justify-center text-xs font-bold font-serif">
                    {m.name.slice(0, 2).toUpperCase()}
                  </div>
                </div>

                <h3 className="font-serif font-bold text-slate-900 text-lg group-hover:text-amber-600 transition">
                  {m.name}
                </h3>
                <p className="text-xs text-slate-600 mt-2 leading-relaxed">
                  {m.shortDescription}
                </p>
                <div className="mt-3 p-2 rounded bg-slate-50 text-[11px] text-slate-700 italic border-l-2 border-amber-500">
                  {m.verse}
                </div>
              </div>

              <button
                onClick={() => onNavigate('/ministeres')}
                className="mt-4 pt-3 border-t border-slate-100 text-xs font-bold text-slate-900 group-hover:text-amber-600 flex items-center justify-between"
              >
                <span>Détails &amp; Engagement</span>
                <ChevronRight className="w-4 h-4 text-amber-500" />
              </button>
            </div>
          ))}
        </div>
      </section>

      {/* 6. DERNIÈRES PRÉDICATIONS & PODCASTS */}
      <section className="bg-slate-100 py-12 border-y border-slate-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col md:flex-row items-center justify-between mb-8 gap-4">
            <div>
              <span className="text-xs font-bold uppercase tracking-wider text-amber-600">
                Podcasts Officiels &amp; Édification
              </span>
              <h2 className="font-serif text-2xl sm:text-3xl font-bold text-slate-900">
                Podcasts Nazaréens &amp; Prédications
              </h2>
            </div>
            <button
              onClick={() => onNavigate('/medias')}
              className="text-xs font-bold text-amber-600 hover:text-amber-700 flex items-center space-x-1"
            >
              <span>Tous les podcasts &amp; médias</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {OFFICIAL_MEDIA.slice(0, 3).map((item) => (
              <div key={item.id} className="bg-white rounded-2xl overflow-hidden shadow-md border border-slate-200 flex flex-col justify-between">
                <div>
                  <div className="h-44 bg-slate-900 relative flex items-center justify-center overflow-hidden">
                    <img
                      src={item.thumbnail}
                      alt={item.title}
                      className="w-full h-full object-cover opacity-80"
                    />
                    <div className="absolute inset-0 bg-slate-900/40 flex items-center justify-center">
                      <div className="w-12 h-12 rounded-full bg-amber-500 text-slate-950 flex items-center justify-center shadow-lg">
                        <Play className="w-5 h-5 ml-0.5 fill-current" />
                      </div>
                    </div>
                    {item.duration && (
                      <span className="absolute bottom-2 right-2 bg-slate-950/80 text-amber-300 text-[10px] font-bold px-2 py-0.5 rounded">
                        {item.duration}
                      </span>
                    )}
                  </div>

                  <div className="p-5">
                    <span className="text-[11px] font-bold text-amber-600 uppercase tracking-wide">
                      {item.category || item.type}
                    </span>
                    <h3 className="font-serif font-bold text-slate-900 text-base mt-1 line-clamp-2">
                      {item.title}
                    </h3>
                    {item.speaker && (
                      <p className="text-xs text-slate-600 mt-1 font-medium">
                        Orateur : {item.speaker}
                      </p>
                    )}
                    {item.reference && (
                      <p className="text-xs text-slate-500 italic mt-0.5">
                        Réf. : {item.reference}
                      </p>
                    )}
                  </div>
                </div>

                <div className="p-5 pt-0">
                  <button
                    onClick={() => onNavigate('/medias')}
                    className="w-full py-2 rounded-lg text-xs font-bold bg-slate-900 text-amber-300 hover:bg-slate-800 transition flex items-center justify-center space-x-2"
                  >
                    <span>Écouter &amp; Regarder</span>
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* 7. APPEL AU DÉFI BIBLIQUE INTERACTIF */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="bg-gradient-to-r from-amber-500 to-amber-600 rounded-3xl p-8 sm:p-10 text-slate-950 shadow-xl flex flex-col md:flex-row items-center justify-between gap-6">
          <div className="space-y-2 max-w-2xl text-center md:text-left">
            <span className="text-xs uppercase font-extrabold tracking-widest text-slate-900 bg-white/30 px-3 py-1 rounded-full">
              Mode Défi &amp; Connaissance Biblique
            </span>
            <h2 className="font-serif text-2xl sm:text-3xl font-black text-slate-950">
              Testez vos connaissances avec nos Jeux Bibliques !
            </h2>
            <p className="text-xs sm:text-sm text-slate-900 leading-relaxed font-medium">
              Quiz sur les Saintes Écritures, devinettes de personnages, doctrine de sainteté et classement des meilleurs scores. Idéal pour les jeunes, familles et moniteurs.
            </p>
          </div>

          <button
            onClick={() => onNavigate('/jeux-bibliques')}
            className="px-6 py-3.5 rounded-xl text-sm font-extrabold bg-slate-950 text-amber-300 hover:bg-slate-900 shadow-lg transition flex items-center space-x-2 flex-shrink-0"
          >
            <span>Lancer un Défi Biblique</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </div>
      </section>
    </div>
  );
};
