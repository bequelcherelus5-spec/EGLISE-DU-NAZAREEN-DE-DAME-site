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
  GraduationCap,
  HelpCircle,
  BookOpen,
  Scroll,
  Sparkles
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

  const navLinks = [
    { path: '/', label: t('nav_home', 'Accueil'), icon: Church },
    { path: '/a-propos', label: t('nav_about', 'À Propos'), icon: Users },
    { path: '/ministeres', label: t('nav_ministries', 'Ministères'), icon: Users },
    { path: '/evenements', label: t('nav_events', 'Événements & Cultes'), icon: Calendar },
    { path: '/priere', label: t('nav_prayer', 'Priyè Sekrè'), icon: Heart },
    { path: '/temwayaj', label: t('nav_testimonies', 'Temwayaj'), icon: Sparkles },
    { path: '/leson-biblik', label: t('nav_lessons', 'Lekòl Dimanch'), icon: BookOpen },
    { path: '/projets', label: t('nav_projects', 'Projets (CDEJ)'), icon: HeartHandshake },
    { path: '/medias', label: t('nav_media', 'Médias & Prédications'), icon: Tv },
    { path: '/jeux-bibliques', label: t('nav_bible_games', 'Jeux Bibliques'), icon: Trophy },
    { path: '/contact', label: t('nav_contact', 'Contact'), icon: Mail },
  ];

  // Chargement dynamique des pages personnalisées publiées et actives dans le menu
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

    // Réagir immédiatement dès qu'une page est créée, modifiée ou supprimée dans le Secrétariat
    const handleUpdate = () => fetchPages();
    window.addEventListener('custom-pages-updated', handleUpdate);
    window.addEventListener('storage', handleUpdate);

    return () => {
      window.removeEventListener('custom-pages-updated', handleUpdate);
      window.removeEventListener('storage', handleUpdate);
    };
  }, []);

  // Fermer le dropdown si on clique en dehors
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
      {/* Top Bar: Official Contacts, Motto & Social */}
      <div className="bg-[#071322] text-xs text-slate-300 py-2 px-4 border-b border-slate-800">
        <div className="max-w-7xl mx-auto flex flex-wrap items-center justify-between gap-3">
          {/* Motto and official badge */}
          <div className="flex items-center space-x-2">
            <span className="inline-flex items-center px-2 py-0.5 rounded text-[11px] font-semibold bg-amber-500/10 text-amber-400 border border-amber-500/30">
              « Sainteté à l’Éternel »
            </span>
            <span className="hidden sm:inline text-slate-400">
              3ème Section Damé, Commune de Môle-Saint-Nicolas, Haïti
            </span>
          </div>

          {/* Contacts and Social Links */}
          <div className="flex items-center space-x-4">
            <a 
              href={`tel:${OFFICIAL_CHURCH_INFO.phone}`} 
              className="inline-flex items-center space-x-1.5 hover:text-amber-400 transition"
              title="Appeler l'Église"
            >
              <Phone className="w-3.5 h-3.5 text-amber-400" />
              <span>{OFFICIAL_CHURCH_INFO.phone}</span>
            </a>

            <a 
              href={`mailto:${OFFICIAL_CHURCH_INFO.email}`} 
              className="hidden md:inline-flex items-center space-x-1.5 hover:text-amber-400 transition"
              title="Email officiel"
            >
              <Mail className="w-3.5 h-3.5 text-amber-400" />
              <span>{OFFICIAL_CHURCH_INFO.email}</span>
            </a>

            {/* Social Links */}
            <div className="flex items-center space-x-2.5 pl-2 border-l border-slate-700">
              <a 
                href={OFFICIAL_CHURCH_INFO.social.youtube} 
                target="_blank" 
                rel="noopener noreferrer"
                className="text-slate-400 hover:text-red-500 transition"
                title="Chaîne YouTube Officielle"
              >
                <Youtube className="w-4 h-4" />
              </a>
              <a 
                href={OFFICIAL_CHURCH_INFO.social.facebook} 
                target="_blank" 
                rel="noopener noreferrer"
                className="text-slate-400 hover:text-blue-500 transition"
                title="Page Facebook Officielle"
              >
                <Facebook className="w-4 h-4" />
              </a>
            </div>

            {/* Language Selector 4 Langues (Kreyòl, Français, Espagnol, Anglais) */}
            <div className="pl-3 border-l border-slate-700">
              <LanguageSelector compact />
            </div>
          </div>
        </div>
      </div>

      {/* Main Navigation Bar */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-20">
          {/* Official Church Identity Logo */}
          <button 
            onClick={() => handleNav('/')}
            className="flex items-center space-x-3 text-left focus:outline-none group"
          >
            <div className="relative w-12 h-12 flex-shrink-0 bg-gradient-to-br from-amber-300 via-amber-500 to-amber-700 rounded-full p-0.5 shadow-lg group-hover:scale-105 transition-transform">
              <div className="w-full h-full bg-black rounded-full flex items-center justify-center p-0.5 overflow-hidden">
                <img 
                  src={churchSealImg} 
                  alt="Sceau Officiel Église du Nazaréen de Damé" 
                  className="w-full h-full object-contain"
                />
              </div>
            </div>
            <div>
              <span className="block font-serif text-lg sm:text-xl font-bold tracking-tight text-white group-hover:text-amber-300 transition leading-snug">
                ÉGLISE DU NAZARÉEN DE DAMÉ
              </span>
              <span className="block text-[11px] font-sans tracking-widest uppercase text-amber-400/90 font-medium">
                HAÏTI • FONDÉE EN 1979 • « SAINTETÉ À L’ÉTERNEL »
              </span>
            </div>
          </button>

          {/* Desktop Nav Items */}
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

            {/* DYNAMIC CUSTOM HTML PAGES IN MENU */}
            {customPages.length > 0 && (
              customPages.length <= 2 ? (
                /* 1 ou 2 pages : affichage direct en onglets */
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
                /* Plus de 2 pages : Menu déroulant élégant */
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

            {/* Language Selector 4 Langues (Desktop) */}
            <div className="ml-2">
              <LanguageSelector />
            </div>

            {/* Secrétariat Admin Button */}
            <button
              onClick={() => handleNav('/secretariat')}
              className={`ml-3 inline-flex items-center space-x-1.5 px-3.5 py-2 rounded-lg text-xs font-semibold uppercase tracking-wider transition shadow-sm ${
                currentPath.startsWith('/secretariat')
                  ? 'bg-amber-500 text-slate-950 font-bold'
                  : 'bg-gradient-to-r from-amber-500/20 to-amber-600/30 text-amber-300 border border-amber-500/40 hover:bg-amber-500 hover:text-slate-950'
              }`}
            >
              <Lock className="w-3.5 h-3.5" />
              <span>Secrétariat</span>
            </button>
          </nav>

          {/* Mobile menu button and language */}
          <div className="flex xl:hidden items-center space-x-2">
            <LanguageSelector compact />

            <button
              onClick={() => handleNav('/secretariat')}
              className="inline-flex items-center space-x-1 px-2.5 py-1.5 rounded text-xs font-semibold bg-amber-500/20 text-amber-300 border border-amber-500/40"
            >
              <Lock className="w-3 h-3" />
              <span>Admin</span>
            </button>

            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="p-2 rounded-md text-slate-300 hover:text-white hover:bg-slate-800 focus:outline-none"
              aria-label="Menu de navigation"
            >
              {mobileMenuOpen ? <X className="w-6 h-6 text-amber-400" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Drawer */}
      {mobileMenuOpen && (
        <div className="xl:hidden bg-slate-950 border-b border-amber-500/20 px-4 pt-3 pb-6 space-y-1 shadow-2xl animate-in slide-in-from-top-2 duration-200">
          <div className="py-2 border-b border-slate-800 mb-2 flex items-center justify-between">
            <p className="text-xs uppercase tracking-wider text-amber-400 font-semibold">
              Église du Nazaréen de Damé
            </p>
            <LanguageSelector compact />
          </div>

          {navLinks.map((link) => {
            const Icon = link.icon;
            const isActive = currentPath === link.path;
            return (
              <button
                key={link.path}
                onClick={() => handleNav(link.path)}
                className={`w-full flex items-center justify-between px-3.5 py-2.5 rounded-lg text-sm font-medium transition ${
                  isActive
                    ? 'bg-amber-500 text-slate-950 font-bold'
                    : 'text-slate-200 hover:bg-slate-800 hover:text-amber-300'
                }`}
              >
                <div className="flex items-center space-x-3">
                  <Icon className={`w-4 h-4 ${isActive ? 'text-slate-950' : 'text-amber-400'}`} />
                  <span>{link.label}</span>
                </div>
                <ChevronRight className="w-4 h-4 opacity-70" />
              </button>
            );
          })}

          {/* PAGES PUBLIÉES DANS LE MENU MOBILE */}
          {customPages.length > 0 && (
            <div className="pt-3 pb-1 border-t border-slate-800 space-y-1">
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
                    className={`w-full flex items-center justify-between px-3.5 py-2.5 rounded-lg text-sm font-medium transition ${
                      isActive
                        ? 'bg-amber-500 text-slate-950 font-bold'
                        : 'text-slate-200 hover:bg-slate-800 hover:text-amber-300'
                    }`}
                  >
                    <div className="flex items-center space-x-3 truncate">
                      <FileText className={`w-4 h-4 flex-shrink-0 ${isActive ? 'text-slate-950' : 'text-amber-400'}`} />
                      <span className="truncate">{page.title}</span>
                    </div>
                    <ChevronRight className="w-4 h-4 opacity-70 flex-shrink-0" />
                  </button>
                );
              })}
            </div>
          )}

          <div className="pt-3 border-t border-slate-800 space-y-2">
            <button
              onClick={() => handleNav('/secretariat')}
              className="w-full flex items-center justify-center space-x-2 py-2.5 rounded-lg text-sm font-bold bg-amber-500 text-slate-950 hover:bg-amber-400 transition"
            >
              <Lock className="w-4 h-4" />
              <span>Espace Secrétariat &amp; Administration</span>
            </button>

            <div className="flex items-center justify-center space-x-4 pt-2 text-xs text-slate-400">
              <a href={`tel:${OFFICIAL_CHURCH_INFO.phone}`} className="flex items-center space-x-1 hover:text-amber-400">
                <Phone className="w-3.5 h-3.5 text-amber-400" />
                <span>{OFFICIAL_CHURCH_INFO.phone}</span>
              </a>
              <span>•</span>
              <a href={OFFICIAL_CHURCH_INFO.social.youtube} target="_blank" rel="noopener noreferrer" className="hover:text-red-400">
                YouTube
              </a>
              <span>•</span>
              <a href={OFFICIAL_CHURCH_INFO.social.facebook} target="_blank" rel="noopener noreferrer" className="hover:text-blue-400">
                Facebook
              </a>
            </div>
          </div>
        </div>
      )}
    </header>
  );
};
