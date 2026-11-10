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
      <div className="bg-[#FAF8F5] text-stone-900 rounded-2xl p-6 sm:p-8 border border-stone-200 shadow-sm max-w-4xl mx-auto my-6 animate-pulse">
        <div className="h-5 bg-stone-200 rounded w-1/3 mb-4"></div>
        <div className="h-4 bg-stone-100 rounded w-full mb-2"></div>
        <div className="h-4 bg-stone-100 rounded w-4/5"></div>
      </div>
    );
  }

  if (!verseData) return null;

  const currentVerse = isCreole ? verseData.verse_ht : verseData.verse_fr;
  const currentReflection = isCreole ? verseData.reflection_ht : verseData.reflection_fr;
  const currentPrayer = isCreole ? verseData.prayer_ht : verseData.prayer_fr;

  return (
    <section className="max-w-5xl mx-auto px-4 sm:px-6">
      <div className="bg-[#FAF8F5] text-stone-900 rounded-2xl p-6 sm:p-8 md:p-10 border border-stone-200 shadow-sm relative">
        <div className="space-y-6">
          {/* Header Row */}
          <div className="flex flex-wrap items-center justify-between gap-3 border-b border-stone-200 pb-3">
            <div>
              <p className="text-[11px] font-serif font-bold uppercase tracking-widest text-amber-800">
                {isCreole ? 'Manje Espirityèl Kominote a' : 'Nourriture Spirituelle Quotidienne'}
              </p>
              <h3 className="font-serif text-lg sm:text-xl font-bold text-stone-900 mt-0.5">
                {isCreole ? 'Vèsè Jounen an' : 'Verset & Méditation du Jour'}
              </h3>
            </div>

            <div className="flex items-center space-x-2">
              <button
                onClick={handleRefresh}
                disabled={refreshing}
                className="px-2.5 py-1.5 rounded-lg bg-white hover:bg-stone-50 text-stone-700 text-xs font-medium border border-stone-200 transition flex items-center space-x-1 shadow-2xs"
                title={isCreole ? 'Renouvle vèsè jounen an' : 'Actualiser le verset'}
              >
                <RefreshCw className={`w-3.5 h-3.5 text-stone-500 ${refreshing ? 'animate-spin' : ''}`} />
                <span className="hidden sm:inline">{refreshing ? '...' : (isCreole ? 'Renouvle' : 'Actualiser')}</span>
              </button>
            </div>
          </div>

          {/* Main Verse Content */}
          <div className="space-y-4">
            <div className="py-2">
              <blockquote className="font-serif text-lg sm:text-2xl md:text-3xl text-stone-900 font-normal leading-relaxed tracking-wide italic">
                « {currentVerse} »
              </blockquote>
              <div className="mt-3 flex items-center space-x-2 text-xs sm:text-sm font-serif font-bold text-amber-900">
                <span>— {verseData.reference}</span>
              </div>
            </div>

            {/* Reflection / Meditation */}
            {currentReflection && (
              <div className="bg-white border border-stone-200 rounded-xl p-4 sm:p-5 text-stone-800 text-xs sm:text-sm leading-relaxed space-y-1">
                <p className="text-amber-900 font-serif font-bold text-xs uppercase tracking-wider">
                  {isCreole ? 'Panse Espirityèl pou Jodi a :' : 'Pensée Pastorale du Jour :'}
                </p>
                <p className="text-stone-700 pt-0.5">
                  {currentReflection}
                </p>
              </div>
            )}

            {/* Prayer of the Day */}
            {currentPrayer && (
              <div className="bg-[#F5EFE6] border border-stone-200 rounded-xl p-3.5 sm:p-4 text-xs sm:text-sm text-stone-800">
                <p className="font-serif font-bold text-amber-950 text-xs uppercase tracking-wider mb-1">
                  {isCreole ? 'Lapriyè pou jodi a :' : 'Prière du jour :'}
                </p>
                <p className="italic text-stone-800">{currentPrayer}</p>
              </div>
            )}
          </div>

          {/* Footer Action Buttons: WhatsApp Share & Copy */}
          <div className="pt-2 border-t border-stone-200 flex flex-wrap items-center justify-between gap-3">
            <span className="text-[11px] text-stone-500">
              {isCreole 
                ? 'Pataje benediksyon sa a ak fanmi w ak zanmi w sou WhatsApp.' 
                : 'Partagez cette parole de bénédiction avec vos proches.'}
            </span>

            <div className="flex items-center space-x-2.5">
              <button
                onClick={handleCopy}
                className="px-3.5 py-2 rounded-lg bg-white hover:bg-stone-50 text-xs font-semibold text-stone-700 border border-stone-200 transition flex items-center space-x-1.5 shadow-xs"
              >
                {copied ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5 text-stone-600" />}
                <span>{copied ? (isCreole ? 'Kopye !' : 'Copié !') : (isCreole ? 'Kopye' : 'Copier')}</span>
              </button>

              <button
                onClick={handleShareWhatsApp}
                className="px-4 py-2 rounded-lg bg-emerald-700 hover:bg-emerald-800 text-white text-xs font-bold transition flex items-center space-x-2 shadow-sm"
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
