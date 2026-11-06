import React, { useState, useEffect } from 'react';
import { dailyVerseService, DailyVerseData } from '../services/dailyVerseService';
import { useLanguage } from '../context/LanguageContext';
import { 
  BookOpen, 
  Sparkles, 
  Share2, 
  Copy, 
  Check, 
  RefreshCw, 
  Heart, 
  Quote, 
  Send,
  MessageCircle
} from 'lucide-react';

export const DailyVerseWidget: React.FC = () => {
  const { currentLang } = useLanguage();
  const [verseData, setVerseData] = useState<DailyVerseData | null>(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [copied, setCopied] = useState(false);

  const isCreole = currentLang === 'ht';

  useEffect(() => {
    dailyVerseService.getDailyVerse()
      .then(data => setVerseData(data))
      .catch(err => console.warn(err))
      .finally(() => setLoading(false));
  }, []);

  const handleRefresh = async () => {
    setRefreshing(true);
    try {
      const updated = await dailyVerseService.refreshDailyVerse();
      setVerseData(updated);
    } catch (err) {
      console.warn(err);
    } finally {
      setRefreshing(false);
    }
  };

  const handleCopy = () => {
    if (!verseData) return;
    const textToCopy = isCreole
      ? `📖 Vèsè Jounen an - Église du Nazaréen de Damé\n\n"${verseData.verse_ht}"\n— ${verseData.reference}\n\n💡 Meditasyon : ${verseData.reflection_ht}\n\n🙏 Lapriyè : ${verseData.prayer_ht}\n\n🌐 https://www.eglisedunazareendedame.org`
      : `📖 Verset du Jour - Église du Nazaréen de Damé\n\n"${verseData.verse_fr}"\n— ${verseData.reference}\n\n💡 Méditation : ${verseData.reflection_fr}\n\n🙏 Prière : ${verseData.prayer_fr}\n\n🌐 https://www.eglisedunazareendedame.org`;

    navigator.clipboard.writeText(textToCopy);
    setCopied(true);
    setTimeout(() => setCopied(false), 2500);
  };

  const handleShareWhatsApp = () => {
    if (!verseData) return;
    const shareText = isCreole
      ? `📖 *VÈSÈ JOUNEN AN - Legliz Nazaréen Damé*\n\n"${verseData.verse_ht}"\n— *${verseData.reference}*\n\n💡 *Meditasyon :* ${verseData.reflection_ht}\n\n🙏 *Lapriyè :* ${verseData.prayer_ht}\n\n👉 Swiv kilt ak pwojè nou yo sou : https://www.eglisedunazareendedame.org`
      : `📖 *VERSET DU JOUR - Église du Nazaréen de Damé*\n\n"${verseData.verse_fr}"\n— *${verseData.reference}*\n\n💡 *Méditation :* ${verseData.reflection_fr}\n\n🙏 *Prière :* ${verseData.prayer_fr}\n\n👉 Retrouvez nos cultes et projets sur : https://www.eglisedunazareendedame.org`;

    const encoded = encodeURIComponent(shareText);
    const url = `https://api.whatsapp.com/send?text=${encoded}`;
    window.open(url, '_blank');
  };

  if (loading) {
    return (
      <div className="bg-gradient-to-br from-[#071322] via-[#0b1b33] to-[#112442] text-white rounded-3xl p-6 sm:p-8 border border-amber-500/30 shadow-xl max-w-4xl mx-auto my-6 animate-pulse">
        <div className="h-6 bg-amber-500/20 rounded w-1/3 mb-4"></div>
        <div className="h-4 bg-slate-700 rounded w-full mb-2"></div>
        <div className="h-4 bg-slate-700 rounded w-4/5"></div>
      </div>
    );
  }

  if (!verseData) return null;

  const currentVerse = isCreole ? verseData.verse_ht : verseData.verse_fr;
  const currentReflection = isCreole ? verseData.reflection_ht : verseData.reflection_fr;
  const currentPrayer = isCreole ? verseData.prayer_ht : verseData.prayer_fr;

  return (
    <section className="max-w-5xl mx-auto px-4 sm:px-6">
      <div className="relative bg-gradient-to-br from-[#071322] via-[#0b1b33] to-[#112442] text-white rounded-3xl p-6 sm:p-8 md:p-10 border border-amber-500/30 shadow-2xl overflow-hidden group">
        {/* Ambient background glow */}
        <div className="absolute top-0 right-0 -mr-16 -mt-16 w-64 h-64 bg-amber-500/10 rounded-full blur-3xl pointer-events-none"></div>
        <div className="absolute bottom-0 left-0 -ml-16 -mb-16 w-64 h-64 bg-blue-500/10 rounded-full blur-3xl pointer-events-none"></div>

        <div className="relative z-10 space-y-6">
          {/* Header Row */}
          <div className="flex flex-wrap items-center justify-between gap-3 border-b border-amber-500/20 pb-4">
            <div className="flex items-center space-x-2.5">
              <div className="w-8 h-8 rounded-full bg-amber-500/20 border border-amber-400/40 flex items-center justify-center text-amber-300">
                <BookOpen className="w-4 h-4" />
              </div>
              <div>
                <span className="text-[10px] sm:text-xs font-bold uppercase tracking-widest text-amber-400">
                  {isCreole ? 'Manje Espirityèl Kominote a' : 'Nourriture Spirituelle Quotidienne'}
                </span>
                <h3 className="font-serif text-lg sm:text-xl font-black text-white flex items-center gap-1.5">
                  <span>{isCreole ? 'Vèsè Jounen an (Chak 24 Tan)' : 'Verset & Méditation du Jour'}</span>
                  <Sparkles className="w-4 h-4 text-amber-400" />
                </h3>
              </div>
            </div>

            <div className="flex items-center space-x-2">
              <button
                onClick={handleRefresh}
                disabled={refreshing}
                className="px-2.5 py-1.5 rounded-xl bg-slate-800/80 hover:bg-slate-700 text-slate-300 text-xs font-medium border border-slate-700 transition flex items-center space-x-1"
                title={isCreole ? 'Renouvle vèsè jounen an' : 'Actualiser le verset'}
              >
                <RefreshCw className={`w-3.5 h-3.5 text-amber-400 ${refreshing ? 'animate-spin' : ''}`} />
                <span className="hidden sm:inline">{refreshing ? '...' : (isCreole ? 'Renouvle' : 'Actualiser')}</span>
              </button>
            </div>
          </div>

          {/* Main Verse Content */}
          <div className="space-y-4">
            <div className="relative pl-6 sm:pl-8 border-l-4 border-amber-400">
              <Quote className="w-6 h-6 text-amber-400/40 absolute -top-2 left-1 -translate-x-full" />
              <p className="font-serif text-lg sm:text-2xl md:text-3xl text-amber-100 font-bold leading-relaxed tracking-wide italic">
                « {currentVerse} »
              </p>
              <div className="mt-2 flex items-center space-x-2">
                <span className="text-xs sm:text-sm font-bold uppercase tracking-wider text-amber-400 bg-amber-500/20 px-3 py-1 rounded-full border border-amber-400/30">
                  {verseData.reference}
                </span>
              </div>
            </div>

            {/* Reflection / Meditation */}
            {currentReflection && (
              <div className="bg-slate-900/80 border border-slate-800 rounded-2xl p-4 sm:p-5 text-slate-200 text-xs sm:text-sm leading-relaxed space-y-1.5">
                <div className="flex items-center space-x-1.5 text-amber-400 font-bold text-xs uppercase tracking-wider">
                  <Sparkles className="w-3.5 h-3.5" />
                  <span>{isCreole ? 'Panse Espirityèl pou Jodi a :' : 'Pensée Pastorale du Jour :'}</span>
                </div>
                <p className="text-slate-300">
                  {currentReflection}
                </p>
              </div>
            )}

            {/* Prayer of the Day */}
            {currentPrayer && (
              <div className="bg-amber-500/10 border border-amber-500/20 rounded-2xl p-3.5 sm:p-4 text-xs sm:text-sm flex items-start space-x-3 text-amber-200">
                <Heart className="w-4 h-4 text-amber-400 flex-shrink-0 mt-0.5" />
                <div>
                  <strong className="text-amber-300 mr-1.5">{isCreole ? 'Lapriyè pou jodi a :' : 'Prière du jour :'}</strong>
                  <span className="italic">{currentPrayer}</span>
                </div>
              </div>
            )}
          </div>

          {/* Footer Action Buttons: WhatsApp Share & Copy */}
          <div className="pt-2 border-t border-slate-800 flex flex-wrap items-center justify-between gap-3">
            <span className="text-[11px] text-slate-400">
              {isCreole 
                ? 'Pataje benediksyon sa a ak fanmi w ak zanmi w sou WhatsApp.' 
                : 'Partagez cette parole de bénédiction avec vos proches.'}
            </span>

            <div className="flex items-center space-x-2.5">
              <button
                onClick={handleCopy}
                className="px-3.5 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-xs font-bold text-slate-200 border border-slate-700 transition flex items-center space-x-1.5 shadow-sm"
              >
                {copied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                <span>{copied ? (isCreole ? 'Kopye !' : 'Copié !') : (isCreole ? 'Kopye' : 'Copier')}</span>
              </button>

              <button
                onClick={handleShareWhatsApp}
                className="px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-black transition flex items-center space-x-2 shadow-md shadow-emerald-900/30 hover:scale-105"
                title={isCreole ? 'Pataje sou WhatsApp Status oswa nan yon gwoup' : 'Partager sur WhatsApp'}
              >
                <MessageCircle className="w-4 h-4 fill-current" />
                <span>{isCreole ? 'Pataje sou WhatsApp' : 'Partager sur WhatsApp'}</span>
              </button>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};
