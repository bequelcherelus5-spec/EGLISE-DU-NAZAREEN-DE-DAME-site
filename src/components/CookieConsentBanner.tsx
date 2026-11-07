import React, { useState, useEffect } from 'react';
import { ShieldCheck, Cookie, Check, X, ExternalLink } from 'lucide-react';
import { useLanguage } from '../context/LanguageContext';

interface CookieConsentBannerProps {
  onNavigate: (path: string) => void;
}

const COOKIE_CONSENT_KEY = 'dame_church_cookie_consent_v1';

export const CookieConsentBanner: React.FC<CookieConsentBannerProps> = ({ onNavigate }) => {
  const { currentLang } = useLanguage();
  const isCreole = currentLang === 'ht';
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    if (typeof window !== 'undefined') {
      const consent = localStorage.getItem(COOKIE_CONSENT_KEY);
      if (!consent) {
        // Show after a brief delay for smooth appearance
        const timer = setTimeout(() => setVisible(true), 1200);
        return () => clearTimeout(timer);
      }
    }
  }, []);

  const handleAccept = () => {
    if (typeof window !== 'undefined') {
      localStorage.setItem(COOKIE_CONSENT_KEY, 'accepted');
    }
    setVisible(false);
  };

  const handleRefuse = () => {
    if (typeof window !== 'undefined') {
      localStorage.setItem(COOKIE_CONSENT_KEY, 'essential_only');
    }
    setVisible(false);
  };

  if (!visible) return null;

  return (
    <div className="fixed bottom-4 left-4 right-4 sm:left-6 sm:right-auto sm:max-w-md z-50 animate-in slide-in-from-bottom duration-500">
      <div className="bg-slate-900/95 backdrop-blur-md text-white border border-amber-500/40 rounded-3xl p-5 shadow-2xl space-y-3">
        <div className="flex items-start space-x-3">
          <div className="w-9 h-9 rounded-xl bg-amber-500/20 text-amber-400 flex items-center justify-center flex-shrink-0 mt-0.5 border border-amber-400/30">
            <Cookie className="w-5 h-5" />
          </div>
          <div className="space-y-1">
            <h4 className="text-sm font-serif font-bold text-amber-300">
              {isCreole ? 'Respè Vi Prive & Jesyon Cookie' : 'Respect de la Vie Privée & Cookies'}
            </h4>
            <p className="text-xs text-slate-300 leading-relaxed">
              {isCreole
                ? 'Nou itilize ti fichye cookie pou analiz vizit yo ak afichaj piblisite Google AdSense ki soutni travay kominotè legliz la.'
                : 'Nous utilisons des cookies pour mesurer l’audience (Google Analytics) et diffuser des annonces Google AdSense soutenant les projets de l’église.'}
            </p>
          </div>
        </div>

        <div className="flex items-center justify-between text-2xs text-slate-400 border-t border-slate-800 pt-2.5">
          <button
            onClick={() => {
              onNavigate('/confidentialite');
            }}
            className="text-amber-400 hover:underline flex items-center space-x-1"
          >
            <span>{isCreole ? 'Li Règleman sou Vi Prive' : 'Lire la Politique de Confidentialité'}</span>
            <ExternalLink className="w-3 h-3" />
          </button>
        </div>

        <div className="flex items-center space-x-2 pt-1">
          <button
            onClick={handleAccept}
            className="flex-1 py-2 px-3 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-black text-xs transition shadow-md flex items-center justify-center space-x-1"
          >
            <Check className="w-3.5 h-3.5" />
            <span>{isCreole ? 'Aksepte tout' : 'Accepter tout'}</span>
          </button>
          <button
            onClick={handleRefuse}
            className="py-2 px-3 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-semibold border border-slate-700 transition"
          >
            <span>{isCreole ? 'Refize piblisite' : 'Refuser'}</span>
          </button>
        </div>
      </div>
    </div>
  );
};
