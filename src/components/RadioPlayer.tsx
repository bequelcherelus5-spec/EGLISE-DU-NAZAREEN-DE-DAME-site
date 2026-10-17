import React, { useState, useEffect, useRef } from 'react';
import { Radio, Play, Pause, Volume2, VolumeX, Sparkles, X, ExternalLink } from 'lucide-react';

interface RadioData {
  active: boolean;
  streamUrl: string;
  stationName: string;
  tagline: string;
  zenoStationId?: string;
}

export const RadioPlayer: React.FC = () => {
  const [radioData, setRadioData] = useState<RadioData>({
    active: true,
    streamUrl: 'https://stream.zeno.fm/f3wvbbqmdg8uv',
    stationName: 'Radyo Nazaréen Damé',
    tagline: 'Louwanj, Adorasyon & Pawòl Bondye 24/7 depi Damé, Haïti'
  });

  const [isPlaying, setIsPlaying] = useState(false);
  const [isMuted, setIsMuted] = useState(false);
  const [isMinimized, setIsMinimized] = useState(true);
  const audioRef = useRef<HTMLAudioElement | null>(null);

  useEffect(() => {
    fetch('/api/radio')
      .then(res => res.json())
      .then(data => {
        if (data && data.streamUrl) setRadioData(data);
      })
      .catch(() => {});
  }, []);

  const togglePlay = () => {
    if (!audioRef.current) return;
    if (isPlaying) {
      audioRef.current.pause();
      setIsPlaying(false);
    } else {
      audioRef.current.play().then(() => {
        setIsPlaying(true);
      }).catch(err => {
        console.warn('Radio playback error:', err);
      });
    }
  };

  const toggleMute = () => {
    if (!audioRef.current) return;
    audioRef.current.muted = !isMuted;
    setIsMuted(!isMuted);
  };

  if (!radioData.active) return null;

  return (
    <>
      <audio ref={audioRef} src={radioData.streamUrl} preload="none" />

      {/* Floating Mini Radio Bar / Player */}
      <div className="fixed bottom-6 left-6 z-40 animate-in slide-in-from-bottom-3 duration-300">
        {isMinimized ? (
          <button
            onClick={() => setIsMinimized(false)}
            className="flex items-center space-x-2.5 px-4 py-2.5 rounded-full bg-slate-950 text-white border border-amber-500/40 shadow-2xl hover:border-amber-400 hover:scale-105 transition-all group"
            title="Louvri Radyo Nazaréen Damé"
          >
            <div className={`w-3 h-3 rounded-full ${isPlaying ? 'bg-emerald-400 animate-pulse' : 'bg-amber-400'}`} />
            <Radio className="w-4 h-4 text-amber-400 group-hover:rotate-12 transition-transform" />
            <span className="text-xs font-bold font-serif tracking-wide text-amber-300">
              {isPlaying ? 'Radyo ap Jwe...' : 'Radyo Nazaréen Damé'}
            </span>
            <span className="px-1.5 py-0.5 rounded text-[9px] font-bold bg-amber-500/20 text-amber-300 border border-amber-500/30">
              LIVE
            </span>
          </button>
        ) : (
          <div className="w-80 sm:w-96 rounded-3xl bg-slate-950 text-white border-2 border-amber-500/50 shadow-2xl p-5 space-y-4 backdrop-blur-xl">
            {/* Header */}
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <div className="flex items-center space-x-2">
                <div className="w-2.5 h-2.5 rounded-full bg-rose-500 animate-ping" />
                <span className="text-[10px] font-extrabold uppercase tracking-widest text-amber-400">
                  Difizyon Web 24/7
                </span>
              </div>
              <button
                onClick={() => setIsMinimized(true)}
                className="p-1 text-slate-400 hover:text-white rounded-lg hover:bg-slate-800 transition"
                title="Minimiser"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Station Title & Status */}
            <div>
              <h4 className="font-serif font-extrabold text-base text-white flex items-center space-x-2">
                <Radio className="w-4 h-4 text-amber-400" />
                <span>{radioData.stationName}</span>
              </h4>
              <p className="text-[11px] text-slate-400 mt-1 leading-snug">
                {radioData.tagline}
              </p>
            </div>

            {/* Controls */}
            <div className="flex items-center justify-between bg-slate-900 p-3 rounded-2xl border border-slate-800">
              <button
                onClick={togglePlay}
                className="px-5 py-2 rounded-xl text-xs font-bold bg-gradient-to-r from-amber-400 to-amber-500 text-slate-950 hover:brightness-110 shadow-lg shadow-amber-500/20 transition flex items-center space-x-2"
              >
                {isPlaying ? (
                  <>
                    <Pause className="w-4 h-4 fill-slate-950" />
                    <span>Poz</span>
                  </>
                ) : (
                  <>
                    <Play className="w-4 h-4 fill-slate-950" />
                    <span>Koute Radyo a</span>
                  </>
                )}
              </button>

              <button
                onClick={toggleMute}
                className="p-2 rounded-xl bg-slate-800 text-slate-300 hover:text-white hover:bg-slate-700 transition"
                title={isMuted ? 'Retire silans' : 'Mete silans'}
              >
                {isMuted ? <VolumeX className="w-4 h-4 text-rose-400" /> : <Volume2 className="w-4 h-4 text-amber-400" />}
              </button>
            </div>

            <p className="text-[10px] text-slate-500 text-center font-sans">
              Stream gratis ki fonksyone menm sou ti koneksyon entènèt mobil.
            </p>
          </div>
        )}
      </div>
    </>
  );
};
