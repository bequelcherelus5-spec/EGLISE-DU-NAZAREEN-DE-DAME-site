/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { LanguageProvider } from './context/LanguageContext';
import { Navbar } from './components/Navbar';
import { Footer } from './components/Footer';
import { AlertBanner } from './components/AlertBanner';
import { RadioPlayer } from './components/RadioPlayer';
import { Home } from './pages/Home';
import { About } from './pages/About';
import { Ministries } from './pages/Ministries';
import { Events } from './pages/Events';
import { Projects } from './pages/Projects';
import { Media } from './pages/Media';
import { Contact } from './pages/Contact';
import { BibleGames } from './pages/BibleGames';
import { Secretariat } from './pages/Secretariat';
import { DynamicPage } from './pages/DynamicPage';
import { PrayerRequests } from './pages/PrayerRequests';
import { SundaySchoolResources } from './pages/SundaySchoolResources';
import { Discipleship } from './pages/Discipleship';
import { DocumentRequests } from './pages/DocumentRequests';
import { FAQ } from './pages/FAQ';
import { DailyBibleReading } from './pages/DailyBibleReading';
import { Testimonies } from './pages/Testimonies';
import { Donations } from './pages/Donations';
import { isSecretariatSubdomain } from './utils/subdomain';
import { ArrowUp, ShieldCheck, ExternalLink, Lock } from 'lucide-react';

