import React, { useState, useEffect } from 'react';
import { SEOHead } from '../components/SEOHead';
import { 
  BookOpen, 
  Share2, 
  Copy, 
  Check, 
  Users, 
  Sparkles, 
  Calendar, 
  MessageSquare, 
  Download, 
  Printer, 
  ChevronRight, 
  GraduationCap, 
  HelpCircle 
} from 'lucide-react';

interface Lesson {
  id: string;
  title: string;
  targetGroup: 'children' | 'youth' | 'adults' | 'teachers';
  weekDate: string;
  passage: string;
  memoryVerse: string;
  contentHtml: string;
  teacherNotes?: string;
  author: string;
  createdAt: string;
}

export const SundaySchoolResources: React.FC<{ onNavigate: (path: string) => void }> = ({ onNavigate }) => {
  const [lessons, setLessons] = useState<Lesson[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedGroup, setSelectedGroup] = useState<string>('all');
  const [selectedLesson, setSelectedLesson] = useState<Lesson | null>(null);
  const [copiedId, setCopiedId] = useState<string | null>(null);

  useEffect(() => {
    fetch('/api/lessons')
      .then(res => res.json())
      .then(data => {
        setLessons(data);
        if (data.length > 0) setSelectedLesson(data[0]);
      })
      .catch(err => console.warn('Erreur chargement leçons:', err))
      .finally(() => setLoading(false));
  }, []);

  const handleCopyLink = (lesson: Lesson) => {
    const url = `${window.location.origin}/leson-biblik#${lesson.id}`;
    navigator.clipboard.writeText(url);
    setCopiedId(lesson.id);
    setTimeout(() => setCopiedId(null), 2500);
  };

  const handleShareWhatsApp = (lesson: Lesson) => {
    const text = encodeURIComponent(
      `📖 *Leson Lekòl Dimanch – Église du Nazaréen de Damé*\n\n*Tit :* ${lesson.title}\n*Pasaj :* ${lesson.passage}\n*Vèsè pou memorize :* ${lesson.memoryVerse}\n\nLi leson an nèt isit : ${window.location.origin}/leson-biblik\n\n« Sainteté à l'Éternel »`
    );
    window.open(`https://api.whatsapp.com/send?text=${text}`, '_blank');
  };

  const filteredLessons = lessons.filter(l => {
    if (selectedGroup === 'all') return true;
    return l.targetGroup === selectedGroup;
  });

  return (
    <div className="space-y-12 pb-20">
      <SEOHead
        title="Leson Lekòl Dimanch & Resous Biblik | Église du Nazaréen de Damé"
        description="Resous ofisyèl pou monitè, timoun, jèn ak granmoun nan Lekòl Dimanch Église du Nazaréen de Damé. Etid biblik, vèsè pou memorize ak gid fòmasyon."
        path="/leson-biblik"
      />

      {/* Header */}
      <section className="bg-gradient-to-b from-[#071322] to-[#0b1b33] text-white py-16 px-4 border-b border-amber-500/20">
        <div className="max-w-4xl mx-auto text-center space-y-4">
          <div className="inline-flex items-center space-x-2 px-3.5 py-1 rounded-full bg-amber-500/10 border border-amber-400/30 text-amber-300 text-xs font-bold uppercase tracking-widest">
            <GraduationCap className="w-3.5 h-3.5" />
            <span>Edikasyon Kretyèn &amp; Fòmasyon Disip</span>
          </div>

          <h1 className="font-serif text-3xl sm:text-5xl font-extrabold text-white">
            Leson Lekòl Dimanch &amp; Resous Biblik
          </h1>

          <p className="text-slate-300 text-base sm:text-lg max-w-2xl mx-auto leading-relaxed">
            « Fòme timoun lan nan chemen li dwe swiv la; menm lè li vin gran li pap vire do ba li. » <span className="text-amber-400 italic font-serif">(Pwovèb 22:6)</span>
            <br />
            Resous pou tout fanmi an, monitè yo ak manm legliz la nan Damé.
          </p>

          {/* SHARE PAGE & GROUP FILTERS */}
          <div className="pt-2 flex flex-wrap items-center justify-center gap-3">
            <button
              onClick={() => {
                const url = window.location.href;
                const text = encodeURIComponent(
                  `📖 *Leson Lekòl Dimanch & Resous Biblik – Église du Nazaréen de Damé*\n\nDekouvri leson lekòl dimanch pou timoun, jèn ak granmoun, vèsè pou memorize ak resous monitè yo :\n${url}\n\n« Sainteté à l'Éternel »`
                );
                if (navigator.share) {
                  navigator.share({
                    title: 'Leson Lekòl Dimanch – Église du Nazaréen de Damé',
                    text: 'Resous biblik ak leson lekòl dimanch nan Damé, Haïti',
                    url: window.location.href
                  }).catch(() => {});
                } else {
                  window.open(`https://api.whatsapp.com/send?text=${text}`, '_blank');
                }
              }}
              className="px-5 py-2.5 rounded-xl text-xs font-bold bg-amber-500 text-slate-950 hover:bg-amber-400 transition flex items-center space-x-2 shadow-lg shadow-amber-500/20"
              title="Pataje paj sa a ak zanmi w sou WhatsApp oswa rezo sosyal"
            >
              <Share2 className="w-4 h-4" />
              <span>Pataje Paj Leson an (WhatsApp / Rezo)</span>
            </button>

            <button
              onClick={() => {
                navigator.clipboard.writeText(window.location.href);
                alert('Lyen paj la kopye ak siksè !');
              }}
              className="px-4 py-2.5 rounded-xl text-xs font-bold bg-slate-800 text-slate-200 hover:bg-slate-700 transition flex items-center space-x-2 border border-slate-700"
              title="Kopye lyen paj la"
            >
              <Copy className="w-3.5 h-3.5" />
              <span>Kopye Lyen Paj la</span>
            </button>
          </div>

          {/* Group Filter */}
          <div className="pt-3 flex flex-wrap items-center justify-center gap-2">
            {[
              { id: 'all', label: 'Tout Leson yo' },
              { id: 'adults', label: 'Granmoun' },
              { id: 'youth', label: 'Jeunesse (JNI)' },
              { id: 'children', label: 'Timoun' },
              { id: 'teachers', label: 'Gid Monitè' }
            ].map(tab => (
              <button
                key={tab.id}
                onClick={() => setSelectedGroup(tab.id)}
                className={`px-4 py-2 rounded-xl text-xs font-bold transition ${
                  selectedGroup === tab.id
                    ? 'bg-amber-500 text-slate-950 shadow-md'
                    : 'bg-slate-800 text-slate-300 hover:bg-slate-700'
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>
        </div>
      </section>

      {/* Main Content Area */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          
          {/* Lessons List Sidebar */}
          <div className="lg:col-span-4 space-y-4">
            <h3 className="font-serif font-bold text-slate-900 text-base border-b pb-2 flex items-center justify-between">
              <span>Lis Leson yo</span>
              <span className="text-xs text-amber-700 font-mono">{filteredLessons.length} disponib</span>
            </h3>

            <div className="space-y-3">
              {filteredLessons.map(lesson => {
                const isSelected = selectedLesson?.id === lesson.id;
                return (
                  <div
                    key={lesson.id}
                    onClick={() => setSelectedLesson(lesson)}
                    className={`p-4 rounded-2xl border transition-all cursor-pointer ${
                      isSelected
                        ? 'bg-amber-50 border-amber-500 shadow-sm ring-1 ring-amber-400'
                        : 'bg-white border-slate-200 hover:border-slate-300 hover:bg-slate-50'
                    }`}
                  >
                    <div className="flex items-center justify-between mb-1.5">
                      <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded bg-slate-100 text-slate-700">
                        {lesson.targetGroup}
                      </span>
                      <span className="text-[11px] text-slate-400 font-mono">
                        {lesson.weekDate}
                      </span>
                    </div>

                    <h4 className="font-serif font-bold text-slate-900 text-sm leading-snug">
                      {lesson.title}
                    </h4>

                    <p className="text-xs text-slate-500 mt-1 truncate">
                      {lesson.passage}
                    </p>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Active Lesson Viewer */}
          <div className="lg:col-span-8 bg-white rounded-3xl p-6 sm:p-10 shadow-xl border border-slate-200 space-y-6">
            {selectedLesson ? (
              <>
                {/* Lesson Header */}
                <div className="border-b border-slate-100 pb-6 space-y-4">
                  <div className="flex flex-wrap items-center justify-between gap-3">
                    <span className="px-3 py-1 rounded-full text-xs font-bold bg-amber-100 text-amber-800 border border-amber-300">
                      Lekòl Dimanch • {selectedLesson.targetGroup.toUpperCase()}
                    </span>
                    <span className="text-xs text-slate-400 font-mono">
                      Otè : {selectedLesson.author}
                    </span>
                  </div>

                  <h2 className="font-serif text-2xl sm:text-3xl font-extrabold text-slate-900 leading-tight">
                    {selectedLesson.title}
                  </h2>

                  {/* Passage & Memory Verse Highlight */}
                  <div className="p-4 rounded-2xl bg-amber-50/70 border border-amber-200 space-y-2">
                    <div className="text-xs font-bold text-amber-900 uppercase tracking-wide">
                      📖 Pasaj pou Li : <span className="font-mono">{selectedLesson.passage}</span>
                    </div>
                    {selectedLesson.memoryVerse && (
                      <p className="text-xs font-serif italic text-slate-800 leading-relaxed bg-white p-3 rounded-xl border border-amber-200">
                        {selectedLesson.memoryVerse}
                      </p>
                    )}
                  </div>
                </div>

                {/* Lesson HTML Content */}
                <div 
                  className="prose prose-slate max-w-none text-xs sm:text-sm leading-relaxed"
                  dangerouslySetInnerHTML={{ __html: selectedLesson.contentHtml }}
                />

                {/* Teacher Notes */}
                {selectedLesson.teacherNotes && (
                  <div className="p-5 rounded-2xl bg-slate-900 text-white space-y-2 border border-amber-500/30">
                    <div className="flex items-center space-x-2 text-amber-400 font-bold text-xs uppercase tracking-wider">
                      <GraduationCap className="w-4 h-4" />
                      <span>Nòt Espesyal pou Monitè / Pwofesè a</span>
                    </div>
                    <p className="text-xs text-slate-300 leading-relaxed font-sans">
                      {selectedLesson.teacherNotes}
                    </p>
                  </div>
                )}

                {/* SHARE & ACTIONS BUTTONS */}
                <div className="pt-6 border-t border-slate-100 flex flex-wrap items-center justify-between gap-4">
                  <div className="flex flex-wrap items-center gap-2">
                    {/* Share on WhatsApp */}
                    <button
                      onClick={() => handleShareWhatsApp(selectedLesson)}
                      className="px-4 py-2 rounded-xl text-xs font-bold bg-emerald-600 text-white hover:bg-emerald-700 transition flex items-center space-x-2 shadow-sm"
                      title="Pataje leson an sou WhatsApp"
                    >
                      <MessageSquare className="w-3.5 h-3.5" />
                      <span>Pataje sou WhatsApp</span>
                    </button>

                    {/* Copy Link Button */}
                    <button
                      onClick={() => handleCopyLink(selectedLesson)}
                      className="px-4 py-2 rounded-xl text-xs font-bold bg-slate-100 text-slate-800 hover:bg-slate-200 transition flex items-center space-x-2"
                      title="Kopye lyen leson an"
                    >
                      {copiedId === selectedLesson.id ? (
                        <>
                          <Check className="w-3.5 h-3.5 text-emerald-600" />
                          <span>Lyen Kopye !</span>
                        </>
                      ) : (
                        <>
                          <Copy className="w-3.5 h-3.5" />
                          <span>Kopye Lyen an</span>
                        </>
                      )}
                    </button>

                    {/* Print Lesson */}
                    <button
                      onClick={() => window.print()}
                      className="px-4 py-2 rounded-xl text-xs font-bold bg-slate-100 text-slate-700 hover:bg-slate-200 transition flex items-center space-x-2"
                      title="Enprime leson an"
                    >
                      <Printer className="w-3.5 h-3.5" />
                      <span>Enprime</span>
                    </button>
                  </div>

                  <button
                    onClick={() => onNavigate('/evenements')}
                    className="text-xs font-bold text-amber-700 hover:text-amber-800 transition flex items-center space-x-1"
                  >
                    <span>Orè Lekòl Dimanch (07h00) ›</span>
                  </button>
                </div>
              </>
            ) : (
              <div className="py-20 text-center text-slate-500">
                <BookOpen className="w-10 h-10 text-slate-300 mx-auto mb-2" />
                <p className="text-sm font-semibold">Chwazi yon leson pou li l.</p>
              </div>
            )}
          </div>

        </div>
      </section>
    </div>
  );
};
