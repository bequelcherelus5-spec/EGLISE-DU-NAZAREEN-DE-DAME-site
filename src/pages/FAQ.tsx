import React, { useState, useEffect } from 'react';
import { SEOHead } from '../components/SEOHead';
import { 
  HelpCircle, 
  ChevronDown, 
  Search, 
  MessageSquare, 
  BookOpen, 
  Church, 
  Heart, 
  ShieldCheck,
  Loader2,
  Sparkles
} from 'lucide-react';
import { faqService, FAQItem } from '../services/faqService';

export const FAQ: React.FC<{ onNavigate: (path: string) => void }> = ({ onNavigate }) => {
  const [faqs, setFaqs] = useState<FAQItem[]>([]);
  const [customHtml, setCustomHtml] = useState<string>('');
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [categoryFilter, setCategoryFilter] = useState<string>('all');
  const [openIds, setOpenIds] = useState<Set<string>>(new Set(['faq-1', 'faq-2']));

  const loadFaqs = async () => {
    try {
      const data = await faqService.getFAQs();
      setFaqs(data);
      setCustomHtml(faqService.getCustomHtml());
    } catch {
      // Ignorer
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadFaqs();
    const handleUpdate = () => loadFaqs();
    window.addEventListener('faq-updated', handleUpdate);
    return () => window.removeEventListener('faq-updated', handleUpdate);
  }, []);

  const toggle = (id: string) => {
    setOpenIds(prev => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  const filtered = faqs.filter(item => {
    const matchCat = categoryFilter === 'all' || item.category === categoryFilter;
    if (!matchCat) return false;
    if (!search.trim()) return true;
    const q = search.toLowerCase();
    return item.question.toLowerCase().includes(q) || item.answer.toLowerCase().includes(q);
  });

  return (
    <div className="space-y-12 pb-20">
      <SEOHead
        title="Foire Aux Questions (FAQ) | Église du Nazaréen de Damé"
        description="Trouvez des réponses officielles sur la doctrine de sanctification, comment devenir membre, le baptême, la dédicace des enfants et le projet CDEJ HA 0926 à Damé."
        path="/faq"
      />

      <section className="bg-gradient-to-b from-[#071322] to-[#0b1b33] text-white py-16 px-4 border-b border-amber-500/20">
        <div className="max-w-4xl mx-auto text-center space-y-4">
          <div className="inline-flex items-center space-x-2 px-3.5 py-1 rounded-full bg-amber-500/10 border border-amber-400/30 text-amber-300 text-xs font-bold uppercase tracking-widest">
            <HelpCircle className="w-3.5 h-3.5" />
            <span>Foi &amp; Pratique Ecclésiale</span>
          </div>

          <h1 className="font-serif text-3xl sm:text-5xl font-extrabold text-white">
            Foire Aux Questions (FAQ)
          </h1>

          <p className="text-slate-300 text-base sm:text-lg max-w-2xl mx-auto leading-relaxed">
            Tout ce que vous devez savoir sur la doctrine nazaréenne, nos cultes, les sacrements et la vie communautaire à Damé.
          </p>

          <div className="max-w-md mx-auto relative pt-4">
            <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-7" />
            <input
              type="text"
              placeholder="Rechercher une question (baptême, membre, culte...)"
              value={search}
              onChange={e => setSearch(e.target.value)}
              className="w-full pl-10 pr-4 py-2.5 rounded-2xl bg-white text-slate-900 text-xs border border-amber-500/40 focus:outline-none focus:ring-2 focus:ring-amber-400 shadow-md"
            />
          </div>

          {/* Filtres de catégorie */}
          <div className="pt-2 flex flex-wrap items-center justify-center gap-2">
            {[
              { id: 'all', label: 'Toutes les questions' },
              { id: 'doctrinal', label: 'Doctrine' },
              { id: 'membership', label: 'Adhésion' },
              { id: 'sacraments', label: 'Sacrements' },
              { id: 'social', label: 'CDEJ & Social' },
              { id: 'general', label: 'Général' }
            ].map(tab => (
              <button
                key={tab.id}
                onClick={() => setCategoryFilter(tab.id)}
                className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition ${
                  categoryFilter === tab.id
                    ? 'bg-amber-500 text-slate-950 shadow-sm'
                    : 'bg-slate-800 text-slate-300 hover:bg-slate-700'
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>
        </div>
      </section>

      <section className="max-w-4xl mx-auto px-4 sm:px-6">
        {loading ? (
          <div className="py-20 text-center">
            <Loader2 className="w-8 h-8 animate-spin text-amber-500 mx-auto" />
            <p className="text-xs text-slate-500 mt-2 font-mono">Chargement de la FAQ...</p>
          </div>
        ) : filtered.length === 0 ? (
          <div className="py-16 text-center bg-white rounded-3xl border border-dashed border-slate-300 p-8">
            <HelpCircle className="w-12 h-12 text-slate-300 mx-auto mb-2" />
            <p className="text-xs text-slate-500">Aucune question ne correspond à votre recherche.</p>
          </div>
        ) : (
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
                    <div 
                      className="px-5 pb-5 pt-3 text-xs sm:text-sm text-slate-700 leading-relaxed border-t border-slate-100 bg-slate-50/60 font-sans prose prose-sm max-w-none prose-slate"
                      dangerouslySetInnerHTML={{ __html: item.answer }}
                    />
                  )}
                </div>
              );
            })}
          </div>
        )}

        {/* Section FAQ Personnalisée avec Code HTML (si configurée dans le Secrétariat) */}
        {customHtml && customHtml.trim() && (
          <div className="mt-8 bg-white rounded-3xl border border-amber-500/30 p-6 sm:p-8 shadow-sm">
            <div className="flex items-center space-x-2 text-xs font-bold text-amber-700 uppercase tracking-wider mb-4 pb-2 border-b border-slate-100">
              <Sparkles className="w-4 h-4 text-amber-500" />
              <span>Section Complémentaire &amp; Guides Officiels</span>
            </div>
            <div 
              className="prose prose-sm sm:prose-base max-w-none text-slate-700 leading-relaxed font-sans"
              dangerouslySetInnerHTML={{ __html: customHtml }}
            />
          </div>
        )}

        {/* Contact pastoral callout */}
        <div className="mt-12 bg-slate-900 text-white p-8 rounded-3xl border border-amber-500/30 text-center space-y-4">
          <h3 className="font-serif font-bold text-xl text-amber-300">
            Vous avez une question personnelle ?
          </h3>
          <p className="text-xs text-slate-300 max-w-lg mx-auto">
            Le Pasteur Bequel CHERELUS et l'équipe pastorale sont toujours à votre écoute pour vous accompagner spirituellement.
          </p>
          <a
            href="https://wa.me/50948596089"
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center space-x-2 px-6 py-3 rounded-xl text-xs font-bold bg-emerald-600 text-white hover:bg-emerald-700 transition shadow-lg shadow-emerald-600/20"
          >
            <MessageSquare className="w-4 h-4" />
            <span>Poser une Question au Pasteur sur WhatsApp</span>
          </a>
        </div>
      </section>
    </div>
  );
};
