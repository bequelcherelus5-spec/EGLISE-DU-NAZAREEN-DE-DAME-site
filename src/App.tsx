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
import { ArrowUp } from 'lucide-react';

export default function App() {
  const [currentPath, setCurrentPath] = useState<string>(() => {
    return window.location.pathname || '/';
  });
  const [showScrollTop, setShowScrollTop] = useState(false);

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
    // Dynamic custom pages created in Content Manager
    if (currentPath.startsWith('/page/')) {
      const slug = currentPath.replace(/^\/page\//, '');
      return <DynamicPage slug={slug} onNavigate={navigateTo} />;
    }

    switch (currentPath) {
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
        return <Secretariat onNavigate={navigateTo} />;
      case '/':
      default:
        return <Home onNavigate={navigateTo} />;
    }
  };

  return (
    <LanguageProvider>
      <div className="min-h-screen flex flex-col bg-slate-50 text-slate-800 font-sans selection:bg-amber-500 selection:text-white">
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