export default function App() {
  const [currentPath, setCurrentPath] = useState<string>(() => {
    return window.location.pathname || '/';
  });
  const [showScrollTop, setShowScrollTop] = useState(false);
  const isSubdomain = isSecretariatSubdomain();

  useEffect(() => {
    if (isSubdomain) {
      document.title = 'Secrétariat Général & Administration | Église du Nazaréen de Damé';
    }
  }, [isSubdomain]);

  useEffect(() => {
    const handlePopState = () => {
      setCurrentPath(window.location.pathname || '/');
    };
    window.addEventListener('popstate', handlePopState);

    const handleScroll = () => {
      setShowScrollTop(window.scrollY > 400);
    };
    window.addEventListener('scroll', handleScroll);

    return () => {
      window.removeEventListener('popstate', handlePopState);
      window.removeEventListener('scroll', handleScroll);
    };
  }, []);

  const navigateTo = (path: string) => {
    if (window.location.pathname !== path) {
      window.history.pushState({}, '', path);
      setCurrentPath(path);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const renderCurrentPage = () => {
    // Si la requête provient du sous-domaine secretariat.eglisedunazareendedame.org
    // La page racine ou toute route d'administration charge le portail officiel
    if (isSubdomain && (currentPath === '/' || currentPath === '/secretariat' || currentPath === '/admin')) {
      return <Secretariat onNavigate={navigateTo} isSubdomain={true} />;
    }

    // Dynamic custom pages created in Content Manager
    if (currentPath.startsWith('/page/')) {
      const slug = currentPath.replace(/^\/page\//, '');
      return <DynamicPage slug={slug} onNavigate={navigateTo} />;
    }

    switch (currentPath) {
      case '/faire-un-don':
      case '/don':
      case '/dons':
      case '/dimes':
      case '/donations':
        return <Donations onNavigate={navigateTo} />;
      case '/a-propos':
        return <About onNavigate={navigateTo} />;
      case '/ministeres':
        return <Ministries onNavigate={navigateTo} />;
      case '/evenements':
        return <Events onNavigate={navigateTo} />;
      case '/projets':
        return <Projects onNavigate={navigateTo} />;
      case '/medias':
        return <Media onNavigate={navigateTo} />;
      case '/priere':
      case '/demann-priye':
      case '/requetes-priere':
        return <PrayerRequests onNavigate={navigateTo} />;
      case '/temwayaj':
      case '/testimonies':
        return <Testimonies onNavigate={navigateTo} />;
      case '/leson-biblik':
      case '/ressources':
        return <SundaySchoolResources onNavigate={navigateTo} />;
      case '/discipulat':
      case '/nouvo-kwayan':
        return <Discipleship onNavigate={navigateTo} />;
      case '/documents-pastoraux':
      case '/demann-dokiman':
        return <DocumentRequests onNavigate={navigateTo} />;
      case '/faq':
        return <FAQ onNavigate={navigateTo} />;
      case '/lekti-biblik':
        return <DailyBibleReading onNavigate={navigateTo} />;
      case '/contact':
        return <Contact onNavigate={navigateTo} />;
      case '/jeux-bibliques':
        return <BibleGames onNavigate={navigateTo} />;
      case '/secretariat':
        if (isSubdomain) {
          return <Secretariat onNavigate={navigateTo} isSubdomain={true} />;
        }
        // Accès exclusif par sous-domaine :
        // Sur le domaine public (www.eglisedunazareendedame.org), rediriger vers le sous-domaine officiel
        if (typeof window !== 'undefined') {
          const host = window.location.hostname.toLowerCase();
          if (host.includes('eglisedunazareendedame.org') && !host.startsWith('secretariat.') && !host.startsWith('secretaria.')) {
            window.location.href = 'https://secretariat.eglisedunazareendedame.org';
            return null;
          }
        }
        return (
          <div className="min-h-[60vh] flex items-center justify-center px-4 py-16">
            <div className="max-w-md w-full bg-slate-900 border border-amber-500/30 rounded-3xl p-8 text-center space-y-4 text-white shadow-2xl">
              <div className="w-14 h-14 mx-auto rounded-full bg-amber-500/20 border border-amber-500/40 flex items-center justify-center">
                <Lock className="w-7 h-7 text-amber-400" />
              </div>
              <h2 className="font-serif text-xl font-bold text-white">
                Accès Exclusif par Sous-Domaine
              </h2>
              <p className="text-xs text-slate-300 leading-relaxed">
                Le portail administratif et pastoral n'est plus accessible depuis le site public. L'accès se fait exclusivement via l'adresse officielle :
              </p>
              <div className="p-3 bg-slate-950 rounded-xl border border-slate-800 text-amber-400 font-mono text-xs font-bold select-all">
                secretariat.eglisedunazareendedame.org
              </div>
              <a
                href="https://secretariat.eglisedunazareendedame.org"
                className="inline-flex items-center space-x-2 px-5 py-2.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 text-xs font-bold transition shadow-lg"
              >
                <span>Accéder au Portail Administratif</span>
                <ExternalLink className="w-3.5 h-3.5" />
              </a>
            </div>
          </div>
        );
      case '/':
      default:
        if (isSubdomain) {
          return <Secretariat onNavigate={navigateTo} isSubdomain={true} />;
        }
        return <Home onNavigate={navigateTo} />;
    }
  };

  return (
    <LanguageProvider>
      <div className="min-h-screen flex flex-col bg-slate-50 text-slate-800 font-sans selection:bg-amber-500 selection:text-white">
        {/* Bandeau officiel spécifique au sous-domaine du Secrétariat */}
        {isSubdomain && (
          <div className="bg-gradient-to-r from-amber-600 via-amber-500 to-amber-600 text-slate-950 px-4 py-2 text-xs font-bold shadow-md">
            <div className="max-w-7xl mx-auto flex flex-wrap items-center justify-between gap-2">
              <div className="flex items-center space-x-2">
                <span className="px-2 py-0.5 rounded bg-black/20 text-white text-[10px] uppercase tracking-wider font-mono">
                  PORTAIL OFFICIEL
                </span>
                <span>
                  Secrétariat Général &amp; Administration Paroissiale (secretariat.eglisedunazareendedame.org)
                </span>
              </div>
              <a
                href="https://www.eglisedunazareendedame.org"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center space-x-1 underline hover:text-white transition text-[11px]"
              >
                <span>Accéder au site public officiel (eglisedunazareendedame.org)</span>
                <ExternalLink className="w-3.5 h-3.5 ml-0.5" />
              </a>
            </div>
          </div>
        )}

        {/* Urgent Official Announcement Banner (Option 13) */}
        <AlertBanner onNavigate={navigateTo} />

        {/* Navigation Bar */}
        <Navbar currentPath={currentPath} onNavigate={navigateTo} />

        {/* Main Page Content */}
        <main className="flex-grow">
          {renderCurrentPage()}
        </main>

        {/* Footer */}
        <Footer onNavigate={navigateTo} />

        {/* 24/7 Web Radio Player Floating (Option Radio) */}
        <RadioPlayer />

        {/* Back to Top Floating Button */}
        {showScrollTop && (
          <button
            onClick={scrollToTop}
            aria-label="Retour en haut"
            className="fixed bottom-6 right-6 z-40 p-3 rounded-full bg-slate-900 text-amber-400 border border-amber-500/40 shadow-xl hover:bg-amber-500 hover:text-slate-950 transition-all hover:scale-110"
          >
            <ArrowUp className="w-5 h-5" />
          </button>
        )}
      </div>
    </LanguageProvider>
  );
}
