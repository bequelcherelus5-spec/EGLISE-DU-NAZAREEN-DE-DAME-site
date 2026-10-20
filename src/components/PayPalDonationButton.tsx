import React, { useEffect, useRef, useState } from 'react';
import { 
  ShieldCheck, 
  HeartHandshake, 
  Loader2, 
  ExternalLink, 
  AlertCircle, 
  CheckCircle2, 
  DollarSign, 
  CreditCard, 
  Printer, 
  RotateCcw, 
  Sparkles,
  HelpCircle,
  Church
} from 'lucide-react';
const churchSealImg = '/images/eglise/sceau-officiel.svg';

interface PayPalDonationButtonProps {
  buttonId?: string;
  containerId?: string;
  className?: string;
  label?: string;
  initialAmount?: number;
  initialCategory?: string;
}

interface PaymentSuccessData {
  transactionId: string;
  amount: string;
  category: string;
  donorName: string;
  payerEmail?: string;
  date: string;
}

declare global {
  interface Window {
    paypal?: {
      Buttons?: (options: {
        style?: {
          layout?: 'vertical' | 'horizontal';
          color?: 'gold' | 'blue' | 'silver' | 'white' | 'black';
          shape?: 'rect' | 'pill';
          label?: 'paypal' | 'checkout' | 'buynow' | 'pay' | 'donate';
          tagline?: boolean;
          height?: number;
        };
        createOrder: (data: any, actions: any) => Promise<string>;
        onApprove: (data: any, actions: any) => Promise<void>;
        onError?: (err: any) => void;
        onCancel?: (data: any) => void;
      }) => {
        render: (selector: string | HTMLElement) => Promise<void>;
      };
      HostedButtons?: (options: { hostedButtonId: string }) => {
        render: (selector: string | HTMLElement) => Promise<void>;
      };
    };
  }
}

