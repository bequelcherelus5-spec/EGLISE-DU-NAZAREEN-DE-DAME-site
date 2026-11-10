import React, { useState, useEffect, useRef } from 'react';
import { mediaService, ChurchMedia, parseVideoUrl } from '../services/mediaService';
import { OFFICIAL_CHURCH_INFO } from '../data/churchData';
import { SEOHead } from '../components/SEOHead';
import { 
  Tv, 
  Headphones, 
  Play, 
  Pause, 
  Download, 
  Maximize2, 
  Youtube, 
  Facebook,
  ExternalLink, 
  Image as ImageIcon,
  Calendar,
  User,
  Search,
  Filter,
  Volume2,
  Share2,
  Sparkles,
  Lock,
  PlusCircle,
  Eye
} from 'lucide-react';

interface MediaProps {
  onNavigate: (path: string) => void;
}

export const Media: React.FC<MediaProps> = ({ onNavigate }) => {
  const [items, setItems] = useState<ChurchMedia[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'all' | 'video' | 'audio' | 'image'>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');

  // Audio player state
  const [playingAudioId, setPlayingAudioId] = useState<string | null>(null);
  const audioRef = useRef<HTMLAudioElement | null>(null);

  // Video modal player state
  const [activeVideoModal, setActiveVideoModal] = useState<ChurchMedia | null>(null);

  // Lightbox for photos
  const [selectedPhoto, setSelectedPhoto] = useState<ChurchMedia | null>(null);

  // Load media items from mediaService
  const loadMedia = async () => {
    try {
      const data = await mediaService.getAllMedia();
      setItems(data);
    } catch (e) {
      console.warn('Erreur chargement media:', e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadMedia();

    const handleUpdate = () => {
      loadMedia();
    };

    window.addEventListener('church-media-updated', handleUpdate);
    window.addEventListener('storage', handleUpdate);

    return () => {
      window.removeEventListener('church-media-updated', handleUpdate);
      window.removeEventListener('storage', handleUpdate);
    };
  }, []);

  // Handle Audio playback
  const handleToggleAudio = (item: ChurchMedia) => {
    if (playingAudioId === item.id) {
      if (audioRef.current) {
        audioRef.current.pause();
      }
      setPlayingAudioId(null);
    } else {
      if (audioRef.current) {
        audioRef.current.src = item.url;
        audioRef.current.play().catch(err => {
          console.warn('Playback error:', err);
        });
      }
      setPlayingAudioId(item.id);
    }
  };

  // Categories extraction
  const categories = Array.from(new Set(items.map(m => m.category).filter(Boolean)));

  // Filtered media
  const filteredItems = items.filter(item => {
    const matchesTab = activeTab === 'all' || item.type === activeTab;
    const matchesCat = selectedCategory === 'all' || item.category === selectedCategory;
    const q = searchQuery.toLowerCase().trim();
    const matchesQuery = !q || 
      item.title.toLowerCase().includes(q) || 
      (item.description && item.description.toLowerCase().includes(q)) ||
      (item.speaker && item.speaker.toLowerCase().includes(q)) ||
      (item.category && item.category.toLowerCase().includes(q));

    return matchesTab && matchesCat && matchesQuery;
  });

  const videoCount = items.filter(i => i.type === 'video').length;
  const audioCount = items.filter(i => i.type === 'audio').length;
  const imageCount = items.filter(i => i.type === 'image').length;

  return (
    <div className="space-y-12 pb-20">
      <SEOHead 
        title="Media – Vidéos, Audios & Photos | Église du Nazaréen de Damé"
        description="Médiathèque officielle de l'Église du Nazaréen de Damé : cultes en vidéo, prédications audio du Pasteur Bequel CHERELUS, chants et galerie photographique."
        path="/media"
        image="/images/eglise/sceau-officiel.svg"
      />

      {/* Hidden global audio tag for streaming sermons */}
      <audio 
        ref={audioRef} 
        onEnded={() => setPlayingAudioId(null)}
        onError={() => setPlayingAudioId(null)}
      />

      {/* Hero Banner Clean & Pastoral */}
      <section className="bg-[#F7F4EE] text-stone-900 py-12 sm:py-16 px-4 border-b border-stone-200">
        <div className="max-w-4xl mx-auto text-center space-y-3">
          <div className="inline-flex items-center space-x-2 px-3.5 py-1 rounded-full bg-stone-100 border border-stone-200 text-amber-900 text-xs font-bold uppercase tracking-widest">
            <Tv className="w-3.5 h-3.5 text-amber-800" />
            <span>Médiathèque Spirituelle &amp; Prédications</span>
          </div>

          <h1 className="font-serif text-3xl sm:text-5xl font-bold text-stone-900 tracking-tight">
            Media
          </h1>

          <p className="text-stone-700 text-base sm:text-lg max-w-2xl mx-auto leading-relaxed">
            Vidéos des cultes, prédications audio édifiantes du Pasteur Bequel CHERELUS et souvenirs photographiques de la congrégation de Damé.
          </p>

          {/* Quick link to Secretariat for authorized leaders */}
          <div className="pt-2 flex flex-wrap items-center justify-center gap-2.5">
            <button
              onClick={() => onNavigate('/secretariat')}
              className="inline-flex items-center space-x-2 px-4 py-2 rounded-lg bg-stone-900 hover:bg-stone-800 text-white text-xs font-bold transition shadow-xs"
            >
              <PlusCircle className="w-4 h-4" />
              <span>Publier un Média (Secrétariat)</span>
            </button>
            <a
              href={OFFICIAL_CHURCH_INFO.social.youtube}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center space-x-2 px-4 py-2 rounded-lg bg-red-700 hover:bg-red-800 text-white text-xs font-bold transition shadow-xs"
            >
              <Youtube className="w-4 h-4" />
              <span>Chaîne YouTube Officielle</span>
            </a>
          </div>
        </div>
      </section>

      {/* Main Content Area */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8">
        {/* Controls: Search, Tabs & Category Filter */}
        <div className="bg-white rounded-3xl p-4 sm:p-6 shadow-md border border-slate-200/80 space-y-4">
          <div className="flex flex-col md:flex-row items-center justify-between gap-4">
            {/* Search Input */}
            <div className="relative w-full md:w-96">
              <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
              <input 
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Rechercher par titre, pasteur, sujet..."
                className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-slate-200 text-xs sm:text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-amber-500 bg-slate-50"
              />
              {searchQuery && (
                <button
                  onClick={() => setSearchQuery('')}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-slate-400 hover:text-slate-600"
                >
                  ✕
                </button>
              )}
            </div>

            {/* Category Dropdown */}
            {categories.length > 0 && (
              <div className="flex items-center space-x-2 w-full md:w-auto">
                <Filter className="w-4 h-4 text-amber-500 flex-shrink-0" />
                <select
                  value={selectedCategory}
                  onChange={(e) => setSelectedCategory(e.target.value)}
                  className="w-full md:w-auto px-3 py-2 rounded-xl border border-slate-200 text-xs font-medium text-slate-700 bg-slate-50 focus:outline-none focus:ring-2 focus:ring-amber-500"
                >
                  <option value="all">Toutes les catégories ({items.length})</option>
                  {categories.map(cat => (
                    <option key={cat} value={cat}>{cat}</option>
                  ))}
                </select>
              </div>
            )}
          </div>

          {/* Type Filter Buttons */}
          <div className="flex flex-wrap items-center gap-2 pt-2 border-t border-slate-100">
            {[
              { id: 'all', label: 'Tout Afficher', count: items.length, icon: Sparkles },
              { id: 'video', label: 'Vidéos (YouTube & Culte)', count: videoCount, icon: Tv },
              { id: 'audio', label: 'Audios & Prédications', count: audioCount, icon: Headphones },
              { id: 'image', label: 'Galerie Photos & Sceau', count: imageCount, icon: ImageIcon },
            ].map(tab => {
              const Icon = tab.icon;
              const isActive = activeTab === tab.id;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id as any)}
                  className={`flex items-center space-x-2 px-4 py-2 rounded-xl text-xs font-bold transition-all shadow-sm ${
                    isActive
                      ? 'bg-amber-500 text-slate-950 scale-105 shadow-amber-500/20'
                      : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                  }`}
                >
                  <Icon className="w-3.5 h-3.5" />
                  <span>{tab.label}</span>
                  <span className={`text-[10px] px-1.5 py-0.5 rounded-full ${
                    isActive ? 'bg-slate-950 text-amber-300' : 'bg-white text-slate-600'
                  }`}>
                    {tab.count}
                  </span>
                </button>
              );
            })}
          </div>
        </div>

        {/* Media Grid */}
        {loading ? (
          <div className="py-20 text-center space-y-3">
            <div className="w-10 h-10 border-4 border-amber-500 border-t-transparent rounded-full animate-spin mx-auto" />
            <p className="text-xs text-slate-500 font-medium">Chargement des médias officiels...</p>
          </div>
        ) : items.length === 0 ? (
          <div className="space-y-10">
            {/* Pastoral Message & Media Center Overview */}
            <div className="bg-white rounded-3xl p-8 sm:p-10 border border-slate-200/80 shadow-md space-y-6">
              <div className="max-w-3xl space-y-3">
                <span className="text-[11px] font-bold uppercase tracking-wider text-amber-700 bg-amber-50 px-3 py-1 rounded-full border border-amber-200 inline-block">
                  Centre Audiovisuel &amp; Ministère de la Parole
                </span>
                <h2 className="font-serif text-2xl sm:text-3xl font-bold text-slate-900">
                  Prédications, Enseignements &amp; Archives Liturgiques de Damé
                </h2>
                <p className="text-sm text-slate-700 leading-relaxed">
                  Bienvenue dans l’espace audiovisuel officiel de l’<strong>Église du Nazaréen de Damé</strong>. Sous la conduite pastorale du <strong>Pasteur Bequel CHERELUS</strong>, notre congrégation proclame la pure doctrine biblique de la sainteté de cœur et de vie (Hébreux 12:14), tout en partageant avec les fidèles d’Haïti et de la diaspora les prédications inspirées, les chants d’adoration de nos chorales et les témoignages de la grâce divine.
                </p>
              </div>

              {/* 3 Pillars of Media Ministry */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6 pt-2">
                <div className="p-5 rounded-2xl bg-slate-50 border border-slate-200 space-y-2">
                  <div className="w-10 h-10 rounded-xl bg-amber-500/20 text-amber-700 flex items-center justify-center font-bold">
                    <Tv className="w-5 h-5 text-amber-600" />
                  </div>
                  <h3 className="font-serif font-bold text-slate-900 text-sm">
                    Diffusion des Cultes du Dimanche
                  </h3>
                  <p className="text-xs text-slate-600 leading-relaxed">
                    Les cultes d’adoration et de louange célébrés chaque dimanche matin de 08h00 à 11h30 à Damé sont captés pour édifier les foyers chrétiens, les membres éloignés et la communauté chrétienne internationale.
                  </p>
                </div>

                <div className="p-5 rounded-2xl bg-slate-50 border border-slate-200 space-y-2">
                  <div className="w-10 h-10 rounded-xl bg-blue-500/20 text-blue-700 flex items-center justify-center font-bold">
                    <Headphones className="w-5 h-5 text-blue-600" />
                  </div>
                  <h3 className="font-serif font-bold text-slate-900 text-sm">
                    Prédications Audio &amp; Études
                  </h3>
                  <p className="text-xs text-slate-600 leading-relaxed">
                    Des messages audio théologiques centrés sur la sanctification chrétienne, l’espérance en Christ et l’éthique nazaréenne, disponibles pour une écoute méditative à tout moment.
                  </p>
                </div>

                <div className="p-5 rounded-2xl bg-slate-50 border border-slate-200 space-y-2">
                  <div className="w-10 h-10 rounded-xl bg-emerald-500/20 text-emerald-700 flex items-center justify-center font-bold">
                    <ImageIcon className="w-5 h-5 text-emerald-600" />
                  </div>
                  <h3 className="font-serif font-bold text-slate-900 text-sm">
                    Mémoire Visuelle &amp; Projets
                  </h3>
                  <p className="text-xs text-slate-600 leading-relaxed">
                    Photographies des baptêmes par immersion, des célébrations de jeunesse JNI, des réunions du Ministère des Dames et des activités humanitaires du projet CDEJ HA 0926.
                  </p>
                </div>
              </div>

              {/* Pastoral Themes & Scripture Guide */}
              <div className="p-6 rounded-2xl bg-gradient-to-br from-amber-50 via-white to-amber-50 border border-amber-200 space-y-3">
                <h4 className="font-serif font-bold text-amber-900 text-base">
                  Thèmes Majeurs de la Prédication à l’Église du Nazaréen de Damé
                </h4>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs text-slate-700">
                  <div className="space-y-1">
                    <p className="font-bold text-slate-900">1. La Sanctification Entière (1 Thessaloniciens 5:23-24)</p>
                    <p className="text-slate-600">
                      L’œuvre de l’Esprit de Dieu qui purifie le cœur du croyant, le rendant capable d’aimer Dieu de tout son cœur et son prochain comme lui-même.
                    </p>
                  </div>
                  <div className="space-y-1">
                    <p className="font-bold text-slate-900">2. La Fidélité et la Persévérance dans l’Épreuve (Jacques 1:12)</p>
                    <p className="text-slate-600">
                      Encouragements adressés à la congrégation de Damé pour demeurer fermes dans la foi chrétienne en toutes circonstances.
                    </p>
                  </div>
                  <div className="space-y-1">
                    <p className="font-bold text-slate-900">3. La Compassion &amp; le Service Chrétien (Matthieu 25:40)</p>
                    <p className="text-slate-600">
                      L’incarnation pratique de l’Évangile par le soutien aux 200+ enfants parrainés et aux familles vulnérables du Nord-Ouest d’Haïti.
                    </p>
                  </div>
                  <div className="space-y-1">
                    <p className="font-bold text-slate-900">4. La Transmission de la Foi aux Nouvelles Générations (Proverbes 22:6)</p>
                    <p className="text-slate-600">
                      Formation biblique approfondie dans les écoles du dimanche, les clubs d'enfants et les séminaires pour la jeunesse JNI.
                    </p>
                  </div>
                </div>
              </div>

              {/* Official Social Channels CTA */}
              <div className="flex flex-col sm:flex-row items-center justify-between p-6 rounded-2xl bg-[#FAF7F2] text-stone-900 border border-stone-200/90 shadow-2xs gap-4">
                <div className="space-y-1 text-center sm:text-left">
                  <p className="font-serif font-bold text-base text-stone-900">
                    Suivez nos cultes en direct sur les Réseaux Sociaux
                  </p>
                  <p className="text-xs text-stone-600">
                    Retrouvez les diffusions en direct, prédications et louanges du Pasteur Bequel CHERELUS.
                  </p>
                </div>
                <div className="flex flex-wrap items-center gap-2">
                  <a
                    href={OFFICIAL_CHURCH_INFO.social.facebook}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="px-4 py-2 rounded-lg bg-blue-700 hover:bg-blue-800 text-white text-xs font-serif font-bold transition flex items-center space-x-1.5 shadow-2xs"
                  >
                    <Facebook className="w-4 h-4" />
                    <span>Facebook</span>
                  </a>
                  <a
                    href={OFFICIAL_CHURCH_INFO.social.youtube}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="px-4 py-2 rounded-lg bg-red-700 hover:bg-red-800 text-white text-xs font-serif font-bold transition flex items-center space-x-1.5 shadow-2xs"
                  >
                    <Youtube className="w-4 h-4" />
                    <span>YouTube</span>
                  </a>
                  <button
                    onClick={() => onNavigate('/contact')}
                    className="px-4 py-2 rounded-lg bg-white hover:bg-stone-50 text-stone-800 text-xs font-semibold transition border border-stone-300 shadow-2xs"
                  >
                    <span>Contact</span>
                  </button>
                </div>
              </div>
            </div>
          </div>
        ) : filteredItems.length === 0 ? (
          <div className="bg-white rounded-3xl p-12 text-center border border-slate-200 space-y-3">
            <Tv className="w-12 h-12 text-slate-300 mx-auto" />
            <h3 className="font-serif text-lg font-bold text-slate-800">Aucun résultat</h3>
            <p className="text-xs text-slate-500 max-w-sm mx-auto">
              Aucun média ne correspond à vos filtres de recherche actuels.
            </p>
            <button
              onClick={() => { setSearchQuery(''); setSelectedCategory('all'); setActiveTab('all'); }}
              className="mt-2 px-4 py-2 rounded-xl bg-amber-500 text-slate-950 text-xs font-bold hover:bg-amber-400"
            >
              Réinitialiser les filtres
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredItems.map(item => {
              const videoMeta = item.type === 'video' ? parseVideoUrl(item.url) : null;
              const isAudioPlaying = playingAudioId === item.id;

              return (
                <div 
                  key={item.id} 
                  className="bg-white rounded-3xl overflow-hidden shadow-md border border-slate-200/80 hover:shadow-xl transition-all duration-300 flex flex-col justify-between group"
                >
                  {/* Card Visual / Thumbnail */}
                  <div>
                    <div className="relative aspect-video bg-slate-950 overflow-hidden">
                      <img 
                        src={item.thumbnail || '/images/eglise/sceau-officiel.svg'} 
                        alt={item.title}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                        onError={(e) => {
                          (e.target as HTMLImageElement).src = '/images/eglise/sceau-officiel.svg';
                        }}
                      />

                      {/* Badge Type */}
                      <div className="absolute top-3 left-3 flex items-center space-x-1.5 px-2.5 py-1 rounded-full bg-slate-900/90 text-amber-300 text-[10px] font-bold uppercase tracking-wider backdrop-blur-sm border border-amber-500/30">
                        {item.type === 'video' && <Tv className="w-3 h-3 text-red-400" />}
                        {item.type === 'audio' && <Headphones className="w-3 h-3 text-amber-400" />}
                        {item.type === 'image' && <ImageIcon className="w-3 h-3 text-emerald-400" />}
                        <span>{item.type}</span>
                      </div>

                      {/* Duration if available */}
                      {item.duration && (
                        <div className="absolute top-3 right-3 px-2 py-0.5 rounded bg-black/75 text-white text-[10px] font-mono">
                          {item.duration}
                        </div>
                      )}

                      {/* Click overlay for video / photo */}
                      {item.type === 'video' && (
                        <button
                          onClick={() => setActiveVideoModal(item)}
                          className="absolute inset-0 bg-black/40 hover:bg-black/60 transition flex items-center justify-center group/btn"
                          title="Visionner la vidéo"
                        >
                          <div className="w-14 h-14 rounded-full bg-red-600 text-white flex items-center justify-center shadow-2xl group-hover/btn:scale-110 transition-transform">
                            <Play className="w-6 h-6 ml-1 fill-current" />
                          </div>
                        </button>
                      )}

                      {item.type === 'image' && (
                        <button
                          onClick={() => setSelectedPhoto(item)}
                          className="absolute inset-0 bg-black/30 hover:bg-black/50 transition flex items-center justify-center"
                          title="Agrandir la photo"
                        >
                          <div className="w-11 h-11 rounded-full bg-slate-900/80 text-white flex items-center justify-center shadow-lg hover:scale-110 transition-transform">
                            <Maximize2 className="w-5 h-5 text-amber-400" />
                          </div>
                        </button>
                      )}

                      {item.type === 'audio' && (
                        <button
                          onClick={() => handleToggleAudio(item)}
                          className="absolute inset-0 bg-black/30 hover:bg-black/50 transition flex items-center justify-center"
                          title={isAudioPlaying ? 'Mettre en pause' : 'Écouter'}
                        >
                          <div className={`w-14 h-14 rounded-full flex items-center justify-center shadow-2xl transition-transform hover:scale-110 ${
                            isAudioPlaying ? 'bg-amber-500 text-slate-950 animate-pulse' : 'bg-slate-900 text-amber-300'
                          }`}>
                            {isAudioPlaying ? <Pause className="w-6 h-6" /> : <Play className="w-6 h-6 ml-0.5 fill-current" />}
                          </div>
                        </button>
                      )}
                    </div>

                    {/* Content Details */}
                    <div className="p-5 space-y-3">
                      <div className="flex items-center justify-between text-[11px] text-slate-500">
                        <span className="font-bold text-amber-700 bg-amber-50 px-2 py-0.5 rounded">
                          {item.category || 'Général'}
                        </span>
                        <span className="flex items-center space-x-1">
                          <Calendar className="w-3 h-3 text-slate-400" />
                          <span>{item.date}</span>
                        </span>
                      </div>

                      <h3 className="font-serif font-bold text-slate-900 text-base leading-snug line-clamp-2">
                        {item.title}
                      </h3>

                      {item.speaker && (
                        <p className="flex items-center space-x-1.5 text-xs text-slate-600 font-medium">
                          <User className="w-3.5 h-3.5 text-amber-500" />
                          <span>{item.speaker}</span>
                        </p>
                      )}

                      {item.description && (
                        <p className="text-xs text-slate-600 leading-relaxed line-clamp-3">
                          {item.description}
                        </p>
                      )}
                    </div>
                  </div>

                  {/* Actions Bar Footer */}
                  <div className="p-5 pt-0 border-t border-slate-100 flex items-center justify-between mt-2">
                    {item.type === 'video' && (
                      <button
                        onClick={() => setActiveVideoModal(item)}
                        className="inline-flex items-center space-x-1.5 text-xs font-bold text-red-600 hover:text-red-700"
                      >
                        <Play className="w-3.5 h-3.5 fill-current" />
                        <span>Regarder la vidéo</span>
                      </button>
                    )}

                    {item.type === 'audio' && (
                      <button
                        onClick={() => handleToggleAudio(item)}
                        className={`inline-flex items-center space-x-1.5 text-xs font-bold ${
                          isAudioPlaying ? 'text-amber-600' : 'text-slate-800 hover:text-amber-600'
                        }`}
                      >
                        {isAudioPlaying ? <Pause className="w-3.5 h-3.5" /> : <Play className="w-3.5 h-3.5 fill-current" />}
                        <span>{isAudioPlaying ? 'Pause audio' : 'Écouter le message'}</span>
                      </button>
                    )}

                    {item.type === 'image' && (
                      <button
                        onClick={() => setSelectedPhoto(item)}
                        className="inline-flex items-center space-x-1.5 text-xs font-bold text-slate-800 hover:text-amber-600"
                      >
                        <Eye className="w-3.5 h-3.5 text-amber-500" />
                        <span>Agrandir l’image</span>
                      </button>
                    )}

                    {/* External Link or Download */}
                    {item.url && (
                      <a
                        href={item.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-xs text-slate-400 hover:text-amber-600 transition flex items-center space-x-1 p-1"
                        title="Ouvrir le lien source"
                      >
                        <ExternalLink className="w-3.5 h-3.5" />
                      </a>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Video Player Modal */}
      {activeVideoModal && (
        <div 
          className="fixed inset-0 z-50 bg-slate-950/90 backdrop-blur-md flex items-center justify-center p-4 animate-in fade-in"
          onClick={() => setActiveVideoModal(null)}
        >
          <div 
            className="bg-slate-900 border border-amber-500/40 rounded-3xl max-w-4xl w-full overflow-hidden shadow-2xl text-white space-y-4 p-4 sm:p-6"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <div>
                <span className="text-[10px] font-bold uppercase tracking-wider text-amber-400 bg-amber-500/10 px-2 py-0.5 rounded">
                  {activeVideoModal.category}
                </span>
                <h3 className="font-serif font-bold text-white text-base sm:text-xl mt-1">
                  {activeVideoModal.title}
                </h3>
              </div>
              <button
                onClick={() => setActiveVideoModal(null)}
                className="text-slate-400 hover:text-white text-xl font-bold px-3 py-1 rounded-lg bg-slate-800"
              >
                ✕
              </button>
            </div>

            {/* Video Embed Frame */}
            <div className="relative aspect-video w-full rounded-2xl overflow-hidden bg-black shadow-inner">
              {(() => {
                const info = parseVideoUrl(activeVideoModal.url);
                if (info.isYouTube) {
                  return (
                    <iframe
                      src={`${info.embedUrl}?autoplay=1&rel=0`}
                      title={activeVideoModal.title}
                      className="w-full h-full border-0"
                      allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                      allowFullScreen
                    />
                  );
                } else if (info.isFacebook) {
                  return (
                    <iframe
                      src={info.embedUrl}
                      title={activeVideoModal.title}
                      className="w-full h-full border-0"
                      allow="autoplay; clipboard-write; encrypted-media; picture-in-picture"
                      allowFullScreen
                    />
                  );
                } else {
                  return (
                    <video 
                      src={activeVideoModal.url}
                      controls
                      autoPlay
                      className="w-full h-full object-contain"
                    >
                      Votre navigateur ne supporte pas la balise vidéo.
                    </video>
                  );
                }
              })()}
            </div>

            <div className="text-xs text-slate-300 space-y-1">
              <p className="font-medium text-amber-300">
                Prédicateur / Auteur : {activeVideoModal.speaker || 'Direction Pastorale'}
              </p>
              <p className="text-slate-400 leading-relaxed">
                {activeVideoModal.description}
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Photo Lightbox Modal */}
      {selectedPhoto && (
        <div
          className="fixed inset-0 z-50 bg-slate-950/90 backdrop-blur-md flex items-center justify-center p-4 animate-in fade-in"
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
                className="text-slate-400 hover:text-white text-xl font-bold px-3 py-1 rounded-lg bg-slate-800"
              >
                ✕
              </button>
            </div>

            <div className="rounded-2xl overflow-hidden bg-black flex items-center justify-center max-h-[65vh]">
              <img
                src={selectedPhoto.url}
                alt={selectedPhoto.title}
                className="max-h-[65vh] w-auto object-contain"
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
