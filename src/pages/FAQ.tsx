import React, { useState } from 'react';
import { SEOHead } from '../components/SEOHead';
import { 
  HelpCircle, 
  ChevronDown, 
  Search, 
  MessageSquare, 
  BookOpen, 
  Church, 
  Heart, 
  ShieldCheck 
} from 'lucide-react';

interface FAQItem {
  id: string;
  category: 'doctrinal' | 'membership' | 'sacraments' | 'social';
  question: string;
  answer: string;
}

const FAQ_DATA: FAQItem[] = [
  {
    id: 'faq-1',
    category: 'membership',
    question: 'Kijan pou yon moun vin manm ofisyèl nan Église du Nazaréen de Damé ?',
    answer: 'Pou vin manm ofisyèl, ou dwe : 1) Fè konfesyon pèsonèl lafwa w nan Jezi Kris kòm Mèt ak Sovè w; 2) Resevwa batèm biblik pa imèsyon nan dlo; 3) Suiv klas disipila ak manm kote ou aprann doktrin Nazaréen yo; 4) Resevwa vòt akeyi asanble a devan Pasteur Bequel CHERELUS ak konsèy legliz la.'
  },
  {
    id: 'faq-2',
    category: 'doctrinal',
    question: 'Kisa deviz « Sainteté à l’Éternel » (Sentite pou Letènèl) la vle di ?',
    answer: 'Deviz sa a sòti nan Egzòd 28:36 ak 1 Tesalonisyen 5:23. Legliz Nazaréen an kwè fèm nan doktrin Sanktifikasyon Total (Entire Sanctification). Se aksyon Lespri Sen an ki pirifye kè kwayan an anba peche orijinal la, epi ki ranpli li ak yon lanmou pafè pou Bondye ak pou pwochen li, pou li viv yon lavi sen chak jou.'
  },
  {
    id: 'faq-3',
    category: 'sacraments',
    question: 'Kijan pou m fè dedikas yon ti bebe oswa resevwa batèm ?',
    answer: 'Pou dedikas timoun : paran yo dwe kontakte sekretarya a oswa Pasteur Bequel CHERELUS pou planifye seremoni an pandan yon kil Dimanch (espesyalman 4èm Dimanch ki konsakre pou Timoun). Pou batèm pa imèsyon : kandida a dwe fin pase nan klas fòmasyon batèm pou konprann angajman lafwa li.'
  },
  {
    id: 'faq-4',
    category: 'sacraments',
    question: 'Ki etap ak kondisyon pou yon maryaj kretyen fèt nan legliz la ?',
    answer: 'Fidèl yo dwe rankontre Pasteur Bequel CHERELUS omwen 3 a 6 mwa anvan dat maryaj la pou kòmanse seyans konsèy pre-matrimonyal. Tou de fiyanse yo dwe ranpli fòmilè eta sivil epi montre yon temwayaj kretyen ki onore Bondye.'
  },
  {
    id: 'faq-5',
    category: 'social',
    question: 'Ki wòl pwojè CDEJ HA 0926 Compassion International jwe nan Damé ?',
    answer: 'CDEJ HA 0926 se branch sosyal ak devlopman holistik legliz la an patenarya avèk Compassion International. Li sipòte plizyè santèn timoun vilnerab nan kominote Damé a nan bay yo manje nourisan, swen sante medikal, fòmasyon biblik, kaye lekòl ak fòmasyon pwofesyonèl pou libere yo anba povrete.'
  },
  {
    id: 'faq-6',
    category: 'membership',
    question: 'Kijan pou m voye yon ofrann oswa yon demann priyè sekrè ?',
    answer: 'Pou demann priyè : ou ka itilize paj « Espas Priyè Sekrè » sou sit la. Lè w koche « Sekrè Pastoral », se sèlman Pasteur Bequel CHERELUS ki wè li. Pou ofrann ak donasyon : ou ka kontakte sekretarya a pa telefòn oswa WhatsApp sou +509 48596089 pou kowòdone MonCash, Natcash oswa transfè dirèk.'
  },
  {
    id: 'faq-7',
    category: 'doctrinal',
    question: 'Kijan pou m jwenn legliz la nan 3èm Seksyon Damé ?',
    answer: 'Legliz la sitiye nan 3èm Seksyon Damé, Komin Mòl Sen Nikola nan Depatman Nòdwès Haïti. Ou ka klike sou lyen ofisyèl Google Maps sou paj Kontak nou an (https://share.google/9kpd149ZpzHWNxOXI) pou jwenn kowòdone GPS egzat yo.'
  }
];

