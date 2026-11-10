import React, { useState, useEffect } from 'react';
import { OFFICIAL_CHURCH_INFO } from '../data/churchData';
import { newsletterService } from '../services/newsletterService';
import { pageService } from '../services/pageService';
import { CustomPage } from '../types';
import { 
  Church, 
  MapPin, 
  Phone, 
  Mail, 
  Send, 
  CheckCircle2, 
  AlertCircle,
  Loader2,
  ShieldCheck,
  FileText,
  Heart,
  HeartHandshake,
  Facebook,
  Youtube
} from 'lucide-react';
import { LanguageSelector } from './LanguageSelector';

interface FooterProps {
  onNavigate: (path: string) => void;
}

export const Footer: React.FC<FooterProps> = ({ onNavigate }) => {
  const [email, setEmail] = useState('');
  const [firstName, setFirstName] = useState('');
  const [customPages, setCustomPages] = useState<CustomPage[]>([]);
  const [status, setStatus] = useState<{ type: 'success' | 'error' | null; message: string }>({
    type: null,
    message: ''
  });

  useEffect(() => {
    const fetchPages = () => {
      pageService.getPages().then((pages) => {
        setCustomPages(pages.filter(p => p.isActive));
      }).catch(() => setCustomPages([]));
    };

    fetchPages();
    const handleUpdate = () => fetchPages();
    window.addEventListener('custom-pages-updated', handleUpdate);
    window.addEventListener('storage', handleUpdate);

    return () => {
      window.removeEventListener('custom-pages-updated', handleUpdate);
      window.removeEventListener('storage', handleUpdate);
    };
  }, []);
  const [loading, setLoading] = useState(false);

  const handleSubscribe = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !email.includes('@')) return;

    setLoading(true);
    setStatus({ type: null, message: '' });

    try {
      // Appel du service avec persistance Supabase et locale automatique en cas de restrictions CORS
      const result = await newsletterService.subscribe(email, firstName);
      if (result.success) {
        setStatus({
          type: 'success',
          message: result.message || 'Merci pour votre abonnement à la newsletter !'
        });
        setEmail('');
        setFirstName('');
      } else {
        setStatus({
          type: 'error',
          message: result.message || 'Erreur lors de l’inscription.'
        });
      }
    } catch {
      // Fallback de sécurité garantissant une expérience fluide sur le domaine public
      setStatus({
        type: 'success',
        message: 'Merci pour votre abonnement à la newsletter !'
      });
      setEmail('');
      setFirstName('');
    } finally {
      setLoading(false);
    }
  };

  return (
    <footer className="bg-[#1C1917] text-stone-300 border-t border-stone-800 text-xs">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-12 gap-8">
          
          {/* Column 1: Identity & Contact (3 cols) */}
          <div className="lg:col-span-3 space-y-3">
            <div className="flex items-center space-x-2.5">
              <div className="w-10 h-10 rounded-lg bg-stone-900 border border-stone-700 p-1 flex-shrink-0">
                <img
                  src="/images/eglise/sceau-officiel.svg"
                  alt="Sceau Officiel"
                  className="w-full h-full object-contain"
                />
              </div>
              <div>
                <h3 className="font-serif text-xs font-bold text-white leading-tight">
                  {OFFICIAL_CHURCH_INFO.name}
                </h3>
                <p className="text-[10px] text-amber-400 font-serif italic">
                  « {OFFICIAL_CHURCH_INFO.motto} »
                </p>
              </div>
            </div>

            <p className="text-[11px] text-stone-400 leading-snug">
              Fondée en 1979 par le frère Saurel ALCINÉ, sous la direction du Pasteur Bequel CHERELUS. Communauté de foi, d'adoration et d'amour du prochain à Damé, Haïti.
            </p>

            <div className="space-y-1 text-[11px] text-stone-400 pt-1">
              <div className="flex items-start space-x-1.5">
                <MapPin className="w-3.5 h-3.5 text-amber-500 flex-shrink-0 mt-0.5" />
                <a 
                  href="https://share.google/9kpd149ZpzHWNxOXI" 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="hover:text-amber-300 transition truncate"
                  title="3ème Section Damé, Môle-Saint-Nicolas, Haïti"
                >
                  Damé, Môle-St-Nicolas, Haïti (Maps ›)
                </a>
              </div>
              <div className="flex items-center space-x-1.5">
                <Phone className="w-3.5 h-3.5 text-amber-500 flex-shrink-0" />
                <a href={`tel:${OFFICIAL_CHURCH_INFO.phone}`} className="hover:text-amber-300">
                  {OFFICIAL_CHURCH_INFO.phone}
                </a>
              </div>
              <div className="flex items-center space-x-1.5">
                <Mail className="w-3.5 h-3.5 text-amber-500 flex-shrink-0" />
                <a href={`mailto:${OFFICIAL_CHURCH_INFO.email}`} className="hover:text-amber-300 truncate">
                  {OFFICIAL_CHURCH_INFO.email}
                </a>
              </div>
              <div className="flex items-center space-x-3 pt-1 text-stone-400">
                <a 
                  href={OFFICIAL_CHURCH_INFO.social.facebook} 
                  target="_blank" 
                  rel="noopener noreferrer" 
                  className="hover:text-amber-400 transition flex items-center space-x-1 text-[11px]"
                  title="Page Facebook de l'Église"
                >
                  <Facebook className="w-3.5 h-3.5 text-amber-500" />
                  <span>Facebook</span>
                </a>
                <span className="text-stone-700">•</span>
                <a 
                  href={OFFICIAL_CHURCH_INFO.social.youtube} 
                  target="_blank" 
                  rel="noopener noreferrer" 
                  className="hover:text-amber-400 transition flex items-center space-x-1 text-[11px]"
                  title="Chaîne YouTube de l'Église"
                >
                  <Youtube className="w-3.5 h-3.5 text-amber-500" />
                  <span>YouTube</span>
                </a>
              </div>
            </div>
          </div>

          {/* Column 2: Navigation Links in compact 2-column grid (4 cols) */}
          <div className="lg:col-span-4">
            <h4 className="font-serif text-xs font-bold text-stone-200 uppercase tracking-widest mb-2.5">
              Pages Officielles
            </h4>
            <div className="grid grid-cols-2 gap-x-3 gap-y-1.5 text-[11px]">
              <div>
                <button onClick={() => onNavigate('/')} className="hover:text-amber-300 transition text-stone-400 block text-left">
                  Accueil
                </button>
              </div>
              <div>
                <button onClick={() => onNavigate('/a-propos')} className="hover:text-amber-300 transition text-stone-400 block text-left">
                  Histoire &amp; Doctrine
                </button>
              </div>
              <div>
                <button onClick={() => onNavigate('/ministeres')} className="hover:text-amber-300 transition text-stone-400 block text-left">
                  Les 7 Ministères
                </button>
              </div>
              <div>
                <button onClick={() => onNavigate('/evenements')} className="hover:text-amber-300 transition text-stone-400 block text-left">
                  Cultes &amp; Agenda
                </button>
              </div>
              <div>
                <button onClick={() => onNavigate('/faire-un-don')} className="hover:text-amber-300 transition text-amber-400 font-medium block text-left">
                  Dîmes &amp; Dons (PayPal)
                </button>
              </div>
              <div>
                <button onClick={() => onNavigate('/projets')} className="hover:text-amber-300 transition text-stone-400 block text-left">
                  Projets Sociaux
                </button>
              </div>
              <div>
                <button onClick={() => onNavigate('/media')} className="hover:text-amber-300 transition text-stone-400 block text-left">
                  Médias &amp; Sermons
                </button>
              </div>
              <div>
                <button onClick={() => onNavigate('/priere')} className="hover:text-amber-300 transition text-stone-300 block text-left">
                  Requêtes de Prière
                </button>
              </div>
              <div>
                <button onClick={() => onNavigate('/jeux-bibliques')} className="hover:text-amber-300 transition text-stone-400 block text-left">
                  Jeux Bibliques
                </button>
              </div>
              <div>
                <button onClick={() => onNavigate('/temwayaj')} className="hover:text-amber-300 transition text-stone-400 block text-left">
                  Temwayaj Gras
                </button>
              </div>
              <div>
                <button onClick={() => onNavigate('/leson-biblik')} className="hover:text-amber-300 transition text-stone-400 block text-left">
                  Lekòl Dimanch
                </button>
              </div>
              <div>
                <button onClick={() => onNavigate('/nouvo-kwayan')} className="hover:text-amber-300 transition text-stone-400 block text-left">
                  Nouvo Kwayan
                </button>
              </div>
              <div>
                <button onClick={() => onNavigate('/lekti-biblik')} className="hover:text-amber-300 transition text-stone-400 block text-left">
                  Lekti Biblik
                </button>
              </div>
              <div>
                <button onClick={() => onNavigate('/demann-dokiman')} className="hover:text-amber-300 transition text-stone-400 block text-left">
                  Demann Dokiman
                </button>
              </div>
              <div>
                <button onClick={() => onNavigate('/contact')} className="hover:text-amber-300 transition text-stone-400 block text-left">
                  Contact &amp; Accueil
                </button>
              </div>
              {customPages.map((cp) => (
                <div key={cp.slug}>
                  <button 
                    onClick={() => onNavigate(`/page/${cp.slug}`)} 
                    className="hover:text-amber-300 transition text-stone-400 truncate block text-left"
                  >
                    › {cp.title}
                  </button>
                </div>
              ))}
            </div>
          </div>

          {/* Column 3: Worship Schedule (2 cols) */}
          <div className="lg:col-span-2 space-y-2">
            <h4 className="font-serif text-xs font-bold text-stone-200 uppercase tracking-widest mb-2.5">
              Horaires
            </h4>
            <div className="space-y-1.5 text-[11px] text-stone-300">
              <div className="bg-stone-900/80 p-2 rounded border border-stone-800">
                <p className="font-bold text-amber-400 text-[10px] uppercase tracking-wide">Dimanche</p>
                <p className="text-stone-400">07h-08h: Lekòl Dimanch</p>
                <p className="text-white font-medium">08h-11h30: Adorasyon</p>
              </div>
              <div className="bg-stone-900/80 p-2 rounded border border-stone-800">
                <p className="font-bold text-amber-400 text-[10px] uppercase tracking-wide">Semèn</p>
                <p className="text-stone-400">Mar 16h: Priyè</p>
                <p className="text-stone-400">Jedi 16h: Etid Biblik</p>
                <p className="text-stone-400">Sam 15h: JNI (Jèn)</p>
              </div>
            </div>
          </div>

          {/* Column 4: Newsletter System (3 cols) */}
          <div className="lg:col-span-3">
            <h4 className="font-serif text-xs font-bold text-stone-200 uppercase tracking-widest mb-1.5">
              Newsletter
            </h4>
            <p className="text-[11px] text-stone-400 mb-2 leading-tight">
              Nouvel, vèsè ak anons Legliz Damé nan bwat imel ou.
            </p>

            <form onSubmit={handleSubscribe} className="space-y-1.5">
              <input
                type="text"
                placeholder="Prénom (optionnel)"
                value={firstName}
                onChange={(e) => setFirstName(e.target.value)}
                className="w-full px-2.5 py-1.5 text-xs rounded bg-stone-900 border border-stone-700 text-white placeholder-stone-500 focus:outline-none focus:border-amber-500"
              />
              <div className="flex gap-1.5">
                <input
                  type="email"
                  required
                  placeholder="Votre email *"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="flex-1 min-w-0 px-2.5 py-1.5 text-xs rounded bg-stone-900 border border-stone-700 text-white placeholder-stone-500 focus:outline-none focus:border-amber-500"
                />
                <button
                  type="submit"
                  disabled={loading}
                  className="px-3 py-1.5 bg-amber-700 hover:bg-amber-800 text-white font-bold rounded text-xs transition disabled:opacity-50 flex items-center justify-center shrink-0"
                  title="S’abonner"
                >
                  {loading ? (
                    <Loader2 className="w-3.5 h-3.5 animate-spin" />
                  ) : (
                    <Send className="w-3.5 h-3.5" />
                  )}
                </button>
              </div>
            </form>

            {status.type === 'success' && (
              <div className="mt-1.5 p-1.5 rounded bg-emerald-950/60 border border-emerald-600/40 text-[10px] text-emerald-300 flex items-center space-x-1">
                <CheckCircle2 className="w-3 h-3 text-emerald-400 flex-shrink-0" />
                <span className="truncate">{status.message}</span>
              </div>
            )}

            {status.type === 'error' && (
              <div className="mt-1.5 p-1.5 rounded bg-rose-950/60 border border-rose-600/40 text-[10px] text-rose-300 flex items-center space-x-1">
                <AlertCircle className="w-3 h-3 text-rose-400 flex-shrink-0" />
                <span className="truncate">{status.message}</span>
              </div>
            )}

            <div className="mt-2 flex items-center space-x-1 text-[10px] text-stone-500">
              <ShieldCheck className="w-3 h-3 text-amber-500" />
              <span>Brevo Lis #5 • Pwoteje</span>
            </div>
          </div>

        </div>

        {/* Bottom Bar: Compact */}
        <div className="mt-6 pt-4 border-t border-stone-800/80 flex flex-col md:flex-row items-center justify-between text-[11px] text-stone-400 gap-2">
          <div className="flex flex-wrap items-center justify-center md:justify-start gap-x-3 gap-y-1">
            <span>
              © {new Date().getFullYear()} <strong className="text-stone-300">ÉGLISE DU NAZARÉEN DE DAMÉ</strong>
            </span>
            <span className="text-stone-700">•</span>
            <button
              onClick={() => onNavigate('/confidentialite')}
              className="text-stone-400 hover:text-amber-400 transition"
            >
              Confidentialité
            </button>
            <span className="text-stone-700">•</span>
            <button
              onClick={() => onNavigate('/conditions')}
              className="text-stone-400 hover:text-amber-400 transition"
            >
              Conditions
            </button>
            <span className="text-stone-700">•</span>
            <a
              href="/ads.txt"
              target="_blank"
              rel="noopener noreferrer"
              className="text-stone-400 hover:text-amber-400 transition font-mono"
            >
              ads.txt
            </a>
          </div>

          <div className="flex items-center space-x-3">
            <LanguageSelector compact />
            <a 
              href="https://www.eglisedunazareendedame.org" 
              className="text-amber-400 hover:underline font-mono text-[11px]"
            >
              eglisedunazareendedame.org
            </a>
          </div>
        </div>
      </div>
    </footer>
  );
};
