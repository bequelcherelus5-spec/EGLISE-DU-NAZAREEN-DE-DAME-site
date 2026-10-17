import React, { useState } from 'react';
import { SEOHead } from '../components/SEOHead';
import { 
  BookOpen, 
  Calendar, 
  Share2, 
  Sparkles, 
  Heart, 
  MessageSquare, 
  Copy, 
  Check, 
  Sun, 
  BookmarkCheck 
} from 'lucide-react';

const DAILY_READINGS = [
  {
    day: 'Lendi',
    verseText: '« Pawòl ou se yon lanp ki klere pye m, yon limyè sou chemen mwen. »',
    verseRef: 'Sòm 119:105',
    ot: 'Jenèz 1 - 3',
    nt: 'Matye 1',
    psalm: 'Sòm 1',
    meditation: 'Kòmanse semèn nan ak kreyasyon an ak limyè Pawòl Bondye a. Kèlkeswa fènwa ou rankontre, Pawòl Jezi se limyè ki pap janm etenn.',
    prayer: 'Senyè, gide tout etap mwen jodi a. Fè lavi m klere pou kominote Damé a.'
  },
  {
    day: 'Madi',
    verseText: '« Menm jan Bondye ki te rele nou an sen, se pou nou menm tou nou sen nan tout konduit nou. »',
    verseRef: '1 Pyè 1:15',
    ot: 'Levitik 19:1-18',
    nt: '1 Pyè 1',
    psalm: 'Sòm 15',
    meditation: 'Sanktifikasyon se kè mesaj Nazaréen an. Se pa fòs kouray pa nou, se Gras Lespri Sen an ki ban nou pouvwa pou nou renmen jan Jezi te renmen.',
    prayer: 'Lespri Sen, pirifye kè m epi ban m fòs pou m viv yon lavi ki fè Bondye plezi.'
  },
  {
    day: 'Mèkredi',
    verseText: '« Pa enkyete nou pou anyen. Men, nan tout sikonstans, mande Bondye sa nou bezwen nan lapriyè ak siplikasyon, ansanm ak aksyon de gras. »',
    verseRef: 'Filipyen 4:6',
    ot: 'Ezayi 40:27-31',
    nt: 'Filipyen 4',
    psalm: 'Sòm 23',
    meditation: 'Bondye konnen tout bezwen fanmi w nan Damé. Lage tout fado w nan pye Jezi jodi a, lapè Bondye ki depase tout konpreyansyon ap kenbe kè w.',
    prayer: 'Papa, mwen remèt ou tout fado mwen ak fanmi mwen. Mwen mete lafwa m nan fidelite w.'
  },
  {
    day: 'Jedi',
    verseText: '« Mwen se pye rezen an, nou se branch yo. Moun ki rete nan mwen, epi mwen rete nan li, se li ki pote anpil fwi. »',
    verseRef: 'Jan 15:5',
    ot: 'Detewonòm 6:1-9',
    nt: 'Jan 15',
    psalm: 'Sòm 19',
    meditation: 'Konekte ak Jezi chak moman. Lè nou rete atache nan branch la, nou pap janm cheche menm nan sezon difisil.',
    prayer: 'Mèt Jezi, kenbe m kole nan ou pou lavi m ka pote bèl fwi lespri a.'
  },
  {
    day: 'Vandredi',
    verseText: '« Paske Bondye tèlman renmen lemonn, Li te bay sèl Pitit Li a, pou nenpòt moun ki kwè nan Li pa peri, men pou l gen lavi ki p ap janm fini an. »',
    verseRef: 'Jan 3:16',
    ot: 'Ezayi 53',
    nt: 'Romains 5:1-11',
    psalm: 'Sòm 22',
    meditation: 'Kwa Kalvè a se pi gwo prèv lanmou Bondye. Pa gen anyen ki ka separe nou ak lanmou Kris la.',
    prayer: 'Mèsi Jezi pou san ou ki te koule pou padon peche m ak gerizon mwen.'
  },
  {
    day: 'Samdi',
    verseText: '« Kijan yon jennonm ka kenbe chemen li pwòp ? Se lè li obeyi pawòl ou. »',
    verseRef: 'Sòm 119:9',
    ot: 'Pwovèb 3:1-12',
    nt: '1 Timote 4',
    psalm: 'Sòm 119:9-16',
    meditation: 'Jodi a se jou rasanbleman Jeunesse Nazaréenne (JNI) nan Damé a 15h00. Se yon apèl pou jèn yo kenbe entegrite yo nan Kris la.',
    prayer: 'Beni tout jèn legliz la nan Damé, mete krentif pou non w nan kè yo.'
  },
  {
    day: 'Dimanch',
    verseText: '« Mwen te kontan lè yo te di m : Ann ale nan kay Senyè a ! »',
    verseRef: 'Sòm 122:1',
    ot: 'Sòm 100',
    nt: 'Ebre 10:19-25',
    psalm: 'Sòm 84',
    meditation: 'Gran jou adorasyon an rive nan tanp Damé a (07h00 Lekòl Dimanch, 08h00 Grand Culte). Vini ak rekonesans nan kè w !',
    prayer: 'Senyè, desann prezans ou sou asanble a jodi a, touche chak kè k ap adore w.'
  }
];

