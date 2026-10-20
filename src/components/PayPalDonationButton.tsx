import React, { useEffect, useRef, useState } from 'react';
import { ShieldCheck, HeartHandshake, Loader2, ExternalLink, AlertCircle } from 'lucide-react';

interface PayPalDonationButtonProps {
  buttonId?: string;
  containerId?: string;
  className?: string;
  label?: string;
}

declare global {
  interface Window {
    paypal?: {
      HostedButtons?: (options: { hostedButtonId: string }) => {
        render: (selector: string) => Promise<void>;
      };
    };
  }
}

export const PayPalDonationButton: React.FC<PayPalDonationButtonProps> = ({
  buttonId = 'J6F3GVMK9T27Y',
  containerId = 'paypal-container-J6F3GVMK9T27Y',
  className = '',
  label,
}) => {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const renderedRef = useRef(false);

  useEffect(() => {
    let isMounted = true;
    renderedRef.current = false;

    // S'assurer que le script SDK PayPal est présent
    const ensureScriptLoaded = (): Promise<void> => {
      return new Promise((resolve, reject) => {
        if (window.paypal && window.paypal.HostedButtons) {
          resolve();
          return;
        }

        const scriptSrc =
          'https://www.paypal.com/sdk/js?client-id=BAAnwRf5eIyYpEIKICscYZdDYqgDj_ANKewnO6LqqAJd2I0Y6JpMHmRyPEk26XKu60CTz60_pzLs4FHteM&components=hosted-buttons&disable-funding=venmo&currency=USD';

        let existingScript = document.querySelector(`script[src*="hosted-buttons"]`) as HTMLScriptElement;

        if (existingScript) {
          const checkInterval = setInterval(() => {
            if (window.paypal && window.paypal.HostedButtons) {
              clearInterval(checkInterval);
              resolve();
            }
          }, 100);

          setTimeout(() => {
            clearInterval(checkInterval);
            if (window.paypal && window.paypal.HostedButtons) resolve();
            else reject(new Error('Délai d’attente du SDK PayPal dépassé'));
          }, 10000);
          return;
        }

        const script = document.createElement('script');
        script.src = scriptSrc;
        script.async = true;
        script.onload = () => resolve();
        script.onerror = () => reject(new Error('Impossible de charger le SDK PayPal'));
        document.head.appendChild(script);
      });
    };

    const renderButton = async () => {
      try {
        setLoading(true);
        setError(null);
        await ensureScriptLoaded();

        if (!isMounted) return;

        const container = document.getElementById(containerId);
        if (!container) return;

        // Vider l'ancien contenu si React a re-monté le composant
        container.innerHTML = '';

        if (window.paypal && window.paypal.HostedButtons) {
          await window.paypal
            .HostedButtons({
              hostedButtonId: buttonId,
            })
            .render(`#${containerId}`);

          if (isMounted) {
            renderedRef.current = true;
            setLoading(false);
          }
        } else {
          throw new Error('Composant HostedButtons de PayPal non disponible');
        }
      } catch (err: any) {
        console.warn('[PayPalDonationButton] Erreur chargement bouton PayPal:', err);
        if (isMounted) {
          setError(err?.message || 'Erreur lors du chargement du bouton PayPal.');
          setLoading(false);
        }
      }
    };

    renderButton();

    return () => {
      isMounted = false;
    };
  }, [buttonId, containerId]);

  return (
    <div className={`paypal-donation-wrapper ${className}`}>
      {label && (
        <div className="mb-3 text-center">
          <span className="text-xs font-bold text-slate-700 uppercase tracking-wider">
            {label}
          </span>
        </div>
      )}

      {/* Conteneur officiel PayPal SDK */}
      <div className="relative min-h-[50px] flex flex-col items-center justify-center">
        {loading && (
          <div className="flex items-center justify-center space-x-2 py-4 text-xs font-medium text-slate-500">
            <Loader2 className="w-4 h-4 animate-spin text-amber-500" />
            <span>Chargement du bouton officiel PayPal sécurisé...</span>
          </div>
        )}

        {/* Le conteneur exact demandé par PayPal */}
        <div 
          id={containerId} 
          className="w-full flex justify-center paypal-hosted-container"
        />

        {error && (
          <div className="p-3.5 rounded-xl bg-amber-50 border border-amber-200 text-xs text-amber-900 w-full text-center space-y-2 mt-2">
            <div className="flex items-center justify-center space-x-1.5 text-amber-800 font-semibold">
              <AlertCircle className="w-4 h-4 text-amber-600 flex-shrink-0" />
              <span>Paiement direct PayPal</span>
            </div>
            <p className="text-[11px] text-slate-600 leading-relaxed">
              Vous pouvez effectuer votre dîme ou don directement sur notre page de don PayPal sécurisée :
            </p>
            <a
              href="https://www.paypal.com/donate/?hosted_button_id=J6F3GVMK9T27Y"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center space-x-1.5 px-4 py-2 rounded-lg bg-[#0070ba] hover:bg-[#003087] text-white text-xs font-bold shadow transition"
            >
              <span>Faire un Don Sécurisé sur PayPal (USD)</span>
              <ExternalLink className="w-3.5 h-3.5 ml-1" />
            </a>
          </div>
        )}
      </div>

      {/* Badges de sécurité et devises */}
      <div className="mt-3 flex flex-wrap items-center justify-center gap-2 text-[10px] text-slate-500">
        <span className="inline-flex items-center space-x-1 bg-slate-100 px-2 py-0.5 rounded text-slate-600">
          <ShieldCheck className="w-3 h-3 text-emerald-600" />
          <span>Sécurisé SSL 256-bit</span>
        </span>
        <span className="inline-flex items-center space-x-1 bg-slate-100 px-2 py-0.5 rounded text-slate-600">
          <span>Devise : USD (Montant libre)</span>
        </span>
        <span className="inline-flex items-center space-x-1 bg-slate-100 px-2 py-0.5 rounded text-slate-600">
          <span>Cartes Visa / MasterCard / PayPal</span>
        </span>
      </div>
    </div>
  );
};
