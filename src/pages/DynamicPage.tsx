import React, { useState, useEffect } from 'react';
import { CustomPage } from '../types';
import { pageService } from '../services/pageService';
import { SEOHead } from '../components/SEOHead';
import { Calendar, User, ArrowLeft, Globe, Share2, Check, Printer } from 'lucide-react';

interface DynamicPageProps {
  slug: string;
  onNavigate: (path: string) => void;
}

export const DynamicPage: React.FC<DynamicPageProps> = ({ slug, onNavigate }) => {
  const [page, setPage] = useState<CustomPage | null>(null);
  const [loading, setLoading] = useState(true);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    let isMounted = true;
    setLoading(true);

    pageService.getPageBySlug(slug).then((res) => {
      if (isMounted) {
        setPage(res);
        setLoading(false);
      }
    }).catch(() => {
      if (isMounted) {
        setPage(null);
        setLoading(false);
      }
    });

    return () => {
      isMounted = false;
    };
  }, [slug]);

  const handleShare = async () => {
    if (page && navigator.share) {
      try {
        await navigator.share({ title: page.title, url: window.location.href });
        return;
      } catch {
        // Fallback to clipboard
      }
    }
    navigator.clipboard.writeText(window.location.href);
    setCopied(true);
    setTimeout(() => setCopied(false), 3000);
  };

  const handlePrint = () => {
    window.print();
  };

  if (loading) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center">
        <div className="text-center space-y-3">
          <div className="w-8 h-8 border-4 border-amber-500 border-t-transparent rounded-full animate-spin mx-auto" />
          <p className="text-xs text-slate-500 font-medium">Chargement de la page...</p>
        </div>
      </div>
    );
  }

  if (!page || !page.isActive) {
    return (
      <div className="max-w-3xl mx-auto px-4 py-20 text-center space-y-6">
        <div className="w-16 h-16 rounded-3xl bg-slate-100 flex items-center justify-center mx-auto text-slate-400">
          <Globe className="w-8 h-8" />
        </div>
        <div className="space-y-2">
          <h1 className="font-serif text-3xl font-bold text-slate-900">Page non trouvée ou inactive</h1>
          <p className="text-sm text-slate-500 max-w-md mx-auto">
            La page demandée n’existe pas ou n’a pas encore été rendue publique par le secrétariat de l’Église.
          </p>
        </div>
        <button
          onClick={() => onNavigate('/')}
          className="inline-flex items-center space-x-2 px-5 py-2.5 rounded-xl font-bold text-xs bg-slate-900 text-white hover:bg-slate-800 transition"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Retour à l’accueil</span>
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-12 pb-20">
      <SEOHead 
        title={`${page.title} | Église du Nazaréen de Damé`}
        description={page.excerpt || (page.content ? page.content.slice(0, 160) : 'Page officielle de l’Église du Nazaréen de Damé')}
        path={`/page/${page.slug}`}
        image={page.featuredImage || '/images/eglise/sceau-officiel.svg'}
      />

      {/* Hero Banner */}
      <section className="relative bg-gradient-to-b from-slate-950 via-slate-900 to-indigo-950 text-white py-16 px-4">
        <div className="max-w-4xl mx-auto space-y-6 text-center">
          <div className="inline-flex items-center space-x-2 px-3 py-1 rounded-full bg-amber-500/20 text-amber-300 text-xs font-bold uppercase tracking-wider">
            <span>Église du Nazaréen de Damé</span>
          </div>
          <h1 className="font-serif text-3xl sm:text-4xl md:text-5xl font-bold text-white leading-tight">
            {page.title}
          </h1>
          {page.excerpt && (
            <p className="text-slate-300 text-sm sm:text-base max-w-2xl mx-auto leading-relaxed">
              {page.excerpt}
            </p>
          )}

          <div className="flex flex-wrap items-center justify-center gap-4 text-xs text-slate-400 pt-2 border-t border-slate-800/60 max-w-md mx-auto">
            <span className="flex items-center space-x-1">
              <User className="w-3.5 h-3.5 text-amber-400" />
              <span>{page.author}</span>
            </span>
            <span>•</span>
            <span className="flex items-center space-x-1">
              <Calendar className="w-3.5 h-3.5 text-amber-400" />
              <span>{new Date(page.createdAt).toLocaleDateString('fr-FR', { year: 'numeric', month: 'long', day: 'numeric' })}</span>
            </span>
          </div>
        </div>
      </section>

      {/* Main Content */}
      <div className="max-w-4xl mx-auto px-4 sm:px-6 space-y-10">
        {page.featuredImage && (
          <div className="rounded-3xl overflow-hidden shadow-xl border border-slate-200 max-h-96 bg-slate-900">
            <img 
              src={page.featuredImage} 
              alt={page.title} 
              className="w-full h-full object-cover" 
              onError={(e) => {
                (e.target as HTMLElement).style.display = 'none';
              }}
            />
          </div>
        )}

        <article className="bg-white rounded-3xl p-8 sm:p-12 border border-slate-200 shadow-sm space-y-6">
          {page.content && (
            <div className="text-slate-800 text-sm sm:text-base leading-relaxed whitespace-pre-line font-normal">
              {page.content}
            </div>
          )}

          {page.htmlContent && (
            <div 
              className="prose prose-slate max-w-none pt-4 border-t border-slate-100 text-slate-800 leading-relaxed overflow-x-auto"
              dangerouslySetInnerHTML={{ __html: page.htmlContent }}
            />
          )}

          <div className="flex flex-wrap items-center justify-between gap-3 pt-8 border-t border-slate-100">
            <button
              onClick={() => onNavigate('/')}
              className="inline-flex items-center space-x-2 text-xs font-bold text-slate-600 hover:text-slate-950 transition"
            >
              <ArrowLeft className="w-4 h-4" />
              <span>Retour à l’accueil</span>
            </button>

            <div className="flex items-center space-x-2">
              <button
                onClick={handlePrint}
                className="inline-flex items-center space-x-1.5 px-3 py-1.5 rounded-lg text-xs font-medium text-slate-600 bg-slate-100 hover:bg-slate-200 transition"
                title="Imprimer cette page"
              >
                <Printer className="w-3.5 h-3.5" />
                <span>Imprimer</span>
              </button>

              <button
                onClick={handleShare}
                className={`inline-flex items-center space-x-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition ${
                  copied 
                    ? 'bg-emerald-100 text-emerald-800 border border-emerald-300' 
                    : 'text-slate-600 bg-slate-100 hover:bg-slate-200'
                }`}
                title="Partager ou copier le lien"
              >
                {copied ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Share2 className="w-3.5 h-3.5" />}
                <span>{copied ? 'Lien copié !' : 'Partager'}</span>
              </button>
            </div>
          </div>
        </article>
      </div>
    </div>
  );
};
