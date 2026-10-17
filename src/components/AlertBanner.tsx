import React, { useState, useEffect } from 'react';
import { Megaphone, X, ArrowRight, AlertTriangle, Info, Bell } from 'lucide-react';

interface AlertData {
  active: boolean;
  title: string;
  message: string;
  badge: string;
  linkUrl?: string;
  level: 'info' | 'warning' | 'urgent';
}

export const AlertBanner: React.FC<{ onNavigate: (path: string) => void }> = ({ onNavigate }) => {
  const [alert, setAlert] = useState<AlertData | null>(null);
  const [dismissed, setDismissed] = useState(false);

  useEffect(() => {
    fetch('/api/alert')
      .then(res => res.json())
      .then(data => {
        if (data && data.active) {
          setAlert(data);
        }
      })
      .catch(() => {});
  }, []);

  if (!alert || !alert.active || dismissed) return null;

  const bgStyles = {
    urgent: 'bg-gradient-to-r from-rose-700 via-rose-600 to-amber-600 text-white',
    warning: 'bg-gradient-to-r from-amber-600 via-amber-500 to-amber-600 text-slate-950 font-medium',
    info: 'bg-gradient-to-r from-slate-950 via-slate-900 to-[#0b1b33] text-amber-300 border-b border-amber-500/30'
  }[alert.level] || 'bg-slate-900 text-white';

  return (
    <div className={`relative py-2.5 px-4 shadow-md transition-all z-40 ${bgStyles}`}>
      <div className="max-w-7xl mx-auto flex items-center justify-between gap-3 text-xs">
        <div className="flex items-center space-x-2.5 flex-grow truncate">
          <span className="flex-shrink-0 px-2 py-0.5 rounded text-[10px] font-extrabold uppercase tracking-wider bg-white/20 backdrop-blur-sm border border-white/30 flex items-center space-x-1">
            <Bell className="w-3 h-3 animate-bounce" />
            <span>{alert.badge || 'ANONS'}</span>
          </span>

          <span className="font-bold truncate">{alert.title} :</span>
          <span className="hidden sm:inline truncate opacity-90">{alert.message}</span>
        </div>

        <div className="flex items-center space-x-3 flex-shrink-0">
          {alert.linkUrl && (
            <button
              onClick={() => {
                if (alert.linkUrl?.startsWith('http')) {
                  window.open(alert.linkUrl, '_blank');
                } else {
                  onNavigate(alert.linkUrl || '/evenements');
                }
              }}
              className="inline-flex items-center space-x-1 px-3 py-1 rounded-full text-[11px] font-bold bg-white text-slate-900 hover:bg-amber-100 transition shadow-sm"
            >
              <span>Detay</span>
              <ArrowRight className="w-3 h-3" />
            </button>
          )}

          <button
            onClick={() => setDismissed(true)}
            className="p-1 rounded-full hover:bg-black/20 transition opacity-80 hover:opacity-100"
            title="Fèmen anons la"
          >
            <X className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>
    </div>
  );
};
