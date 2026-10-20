import React, { useState, useEffect, useRef } from 'react';
import { 
  Phone, 
  Mail, 
  Youtube, 
  Facebook, 
  Menu, 
  X, 
  Church, 
  Calendar, 
  Users, 
  HeartHandshake, 
  Tv, 
  Trophy, 
  Lock,
  ChevronRight,
  ChevronDown,
  FileText,
  Heart,
  BookOpen,
  Sparkles,
  HelpCircle
} from 'lucide-react';
import { OFFICIAL_CHURCH_INFO } from '../data/churchData';
import { CustomPage } from '../types';
import { pageService } from '../services/pageService';
import { LanguageSelector } from './LanguageSelector';
import { useLanguage } from '../context/LanguageContext';
import churchSealImg from '../assets/images/regenerated_image_1792011564270.x-icon';

interface NavbarProps {
  currentPath: string;
  onNavigate: (path: string) => void;
}

export const Navbar: React.FC<NavbarProps> = ({ currentPath, onNavigate }) => {
  const { t } = useLanguage();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [customPages, setCustomPages] = useState<CustomPage[]>([]);
  const [pagesDropdownOpen, setPagesDropdownOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Ref pour mesurer la hauteur exacte de l'en-tête et positionner le tiroir mobile
  const headerBarRef = useRef<HTMLDivElement>(null);
  const [headerHeight, setHeaderHeight] = useState<number>(72);

  const navLinks = [
    { path: '/', label: t('nav_home', 'Accueil'), icon: Church },
    { path: '/a-propos', label: t('nav_about', 'À Propos'), icon: Users },
    { path: '/ministeres', label: t('nav_ministries', 'Ministères'), icon: Users },
    { path: '/evenements', label: t('nav_events', 'Événements & Cultes'), icon: Calendar },
    { path: '/priere', label: t('nav_prayer', 'Priyè Sekrè'), icon: Heart },
    { path: '/temwayaj', label: t('nav_testimonies', 'Temwayaj'), icon: Sparkles },
    { path: '/leson-biblik', label: t('nav_lessons', 'Lekòl Dimanch'), icon: BookOpen },
    { path: '/projets', label: t('nav_projects', 'Projets (CDEJ)'), icon: HeartHandshake },
    { path: '/faire-un-don', label: t('nav_donations', 'Faire un Don'), icon: HeartHandshake },
    { path: '/medias', label: t('nav_media', 'Médias & Prédications'), icon: Tv },
    { path: '/jeux-bibliques', label: t('nav_bible_games', 'Jeux Bibliques'), icon: Trophy },
    { path: '/faq', label: t('nav_faq', 'FAQ'), icon: HelpCircle },
    { path: '/contact', label: t('nav_contact', 'Contact'), icon: Mail },
  ];

  // Mesure dynamique de la hauteur de l'en-tête
  useEffect(() => {
    const updateHeaderHeight = () => {
      if (headerBarRef.current) {
        setHeaderHeight(headerBarRef.current.offsetHeight);
      }
    };
    updateHeaderHeight();
    window.addEventListener('resize', updateHeaderHeight);
    return () => window.removeEventListener('resize', updateHeaderHeight);
  }, []);

  // Bloquer le défilement de la page arrière-plan quand le menu mobile est ouvert
  // Résout le problème Android : "nan meni lem ouvé map défilé meu an pa défilé se sèlman paj la anba menu an ki defile"
  useEffect(() => {
    if (mobileMenuOpen) {
      const scrollY = window.scrollY;
      document.body.style.position = 'fixed';
      document.body.style.top = `-${scrollY}px`;
      document.body.style.width = '100%';
      document.body.style.overflowY = 'hidden';

      return () => {
        const top = document.body.style.top;
        document.body.style.position = '';
        document.body.style.top = '';
        document.body.style.width = '';
        document.body.style.overflowY = '';
        if (top) {
          window.scrollTo(0, parseInt(top || '0', 10) * -1);
        }
      };
    }
  }, [mobileMenuOpen]);

  // Chargement dynamique des pages personnalisées
  useEffect(() => {
    const fetchPages = () => {
      pageService.getPages().then((pages) => {
        const activeInMenu = pages.filter(p => p.isActive && p.showInMenu !== false);
        setCustomPages(activeInMenu);
      }).catch(() => {
        setCustomPages([]);
      });
    };

    fetchPages();

    const handleUpdate = () => fetchPages();
    window.addEventListener('custom-pages-updated', handleUpdate);
    window.addEventListener('storage', handleUpdate);

    return () => {
      window.removeEventListener('custom-pages-updated', handleUpdate);
      window.removeEventListener('storage', handleUpdate);
    };
  }, []);

  // Fermer le dropdown pages en cliquant en dehors
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setPagesDropdownOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleNav = (path: string) => {
    onNavigate(path);
    setMobileMenuOpen(false);
    setPagesDropdownOpen(false);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <header className="sticky top-0 z-50 w-full shadow-lg bg-slate-900 border-b border-amber-500/20">
      {/* Conteneur principal de la barre d'en-tête (référencé pour la hauteur) */}
      <div ref={headerBarRef} className="w-full">
        {/* Top Bar: Official Contacts, Motto & Social (Épurée pour Android et petits écrans) */}
        <div className="bg-[#071322] text-xs text-slate-300 py-1 px-3 sm:px-4 border-b border-slate-800">
          <div className="max-w-7xl mx-auto flex items-center justify-between gap-2">
            {/* Devise officielle */}
            <div className="flex items-center space-x-2 min-w-0">
              <span className="hidden sm:inline-flex items-center px-2 py-0.5 rounded text-[10px] sm:text-[11px] font-semibold bg-amber-500/10 text-amber-400 border border-amber-500/30 truncate">
                « Sainteté à l’Éternel »
              </span>
              <span className="hidden md:inline text-slate-400 text-[11px] truncate">
                3ème Section Damé, Commune de Môle-Saint-Nicolas, Haïti
              </span>
            </div>

            {/* Contacts & Réseaux Sociaux rapides */}
            <div className="flex items-center space-x-2 sm:space-x-4 flex-shrink-0 w-full sm:w-auto justify-between sm:justify-end">
              <a 
                href={`tel:${OFFICIAL_CHURCH_INFO.phone}`} 
                className="inline-flex items-center space-x-1.5 text-[11px] sm:text-xs text-slate-300 hover:text-amber-400 transition"
                title="Appeler l'Église"
              >
                <Phone className="w-3.5 h-3.5 text-amber-400 flex-shrink-0" />
                <span className="font-mono">{OFFICIAL_CHURCH_INFO.phone}</span>
              </a>

              <span className="sm:hidden text-[10px] text-amber-400/90 font-medium">
                Damé, Haïti
              </span>

              <a 
                href={`mailto:${OFFICIAL_CHURCH_INFO.email}`} 
                className="hidden lg:inline-flex items-center space-x-1 text-xs text-slate-300 hover:text-amber-400 transition"
                title="Email officiel"
              >
                <Mail className="w-3.5 h-3.5 text-amber-400" />
                <span>{OFFICIAL_CHURCH_INFO.email}</span>
              </a>

              {/* Réseaux Sociaux */}
              <div className="hidden sm:flex items-center space-x-2 pl-2 border-l border-slate-800">
                <a 
                  href={OFFICIAL_CHURCH_INFO.social.youtube} 
                  target="_blank" 
                  rel="noopener noreferrer" 
                  className="text-slate-400 hover:text-red-500 transition p-0.5"
                  title="Chaîne YouTube Officielle"
                >
                  <Youtube className="w-3.5 h-3.5" />
                </a>
                <a 
                  href={OFFICIAL_CHURCH_INFO.social.facebook} 
                  target="_blank" 
                  rel="noopener noreferrer" 
                  className="text-slate-400 hover:text-blue-500 transition p-0.5"
                  title="Page Facebook Officielle"
                >
                  <Facebook className="w-3.5 h-3.5" />
                </a>
              </div>

              {/* Sélecteur de langue en haut sur Desktop uniquement (sur mobile, il est dans la barre principale) */}
              <div className="hidden sm:block pl-2 border-l border-slate-800">
                <LanguageSelector compact />
              </div>
            </div>
          </div>
        </div>

        {/* Main Navigation Bar (Adaptative, aérée et sans chevauchement) */}
        <div className="max-w-7xl mx-auto px-3 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16 sm:h-20 gap-2">
            {/* Logo officiel & Titre de l'Église (Sécurisé pour mobile avec truncate) */}
            <button 
              onClick={() => handleNav('/')}
              className="flex items-center space-x-2 sm:space-x-3 text-left focus:outline-none group min-w-0 flex-1 sm:flex-initial"
            >
              <div className="relative w-8 h-8 min-[380px]:w-9 min-[380px]:h-9 sm:w-11 sm:h-11 md:w-12 md:h-12 flex-shrink-0 bg-gradient-to-br from-amber-300 via-amber-500 to-amber-700 rounded-full p-0.5 shadow-lg group-hover:scale-105 transition-transform">
                <div className="w-full h-full bg-black rounded-full flex items-center justify-center p-0.5 overflow-hidden">
                  <img 
                    src={churchSealImg} 
                    alt="Sceau Officiel Église du Nazaréen de Damé" 
                    className="w-full h-full object-contain"
                  />
                </div>
              </div>
              <div className="min-w-0 flex-1 flex flex-col justify-center">
                <span className="block font-serif text-[11px] min-[360px]:text-xs sm:text-base lg:text-xl font-bold tracking-tight text-white group-hover:text-amber-300 transition leading-tight truncate">
                  ÉGLISE DU NAZARÉEN DE DAMÉ
                </span>
                <span className="block text-[8.5px] min-[360px]:text-[9.5px] sm:text-[11px] font-sans tracking-wider uppercase text-amber-400/90 font-medium leading-normal truncate mt-0.5">
                  HAÏTI • FONDÉE EN 1979 <span className="hidden md:inline">• « SAINTETÉ À L’ÉTERNEL »</span>
                </span>
              </div>
            </button>

            {/* Desktop Navigation Links (Écrans larges XL) */}
            <nav className="hidden xl:flex items-center space-x-1">
              {navLinks.map((link) => {
                const isActive = currentPath === link.path;
                return (
                  <button
                    key={link.path}
                    onClick={() => handleNav(link.path)}
                    className={`px-3 py-2 rounded-md text-sm font-medium transition-all ${
                      isActive 
                        ? 'bg-amber-500/20 text-amber-300 border-b-2 border-amber-400 shadow-sm font-semibold' 
                        : 'text-slate-200 hover:text-amber-300 hover:bg-slate-800/60'
                    }`}
                  >
                    {link.label}
                  </button>
                );
              })}

              {/* Pages personnalisées dans le menu Desktop */}
              {customPages.length > 0 && (
                customPages.length <= 2 ? (
                  customPages.map((page) => {
                    const isCurrent = currentPath === `/page/${page.slug}`;
                    return (
                      <button
                        key={page.slug}
                        onClick={() => handleNav(`/page/${page.slug}`)}
                        className={`px-3 py-2 rounded-md text-sm font-medium transition-all flex items-center space-x-1 ${
                          isCurrent
                            ? 'bg-amber-500/20 text-amber-300 border-b-2 border-amber-400 shadow-sm font-semibold'
                            : 'text-slate-200 hover:text-amber-300 hover:bg-slate-800/60'
                        }`}
                        title={page.excerpt || page.title}
                      >
                        <FileText className="w-3.5 h-3.5 text-amber-400" />
                        <span>{page.title}</span>
                      </button>
                    );
                  })
                ) : (
                  <div className="relative" ref={dropdownRef}>
                    <button
                      onClick={() => setPagesDropdownOpen(!pagesDropdownOpen)}
                      className={`px-3 py-2 rounded-md text-sm font-medium transition-all flex items-center space-x-1.5 ${
                        currentPath.startsWith('/page/')
                          ? 'bg-amber-500/20 text-amber-300 border-b-2 border-amber-400 shadow-sm font-semibold'
                          : 'text-slate-200 hover:text-amber-300 hover:bg-slate-800/60'
                      }`}
                    >
                      <FileText className="w-3.5 h-3.5 text-amber-400" />
                      <span>Pages</span>
                      <span className="px-1.5 py-0.2 rounded-full text-[10px] font-bold bg-amber-500/30 text-amber-300">
                        {customPages.length}
                      </span>
                      <ChevronDown className={`w-3.5 h-3.5 transition-transform ${pagesDropdownOpen ? 'rotate-180' : ''}`} />
                    </button>

                    {pagesDropdownOpen && (
                      <div className="absolute top-full right-0 mt-2 w-72 bg-slate-950 border border-slate-700/80 rounded-2xl shadow-2xl py-2 z-50 animate-in fade-in slide-in-from-top-1">
                        <div className="px-3.5 py-1.5 border-b border-slate-800 mb-1">
                          <span className="text-[10px] uppercase font-bold tracking-wider text-amber-400">
                            Pages Officielles Publiées
                          </span>
                        </div>
                        {customPages.map((page) => (
                          <button
                            key={page.slug}
                            onClick={() => handleNav(`/page/${page.slug}`)}
                            className={`w-full text-left px-4 py-2.5 text-xs font-semibold flex items-center justify-between transition ${
                              currentPath === `/page/${page.slug}`
                                ? 'bg-amber-500/20 text-amber-300 border-l-2 border-amber-400'
                                : 'text-slate-200 hover:bg-slate-800 hover:text-amber-300'
                            }`}
                          >
                            <div className="truncate pr-2">
                              <span className="block truncate">{page.title}</span>
                              {page.excerpt && (
                                <span className="block text-[10px] text-slate-400 font-normal truncate">
                                  {page.excerpt}
                                </span>
                              )}
                            </div>
                            <ChevronRight className="w-3.5 h-3.5 text-slate-500 flex-shrink-0" />
                          </button>
                        ))}
                      </div>
                    )}
                  </div>
                )
              )}

              {/* Sélecteur de langue Desktop */}
              <div className="ml-2">
                <LanguageSelector />
              </div>

              {/* Bouton Dîmes & Faire un Don */}
              <button
                onClick={() => handleNav('/faire-un-don')}
                className={`ml-3 inline-flex items-center space-x-1.5 px-3.5 py-2 rounded-lg text-xs font-bold uppercase tracking-wider transition shadow-sm ${
                  currentPath.startsWith('/faire-un-don') || currentPath.startsWith('/don')
                    ? 'bg-emerald-500 text-white font-extrabold shadow-emerald-500/25'
                    : 'bg-emerald-600/20 text-emerald-300 border border-emerald-500/40 hover:bg-emerald-500 hover:text-white'
                }`}
                title="Soutenez l'Église et le projet CDEJ HA 0926"
              >
                <HeartHandshake className="w-3.5 h-3.5" />
                <span>Faire un Don</span>
              </button>

              {/* Bouton Espace Secrétariat */}
              <button
                onClick={() => handleNav('/secretariat')}
                className={`ml-2 inline-flex items-center space-x-1.5 px-3.5 py-2 rounded-lg text-xs font-semibold uppercase tracking-wider transition shadow-sm ${
                  currentPath.startsWith('/secretariat')
                    ? 'bg-amber-500 text-slate-950 font-bold'
                    : 'bg-gradient-to-r from-amber-500/20 to-amber-600/30 text-amber-300 border border-amber-500/40 hover:bg-amber-500 hover:text-slate-950'
                }`}
              >
                <Lock className="w-3.5 h-3.5" />
                <span>Secrétariat</span>
              </button>
            </nav>

            {/* Contrôles Mobiles : Sélecteur de langue compact + Bouton Hamburger (Épuré pour Android) */}
            <div className="flex xl:hidden items-center space-x-1.5 sm:space-x-2 flex-shrink-0">
              <LanguageSelector compact />

              <button
                onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                className="p-2 rounded-xl text-slate-300 hover:text-white hover:bg-slate-800 transition focus:outline-none"
                aria-label={mobileMenuOpen ? 'Fermer le menu' : 'Ouvrir le menu'}
              >
                {mobileMenuOpen ? (
                  <X className="w-6 h-6 text-amber-400" />
                ) : (
                  <Menu className="w-6 h-6 text-slate-200" />
                )}
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* TIROIR MOBILE PLEIN ÉCRAN DÉFILABLE (FIX OVERFLOW & TOUCH SCROLL SUR ANDROID) */}
      {/* Positionné sous l'en-tête (top: headerHeight), avec scroll autonome et blocage du fond */}
      {mobileMenuOpen && (
        <div 
          className="xl:hidden fixed inset-x-0 bottom-0 z-50 bg-slate-950/98 backdrop-blur-md overflow-y-auto overscroll-contain px-4 pt-3 pb-32 shadow-2xl border-t border-slate-800 animate-in slide-in-from-top-2 duration-200"
          style={{ 
            top: `${headerHeight}px`,
            WebkitOverflowScrolling: 'touch',
            touchAction: 'pan-y'
          }}
        >
          {/* En-tête du menu mobile */}
          <div className="py-2.5 border-b border-slate-800 mb-3 flex items-center justify-between">
            <div>
              <p className="text-xs uppercase tracking-wider text-amber-400 font-bold">
                Église du Nazaréen de Damé
              </p>
              <p className="text-[11px] text-slate-400">
                Menu de Navigation Principal
              </p>
            </div>
            <button
              onClick={() => setMobileMenuOpen(false)}
              className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition"
              aria-label="Fermer le menu"
            >
              <X className="w-5 h-5 text-amber-400" />
            </button>
          </div>

          {/* Liens de navigation principaux (Touch targets confortables) */}
          <div className="space-y-1">
            {navLinks.map((link) => {
              const Icon = link.icon;
              const isActive = currentPath === link.path;
              return (
                <button
                  key={link.path}
                  onClick={() => handleNav(link.path)}
                  className={`w-full flex items-center justify-between px-3.5 py-3 rounded-xl text-sm font-medium transition ${
                    isActive
                      ? 'bg-amber-500 text-slate-950 font-bold shadow-md'
                      : 'text-slate-200 hover:bg-slate-800/80 hover:text-amber-300 active:bg-slate-800'
                  }`}
                >
                  <div className="flex items-center space-x-3">
                    <Icon className={`w-4 h-4 ${isActive ? 'text-slate-950' : 'text-amber-400'}`} />
                    <span>{link.label}</span>
                  </div>
                  <ChevronRight className={`w-4 h-4 ${isActive ? 'text-slate-950 opacity-90' : 'opacity-40'}`} />
                </button>
              );
            })}
          </div>

          {/* Section des Pages publiées */}
          {customPages.length > 0 && (
            <div className="pt-3 pb-1 border-t border-slate-800/80 mt-2 space-y-1">
              <div className="px-3.5 py-1.5 flex items-center space-x-1.5 text-[11px] font-bold text-amber-400 uppercase tracking-wider">
                <FileText className="w-3.5 h-3.5" />
                <span>Pages Publiées ({customPages.length})</span>
              </div>
              {customPages.map((page) => {
                const isActive = currentPath === `/page/${page.slug}`;
                return (
                  <button
                    key={page.slug}
                    onClick={() => handleNav(`/page/${page.slug}`)}
                    className={`w-full flex items-center justify-between px-3.5 py-2.5 rounded-xl text-sm font-medium transition ${
                      isActive
                        ? 'bg-amber-500 text-slate-950 font-bold'
                        : 'text-slate-200 hover:bg-slate-800/80 hover:text-amber-300 active:bg-slate-800'
                    }`}
                  >
                    <div className="flex items-center space-x-3 truncate">
                      <FileText className={`w-4 h-4 flex-shrink-0 ${isActive ? 'text-slate-950' : 'text-amber-400'}`} />
                      <span className="truncate">{page.title}</span>
                    </div>
                    <ChevronRight className="w-4 h-4 opacity-50 flex-shrink-0" />
                  </button>
                );
              })}
            </div>
          )}

          {/* Boutons d'Action Rapide dans le tiroir mobile */}
          <div className="pt-4 mt-3 border-t border-slate-800/80 space-y-2.5">
            <button
              onClick={() => handleNav('/faire-un-don')}
              className="w-full flex items-center justify-center space-x-2 py-3 rounded-xl text-sm font-bold bg-gradient-to-r from-emerald-600 to-emerald-500 text-white shadow-md hover:brightness-110 active:scale-[0.99] transition"
            >
              <HeartHandshake className="w-4 h-4 text-emerald-200" />
              <span>Dîmes &amp; Faire un Don (PayPal / Mobile)</span>
            </button>

            <button
              onClick={() => handleNav('/secretariat')}
              className={`w-full flex items-center justify-center space-x-2 py-3 rounded-xl text-sm font-bold transition shadow-md ${
                currentPath.startsWith('/secretariat')
                  ? 'bg-amber-500 text-slate-950'
                  : 'bg-gradient-to-r from-amber-500 to-amber-600 text-slate-950 hover:bg-amber-400 active:scale-[0.99]'
              }`}
            >
              <Lock className="w-4 h-4" />
              <span>Espace Secrétariat &amp; Administration</span>
            </button>

            {/* Liens de contact et réseaux dans le menu */}
            <div className="pt-2 text-center text-xs text-slate-400 space-y-2">
              <div className="flex items-center justify-center space-x-4">
                <a 
                  href={`tel:${OFFICIAL_CHURCH_INFO.phone}`} 
                  className="flex items-center space-x-1.5 hover:text-amber-400 py-1"
                >
                  <Phone className="w-3.5 h-3.5 text-amber-400" />
                  <span>{OFFICIAL_CHURCH_INFO.phone}</span>
                </a>
                <span>•</span>
                <a 
                  href={OFFICIAL_CHURCH_INFO.social.youtube} 
                  target="_blank" 
                  rel="noopener noreferrer" 
                  className="hover:text-red-400 py-1"
                >
                  YouTube
                </a>
                <span>•</span>
                <a 
                  href={OFFICIAL_CHURCH_INFO.social.facebook} 
                  target="_blank" 
                  rel="noopener noreferrer" 
                  className="hover:text-blue-400 py-1"
                >
                  Facebook
                </a>
              </div>
              <p className="text-[11px] text-slate-500">
                3ème Section Damé, Commune de Môle-Saint-Nicolas, Haïti
              </p>
            </div>
          </div>
        </div>
      )}
    </header>
  );
};