export const FAQ: React.FC<{ onNavigate: (path: string) => void }> = ({ onNavigate }) => {
  const [search, setSearch] = useState('');
  const [openIds, setOpenIds] = useState<Set<string>>(new Set(['faq-1', 'faq-2']));

  const toggle = (id: string) => {
    setOpenIds(prev => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  const filtered = FAQ_DATA.filter(item => {
    if (!search.trim()) return true;
    const q = search.toLowerCase();
    return item.question.toLowerCase().includes(q) || item.answer.toLowerCase().includes(q);
  });

  return (
    <div className="space-y-12 pb-20">
      <SEOHead
        title="Kesyon yo Poze Souvan (FAQ) | Église du Nazaréen de Damé"
        description="Jwenn repons pou kesyon sou doktrin santifikasyon, kijan pou vin manm, batèm, dedikas timoun, maryaj biblik ak pwojè CDEJ HA 0926 nan Damé."
        path="/faq"
      />

      <section className="bg-gradient-to-b from-[#071322] to-[#0b1b33] text-white py-16 px-4 border-b border-amber-500/20">
        <div className="max-w-4xl mx-auto text-center space-y-4">
          <div className="inline-flex items-center space-x-2 px-3.5 py-1 rounded-full bg-amber-500/10 border border-amber-400/30 text-amber-300 text-xs font-bold uppercase tracking-widest">
            <HelpCircle className="w-3.5 h-3.5" />
            <span>Fwa &amp; Pratik Ecclésiale</span>
          </div>

          <h1 className="font-serif text-3xl sm:text-5xl font-extrabold text-white">
            Kesyon yo Poze Souvan (FAQ)
          </h1>

          <p className="text-slate-300 text-base sm:text-lg max-w-2xl mx-auto leading-relaxed">
            Tout sa ou bezwen konnen sou doktrin, sèvis, sakreman ak lavi kominotè nan Église du Nazaréen de Damé.
          </p>

          <div className="max-w-md mx-auto relative pt-4">
            <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-7" />
            <input
              type="text"
              placeholder="Chèche yon kesyon (batèm, manm, sentite...)"
              value={search}
              onChange={e => setSearch(e.target.value)}
              className="w-full pl-10 pr-4 py-2.5 rounded-2xl bg-white text-slate-900 text-xs border border-amber-500/40 focus:outline-none focus:ring-2 focus:ring-amber-400 shadow-md"
            />
          </div>
        </div>
      </section>

      <section className="max-w-4xl mx-auto px-4 sm:px-6">
        <div className="space-y-4">
          {filtered.map(item => {
            const isOpen = openIds.has(item.id);
            return (
              <div
                key={item.id}
                className="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-sm transition hover:border-amber-400"
              >
                <button
                  type="button"
                  onClick={() => toggle(item.id)}
                  className="w-full p-5 text-left flex items-center justify-between gap-4 focus:outline-none"
                >
                  <span className="font-serif font-bold text-slate-900 text-sm sm:text-base leading-snug">
                    {item.question}
                  </span>
                  <ChevronDown className={`w-4 h-4 text-amber-500 flex-shrink-0 transition-transform ${isOpen ? 'rotate-180' : ''}`} />
                </button>

                {isOpen && (
                  <div className="px-5 pb-5 pt-1 text-xs sm:text-sm text-slate-600 leading-relaxed border-t border-slate-100 bg-slate-50/60 font-sans">
                    {item.answer}
                  </div>
                )}
              </div>
            );
          })}
        </div>

        {/* Contact pastoral callout */}
        <div className="mt-12 bg-slate-900 text-white p-8 rounded-3xl border border-amber-500/30 text-center space-y-4">
          <h3 className="font-serif font-bold text-xl text-amber-300">
            Ou gen yon lòt kesyon pèsonèl ?
          </h3>
          <p className="text-xs text-slate-300 max-w-lg mx-auto">
            Pasteur Bequel CHERELUS ak ekip konsèy pastoral la toujou la pou koute w ak renmen Kris la.
          </p>
          <a
            href="https://wa.me/50948596089"
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center space-x-2 px-6 py-3 rounded-xl text-xs font-bold bg-emerald-600 text-white hover:bg-emerald-700 transition shadow-lg shadow-emerald-600/20"
          >
            <MessageSquare className="w-4 h-4" />
            <span>Poze Pasteur Bequel Yon Kesyon sou WhatsApp</span>
          </a>
        </div>
      </section>
    </div>
  );
};
