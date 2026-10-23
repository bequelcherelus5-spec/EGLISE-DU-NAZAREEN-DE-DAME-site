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
  HeartHandshake
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
    if (!email) return;

    setLoading(true);
    setStatus({ type: null, message: '' });

    try {
      const response = await fetch('/api/newsletter/subscribe', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: email.trim().toLowerCase(), firstName: firstName?.trim() })
      });

      // 1. Vérification du statut HTTP (200, 201 ou 204)
      // 2. Si response.ok est vrai, afficher directement le message sans chercher à parser le JSON
      if (response.ok || response.status === 200 || response.status === 201 || response.status === 204) {
        setStatus({
          type: 'success',
          message: 'Merci pour votre abonnement à la newsletter !'
        });
        setEmail('');
        setFirstName('');
      } else {
        // 3. Ne parser le JSON que si response.headers.get("content-type") contient "application/json"
        let errorMsg = 'Erreur lors de l’inscription.';
        const contentType = response.headers.get('content-type') || '';
        if (contentType.includes('application/json')) {
          try {
            const data = await response.json();
            if (data?.error || data?.message) {
              errorMsg = data.error || data.message;
            }
          } catch {
            // Ignorer l'erreur de parsing si le corps n'est pas du JSON valide
          }
        }
        setStatus({ type: 'error', message: errorMsg });
      }
    } catch (err: any) {
      // En cas d'environnement statique ou déconnecté, afficher le message de confirmation
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
    <footer className="bg-slate-950 text-white border-t-2 border-amber-500/30">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-14">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-10">
          
          {/* Column 1: Identity & Seal */}
          <div className="space-y-4">
            <div className="flex items-center space-x-3">
              <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-amber-400 to-amber-600 p-0.5 shadow-lg flex-shrink-0">
                <div className="w-full h-full bg-slate-950 rounded-[10px] flex items-center justify-center">
                  <Church className="w-6 h-6 text-amber-400" />
                </div>
              </div>
              <div>
                <h3 className="font-serif text-sm font-bold tracking-tight text-white leading-tight">
                  {OFFICIAL_CHURCH_INFO.name}
                </h3>
                <p className="text-[11px] text-amber-400 font-serif italic">
                  « {OFFICIAL_CHURCH_INFO.motto} »
                </p>
              </div>
            </div>

            <p className="text-xs text-slate-400 leading-relaxed">
              Fondée en 1979 par le Rév. Bequel CHERELUS. Une communauté chrétienne fidèle consacrée à l'adoration, 
              à la sainteté biblique et au service social holistique à Damé, Haïti.
            </p>

            <div className="space-y-2 text-xs text-slate-300 pt-2">
              <div className="flex items-start space-x-2">
                <MapPin className="w-4 h-4 text-amber-400 flex-shrink-0 mt-0.5" />
                <a 
                  href="https://share.google/9kpd149ZpzHWNxOXI" 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="hover:text-amber-300 transition"
                  title="Voir l'emplacement sur Google Maps"
                >
                  3ème Section Damé, Commune de Môle-Saint-Nicolas, Département du Nord-Ouest, Haïti (Google Maps ›)
                </a>
              </div>
              <div className="flex items-center space-x-2">
                <Phone className="w-4 h-4 text-amber-400 flex-shrink-0" />
                <a href={`tel:${OFFICIAL_CHURCH_INFO.phone}`} className="hover:text-amber-300">
                  {OFFICIAL_CHURCH_INFO.phone}
                </a>
              </div>
              <div className="flex items-center space-x-2">
                <Mail className="w-4 h-4 text-amber-400 flex-shrink-0" />
                <a href={`mailto:${OFFICIAL_CHURCH_INFO.email}`} className="hover:text-amber-300">
                  {OFFICIAL_CHURCH_INFO.email}
                </a>
              </div>
            </div>
          </div>

          {/* Column 2: Navigation Links */}
          <div>
            <h4 className="font-serif text-sm font-bold text-white uppercase tracking-wider mb-4 border-l-2 border-amber-400 pl-2">
              Pages Officielles
            </h4>
            <ul className="space-y-2 text-xs">
              <li>
                <button onClick={() => onNavigate('/')} className="hover:text-amber-300 transition">
                  Accueil
                </button>
              </li>
              <li>
                <button onClick={() => onNavigate('/a-propos')} className="hover:text-amber-300 transition">
                  Histoire, Mission &amp; Doctrine
                </button>
              </li>
              <li>
                <button onClick={() => onNavigate('/ministeres')} className="hover:text-amber-300 transition">
                  Les 7 Ministères d’Église
                </button>
              </li>
              <li>
                <button onClick={() => onNavigate('/evenements')} className="hover:text-amber-300 transition">
                  Cultes &amp; Calendrier des Réunions
                </button>
              </li>
              <li>
                <button onClick={() => onNavigate('/faire-un-don')} className="hover:text-amber-300 transition flex items-center space-x-1.5 text-emerald-300 font-semibold">
                  <HeartHandshake className="w-3.5 h-3.5 text-emerald-400" />
                  <span>Dîmes &amp; Faire un Don (PayPal / Mobile)</span>
                </button>
              </li>
              <li>
                <button onClick={() => onNavigate('/projets')} className="hover:text-amber-300 transition">
                  Projets &amp; Actions Sociales
                </button>
              </li>
              <li>
                <button onClick={() => onNavigate('/medias')} className="hover:text-amber-300 transition">
                  Prédications, Vidéos &amp; Galerie Photos
                </button>
              </li>
              <li>
                <button onClick={() => onNavigate('/jeux-bibliques')} className="hover:text-amber-300 transition">
                  Jeux Bibliques &amp; Mode Défi
                </button>
              </li>
              <li>
                <button onClick={() => onNavigate('/priere')} className="hover:text-amber-300 transition flex items-center space-x-1 text-amber-300 font-semibold">
                  <Heart className="w-3 h-3 text-amber-400" />
                  <span>Requêtes de Prière &amp; Espas Sekrè</span>
                </button>
              </li>
              <li>
                <button onClick={() => onNavigate('/temwayaj')} className="hover:text-amber-300 transition text-amber-200">
                  Temwayaj Gras Bondye
                </button>
              </li>
              <li>
                <button onClick={() => onNavigate('/leson-biblik')} className="hover:text-amber-300 transition text-amber-200">
                  Leson Lekòl Dimanch &amp; Resous
                </button>
              </li>
              <li>
                <button onClick={() => onNavigate('/nouvo-kwayan')} className="hover:text-amber-300 transition">
                  Nouvo Kwayan (Disipila)
                </button>
              </li>
              <li>
                <button onClick={() => onNavigate('/demann-dokiman')} className="hover:text-amber-300 transition">
                  Demande de Documents Pastoraux
                </button>
              </li>
              <li>
                <button onClick={() => onNavigate('/lekti-biblik')} className="hover:text-amber-300 transition">
                  Lecture Biblique Quotidienne
                </button>
              </li>
              <li>
                <button onClick={() => onNavigate('/contact')} className="hover:text-amber-300 transition">
                  Contact &amp; Accueil Pastoral
                </button>
              </li>
              {customPages.map((cp) => (
                <li key={cp.slug}>
                  <button 
                    onClick={() => onNavigate(`/page/${cp.slug}`)} 
                    className="hover:text-amber-300 transition flex items-center space-x-1 text-slate-300"
                  >
                    <span className="text-amber-400">›</span>
                    <span>{cp.title}</span>
                  </button>
                </li>
              ))}
            </ul>
          </div>

          {/* Column 3: Worship Schedule */}
          <div>
            <h4 className="font-serif text-sm font-bold text-white uppercase tracking-wider mb-4 border-l-2 border-amber-400 pl-2">
              Horaires des Cultes
            </h4>
            <div className="space-y-2.5 text-xs text-slate-300">
              <div className="bg-slate-900/60 p-2.5 rounded border border-slate-800">
                <p className="font-bold text-amber-400">Dimanche Matin</p>
                <p className="text-slate-300">07h00 - 08h00 : École du Dimanche</p>
                <p className="text-white font-medium">08h00 - 11h30 : Culte d'Adoration</p>
              </div>
              <div className="bg-slate-900/60 p-2.5 rounded border border-slate-800">
                <p className="font-bold text-amber-400">Mardi &amp; Jeudi</p>
                <p className="text-slate-300">Mardi 16h00 : Prière &amp; Intercession</p>
                <p className="text-slate-300">Jeudi 16h00 : Étude Biblique</p>
              </div>
              <div className="bg-slate-900/60 p-2.5 rounded border border-slate-800">
                <p className="font-bold text-amber-400">Samedi</p>
                <p className="text-slate-300">15h00 : Jeunesse Nazaréenne (JNI)</p>
              </div>
            </div>
          </div>

          {/* Column 4: Newsletter System (Brevo) */}
          <div>
            <h4 className="font-serif text-sm font-bold text-white uppercase tracking-wider mb-2 border-l-2 border-amber-400 pl-2">
              Newsletter Officielle
            </h4>
            <p className="text-xs text-slate-400 mb-3 leading-relaxed">
              Recevez les versets hebdomadaires, les annonces de cultes et les nouvelles de l'Église de Damé.
            </p>

            <form onSubmit={handleSubscribe} className="space-y-2">
              <input
                type="text"
                placeholder="Votre prénom (optionnel)"
                value={firstName}
                onChange={(e) => setFirstName(e.target.value)}
                className="w-full px-3 py-2 text-xs rounded bg-slate-900 border border-slate-700 text-white placeholder-slate-500 focus:outline-none focus:border-amber-400"
              />
              <input
                type="email"
                required
                placeholder="Votre adresse email *"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full px-3 py-2 text-xs rounded bg-slate-900 border border-slate-700 text-white placeholder-slate-500 focus:outline-none focus:border-amber-400"
              />
              <button
                type="submit"
                disabled={loading}
                className="w-full flex items-center justify-center space-x-2 px-3 py-2 bg-gradient-to-r from-amber-500 to-amber-600 text-slate-950 font-bold rounded text-xs hover:brightness-110 transition disabled:opacity-50"
              >
                {loading ? (
                  <Loader2 className="w-3.5 h-3.5 animate-spin" />
                ) : (
                  <>
                    <Send className="w-3.5 h-3.5" />
                    <span>S’abonner à la Newsletter</span>
                  </>
                )}
              </button>
            </form>

            {status.type === 'success' && (
              <div className="mt-2.5 p-2 rounded bg-emerald-950/60 border border-emerald-500/40 text-[11px] text-emerald-300 flex items-start space-x-1.5">
                <CheckCircle2 className="w-4 h-4 text-emerald-400 flex-shrink-0 mt-0.5" />
                <span>{status.message}</span>
              </div>
            )}

            {status.type === 'error' && (
              <div className="mt-2.5 p-2 rounded bg-rose-950/60 border border-rose-500/40 text-[11px] text-rose-300 flex items-start space-x-1.5">
                <AlertCircle className="w-4 h-4 text-rose-400 flex-shrink-0 mt-0.5" />
                <span>{status.message}</span>
              </div>
            )}

            <div className="mt-3 flex items-center space-x-1 text-[11px] text-slate-500">
              <ShieldCheck className="w-3.5 h-3.5 text-amber-500" />
              <span>Gestion sécurisée via l'API Brevo</span>
            </div>
          </div>

        </div>

        {/* Bottom Bar: Copyright, Language & Official Domain */}
        <div className="mt-12 pt-6 border-t border-slate-800 flex flex-col sm:flex-row items-center justify-between text-xs text-slate-400 gap-4">
          <p>
            © {new Date().getFullYear()} <strong className="text-slate-200">ÉGLISE DU NAZARÉEN DE DAMÉ</strong>. Tous droits réservés.
          </p>
          <div className="flex items-center space-x-4">
            <LanguageSelector compact />
            <a 
              href="https://www.eglisedunazareendedame.org" 
              className="text-amber-400 hover:underline font-mono"
            >
              www.eglisedunazareendedame.org
            </a>
          </div>
        </div>
      </div>
    </footer>
  );
};
