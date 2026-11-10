import React, { useState } from 'react';
import { OFFICIAL_SERVICES, OFFICIAL_CHURCH_INFO } from '../data/churchData';
import { SEOHead } from '../components/SEOHead';
import { 
  Calendar as CalendarIcon, 
  Clock, 
  MapPin, 
  Download, 
  Sparkles,
  Search,
  CalendarPlus,
  ExternalLink,
  CheckCircle2
} from 'lucide-react';

interface EventsProps {
  onNavigate: (path: string) => void;
}

export const Events: React.FC<EventsProps> = ({ onNavigate }) => {
  const [selectedFilter, setSelectedFilter] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState<string>('');

  const filteredEvents = OFFICIAL_SERVICES.filter((ev) => {
    const matchesFilter = selectedFilter === 'all' || ev.category === selectedFilter;
    const matchesQuery = 
      ev.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      ev.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
      ev.day.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesFilter && matchesQuery;
  });

  // Génération de lien Google Calendar direct
  const createGoogleCalendarUrl = (event: typeof OFFICIAL_SERVICES[0]) => {
    const title = encodeURIComponent(`${event.title} – Église du Nazaréen de Damé`);
    const details = encodeURIComponent(
      `${event.description}\n\nJour & Heure : ${event.day} à ${event.time}\nLieu : ${event.location}\nÉglise du Nazaréen de Damé, Haïti.\nPasteur Bequel CHERELUS.\nSite web : https://www.eglisedunazareendedame.org`
    );
    const location = encodeURIComponent(`${event.location}, 3ème Section Damé, Môle-Saint-Nicolas, Haïti`);

    // Formatage URL Google Calendar avec paramètre TEMPLATE
    return `https://calendar.google.com/calendar/render?action=TEMPLATE&text=${title}&details=${details}&location=${location}`;
  };

  const generateIcs = (event: typeof OFFICIAL_SERVICES[0]) => {
    const icsContent = `BEGIN:VCALENDAR
VERSION:2.0
PRODID:-//Eglise du Nazareen de Dame//Cultes//FR
BEGIN:VEVENT
SUMMARY:${event.title} - Eglise du Nazareen de Dame
DESCRIPTION:${event.description.replace(/\n/g, ' ')}
LOCATION:${event.location}
STATUS:CONFIRMED
END:VEVENT
END:VCALENDAR`;

    const blob = new Blob([icsContent], { type: 'text/calendar;charset=utf-8' });
    const link = document.createElement('a');
    link.href = window.URL.createObjectURL(blob);
    link.setAttribute('download', `${event.id}.ics`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="space-y-16 pb-16">
      <SEOHead 
        title="Cultes & Événements – Calendrier & Horaires des Réunions | Damé"
        description="Consultez les horaires des cultes d'adoration, école du dimanche, réunions de prière et conférences de réveil à l'Église du Nazaréen de Damé, Haïti. Ajoutez-les directement à votre Google Calendar."
        path="/evenements"
        image="/images/evenements/evenement-badge.svg"
      />

      {/* Header */}
      <section className="bg-[#F7F4EE] text-stone-900 py-12 sm:py-16 px-4 border-b border-stone-200">
        <div className="max-w-4xl mx-auto text-center space-y-3">
          <div className="inline-flex items-center space-x-2 px-3.5 py-1 rounded-full bg-stone-100 border border-stone-200 text-amber-900 text-xs font-bold uppercase tracking-widest">
            <CalendarIcon className="w-3.5 h-3.5 text-amber-800" />
            <span>Calendrier Ecclésial Officiel</span>
          </div>

          <h1 className="font-serif text-3xl sm:text-5xl font-bold text-stone-900">
            Cultes, Réunions &amp; Événements
          </h1>

          <p className="text-stone-700 text-base sm:text-lg max-w-2xl mx-auto leading-relaxed">
            Rejoignez-nous pour adorer Dieu en esprit et en vérité dans notre sanctuaire de la 3ème Section Damé.
            Ajoutez nos rendez-vous en un clic à votre calendrier personnel.
          </p>
        </div>
      </section>

      {/* Filter and Search Bar */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="bg-white rounded-2xl p-4 sm:p-6 shadow-md border border-slate-200 flex flex-col md:flex-row items-center justify-between gap-4">
          {/* Categories */}
          <div className="flex flex-wrap items-center gap-2">
            {[
              { id: 'all', label: 'Tous les rendez-vous' },
              { id: 'culte', label: 'Cultes d’Adoration' },
              { id: 'priere', label: 'Prière & Intercession' },
              { id: 'formation', label: 'Étude & Enseignement' },
              { id: 'jeunesse', label: 'Jeunesse (JNI)' },
              { id: 'conference', label: 'Conférences Spéciales' }
            ].map(cat => (
              <button
                key={cat.id}
                onClick={() => setSelectedFilter(cat.id)}
                className={`px-3 py-1.5 rounded-lg text-xs font-bold transition ${
                  selectedFilter === cat.id
                    ? 'bg-amber-500 text-slate-950 shadow-sm'
                    : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                }`}
              >
                {cat.label}
              </button>
            ))}
          </div>

          {/* Search Input */}
          <div className="relative w-full md:w-64">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Rechercher jour, culte..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-9 pr-3 py-1.5 text-xs rounded-lg border border-slate-300 focus:outline-none focus:border-amber-500"
            />
          </div>
        </div>
      </section>

      {/* Events List */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredEvents.map((event) => (
            <div
              key={event.id}
              className="bg-white rounded-2xl overflow-hidden shadow-lg border border-slate-200 flex flex-col justify-between hover:border-amber-400/60 transition"
            >
              <div>
                <div className="p-4 bg-[#FAF7F2] text-stone-900 border-b border-stone-200/80 flex items-center justify-between">
                  <span className="text-xs font-serif font-bold text-amber-900 uppercase tracking-wider flex items-center space-x-1.5">
                    <Clock className="w-3.5 h-3.5 text-amber-800" />
                    <span>{event.day}</span>
                  </span>
                  <span className="text-[11px] bg-white text-stone-700 px-2.5 py-0.5 rounded font-mono font-medium border border-stone-200">
                    {event.time}
                  </span>
                </div>

                <div className="p-6 space-y-3">
                  <h3 className="font-serif font-bold text-slate-900 text-lg leading-snug">
                    {event.title}
                  </h3>

                  <div className="flex items-start space-x-2 text-xs text-slate-500">
                    <MapPin className="w-4 h-4 text-amber-500 flex-shrink-0 mt-0.5" />
                    <span>{event.location}</span>
                  </div>

                  <p className="text-xs text-slate-600 leading-relaxed">
                    {event.description}
                  </p>
                </div>
              </div>

              {/* Action Buttons: Google Calendar, ICS & Info */}
              <div className="p-6 pt-0 border-t border-slate-100 space-y-2 mt-4">
                {/* Bouton Ajouter à Google Calendar */}
                <a
                  href={createGoogleCalendarUrl(event)}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-full py-2 px-3 rounded-xl text-xs font-bold bg-amber-500 text-slate-950 hover:bg-amber-400 transition flex items-center justify-center space-x-2 shadow-sm"
                  title="Ajouter automatiquement cet événement à votre Google Calendar"
                >
                  <CalendarPlus className="w-4 h-4" />
                  <span>Ajouter à mon Google Calendar</span>
                </a>

                <div className="flex items-center justify-between pt-1">
                  <button
                    onClick={() => generateIcs(event)}
                    className="inline-flex items-center space-x-1 text-[11px] font-semibold text-slate-500 hover:text-slate-800 transition"
                    title="Télécharger fichier .ics pour Apple Calendar ou Outlook"
                  >
                    <Download className="w-3 h-3" />
                    <span>Fichier .ICS (Outlook/Apple)</span>
                  </button>

                  <a
                    href="https://share.google/9kpd149ZpzHWNxOXI"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-[11px] font-bold text-amber-600 hover:text-amber-700 transition flex items-center space-x-1"
                    title="Voir l'emplacement sur Google Maps"
                  >
                    <MapPin className="w-3 h-3" />
                    <span>Itinéraire Google Maps ›</span>
                  </a>
                </div>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Regular Services Summary Callout */}
      <section className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="bg-[#FAF7F2] rounded-2xl p-6 sm:p-10 text-stone-900 border border-stone-200/90 shadow-2xs">
          <div className="text-center max-w-2xl mx-auto space-y-3">
            <p className="text-xs font-serif font-bold uppercase tracking-wider text-amber-900">
              Accueil &amp; Bénédiction Pastorale
            </p>

            <h3 className="font-serif text-2xl sm:text-3xl font-bold text-stone-900">
              Vous visitez Damé pour la première fois ?
            </h3>
            <p className="text-xs sm:text-sm text-stone-600 leading-relaxed">
              Toute notre équipe d'accueil et le Pasteur Bequel CHERELUS vous réservent une place d'honneur. Venez en famille, vous êtes bénis de l'Éternel !
            </p>
            <div className="pt-2 flex flex-wrap items-center justify-center gap-3">
              <button
                onClick={() => onNavigate('/contact')}
                className="px-6 py-2.5 rounded-lg text-xs font-serif font-bold bg-stone-900 text-white hover:bg-stone-800 transition shadow-2xs"
              >
                Préparer votre venue
              </button>
              <a
                href={createGoogleCalendarUrl(OFFICIAL_SERVICES[0])}
                target="_blank"
                rel="noopener noreferrer"
                className="px-5 py-2.5 rounded-lg text-xs font-semibold bg-white text-stone-800 hover:bg-stone-50 transition border border-stone-300 flex items-center space-x-2 shadow-2xs"
              >
                <CalendarPlus className="w-4 h-4 text-amber-700" />
                <span>Ajouter le Culte du Dimanche</span>
              </a>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};