export const PayPalDonationButton: React.FC<PayPalDonationButtonProps> = ({
  buttonId = 'J6F3GVMK9T27Y',
  containerId = 'paypal-smart-buttons-container',
  className = '',
  label,
  initialAmount = 25,
  initialCategory = 'Dîmes & Offrandes Générales',
}) => {
  // Amount & category configuration
  const [selectedPreset, setSelectedPreset] = useState<number | 'custom'>(initialAmount);
  const [customAmount, setCustomAmount] = useState<string>('');
  const [category, setCategory] = useState<string>(initialCategory);
  const [donorName, setDonorName] = useState<string>('');
  const [donorEmail, setDonorEmail] = useState<string>('');
  
  // UI status
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [notice, setNotice] = useState<string | null>(null);
  const [paymentSuccess, setPaymentSuccess] = useState<PaymentSuccessData | null>(null);

  // References to keep latest values accessible in PayPal closures without re-rendering buttons
  const amountRef = useRef<number>(initialAmount);
  const categoryRef = useRef<string>(initialCategory);
  const donorNameRef = useRef<string>('');
  const donorEmailRef = useRef<string>('');
  const renderedButtonsRef = useRef<boolean>(false);

  // Predefined donation amounts (USD)
  const presetAmounts = [10, 25, 50, 100, 250];

  // Categories of donation
  const categories = [
    { id: 'dimes', label: 'Dîmes & Offrandes Générales' },
    { id: 'cdej', label: 'Projet CDEJ HA 0926 (Enfance)' },
    { id: 'chantiers', label: 'Chantiers & Temple (Aggée 1:8)' },
    { id: 'social', label: 'Secours d’Urgence & Bienfaisance' },
  ];

  // Update current amount value
  const handlePresetSelect = (amt: number) => {
    setSelectedPreset(amt);
    setCustomAmount('');
    amountRef.current = amt;
    setError(null);
    setNotice(null);
  };

  const handleCustomAmountChange = (val: string) => {
    const cleaned = val.replace(/[^0-9.]/g, '');
    setCustomAmount(cleaned);
    setSelectedPreset('custom');
    const parsed = parseFloat(cleaned);
    if (!isNaN(parsed) && parsed > 0) {
      amountRef.current = parsed;
      setError(null);
    }
  };

  // Sync category & donor name refs
  useEffect(() => {
    categoryRef.current = category;
  }, [category]);

  useEffect(() => {
    donorNameRef.current = donorName;
  }, [donorName]);

  useEffect(() => {
    donorEmailRef.current = donorEmail;
  }, [donorEmail]);

  // Load and render PayPal Smart Payment Buttons
  useEffect(() => {
    let isMounted = true;
    renderedButtonsRef.current = false;

    const clientId = 'BAAnwRf5eIyYpEIKICscYZdDYqgDj_ANKewnO6LqqAJd2I0Y6JpMHmRyPEk26XKu60CTz60_pzLs4FHteM';

    const ensureScriptLoaded = (): Promise<void> => {
      return new Promise((resolve, reject) => {
        // If window.paypal.Buttons is already available
        if (window.paypal && typeof window.paypal.Buttons === 'function') {
          resolve();
          return;
        }

        const scriptSrc = `https://www.paypal.com/sdk/js?client-id=${clientId}&components=buttons,hosted-buttons&enable-funding=card&currency=USD`;

        // Check for existing script tag
        let existingScript = document.querySelector(`script[src*="paypal.com/sdk/js"]`) as HTMLScriptElement;

        // If existing script does not include 'buttons' component, reload with buttons
        if (existingScript && !existingScript.src.includes('components=buttons') && existingScript.src.includes('components=hosted-buttons')) {
          existingScript.remove();
          existingScript = null as any;
        }

        if (existingScript) {
          const checkInterval = setInterval(() => {
            if (window.paypal && typeof window.paypal.Buttons === 'function') {
              clearInterval(checkInterval);
              resolve();
            }
          }, 100);

          setTimeout(() => {
            clearInterval(checkInterval);
            if (window.paypal && typeof window.paypal.Buttons === 'function') {
              resolve();
            } else {
              reject(new Error('Délai d’attente du SDK PayPal Buttons dépassé'));
            }
          }, 8000);
          return;
        }

        const script = document.createElement('script');
        script.src = scriptSrc;
        script.async = true;
        script.onload = () => {
          if (window.paypal && typeof window.paypal.Buttons === 'function') {
            resolve();
          } else {
            // Polling in case of async initialization
            const poll = setInterval(() => {
              if (window.paypal && typeof window.paypal.Buttons === 'function') {
                clearInterval(poll);
                resolve();
              }
            }, 50);
            setTimeout(() => {
              clearInterval(poll);
              resolve();
            }, 3000);
          }
        };
        script.onerror = () => reject(new Error('Impossible de charger le SDK PayPal'));
        document.head.appendChild(script);
      });
    };

    const renderButtons = async () => {
      try {
        setLoading(true);
        setError(null);
        await ensureScriptLoaded();

        if (!isMounted) return;

        const container = document.getElementById(containerId);
        if (!container) return;

        // Reset old container content
        container.innerHTML = '';

        if (window.paypal && typeof window.paypal.Buttons === 'function') {
          await window.paypal
            .Buttons({
              // Configuration layout & style : vertical et rect pour PayPal + Cartes
              style: {
                layout: 'vertical',
                color: 'gold',
                shape: 'rect',
                label: 'donate',
                tagline: false,
                height: 48,
              },

              // 1. Logique createOrder avec Custom Amount dynamique
              createOrder: (_data: any, actions: any) => {
                const effectiveAmount = amountRef.current;
                if (!effectiveAmount || isNaN(effectiveAmount) || effectiveAmount < 1) {
                  setError('Veuillez sélectionner ou saisir un montant valide (minimum 1.00 USD).');
                  return Promise.reject(new Error('Montant invalide'));
                }

                setError(null);
                setNotice(null);

                const donorDesc = donorNameRef.current ? ` (Donateur: ${donorNameRef.current})` : '';

                return actions.order.create({
                  purchase_units: [
                    {
                      description: `Église du Nazaréen de Damé - ${categoryRef.current}${donorDesc} [CDEND-HA0926]`,
                      amount: {
                        currency_code: 'USD',
                        value: effectiveAmount.toFixed(2),
                      },
                    },
                  ],
                  application_context: {
                    shipping_preference: 'NO_SHIPPING',
                  },
                });
              },

              // 2. Logique onApprove avec confirmation et célébration
              onApprove: async (data: any, actions: any) => {
                try {
                  const details = await actions.order.capture();
                  const txId = details?.id || data?.orderID || 'TX-' + Date.now();
                  const donor = details?.payer?.name?.given_name
                    ? `${details.payer.name.given_name} ${details.payer.name.surname || ''}`.trim()
                    : (donorNameRef.current || 'Fidèle Donateur');
                  const capturedAmt = 
                    details?.purchase_units?.[0]?.amount?.value || 
                    amountRef.current.toFixed(2);

                  if (isMounted) {
                    setPaymentSuccess({
                      transactionId: txId,
                      amount: capturedAmt,
                      category: categoryRef.current,
                      donorName: donor,
                      payerEmail: details?.payer?.email_address || donorEmailRef.current,
                      date: new Date().toLocaleDateString('fr-FR', {
                        year: 'numeric',
                        month: 'long',
                        day: 'numeric',
                        hour: '2-digit',
                        minute: '2-digit',
                      }),
                    });
                    setError(null);
                    setNotice(null);
                  }
                } catch (captureErr: any) {
                  console.error('[PayPal onApprove] Erreur capture:', captureErr);
                  if (isMounted) {
                    setError('Erreur lors de la validation finale du don. Si votre compte a été débité, veuillez contacter le secrétariat.');
                  }
                }
              },

              // 3. Logique onError avec gestion des échecs (ex: cartes refusées)
              onError: (err: any) => {
                console.warn('[PayPal onError]:', err);
                if (isMounted) {
                  setError(
                    'La transaction n’a pas pu aboutir (carte refusée, fonds insuffisants ou problème réseau). Vous pouvez vérifier les informations de votre carte ou réessayer avec votre compte PayPal.'
                  );
                }
              },

              // Annulation volontaire sans erreur
              onCancel: () => {
                if (isMounted) {
                  setNotice('Paiement annulé. Aucun débit n’a été effectué. Vous pouvez ajuster le montant ou réessayer quand vous voulez.');
                }
              },
            })
            .render(`#${containerId}`);

          if (isMounted) {
            renderedButtonsRef.current = true;
            setLoading(false);
          }
        } else {
          throw new Error('Composant paypal.Buttons non disponible');
        }
      } catch (err: any) {
        console.warn('[PayPalDonationButton] Erreur initialisation smart buttons:', err);
        if (isMounted) {
          setError(err?.message || 'Erreur lors du chargement des boutons de paiement PayPal.');
          setLoading(false);
        }
      }
    };

    renderButtons();

    return () => {
      isMounted = false;
    };
  }, [containerId]);

  // Réinitialiser pour un nouveau don
  const handleReset = () => {
    setPaymentSuccess(null);
    setError(null);
    setNotice(null);
    setSelectedPreset(initialAmount);
    setCustomAmount('');
    amountRef.current = initialAmount;
  };

  return (
    <div className={`paypal-smart-donation-wrapper w-full ${className}`}>
      {/* 1. ÉCRAN DE REMERCIEMENT ET CÉLÉBRATION (onApprove) */}
      {paymentSuccess ? (
        <div className="p-6 sm:p-8 rounded-3xl bg-gradient-to-b from-slate-900 via-slate-900 to-slate-950 border-2 border-emerald-500/50 text-white shadow-2xl space-y-6 animate-in zoom-in-95 duration-300">
          {/* Header de Célébration */}
          <div className="text-center space-y-3">
            <div className="w-16 h-16 mx-auto rounded-full bg-emerald-500/20 border-2 border-emerald-400 flex items-center justify-center shadow-lg shadow-emerald-500/20">
              <CheckCircle2 className="w-10 h-10 text-emerald-400 animate-pulse" />
            </div>

            <div className="inline-flex items-center space-x-2 px-3 py-1 rounded-full bg-emerald-500/20 text-emerald-300 text-xs font-bold uppercase tracking-wider">
              <Sparkles className="w-3.5 h-3.5 text-emerald-400" />
              <span>Paiement Confirmé avec Succès !</span>
            </div>

            <h3 className="font-serif text-2xl sm:text-3xl font-extrabold text-white">
              Mèsi anpil pou sipò w !
            </h3>

            <p className="text-xs sm:text-sm text-slate-300 max-w-md mx-auto leading-relaxed">
              « Dieu aime celui qui donne avec joie. » (2 Corinthiens 9:7)
              <br />
              Votre offrande a été enregistrée avec succès au profit de l'Église du Nazaréen de Damé.
            </p>
          </div>

          {/* Reçu Numérique Officiel */}
          <div className="p-5 rounded-2xl bg-slate-950/90 border border-slate-800 space-y-3 text-xs">
            <div className="flex items-center justify-between pb-3 border-b border-slate-800">
              <div className="flex items-center space-x-2">
                <img src={churchSealImg} alt="Sceau Damé" className="w-7 h-7 object-contain" />
                <div>
                  <span className="font-bold text-white block">Reçu de Don &amp; Offrande</span>
                  <span className="text-[10px] text-amber-400 font-mono">CDEND-HA0926</span>
                </div>
              </div>
              <span className="px-2.5 py-1 rounded bg-emerald-500/20 text-emerald-300 font-bold font-mono">
                PAYÉ (USD)
              </span>
            </div>

            <div className="grid grid-cols-2 gap-3 pt-1 text-slate-300">
              <div>
                <span className="text-[10px] text-slate-500 block uppercase font-bold">Montant Versé</span>
                <span className="font-mono text-base font-extrabold text-amber-400">
                  ${paymentSuccess.amount} USD
                </span>
              </div>

              <div>
                <span className="text-[10px] text-slate-500 block uppercase font-bold">Affectation</span>
                <span className="font-semibold text-white truncate block">
                  {paymentSuccess.category}
                </span>
              </div>

              <div>
                <span className="text-[10px] text-slate-500 block uppercase font-bold">Donateur</span>
                <span className="text-white font-medium truncate block">
                  {paymentSuccess.donorName}
                </span>
              </div>

              <div>
                <span className="text-[10px] text-slate-500 block uppercase font-bold">Date &amp; Heure</span>
                <span className="text-slate-300 font-mono text-[11px] block">
                  {paymentSuccess.date}
                </span>
              </div>
            </div>

            <div className="pt-2 border-t border-slate-800 flex items-center justify-between text-[11px] font-mono text-slate-400">
              <span>Réf. Transaction :</span>
              <span className="text-amber-300 select-all font-bold">{paymentSuccess.transactionId}</span>
            </div>
          </div>

          {/* Actions : Imprimer & Nouveau Don */}
          <div className="flex flex-col sm:flex-row items-center justify-center gap-3 pt-2">
            <button
              onClick={() => window.print()}
              className="w-full sm:w-auto px-4 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-bold transition flex items-center justify-center space-x-2"
            >
              <Printer className="w-4 h-4 text-slate-300" />
              <span>Imprimer le reçu</span>
            </button>

            <button
              onClick={handleReset}
              className="w-full sm:w-auto px-5 py-2.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 text-xs font-bold transition flex items-center justify-center space-x-2 shadow-lg shadow-amber-500/20"
            >
              <RotateCcw className="w-4 h-4" />
              <span>Faire un autre don</span>
            </button>
          </div>
        </div>
      ) : (
        /* 2. FORMULAIRE DE DON ET SMART BUTTONS PAYPAL */
        <div className="space-y-6">
          {label && (
            <div className="text-center">
              <span className="text-xs font-bold text-slate-300 uppercase tracking-wider">
                {label}
              </span>
            </div>
          )}

          {/* Choix de l'affectation du don */}
          <div className="space-y-2">
            <label className="block text-xs font-bold text-slate-300 uppercase tracking-wider text-center sm:text-left">
              1. Choisissez la destination de votre don :
            </label>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
              {categories.map((c) => (
                <button
                  key={c.id}
                  type="button"
                  onClick={() => setCategory(c.label)}
                  className={`p-2.5 rounded-xl text-xs font-medium text-left transition border flex items-center justify-between ${
                    category === c.label
                      ? 'bg-amber-500/20 border-amber-400 text-amber-300 font-bold'
                      : 'bg-slate-900/60 border-slate-800 text-slate-300 hover:bg-slate-800/80 hover:text-white'
                  }`}
                >
                  <span className="truncate">{c.label}</span>
                  {category === c.label && (
                    <span className="w-2 h-2 rounded-full bg-amber-400 flex-shrink-0 ml-1.5" />
                  )}
                </button>
              ))}
            </div>
          </div>

          {/* Choix du Montant (Presets + Custom Amount en USD) */}
          <div className="space-y-2">
            <label className="block text-xs font-bold text-slate-300 uppercase tracking-wider text-center sm:text-left">
              2. Choisissez ou entrez le montant (USD) :
            </label>

            {/* Boutons pré-définis */}
            <div className="grid grid-cols-5 gap-1.5 sm:gap-2">
              {presetAmounts.map((amt) => (
                <button
                  key={amt}
                  type="button"
                  onClick={() => handlePresetSelect(amt)}
                  className={`py-2.5 px-2 rounded-xl text-xs sm:text-sm font-bold font-mono transition border ${
                    selectedPreset === amt
                      ? 'bg-amber-500 text-slate-950 border-amber-400 shadow-md font-extrabold scale-[1.02]'
                      : 'bg-slate-900/80 text-slate-200 border-slate-700/80 hover:bg-slate-800 hover:border-amber-400/50'
                  }`}
                >
                  ${amt}
                </button>
              ))}
            </div>

            {/* Champ Montant Personnalisé (Custom Amount) */}
            <div className="relative pt-1">
              <div className="relative rounded-xl shadow-sm">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                  <DollarSign className="w-4 h-4 text-amber-400" />
                </div>
                <input
                  type="text"
                  inputMode="decimal"
                  placeholder="Ou entrez un montant personnalisé (ex: 15, 75, 500...)"
                  value={customAmount}
                  onChange={(e) => handleCustomAmountChange(e.target.value)}
                  className={`w-full pl-10 pr-16 py-2.5 bg-slate-900/90 border rounded-xl text-xs sm:text-sm text-white placeholder-slate-500 focus:outline-none transition ${
                    selectedPreset === 'custom'
                      ? 'border-amber-400 ring-2 ring-amber-400/20 font-bold'
                      : 'border-slate-700 focus:border-amber-400'
                  }`}
                />
                <div className="absolute inset-y-0 right-0 pr-3.5 flex items-center pointer-events-none">
                  <span className="text-[11px] font-bold text-slate-400 font-mono">USD</span>
                </div>
              </div>
            </div>
          </div>

          {/* Optionnel : Nom et Email du Donateur pour reçu */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 pt-1">
            <div>
              <label className="block text-[11px] text-slate-400 mb-1">
                Nom ou Prénom du donateur (Optionnel) :
              </label>
              <input
                type="text"
                placeholder="Ex : Frère Jean / Sœur Marie"
                value={donorName}
                onChange={(e) => setDonorName(e.target.value)}
                className="w-full px-3 py-2 bg-slate-900/70 border border-slate-800 rounded-xl text-xs text-white placeholder-slate-500 focus:outline-none focus:border-amber-400"
              />
            </div>
            <div>
              <label className="block text-[11px] text-slate-400 mb-1">
                Courriel pour reçu de don (Optionnel) :
              </label>
              <input
                type="email"
                placeholder="votre-email@domaine.com"
                value={donorEmail}
                onChange={(e) => setDonorEmail(e.target.value)}
                className="w-full px-3 py-2 bg-slate-900/70 border border-slate-800 rounded-xl text-xs text-white placeholder-slate-500 focus:outline-none focus:border-amber-400"
              />
            </div>
          </div>

          {/* Messages d'erreur ou d'annulation */}
          {error && (
            <div className="p-3.5 rounded-xl bg-rose-950/40 border border-rose-500/50 text-xs text-rose-200 flex items-start space-x-2 animate-in fade-in">
              <AlertCircle className="w-4 h-4 text-rose-400 flex-shrink-0 mt-0.5" />
              <div className="space-y-1">
                <span className="font-semibold block">Échec ou refus de paiement :</span>
                <p className="text-[11px] text-rose-300 leading-relaxed">{error}</p>
                <div className="pt-1">
                  <a
                    href={`https://www.paypal.com/donate/?hosted_button_id=${buttonId}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center space-x-1 underline text-amber-300 hover:text-white"
                  >
                    <span>Essayer via la page PayPal directe</span>
                    <ExternalLink className="w-3 h-3" />
                  </a>
                </div>
              </div>
            </div>
          )}

          {notice && (
            <div className="p-3 rounded-xl bg-slate-800/80 border border-slate-700 text-xs text-slate-300 flex items-center space-x-2">
              <AlertCircle className="w-4 h-4 text-amber-400 flex-shrink-0" />
              <span>{notice}</span>
            </div>
          )}

          {/* CONTENEUR RESPONSIVE DES BOUTONS PAYPAL SMART (Layout Vertical + Rect) */}
          <div className="pt-2">
            <div className="text-center mb-3">
              <span className="text-[11px] uppercase tracking-wider font-bold text-amber-400">
                Paiement Sécurisé en Ligne (${amountRef.current} USD)
              </span>
            </div>

            {/* Conteneur avec contraintes responsives : minWidth: '280px', maxWidth: '500px', width: '100%' */}
            <div 
              className="mx-auto flex flex-col justify-center items-center"
              style={{ minWidth: '280px', maxWidth: '500px', width: '100%' }}
            >
              {loading && (
                <div className="flex items-center justify-center space-x-2 py-6 text-xs text-slate-400">
                  <Loader2 className="w-4 h-4 animate-spin text-amber-400" />
                  <span>Chargement des boutons sécurisés PayPal &amp; Carte Bancaire...</span>
                </div>
              )}

              {/* Conteneur DOM injecté par le SDK PayPal Buttons */}
              <div 
                id={containerId} 
                className="w-full paypal-smart-buttons-render"
                style={{ minWidth: '280px', maxWidth: '500px', width: '100%' }}
              />
            </div>
          </div>

          {/* Badges de Sécurité SSL et Devises */}
          <div className="pt-2 border-t border-slate-800/80 flex flex-wrap items-center justify-center gap-3 text-[10px] text-slate-400">
            <span className="inline-flex items-center space-x-1 bg-slate-900 px-2.5 py-1 rounded-lg border border-slate-800">
              <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
              <span>Chiffrement SSL 256-bit</span>
            </span>
            <span className="inline-flex items-center space-x-1 bg-slate-900 px-2.5 py-1 rounded-lg border border-slate-800">
              <CreditCard className="w-3.5 h-3.5 text-amber-400" />
              <span>Cartes Visa / MasterCard / Amex / PayPal</span>
            </span>
            <span className="inline-flex items-center space-x-1 bg-slate-900 px-2.5 py-1 rounded-lg border border-slate-800">
              <span>Devise : USD (Montant libre)</span>
            </span>
          </div>
        </div>
      )}
    </div>
  );
};
