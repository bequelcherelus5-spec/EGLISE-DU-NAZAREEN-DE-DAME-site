import React, { useEffect, useRef, useState } from 'react';
import { 
  ShieldCheck, 
  HeartHandshake, 
  Loader2, 
  ExternalLink, 
  AlertCircle, 
  CheckCircle2, 
  CreditCard,
  Heart
} from 'lucide-react';

interface PayPalDonationButtonProps {
  buttonId?: string;
  containerId?: string;
  className?: string;
  label?: string;
  initialCategory?: string;
}

declare global {
  interface Window {
    paypal?: {
      HostedButtons?: (options: { hostedButtonId: string }) => {
        render: (selector: string | HTMLElement) => Promise<void>;
      };
      Buttons?: (options: any) => {
        render: (selector: string | HTMLElement) => Promise<void>;
      };
    };
  }
}

export const PayPalDonationButton: React.FC<PayPalDonationButtonProps> = ({
  buttonId = 'J6F3GVMK9T27Y',
  containerId = 'paypal-container-J6F3GVMK9T27Y',
  className = '',
  label,
  initialCategory = 'Dîmes & Offrandes Générales',
}) => {
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedCategory, setSelectedCategory] = useState<string>(initialCategory);
  const [suggestedAmount, setSuggestedAmount] = useState<number | null>(null);
  const renderedRef = useRef<boolean>(false);

  // Intentions de dons
  const donationCategories = [
    { id: 'dimes', label: 'Dîmes & Offrandes Générales' },
    { id: 'cdej', label: 'Projet CDEJ HA 0926 (Enfance)' },
    { id: 'chantiers', label: 'Chantiers & Temple (Aggée 1:8)' },
    { id: 'social', label: 'Secours & Bienfaisance' },
  ];

  // Montants suggérés pour guider le donateur
  const suggestedAmounts = [10, 25, 50, 100, 250];

  useEffect(() => {
    let isMounted = true;
    renderedRef.current = false;

    const scriptSrc = 
      'https://www.paypal.com/sdk/js?client-id=BAAnwRf5eIyYpEIKICscYZdDYqgDj_ANKewnO6LqqAJd2I0Y6JpMHmRyPEk26XKu60CTz60_pzLs4FHteM&components=hosted-buttons&disable-funding=venmo&currency=USD';

    const ensureScriptLoaded = (): Promise<void> => {
      return new Promise((resolve) => {
        if (window.paypal && window.paypal.HostedButtons) {
          resolve();
          return;
        }

        const existingScript = document.querySelector(`script[src*="hosted-buttons"]`) as HTMLScriptElement;

        if (existingScript) {
          const checkInterval = setInterval(() => {
            if (window.paypal && window.paypal.HostedButtons) {
              clearInterval(checkInterval);
              resolve();
            }
          }, 100);

          setTimeout(() => {
            clearInterval(checkInterval);
            resolve();
          }, 6000);
          return;
        }

        const script = document.createElement('script');
        script.src = scriptSrc;
        script.async = true;
        script.crossOrigin = 'anonymous';
        script.onload = () => {
          if (window.paypal && window.paypal.HostedButtons) {
            resolve();
          } else {
            const poll = setInterval(() => {
              if (window.paypal && window.paypal.HostedButtons) {
                clearInterval(poll);
                resolve();
              }
            }, 100);
            setTimeout(() => {
              clearInterval(poll);
              resolve();
            }, 2500);
          }
        };
        script.onerror = () => {
          console.warn('[PayPal SDK] Script non chargé ou bloqué par un bloqueur de publicité.');
          resolve();
        };
        document.head.appendChild(script);
      });
    };

    const renderHostedButton = async () => {
      try {
        setLoading(true);
        setError(null);
        await ensureScriptLoaded();

        if (!isMounted) return;

        const container = document.getElementById(containerId);
        if (!container) {
          setLoading(false);
          return;
        }

        // Vider l'ancien contenu si React a re-monté le composant
        container.innerHTML = '';

        // Exécution sécurisée demandée par les spécifications officielles PayPal Hosted Buttons
        if (window.paypal && typeof window.paypal.HostedButtons === 'function') {
          try {
            const renderPromise = window.paypal
              .HostedButtons({
                hostedButtonId: buttonId,
              })
              .render(`#${containerId}`);

            if (renderPromise && typeof renderPromise.then === 'function') {
              await renderPromise.catch((renderErr: any) => {
                console.warn('[PayPal HostedButtons render]:', renderErr);
              });
            }

            if (isMounted) {
              renderedRef.current = true;
              setLoading(false);
            }
          } catch (renderEx: any) {
            console.warn('[PayPal HostedButtons call exception]:', renderEx);
            if (isMounted) {
              setLoading(false);
            }
          }
        } else {
          // Si le SDK n'a pas pu initialiser HostedButtons, activer le bouton direct
          if (isMounted) {
            setLoading(false);
          }
        }
      } catch (err: any) {
        console.warn('[PayPalDonationButton] Avis:', err);
        if (isMounted) {
          setLoading(false);
        }
      }
    };

    renderHostedButton();

    return () => {
      isMounted = false;
    };
  }, [buttonId, containerId]);

  return (
    <div 
      className={`paypal-donation-wrapper w-full ${className}`}
      style={{ writingMode: 'horizontal-tb', direction: 'ltr', width: '100%' }}
    >
      {/* 1. Titre Principal Horizontal & Proprement Aligné (Responsive) */}
      <div 
        className="mb-6 text-center space-y-2.5 w-full block"
        style={{ writingMode: 'horizontal-tb', direction: 'ltr' }}
      >
        <div className="inline-flex flex-row items-center justify-center space-x-2 px-3.5 py-1 rounded-full bg-amber-500/10 border border-amber-400/30 text-amber-300 text-xs font-bold uppercase tracking-widest whitespace-nowrap mx-auto">
          <HeartHandshake className="w-3.5 h-3.5 text-amber-400 flex-shrink-0" />
          <span className="whitespace-nowrap">Soutien Officiel &amp; Bénédictions</span>
        </div>

        <h3 
          className="font-serif text-lg sm:text-2xl font-extrabold text-white tracking-wide uppercase leading-normal block w-full text-center"
          style={{ 
            writingMode: 'horizontal-tb', 
            direction: 'ltr', 
            wordBreak: 'normal', 
            whiteSpace: 'normal',
            display: 'block'
          }}
        >
          {label || "DONATION POUR L'EGLISE ET LE CDEND"}
        </h3>

        <p 
          className="text-xs sm:text-sm text-slate-300 max-w-lg mx-auto leading-relaxed block text-center"
          style={{ 
            writingMode: 'horizontal-tb', 
            direction: 'ltr', 
            wordBreak: 'normal',
            display: 'block'
          }}
        >
          Participez fidèlement à l’avancement de l’Évangile, au ministère pastoral et à l’encadrement des enfants du projet CDEJ HA 0926 à Damé.
        </p>
      </div>

      {/* 2. Guide & Sélection de l'affectation du don */}
      <div className="mb-5 space-y-2 w-full block" style={{ writingMode: 'horizontal-tb' }}>
        <label 
          className="block text-xs font-bold text-slate-300 uppercase tracking-wider text-center sm:text-left"
          style={{ writingMode: 'horizontal-tb', direction: 'ltr' }}
        >
          1. Affectation de votre don ou dîme :
        </label>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
          {donationCategories.map((c) => (
            <button
              key={c.id}
              type="button"
              onClick={() => setSelectedCategory(c.label)}
              className={`p-2.5 rounded-xl text-xs font-medium text-left transition border flex flex-row items-center justify-between ${
                selectedCategory === c.label
                  ? 'bg-amber-500/20 border-amber-400 text-amber-300 font-bold'
                  : 'bg-slate-900/60 border-slate-800 text-slate-300 hover:bg-slate-800/80 hover:text-white'
              }`}
              style={{ writingMode: 'horizontal-tb', direction: 'ltr' }}
            >
              <span className="truncate">{c.label}</span>
              {selectedCategory === c.label && (
                <span className="w-2 h-2 rounded-full bg-amber-400 flex-shrink-0 ml-1.5" />
              )}
            </button>
          ))}
        </div>
      </div>

      {/* 3. Repères de montants suggérés en USD */}
      <div className="mb-6 space-y-2 w-full block" style={{ writingMode: 'horizontal-tb' }}>
        <div className="flex flex-row items-center justify-between">
          <label 
            className="block text-xs font-bold text-slate-300 uppercase tracking-wider"
            style={{ writingMode: 'horizontal-tb', direction: 'ltr' }}
          >
            2. Montants suggérés (ou montant libre sur PayPal) :
          </label>
          <span className="text-[10px] text-amber-400 font-mono whitespace-nowrap">Devise : USD</span>
        </div>

        <div className="grid grid-cols-5 gap-1.5 sm:gap-2">
          {suggestedAmounts.map((amt) => (
            <button
              key={amt}
              type="button"
              onClick={() => setSuggestedAmount(amt)}
              className={`py-2 px-1 rounded-xl text-xs sm:text-sm font-bold font-mono transition border text-center ${
                suggestedAmount === amt
                  ? 'bg-amber-500 text-slate-950 border-amber-400 shadow-md font-extrabold scale-[1.02]'
                  : 'bg-slate-900/80 text-slate-200 border-slate-700/80 hover:bg-slate-800 hover:border-amber-400/50'
              }`}
              style={{ writingMode: 'horizontal-tb', direction: 'ltr' }}
            >
              ${amt}
            </button>
          ))}
        </div>
      </div>

      {/* 4. MODULE OFFICIEL PAYPAL HOSTED BUTTONS */}
      <div 
        className="p-4 sm:p-6 rounded-2xl bg-slate-900/90 border border-slate-800 shadow-inner max-w-lg mx-auto space-y-4 w-full block"
        style={{ writingMode: 'horizontal-tb', direction: 'ltr' }}
      >
        <div className="text-center space-y-1 block">
          <span 
            className="text-[11px] uppercase tracking-wider font-bold text-amber-400 block whitespace-nowrap"
            style={{ writingMode: 'horizontal-tb', direction: 'ltr' }}
          >
            Paiement Sécurisé en Ligne (ID : {buttonId})
          </span>
          <p 
            className="text-xs text-slate-400 leading-relaxed block"
            style={{ writingMode: 'horizontal-tb', direction: 'ltr', wordBreak: 'normal' }}
          >
            Cliquez sur le bouton PayPal ou Carte Bancaire ci-dessous pour compléter votre don en USD.
            {suggestedAmount && (
              <span className="block text-amber-300 font-semibold pt-0.5">
                Montant suggéré sélectionné : ${suggestedAmount} USD
              </span>
            )}
          </p>
        </div>

        {/* Conteneur exact avec style CSS requis : width 100%, max-width 400px, margin 0 auto */}
        <div 
          className="relative min-h-[55px] w-full block text-center"
          style={{ writingMode: 'horizontal-tb', direction: 'ltr' }}
        >
          {loading && (
            <div className="flex flex-row items-center justify-center space-x-2 py-4 text-xs font-medium text-slate-400 whitespace-nowrap">
              <Loader2 className="w-4 h-4 animate-spin text-amber-400 flex-shrink-0" />
              <span className="whitespace-nowrap">Chargement du bouton officiel PayPal sécurisé...</span>
            </div>
          )}

          {/* Veso div pour rendering du bouton hébergé (Block display pour éviter l'écrasement flex) */}
          <div 
            id={containerId} 
            className="w-full paypal-hosted-container block text-center mx-auto"
            style={{ 
              width: '100%', 
              maxWidth: '400px', 
              minWidth: '260px',
              margin: '0 auto', 
              minHeight: '50px',
              writingMode: 'horizontal-tb',
              direction: 'ltr',
              display: 'block'
            }}
          />

          {/* Bouton direct PayPal horizontal sécurisé (garantie d'affichage immédiat en toute circonstance) */}
          <div className="pt-3 flex flex-col items-center justify-center space-y-2">
            <a
              href={`https://www.paypal.com/donate/?hosted_button_id=${buttonId}`}
              target="_blank"
              rel="noopener noreferrer"
              className="w-full max-w-[400px] flex flex-row items-center justify-center space-x-2.5 px-6 py-3 rounded-xl bg-[#0070ba] hover:bg-[#003087] text-white font-bold text-xs sm:text-sm shadow-md hover:shadow-lg transition active:scale-[0.99] whitespace-nowrap"
              style={{ writingMode: 'horizontal-tb', direction: 'ltr' }}
            >
              <CreditCard className="w-4 h-4 text-amber-300 flex-shrink-0" />
              <span className="whitespace-nowrap">Faire un Don sur PayPal (USD)</span>
              <ExternalLink className="w-3.5 h-3.5 ml-1 text-slate-200 flex-shrink-0" />
            </a>

            <span className="text-[10px] text-slate-500 whitespace-nowrap">
              Passerelle chiffrée SSL 256 bits officielle de PayPal Inc.
            </span>
          </div>

          {/* Fallback ou alerte en cas d'erreur de chargement SDK */}
          {error && (
            <div className="p-3.5 rounded-xl bg-amber-950/40 border border-amber-500/40 text-xs text-amber-200 w-full text-center space-y-1.5 mt-3">
              <div className="flex flex-row items-center justify-center space-x-1.5 text-amber-300 font-semibold whitespace-nowrap">
                <AlertCircle className="w-4 h-4 text-amber-400 flex-shrink-0" />
                <span>Paiement Direct Sécurisé PayPal</span>
              </div>
              <p className="text-[11px] text-slate-300 leading-relaxed">
                Utilisez le bouton ci-dessus pour accéder directement à la page de don sécurisée de l'Église sur PayPal.
              </p>
            </div>
          )}
        </div>

        {/* Reçu et Transparence */}
        <div className="pt-3 border-t border-slate-800 text-[11px] text-slate-400 text-center space-y-1 block">
          <p className="flex flex-row items-center justify-center space-x-1 text-center">
            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 flex-shrink-0 inline" />
            <span>Reçu de don immédiat délivré par courriel par PayPal.</span>
          </p>
          <p className="text-[10px] text-slate-500">
            Affectation choisie : <strong className="text-slate-300">{selectedCategory}</strong>
          </p>
        </div>
      </div>

      {/* Badges de sécurité et devises (Toujours strictement horizontaux) */}
      <div 
        className="mt-4 flex flex-row flex-wrap items-center justify-center gap-2 text-[10px] text-slate-400 w-full"
        style={{ writingMode: 'horizontal-tb', direction: 'ltr' }}
      >
        <span className="inline-flex flex-row items-center space-x-1 bg-slate-900 px-2.5 py-1 rounded-lg border border-slate-800 text-slate-300 whitespace-nowrap">
          <ShieldCheck className="w-3.5 h-3.5 text-emerald-400 flex-shrink-0" />
          <span className="whitespace-nowrap">Sécurité SSL 256-bit</span>
        </span>
        <span className="inline-flex flex-row items-center space-x-1 bg-slate-900 px-2.5 py-1 rounded-lg border border-slate-800 text-slate-300 whitespace-nowrap">
          <CreditCard className="w-3.5 h-3.5 text-amber-400 flex-shrink-0" />
          <span className="whitespace-nowrap">Cartes Visa / MasterCard / PayPal</span>
        </span>
        <span className="inline-flex flex-row items-center space-x-1 bg-slate-900 px-2.5 py-1 rounded-lg border border-slate-800 text-slate-300 whitespace-nowrap">
          <span className="whitespace-nowrap">Devise : USD (Montant libre)</span>
        </span>
      </div>
    </div>
  );
};
