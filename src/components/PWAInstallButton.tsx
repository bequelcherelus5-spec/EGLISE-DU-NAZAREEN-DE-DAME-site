import React, { useState } from 'react';
import { usePWAInstall } from '../hooks/usePWAInstall';
import { Download, Smartphone, X, Share, PlusSquare, CheckCircle2 } from 'lucide-react';
import churchSealImg from '../assets/images/regenerated_image_1792011564270.x-icon';

interface PWAInstallButtonProps {
  variant?: 'nav' | 'banner' | 'floating';
}

export const PWAInstallButton: React.FC<PWAInstallButtonProps> = ({ variant = 'nav' }) => {
  const { isInstallable, isInstalled, isIOS, install } = usePWAInstall();
  const [showIOSGuide, setShowIOSGuide] = useState(false);
  const [dismissed, setDismissed] = useState(false);

  // If already running as an installed PWA or dismissed, hide
  if (isInstalled || dismissed) {
    return null;
  }

  // If not installable and not iOS, don't display
  if (!isInstallable && !isIOS) {
    return null;
  }

  const handleInstallClick = () => {
    if (isInstallable) {
      install();
    } else if (isIOS) {
      setShowIOSGuide(true);
    }
  };

  // 1. Variant NAVBAR : compact button
  if (variant === 'nav') {
    return (
      <>
        <button
          onClick={handleInstallClick}
          className="flex items-center space-x-1.5 px-3 py-1.5 rounded-full bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-slate-950 font-extrabold text-xs shadow-md shadow-amber-500/20 transition-all hover:scale-105"
          title="Enstale sit la sou telefòn ou tankou yon aplikasyon mobil"
        >
          <Smartphone className="w-3.5 h-3.5" />
          <span>Enstale App</span>
        </button>

        {showIOSGuide && (
          <IOSInstallModal onClose={() => setShowIOSGuide(false)} />
        )}
      </>
    );
  }

  // 2. Variant FLOATING : floating pill on bottom right / bottom bar
  return (
    <>
      <div className="fixed bottom-4 left-4 right-4 sm:left-auto sm:right-6 sm:bottom-6 z-40 max-w-md mx-auto sm:mx-0 animate-in slide-in-from-bottom duration-500">
        <div className="bg-slate-900/95 backdrop-blur-md border border-amber-500/40 rounded-2xl p-3.5 sm:p-4 text-white shadow-2xl flex items-center justify-between gap-3">
          <div className="flex items-center space-x-3 min-w-0">
            <div className="w-10 h-10 rounded-full bg-black p-0.5 border border-amber-400 flex-shrink-0 flex items-center justify-center">
              <img src={churchSealImg} alt="Logo" className="w-full h-full object-contain" />
            </div>
            <div className="min-w-0">
              <h4 className="text-xs sm:text-sm font-serif font-bold text-amber-300 truncate">
                Enstale App Legliz Damé a
              </h4>
              <p className="text-[11px] text-slate-300 line-clamp-1">
                Aksè rapid sou ekran telefòn ou san w pa bezwen ale sou Google
              </p>
            </div>
          </div>

          <div className="flex items-center space-x-2 flex-shrink-0">
            <button
              onClick={handleInstallClick}
              className="px-3.5 py-2 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 text-xs font-black shadow-md transition flex items-center space-x-1"
            >
              <Download className="w-3.5 h-3.5" />
              <span>Enstale</span>
            </button>
            <button
              onClick={() => setDismissed(true)}
              className="text-slate-400 hover:text-white p-1 rounded-lg"
              title="Fèmen"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>

      {showIOSGuide && (
        <IOSInstallModal onClose={() => setShowIOSGuide(false)} />
      )}
    </>
  );
};

const IOSInstallModal: React.FC<{ onClose: () => void }> = ({ onClose }) => {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/75 backdrop-blur-xs p-4 animate-in fade-in">
      <div className="w-full max-w-sm rounded-3xl bg-slate-900 border border-amber-500/40 p-6 text-white shadow-2xl space-y-4">
        <div className="flex items-center justify-between border-b border-slate-800 pb-3">
          <div className="flex items-center space-x-2">
            <Smartphone className="w-5 h-5 text-amber-400" />
            <h3 className="text-base font-serif font-bold text-amber-300">Enstale sou iPhone / iPad</h3>
          </div>
          <button onClick={onClose} className="text-slate-400 hover:text-white text-lg font-bold">
            &times;
          </button>
        </div>

        <p className="text-xs text-slate-300 leading-relaxed">
          Pou enstale sit Legliz la kòm yon aplikasyon sou iPhone ou :
        </p>

        <div className="space-y-3 bg-slate-950/70 p-4 rounded-2xl border border-slate-800 text-xs">
          <div className="flex items-start space-x-3">
            <div className="w-6 h-6 rounded-full bg-amber-500/20 text-amber-400 flex items-center justify-center font-bold text-xs flex-shrink-0">
              1
            </div>
            <p className="text-slate-200">
              Peze bouton <strong className="text-amber-300 font-bold flex items-center gap-1 inline-flex"><Share className="w-3.5 h-3.5" /> Pataje (Share)</strong> ki anba nan ba Safari a.
            </p>
          </div>

          <div className="flex items-start space-x-3">
            <div className="w-6 h-6 rounded-full bg-amber-500/20 text-amber-400 flex items-center justify-center font-bold text-xs flex-shrink-0">
              2
            </div>
            <p className="text-slate-200">
              Desann ti kras epi chwazi <strong className="text-amber-300 font-bold flex items-center gap-1 inline-flex"><PlusSquare className="w-3.5 h-3.5" /> Sou ekran dakey (Add to Home Screen)</strong>.
            </p>
          </div>

          <div className="flex items-start space-x-3">
            <div className="w-6 h-6 rounded-full bg-amber-500/20 text-amber-400 flex items-center justify-center font-bold text-xs flex-shrink-0">
              3
            </div>
            <p className="text-slate-200">
              Peze <strong className="text-emerald-400 font-bold">Ajoute (Add)</strong> anlè adwat. App la ap parèt sou ekran telefòn ou !
            </p>
          </div>
        </div>

        <button
          onClick={onClose}
          className="w-full py-2.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-xs shadow-md transition"
        >
          Konprann, Mèsi !
        </button>
      </div>
    </div>
  );
};
