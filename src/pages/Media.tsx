import React, { useState } from 'react';
import { OFFICIAL_MEDIA, OFFICIAL_CHURCH_INFO } from '../data/churchData';
import { MediaItem } from '../types';
import { SEOHead } from '../components/SEOHead';
import { 
  Tv, 
  Headphones, 
  Play, 
  Pause, 
  Download, 
  Share2, 
  Maximize2, 
  Youtube, 
  ExternalLink, 
  Image as ImageIcon,
  Volume2,
  Calendar,
  User,
  BookOpen
} from 'lucide-react';

interface MediaProps {
  onNavigate: (path: string) => void;
}

export const Media: React.FC<MediaProps> = ({ onNavigate }) => {
  const [activeTab, setActiveTab] = useState<'sermons' | 'videos' | 'podcasts' | 'gallery'>('sermons');
  const [galleryFilter, setGalleryFilter] = useState<string>('all');
  const [playingId, setPlayingId] = useState<string | null>(null);
  const [selectedPhoto, setSelectedPhoto] = useState<MediaItem | null>(null);

  const sermons = OFFICIAL_MEDIA.filter(m => m.type === 'sermon_audio');
  const videos = OFFICIAL_MEDIA.filter(m => m.type === 'sermon_video');
  const podcasts = OFFICIAL_MEDIA.filter(m => m.type === 'podcast');
  const gallery = OFFICIAL_MEDIA.filter(m => m.type === 'gallery_photo');

  const filteredGallery = gallery.filter(item => {
    return galleryFilter === 'all' || item.category === galleryFilter;
  });

  return (
    <div className="space-y-16 pb-16">
      <SEOHead 
        title="Médias – Prédications, Vidéos, Podcasts & Galerie | Église de Damé"
        description="Écoutez les prédications audio du Pasteur Bequel CHERELUS, visionnez les cultes vidéo, écoutez les podcasts et visitez la galerie photo officielle de Damé."
        path="/medias"
        image="/images/galerie/galerie-badge.svg"
      />

      {/* Header */}
      <section className="bg-gradient-to-b from-[#071322] to-[#0b1b33] text-white py-16 px-4 border-b border-amber-500/20">
        <div className="max-w-4xl mx-auto text-center space-y-4">
          <div className="inline-flex items-center space-x-2 px-3.5 py-1 rounded-full bg-amber-500/10 border border-amber-400/30 text-amber-300 text-xs font-bold uppercase tracking-widest">
            <Tv className="w-3.5 h-3.5" />
            <span>Médiathèque Spirituelle</span>
          </div>

          <h1 className="font-serif text-3xl sm:text-5xl font-extrabold text-white">
            Prédications, Vidéos &amp; Galerie
          </h1>

          <p className="text-slate-300 text-base sm:text-lg max-w-2xl mx-auto leading-relaxed">
            Ressources d'édification spirituelle, enseignements de la foi nazaréenne et mémoire visuelle de l’Église de Damé.
          </p>
        </div>
      </section>

      {/* Media Type Tabs */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-wrap items-center justify-center gap-3 border-b border-slate-200 pb-4">
          {[
            { id: 'sermons', label: 'Prédications Audio', icon: Headphones, count: sermons.length },
            { id: 'videos', label: 'Cultes Vidéo (YouTube)', icon: Tv, count: videos.length },
            { id: 'podcasts', label: 'Podcasts & Histoire', icon: Headphones, count: podcasts.length },
            { id: 'gallery', label: 'Galerie Photos Officielle', icon: ImageIcon, count: gallery.length },
          ].map(tab => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as any)}
                className={`flex items-center space-x-2 px-5 py-2.5 rounded-xl text-xs sm:text-sm font-bold transition-all shadow-sm ${
                  isActive
                    ? 'bg-amber-500 text-slate-950 shadow-amber-500/20 scale-105'
                    : 'bg-white text-slate-700 hover:bg-slate-100 border border-slate-200'
                }`}
              >
                <Icon className="w-4 h-4" />
                <span>{tab.label}</span>
                <span className={`text-[10px] px-1.5 py-0.2 rounded-full ${
                  isActive ? 'bg-slate-950 text-amber-300' : 'bg-slate-100 text-slate-600'
                }`}>
                  {tab.count}
                </span>
              </button>
            );
          })}
        </div>
      </section>

      {/* Content for: SERMONS */}
      {activeTab === 'sermons' && (
        <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {sermons.map((item) => {
              const isPlaying = playingId === item.id;
              return (
                <div key={item.id} className="bg-white rounded-2xl p-6 shadow-lg border border-slate-200 flex flex-col justify-between">
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <span className="text-[11px] font-bold text-amber-700 bg-amber-50 px-2.5 py-1 rounded">
                        {item.category}
                      </span>
                      <span className="text-xs text-slate-500 font-mono">
                        {item.duration}
                      </span>
                    </div>

                    <h3 className="font-serif font-bold text-slate-900 text-lg">
                      {item.title}
                    </h3>

                    <div className="text-xs text-slate-600 space-y-1">
                      <p className="flex items-center space-x-1 font-medium">
                        <User className="w-3.5 h-3.5 text-amber-500" />
                        <span>Prédicateur : {item.speaker}</span>
                      </p>
                      <p className="flex items-center space-x-1 italic text-slate-500">
                        <BookOpen className="w-3.5 h-3.5 text-slate-400" />
                        <span>Passage : {item.reference}</span>
                      </p>
                      <p className="flex items-center space-x-1 text-slate-400">
                        <Calendar className="w-3.5 h-3.5 text-slate-400" />
                        <span>Date : {item.date}</span>
                      </p>
                    </div>

                    <p className="text-xs text-slate-600 leading-relaxed pt-1">
                      {item.description}
                    </p>
                  </div>

                  {/* Audio Player Controls */}
                  <div className="mt-6 pt-4 border-t border-slate-100 flex items-center justify-between">
                    <button
                      onClick={() => setPlayingId(isPlaying ? null : item.id)}
                      className={`flex items-center space-x-2 px-4 py-2 rounded-xl text-xs font-bold transition ${
                        isPlaying
                          ? 'bg-amber-500 text-slate-950 animate-pulse'
                          : 'bg-slate-900 text-white hover:bg-slate-800'
                      }`}
                    >
                      {isPlaying ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4 fill-current" />}
                      <span>{isPlaying ? 'En lecture audio...' : 'Écouter le message'}</span>
                    </button>

                    <a
                      href={item.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      download
                      className="text-xs text-slate-500 hover:text-amber-600 flex items-center space-x-1"
                    >
                      <Download className="w-3.5 h-3.5" />
                      <span>Télécharger</span>
                    </a>
                  </div>
                </div>
              );
            })}
          </div>
        </section>
      )}

      {/* Content for: VIDEOS */}
      {activeTab === 'videos' && (
        <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-6">
          <div className="bg-slate-900 text-white rounded-3xl p-6 sm:p-8 flex flex-col md:flex-row items-center justify-between gap-6 border border-amber-500/30">
            <div className="space-y-2">
              <h3 className="font-serif text-xl sm:text-2xl font-bold text-amber-300">
                Chaîne YouTube Officielle de l’Église de Damé
              </h3>
              <p className="text-xs text-slate-300">
                Abonnez-vous pour recevoir en direct les cultes du dimanche, les croisades et les chants de la chorale.
              </p>
            </div>
            <a
              href={OFFICIAL_CHURCH_INFO.social.youtube}
              target="_blank"
              rel="noopener noreferrer"
              className="px-6 py-3 rounded-xl bg-red-600 hover:bg-red-700 text-white font-bold text-xs flex items-center space-x-2 flex-shrink-0 shadow-lg"
            >
              <Youtube className="w-4 h-4" />
              <span>Visiter @eglisedunazareendame</span>
            </a>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {videos.map((item) => (
              <div key={item.id} className="bg-white rounded-2xl overflow-hidden shadow-lg border border-slate-200">
                <div className="relative aspect-video bg-slate-950 flex items-center justify-center">
                  <img
                    src={item.thumbnail}
                    alt={item.title}
                    className="w-full h-full object-cover opacity-75"
                  />
                  <a
                    href={item.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="absolute w-14 h-14 rounded-full bg-red-600 text-white flex items-center justify-center hover:scale-110 transition shadow-2xl"
                  >
                    <Play className="w-6 h-6 ml-1 fill-current" />
                  </a>
                </div>
                <div className="p-6 space-y-2">
                  <span className="text-[11px] font-bold text-amber-600 uppercase">
                    {item.category}
                  </span>
                  <h3 className="font-serif font-bold text-slate-900 text-lg">
                    {item.title}
                  </h3>
                  <p className="text-xs text-slate-600">
                    {item.description}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </section>
      )}

      {/* Content for: PODCASTS */}
      {activeTab === 'podcasts' && (
        <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {podcasts.map((item) => (
              <div key={item.id} className="bg-white rounded-2xl p-6 shadow-lg border border-slate-200 space-y-4">
                <div className="flex items-center space-x-3">
                  <div className="w-12 h-12 rounded-xl bg-amber-500/20 text-amber-600 flex items-center justify-center flex-shrink-0">
                    <Headphones className="w-6 h-6" />
                  </div>
                  <div>
                    <h3 className="font-serif font-bold text-slate-900 text-base">{item.title}</h3>
                    <p className="text-xs text-slate-500">{item.speaker} • {item.duration}</p>
                  </div>
                </div>
                <p className="text-xs text-slate-600 leading-relaxed">{item.description}</p>
                <div className="pt-2">
                  <a
                    href={item.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center space-x-2 px-4 py-2 rounded-lg text-xs font-bold bg-slate-900 text-amber-300 hover:bg-slate-800 transition"
                  >
                    <Play className="w-3.5 h-3.5 fill-current" />
                    <span>Écouter le podcast sur YouTube</span>
                  </a>
                </div>
              </div>
            ))}
          </div>
        </section>
      )}

      {/* Content for: GALLERY PHOTOS */}
      {activeTab === 'gallery' && (
        <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-6">
          {/* Gallery Category Filter */}
          <div className="flex flex-wrap items-center justify-center gap-2">
            {[
              { id: 'all', label: 'Toutes les photos' },
              { id: 'eglise', label: 'Sanctuaire & Bâtiment' },
              { id: 'pasteur', label: 'Direction Pastorale' },
              { id: 'ministeres', label: 'Ministères & Chorales' },
              { id: 'projets', label: 'Projet CDEJ HA 0926' },
            ].map(cat => (
              <button
                key={cat.id}
                onClick={() => setGalleryFilter(cat.id)}
                className={`px-3 py-1.5 rounded-lg text-xs font-bold transition ${
                  galleryFilter === cat.id
                    ? 'bg-amber-500 text-slate-950'
                    : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                }`}
              >
                {cat.label}
              </button>
            ))}
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {filteredGallery.map((item) => (
              <div
                key={item.id}
                onClick={() => setSelectedPhoto(item)}
                className="bg-white rounded-2xl overflow-hidden shadow-md border border-slate-200 cursor-pointer group hover:shadow-xl transition"
              >
                <div className="relative aspect-square bg-slate-900 overflow-hidden">
                  <img
                    src={item.url}
                    alt={item.title}
                    className="w-full h-full object-cover group-hover:scale-105 transition duration-300"
                  />
                  <div className="absolute inset-0 bg-slate-950/40 opacity-0 group-hover:opacity-100 transition flex items-center justify-center text-white">
                    <Maximize2 className="w-6 h-6 text-amber-400" />
                  </div>
                </div>
                <div className="p-4">
                  <h4 className="font-serif font-bold text-slate-900 text-xs sm:text-sm line-clamp-1">
                    {item.title}
                  </h4>
                  <p className="text-[11px] text-slate-500 line-clamp-2 mt-1">
                    {item.description}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </section>
      )}

      {/* Lightbox Modal */}
      {selectedPhoto && (
        <div
          className="fixed inset-0 z-50 bg-slate-950/90 backdrop-blur-md flex items-center justify-center p-4 animate-in fade-in duration-150"
          onClick={() => setSelectedPhoto(null)}
        >
          <div
            className="bg-slate-900 border border-amber-500/40 rounded-3xl max-w-3xl w-full overflow-hidden shadow-2xl p-4 sm:p-6 text-white space-y-4"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between">
              <h3 className="font-serif font-bold text-amber-300 text-lg">
                {selectedPhoto.title}
              </h3>
              <button
                onClick={() => setSelectedPhoto(null)}
                className="text-slate-400 hover:text-white text-xl font-bold px-2"
              >
                ✕
              </button>
            </div>

            <div className="rounded-xl overflow-hidden bg-black flex items-center justify-center max-h-[60vh]">
              <img
                src={selectedPhoto.url}
                alt={selectedPhoto.title}
                className="max-h-[60vh] w-auto object-contain"
              />
            </div>

            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between text-xs text-slate-300 gap-2 border-t border-slate-800 pt-3">
              <p>{selectedPhoto.description}</p>
              <span className="text-amber-400 font-mono text-[11px] flex-shrink-0">
                {selectedPhoto.date}
              </span>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
