import React, { useEffect } from 'react';

declare global {
  interface Window {
    adsbygoogle?: any[];
  }
}

interface AdSenseBannerProps {
  slot?: string;
  format?: 'auto' | 'fluid' | 'rectangle';
  className?: string;
}

export const AdSenseBanner: React.FC<AdSenseBannerProps> = ({
  slot,
  format = 'auto',
  className = ''
}) => {
  useEffect(() => {
    try {
      if (typeof window !== 'undefined') {
        (window.adsbygoogle = window.adsbygoogle || []).push({});
      }
    } catch {
      // Ignore if ads are blocked or loading
    }
  }, []);

  // When slot is provided, render the responsive ad tag
  if (slot) {
    return (
      <div className={`my-6 text-center overflow-hidden ${className}`}>
        <span className="text-[10px] uppercase font-bold text-slate-400 tracking-wider block mb-1">
          Annonce / Piblisite
        </span>
        <ins
          className="adsbygoogle"
          style={{ display: 'block' }}
          data-ad-client="ca-pub-7382968203880435"
          data-ad-slot={slot}
          data-ad-format={format}
          data-full-width-responsive="true"
        />
      </div>
    );
  }

  return null;
};