export const DailyBibleReading: React.FC<{ onNavigate: (path: string) => void }> = ({ onNavigate }) => {
  const currentDayIndex = new Date().getDay(); // 0 is Sunday, 1 Monday...
  const mappedIndex = currentDayIndex === 0 ? 6 : currentDayIndex - 1;
  const [selectedDayIndex, setSelectedDayIndex] = useState<number>(mappedIndex);
  const [copied, setCopied] = useState(false);

  const activeReading = DAILY_READINGS[selectedDayIndex] || DAILY_READINGS[0];

  const handleShareWhatsApp = () => {
    const text = encodeURIComponent(
      `📖 *Vèsè & Lekti Biblik Jounen an – Église du Nazaréen de Damé*\n\n« ${activeReading.verseText} »\n*${activeReading.verseRef}*\n\n*Lekti pou jodi a :*\n• Ansyen Testaman : ${activeReading.ot}\n• Nouvo Testaman : ${activeReading.nt}\n• Sòm : ${activeReading.psalm}\n\n*Refleksyon :* ${activeReading.meditation}\n\nSuiv plan lekti biblik la sou sit ofisyèl la : ${window.location.origin}/lekti-biblik\n\n« Sainteté à l'Éternel »`
    );
    window.open(`https://api.whatsapp.com/send?text=${text}`, '_blank');
  };

  const handleCopy = () => {
    navigator.clipboard.writeText(`« ${activeReading.verseText} » — ${activeReading.verseRef}`);
    setCopied(true);
    setTimeout(() => setCopied(false), 2500);
  };

  return (
    <div className="space-y-12 pb-20">
      <SEOHead
        title="Plakfòm Lekti Biblik Chak Jou & Vèsè Jounen an | Damé"
        description="Medite sou Pawòl Bondye a chak jou ak plan lekti biblik ofisyèl Église du Nazaréen de Damé. Vèsè jounen an, kòmantè espirityèl ak priyè."
        path="/lekti-biblik"
      />

      <section className="bg-gradient-to-b from-[#071322] to-[#0b1b33] text-white py-16 px-4 border-b border-amber-500/20">
        <div className="max-w-4xl mx-auto text-center space-y-4">
          <div className="inline-flex items-center space-x-2 px-3.5 py-1 rounded-full bg-amber-500/10 border border-amber-400/30 text-amber-300 text-xs font-bold uppercase tracking-widest">
            <Sun className="w-3.5 h-3.5" />
            <span>Medite Pawòl la Chak Jou</span>
          </div>

          <h1 className="font-serif text-3xl sm:text-5xl font-extrabold text-white">
            Plan Lekti Biblik &amp; Vèsè Jounen an
          </h1>

          <p className="text-slate-300 text-base sm:text-lg max-w-2xl mx-auto leading-relaxed">
            Nouriti espirityèl pou chak manm legliz la ak tout fanmi nan 3èm Seksyon Damé.
          </p>

          {/* Days buttons */}
          <div className="pt-4 flex flex-wrap items-center justify-center gap-2">
            {DAILY_READINGS.map((r, idx) => (
              <button
                key={r.day}
                onClick={() => setSelectedDayIndex(idx)}
                className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition ${
                  selectedDayIndex === idx
                    ? 'bg-amber-500 text-slate-950 shadow-md'
                    : 'bg-slate-800 text-slate-300 hover:bg-slate-700'
                }`}
              >
                {r.day}
              </button>
            ))}
          </div>
        </div>
      </section>

      <section className="max-w-4xl mx-auto px-4 sm:px-6">
        <div className="bg-white rounded-3xl p-6 sm:p-10 shadow-xl border border-slate-200 space-y-8">
          
          {/* Verset du Jour Banner */}
          <div className="p-6 sm:p-8 rounded-3xl bg-gradient-to-br from-amber-50 via-amber-100/50 to-amber-50 border-2 border-amber-300/80 space-y-3 relative overflow-hidden">
            <div className="flex items-center justify-between">
              <span className="text-[11px] font-bold uppercase tracking-wider text-amber-900 bg-amber-200/60 px-3 py-1 rounded-full">
                Vèsè pou {activeReading.day}
              </span>
              <div className="flex items-center space-x-2">
                <button
                  onClick={handleCopy}
                  className="p-1.5 rounded-lg bg-white/80 hover:bg-white text-slate-700 text-xs flex items-center space-x-1 border border-amber-300"
                  title="Kopye vèsè a"
                >
                  {copied ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
                  <span className="text-[11px]">{copied ? 'Kopye !' : 'Kopye'}</span>
                </button>
                <button
                  onClick={handleShareWhatsApp}
                  className="p-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white text-xs flex items-center space-x-1 shadow-sm"
                  title="Pataje sou WhatsApp"
                >
                  <MessageSquare className="w-3.5 h-3.5" />
                  <span className="text-[11px]">Pataje</span>
                </button>
              </div>
            </div>

            <p className="font-serif text-xl sm:text-2xl font-bold text-slate-900 italic leading-relaxed pt-2">
              {activeReading.verseText}
            </p>

            <p className="text-right font-serif font-bold text-amber-900 text-sm">
              — {activeReading.verseRef}
            </p>
          </div>

          {/* Plan Lekti pou jodi a */}
          <div className="space-y-4">
            <h3 className="font-serif font-bold text-xl text-slate-900 flex items-center space-x-2">
              <BookmarkCheck className="w-5 h-5 text-amber-500" />
              <span>Chapit pou Li Jodi a ({activeReading.day})</span>
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 space-y-1">
                <span className="text-[10px] font-bold uppercase text-slate-500">Ansyen Testaman</span>
                <p className="font-serif font-bold text-slate-900 text-base">{activeReading.ot}</p>
              </div>

              <div className="p-4 rounded-2xl bg-amber-50 border border-amber-200 space-y-1">
                <span className="text-[10px] font-bold uppercase text-amber-800">Nouvo Testaman</span>
                <p className="font-serif font-bold text-slate-900 text-base">{activeReading.nt}</p>
              </div>

              <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 space-y-1">
                <span className="text-[10px] font-bold uppercase text-slate-500">Sòm &amp; Pwovèb</span>
                <p className="font-serif font-bold text-slate-900 text-base">{activeReading.psalm}</p>
              </div>
            </div>
          </div>

          {/* Méditation & Prière */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-4 border-t border-slate-100">
            <div className="p-5 rounded-2xl bg-slate-900 text-white space-y-2 border border-amber-500/30">
              <span className="text-xs font-bold uppercase tracking-wider text-amber-400 block">
                Refleksyon Espirityèl
              </span>
              <p className="text-xs text-slate-300 leading-relaxed font-sans">
                {activeReading.meditation}
              </p>
            </div>

            <div className="p-5 rounded-2xl bg-slate-50 border border-slate-200 space-y-2">
              <span className="text-xs font-bold uppercase tracking-wider text-slate-700 block">
                Priyè pou Jounen an
              </span>
              <p className="text-xs text-slate-600 leading-relaxed italic font-serif">
                « {activeReading.prayer} »
              </p>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};
