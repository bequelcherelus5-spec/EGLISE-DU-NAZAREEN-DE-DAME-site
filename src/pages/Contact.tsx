import React, { useState } from 'react';
import { OFFICIAL_CHURCH_INFO } from '../data/churchData';
import { SEOHead } from '../components/SEOHead';
import { 
  Phone, 
  Mail, 
  MapPin, 
  Clock, 
  Send, 
  CheckCircle2, 
  AlertCircle, 
  Loader2, 
  Globe, 
  Youtube, 
  Facebook,
  Heart,
  ShieldCheck,
  Lock,
  UserCheck,
  Sparkles,
  MessageSquare
} from 'lucide-react';

interface ContactProps {
  onNavigate: (path: string) => void;
}

export const Contact: React.FC<ContactProps> = ({ onNavigate }) => {
  // Tab selection: 'prayer' ou 'general'
  const [activeTab, setActiveTab] = useState<'prayer' | 'general'>('prayer');

  // État formulaire Contact Général
  const [formData, setFormData] = useState({
    fullName: '',
    email: '',
    phone: '',
    subject: '',
    message: ''
  });
  const [loading, setLoading] = useState(false);
  const [status, setStatus] = useState<{ type: 'idle' | 'success' | 'error'; message: string }>({
    type: 'idle',
    message: ''
  });

  // État formulaire Requête de Prière Confidentielle
  const [prayerData, setPrayerData] = useState({
    category: 'Santé & Guérison',
    fullName: '',
    isAnonymous: false,
    phone: '',
    email: '',
    message: '',
    isUrgent: false,
    pastorOnly: true,
    requestCallback: false
  });
  const [prayerLoading, setPrayerLoading] = useState(false);
  const [prayerStatus, setPrayerStatus] = useState<{ type: 'idle' | 'success' | 'error'; message: string }>({
    type: 'idle',
    message: ''
  });

  // Soumission message général
  const handleSubmitGeneral = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.fullName || !formData.email || !formData.message) {
      setStatus({ type: 'error', message: 'Veuillez remplir votre nom, votre adresse email et votre message.' });
      return;
    }

    setLoading(true);
    setStatus({ type: 'idle', message: '' });

    try {
      const res = await fetch('/api/contact', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData)
      });
      const data = await res.json();
      if (res.ok && data.success) {
        setStatus({ type: 'success', message: data.message });
        setFormData({ fullName: '', email: '', phone: '', subject: '', message: '' });
      } else {
        setStatus({ type: 'error', message: data.error || 'Erreur lors de l’envoi de votre message.' });
      }
    } catch {
      setStatus({ type: 'error', message: 'Impossible de joindre le serveur. Veuillez nous contacter directement par téléphone.' });
    } finally {
      setLoading(false);
    }
  };

  // Soumission requête de prière pastorale
  const handleSubmitPrayer = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!prayerData.message.trim()) {
      setPrayerStatus({ type: 'error', message: 'Veuillez décrire votre sujet ou fardeau de prière.' });
      return;
    }

    setPrayerLoading(true);
    setPrayerStatus({ type: 'idle', message: '' });

    try {
      const res = await fetch('/api/prayers', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(prayerData)
      });
      const data = await res.json();
      if (res.ok && data.success) {
        setPrayerStatus({ type: 'success', message: data.message });
        setPrayerData({
          category: 'Santé & Guérison',
          fullName: '',
          isAnonymous: false,
          phone: '',
          email: '',
          message: '',
          isUrgent: false,
          pastorOnly: true,
          requestCallback: false
        });
      } else {
        setPrayerStatus({ type: 'error', message: data.error || 'Erreur lors de l’envoi de votre prière.' });
      }
    } catch {
      setPrayerStatus({ type: 'error', message: 'Erreur de connexion. Vous pouvez joindre directement le Pasteur au +509 48596089.' });
    } finally {
      setPrayerLoading(false);
    }
  };

  return (
    <div className="space-y-16 pb-16">
      <SEOHead 
        title="Contact & Demande de Prière – Église du Nazaréen de Damé"
        description="Contactez l'Église du Nazaréen de Damé, Haïti. Déposez une requête de prière confidentielle pour le Pasteur Bequel CHERELUS ou prenez contact avec le secrétariat."
        path="/contact"
        image="/images/eglise/og-banner.svg"
      />

      {/* Header */}
      <section className="bg-gradient-to-b from-[#071322] to-[#0b1b33] text-white py-16 px-4 border-b border-amber-500/20">
        <div className="max-w-4xl mx-auto text-center space-y-4">
          <div className="inline-flex items-center space-x-2 px-3.5 py-1 rounded-full bg-amber-500/10 border border-amber-400/30 text-amber-300 text-xs font-bold uppercase tracking-widest">
            <Heart className="w-3.5 h-3.5 text-amber-400" />
            <span>Écoute, Prière &amp; Accueil Pastoral</span>
          </div>

          <h1 className="font-serif text-3xl sm:text-5xl font-extrabold text-white">
            Nous Contacter &amp; Déposer une Prière
          </h1>

          <p className="text-slate-300 text-base sm:text-lg max-w-2xl mx-auto leading-relaxed">
            Que vous traversiez une épreuve, désiriez un conseil spirituel ou souhaitiez contacter le secrétariat,
            l'Église du Nazaréen de Damé est là pour vous accompagner.
          </p>
        </div>
      </section>

      {/* Contact Cards & Forms Section */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10">
          {/* Info Column */}
          <div className="lg:col-span-5 space-y-6">
            <div className="bg-white rounded-3xl p-8 shadow-xl border border-slate-200 space-y-6">
              <h2 className="font-serif font-bold text-slate-900 text-2xl border-b border-slate-100 pb-3">
                Coordonnées Officielles
              </h2>

              <div className="space-y-5 text-sm">
                <div className="flex items-start space-x-4">
                  <div className="w-10 h-10 rounded-xl bg-amber-500/10 text-amber-600 flex items-center justify-center flex-shrink-0">
                    <MapPin className="w-5 h-5" />
                  </div>
                  <div>
                    <h3 className="font-bold text-slate-900">Adresse de l'Église</h3>
                    <p className="text-slate-600 text-xs leading-relaxed mt-1">
                      3ème Section Damé<br />
                      Commune de Môle-Saint-Nicolas<br />
                      Département du Nord-Ouest, Haïti
                    </p>
                    <a
                      href="https://share.google/9kpd149ZpzHWNxOXI"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center space-x-1.5 mt-2 text-xs font-bold text-amber-700 hover:text-amber-800 bg-amber-50 hover:bg-amber-100 px-3 py-1 rounded-lg border border-amber-300 transition"
                    >
                      <MapPin className="w-3.5 h-3.5 text-amber-600" />
                      <span>Ouvrir sur Google Maps ›</span>
                    </a>
                  </div>
                </div>

                <div className="flex items-start space-x-4">
                  <div className="w-10 h-10 rounded-xl bg-amber-500/10 text-amber-600 flex items-center justify-center flex-shrink-0">
                    <Phone className="w-5 h-5" />
                  </div>
                  <div>
                    <h3 className="font-bold text-slate-900">Ligne Pastorale &amp; Secrétariat</h3>
                    <a
                      href={`tel:${OFFICIAL_CHURCH_INFO.phone}`}
                      className="text-amber-600 font-bold text-sm hover:underline block mt-1"
                    >
                      {OFFICIAL_CHURCH_INFO.phone}
                    </a>
                    <p className="text-[11px] text-slate-500">Accessible par WhatsApp &amp; Appels</p>
                  </div>
                </div>

                <div className="flex items-start space-x-4">
                  <div className="w-10 h-10 rounded-xl bg-amber-500/10 text-amber-600 flex items-center justify-center flex-shrink-0">
                    <Mail className="w-5 h-5" />
                  </div>
                  <div>
                    <h3 className="font-bold text-slate-900">Courrier Électronique</h3>
                    <a
                      href={`mailto:${OFFICIAL_CHURCH_INFO.email}`}
                      className="text-amber-600 font-bold text-xs hover:underline block mt-1 break-all"
                    >
                      {OFFICIAL_CHURCH_INFO.email}
                    </a>
                  </div>
                </div>

                <div className="flex items-start space-x-4">
                  <div className="w-10 h-10 rounded-xl bg-amber-500/10 text-amber-600 flex items-center justify-center flex-shrink-0">
                    <Globe className="w-5 h-5" />
                  </div>
                  <div>
                    <h3 className="font-bold text-slate-900">Portail Web Officiel</h3>
                    <p className="text-slate-700 font-mono text-xs mt-1">
                      {OFFICIAL_CHURCH_INFO.website}
                    </p>
                  </div>
                </div>
              </div>

              {/* Social links */}
              <div className="pt-4 border-t border-slate-100 flex items-center space-x-3">
                <a
                  href={OFFICIAL_CHURCH_INFO.social.youtube}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center space-x-1.5 px-3 py-1.5 rounded-lg bg-red-50 text-red-600 text-xs font-semibold hover:bg-red-100 transition"
                >
                  <Youtube className="w-4 h-4" />
                  <span>YouTube</span>
                </a>
                <a
                  href={OFFICIAL_CHURCH_INFO.social.facebook}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center space-x-1.5 px-3 py-1.5 rounded-lg bg-blue-50 text-blue-600 text-xs font-semibold hover:bg-blue-100 transition"
                >
                  <Facebook className="w-4 h-4" />
                  <span>Facebook</span>
                </a>
              </div>
            </div>

            {/* Pastoral Office Hours */}
            <div className="bg-slate-900 text-white rounded-3xl p-6 sm:p-8 shadow-xl border border-amber-500/30 space-y-3">
              <div className="flex items-center space-x-2 text-amber-400 text-xs font-bold uppercase tracking-wider">
                <Clock className="w-4 h-4" />
                <span>Permanences Pastorales</span>
              </div>
              <h3 className="font-serif font-bold text-lg text-white">
                Accueil Pastoral de Damé
              </h3>
              <p className="text-xs text-slate-300 leading-relaxed">
                Le Pasteur Bequel CHERELUS et le Conseil des Diacres reçoivent les fidèles et visiteurs :
              </p>
              <ul className="text-xs text-slate-300 space-y-1.5 pt-1">
                <li>• <strong>Mardi :</strong> 14h00 – 16h00 (Conseil &amp; Prière individuelle)</li>
                <li>• <strong>Jeudi :</strong> 14h00 – 16h00 (Entretiens de baptême &amp; foyers)</li>
                <li>• <strong>Dimanche :</strong> À l’issue du culte d’adoration</li>
              </ul>
            </div>
          </div>

          {/* Form Column with 2 Tabs: Prière Confidentielle vs Message Général */}
          <div className="lg:col-span-7">
            <div className="bg-white rounded-3xl p-6 sm:p-10 shadow-xl border border-slate-200 space-y-6">
              {/* Tab Selector */}
              <div className="flex flex-col sm:flex-row p-1.5 bg-slate-100 rounded-2xl gap-2">
                <button
                  type="button"
                  onClick={() => setActiveTab('prayer')}
                  className={`flex-1 py-3 px-4 rounded-xl text-xs sm:text-sm font-bold transition flex items-center justify-center space-x-2 ${
                    activeTab === 'prayer'
                      ? 'bg-amber-500 text-slate-950 shadow-md font-extrabold'
                      : 'text-slate-600 hover:text-slate-950 hover:bg-white/60'
                  }`}
                >
                  <Heart className={`w-4 h-4 ${activeTab === 'prayer' ? 'fill-slate-950' : 'text-amber-600'}`} />
                  <span>Requête de Prière Confidentielle</span>
                </button>

                <button
                  type="button"
                  onClick={() => setActiveTab('general')}
                  className={`flex-1 py-3 px-4 rounded-xl text-xs sm:text-sm font-bold transition flex items-center justify-center space-x-2 ${
                    activeTab === 'general'
                      ? 'bg-slate-900 text-white shadow-md font-extrabold'
                      : 'text-slate-600 hover:text-slate-950 hover:bg-white/60'
                  }`}
                >
                  <MessageSquare className="w-4 h-4" />
                  <span>Message au Secrétariat</span>
                </button>
              </div>

              {/* TAB 1: FORMULAIRE DE PRIÈRE CONFIDENTIELLE */}
              {activeTab === 'prayer' ? (
                <div className="space-y-6 animate-in fade-in duration-200">
                  <div className="border-b pb-4">
                    <div className="inline-flex items-center space-x-1.5 px-3 py-1 rounded-full bg-amber-50 text-amber-800 text-[11px] font-bold border border-amber-200">
                      <Lock className="w-3 h-3 text-amber-600" />
                      <span>Espace Pastoral Strictement Confidentiel</span>
                    </div>
                    <h2 className="font-serif font-bold text-slate-900 text-xl sm:text-2xl mt-2">
                      Déposer une Demande de Prière
                    </h2>
                    <p className="text-xs text-slate-600 mt-1 leading-relaxed">
                      Votre fardeau est sacré. Cette requête parvient directement au Pasteur Bequel CHERELUS.
                      Vous pouvez choisir de rester anonyme si vous le souhaitez.
                    </p>
                  </div>

                  {prayerStatus.type === 'success' ? (
                    <div className="p-6 rounded-2xl bg-emerald-50 border border-emerald-200 text-emerald-900 space-y-3 text-center">
                      <CheckCircle2 className="w-12 h-12 text-emerald-600 mx-auto" />
                      <h3 className="font-serif font-bold text-lg text-emerald-950">
                        Votre fardeau est porté dans la prière
                      </h3>
                      <p className="text-xs text-emerald-800 leading-relaxed max-w-lg mx-auto">
                        {prayerStatus.message}
                      </p>
                      <blockquote className="p-3 bg-white/70 rounded-xl text-xs italic text-slate-700 max-w-md mx-auto border border-emerald-200">
                        « Ne vous inquiétez de rien; mais en toute chose faites connaître vos besoins à Dieu par des prières et des supplications... Et la paix de Dieu gardera vos cœurs. »
                        <span className="block font-bold not-italic text-[10px] text-amber-700 mt-1">— Philippiens 4:6-7</span>
                      </blockquote>
                      <button
                        onClick={() => setPrayerStatus({ type: 'idle', message: '' })}
                        className="mt-2 px-4 py-2 rounded-xl text-xs font-bold bg-emerald-700 text-white hover:bg-emerald-800"
                      >
                        Déposer une autre requête
                      </button>
                    </div>
                  ) : (
                    <form onSubmit={handleSubmitPrayer} className="space-y-4">
                      {/* Catégorie de la prière */}
                      <div>
                        <label className="block text-xs font-bold text-slate-700 mb-1">
                          Domaine de la Prière *
                        </label>
                        <select
                          value={prayerData.category}
                          onChange={(e) => setPrayerData({ ...prayerData, category: e.target.value })}
                          className="w-full px-3.5 py-2.5 text-xs rounded-xl border border-slate-300 focus:outline-none focus:border-amber-400 bg-white font-medium"
                        >
                          <option value="Santé & Guérison">Santé, Maladie &amp; Guérison</option>
                          <option value="Famille & Foyer">Famille, Couple &amp; Foyer</option>
                          <option value="Délivrance Spirituelle & Paix">Délivrance Spirituelle &amp; Paix Intérieure</option>
                          <option value="Travail, Emploi & Finances">Travail, Emploi &amp; Finances</option>
                          <option value="Enfants & Études">Avenir des Enfants &amp; Études</option>
                          <option value="Action de Grâce & Témoignage">Action de Grâce &amp; Remerciement à Dieu</option>
                          <option value="Autre fardeau">Autre besoin ou épreuve</option>
                        </select>
                      </div>

                      {/* Anonymat Toggle */}
                      <div className="p-3 bg-slate-50 rounded-xl border border-slate-200 flex items-center justify-between">
                        <div>
                          <span className="text-xs font-bold text-slate-800 block">
                            Rester Anonyme ?
                          </span>
                          <span className="text-[11px] text-slate-500">
                            Dieu connaît votre nom sans que vous ayez besoin de l’indiquer.
                          </span>
                        </div>
                        <input
                          type="checkbox"
                          checked={prayerData.isAnonymous}
                          onChange={(e) => setPrayerData({ ...prayerData, isAnonymous: e.target.checked })}
                          className="w-4 h-4 text-amber-600 rounded border-slate-300 focus:ring-amber-500 cursor-pointer"
                        />
                      </div>

                      {/* Nom et Prénom si pas anonyme */}
                      {!prayerData.isAnonymous && (
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                          <div>
                            <label className="block text-xs font-bold text-slate-700 mb-1">
                              Votre Nom &amp; Prénom
                            </label>
                            <input
                              type="text"
                              placeholder="Ex : Frère Jean / Sœur Marie"
                              value={prayerData.fullName}
                              onChange={(e) => setPrayerData({ ...prayerData, fullName: e.target.value })}
                              className="w-full px-3.5 py-2.5 text-xs rounded-xl border border-slate-300 focus:outline-none focus:border-amber-400"
                            />
                          </div>

                          <div>
                            <label className="block text-xs font-bold text-slate-700 mb-1">
                              Téléphone ou WhatsApp (Optionnel)
                            </label>
                            <input
                              type="tel"
                              placeholder="+509 ... / +1 ..."
                              value={prayerData.phone}
                              onChange={(e) => setPrayerData({ ...prayerData, phone: e.target.value })}
                              className="w-full px-3.5 py-2.5 text-xs rounded-xl border border-slate-300 focus:outline-none focus:border-amber-400"
                            />
                          </div>
                        </div>
                      )}

                      {/* Intention de prière détaillée */}
                      <div>
                        <label className="block text-xs font-bold text-slate-700 mb-1">
                          Votre Sujet de Prière Détaillé *
                        </label>
                        <textarea
                          rows={5}
                          required
                          placeholder="Décrivez avec vos mots ce qui pèse sur votre cœur ou ce que vous désirez confier à Dieu..."
                          value={prayerData.message}
                          onChange={(e) => setPrayerData({ ...prayerData, message: e.target.value })}
                          className="w-full p-3 text-xs rounded-xl border border-slate-300 focus:outline-none focus:border-amber-400 leading-relaxed"
                        />
                      </div>

                      {/* Options de confidentialité et d'urgence */}
                      <div className="space-y-2 pt-1">
                        <label className="flex items-center space-x-2.5 text-xs text-slate-700 cursor-pointer">
                          <input
                            type="checkbox"
                            checked={prayerData.pastorOnly}
                            onChange={(e) => setPrayerData({ ...prayerData, pastorOnly: e.target.checked })}
                            className="w-4 h-4 text-amber-600 rounded border-slate-300 focus:ring-amber-500"
                          />
                          <span className="font-medium">
                            Confidentiel : Uniquement pour le Pasteur Bequel CHERELUS (ne pas partager avec l’équipe du mardi)
                          </span>
                        </label>

                        <label className="flex items-center space-x-2.5 text-xs text-slate-700 cursor-pointer">
                          <input
                            type="checkbox"
                            checked={prayerData.isUrgent}
                            onChange={(e) => setPrayerData({ ...prayerData, isUrgent: e.target.checked })}
                            className="w-4 h-4 text-rose-600 rounded border-slate-300 focus:ring-rose-500"
                          />
                          <span className="font-bold text-rose-700">
                            Urgence spirituelle ou médicale immédiate
                          </span>
                        </label>
                      </div>

                      {prayerStatus.type === 'error' && (
                        <div className="p-3 rounded-xl bg-rose-50 border border-rose-200 text-xs text-rose-800 flex items-center space-x-2">
                          <AlertCircle className="w-4 h-4 text-rose-600 flex-shrink-0" />
                          <span>{prayerStatus.message}</span>
                        </div>
                      )}

                      <button
                        type="submit"
                        disabled={prayerLoading}
                        className="w-full py-3.5 rounded-xl font-bold text-xs bg-amber-500 text-slate-950 hover:bg-amber-400 transition shadow-lg shadow-amber-500/20 disabled:opacity-50 flex items-center justify-center space-x-2"
                      >
                        {prayerLoading ? (
                          <>
                            <Loader2 className="w-4 h-4 animate-spin" />
                            <span>Transmission en cours...</span>
                          </>
                        ) : (
                          <>
                            <Heart className="w-4 h-4 fill-slate-950" />
                            <span>Déposer ma Requête de Prière Confidentielle</span>
                          </>
                        )}
                      </button>
                    </form>
                  )}
                </div>
              ) : (
                /* TAB 2: FORMULAIRE DE CONTACT GÉNÉRAL */
                <div className="space-y-6 animate-in fade-in duration-200">
                  <div className="border-b pb-4">
                    <span className="text-xs font-bold text-slate-600 uppercase tracking-widest bg-slate-100 px-3 py-1 rounded-full">
                      Secrétariat Général
                    </span>
                    <h2 className="font-serif font-bold text-slate-900 text-xl sm:text-2xl mt-2">
                      Envoyer un Message Administratif
                    </h2>
                    <p className="text-xs text-slate-600 mt-1">
                      Pour toute question concernant les cultes, le projet CDEJ HA 0926 ou une demande de certificat.
                    </p>
                  </div>

                  <form onSubmit={handleSubmitGeneral} className="space-y-4">
                    <div>
                      <label className="block text-xs font-bold text-slate-700 mb-1">
                        Nom complet *
                      </label>
                      <input
                        type="text"
                        required
                        placeholder="Ex : Frère Jean DUPONT"
                        value={formData.fullName}
                        onChange={(e) => setFormData({ ...formData, fullName: e.target.value })}
                        className="w-full px-3.5 py-2.5 text-xs rounded-xl border border-slate-300 focus:outline-none focus:border-amber-400"
                      />
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-xs font-bold text-slate-700 mb-1">
                          Adresse email *
                        </label>
                        <input
                          type="email"
                          required
                          placeholder="jean.dupont@email.com"
                          value={formData.email}
                          onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                          className="w-full px-3.5 py-2.5 text-xs rounded-xl border border-slate-300 focus:outline-none focus:border-amber-400"
                        />
                      </div>
                      <div>
                        <label className="block text-xs font-bold text-slate-700 mb-1">
                          Téléphone (Optionnel)
                        </label>
                        <input
                          type="tel"
                          placeholder="+509 ..."
                          value={formData.phone}
                          onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                          className="w-full px-3.5 py-2.5 text-xs rounded-xl border border-slate-300 focus:outline-none focus:border-amber-400"
                        />
                      </div>
                    </div>

                    <div>
                      <label className="block text-xs font-bold text-slate-700 mb-1">
                        Objet du message
                      </label>
                      <input
                        type="text"
                        placeholder="Ex : Information sur le projet CDEJ / Visite"
                        value={formData.subject}
                        onChange={(e) => setFormData({ ...formData, subject: e.target.value })}
                        className="w-full px-3.5 py-2.5 text-xs rounded-xl border border-slate-300 focus:outline-none focus:border-amber-400"
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-bold text-slate-700 mb-1">
                        Votre message *
                      </label>
                      <textarea
                        rows={4}
                        required
                        placeholder="Écrivez votre message ici..."
                        value={formData.message}
                        onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                        className="w-full p-3 text-xs rounded-xl border border-slate-300 focus:outline-none focus:border-amber-400 leading-relaxed"
                      />
                    </div>

                    {status.type === 'success' && (
                      <div className="p-3.5 rounded-xl bg-emerald-50 border border-emerald-200 text-xs text-emerald-800 flex items-center space-x-2">
                        <CheckCircle2 className="w-4 h-4 text-emerald-600 flex-shrink-0" />
                        <span>{status.message}</span>
                      </div>
                    )}

                    {status.type === 'error' && (
                      <div className="p-3.5 rounded-xl bg-rose-50 border border-rose-200 text-xs text-rose-800 flex items-center space-x-2">
                        <AlertCircle className="w-4 h-4 text-rose-600 flex-shrink-0" />
                        <span>{status.message}</span>
                      </div>
                    )}

                    <button
                      type="submit"
                      disabled={loading}
                      className="w-full py-3.5 rounded-xl font-bold text-xs bg-slate-900 text-white hover:bg-slate-800 transition shadow-lg shadow-slate-900/20 disabled:opacity-50 flex items-center justify-center space-x-2"
                    >
                      {loading ? (
                        <>
                          <Loader2 className="w-4 h-4 animate-spin" />
                          <span>Envoi en cours...</span>
                        </>
                      ) : (
                        <>
                          <Send className="w-4 h-4" />
                          <span>Envoyer le Message au Secrétariat</span>
                        </>
                      )}
                    </button>
                  </form>
                </div>
              )}
            </div>
          </div>
        </div>
      </section>

      {/* GOOGLE MAPS SECTION WITH OFFICIAL LINK */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="bg-slate-900 text-white rounded-3xl p-6 sm:p-10 shadow-2xl border border-amber-500/30 overflow-hidden">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
            <div className="lg:col-span-7 space-y-4">
              <div className="inline-flex items-center space-x-2 px-3 py-1 rounded-full bg-amber-500/10 border border-amber-400/30 text-amber-300 text-xs font-bold uppercase tracking-wider">
                <MapPin className="w-3.5 h-3.5" />
                <span>Lokalizasyon GPS &amp; Google Maps</span>
              </div>

              <h2 className="font-serif text-2xl sm:text-3xl font-extrabold text-white">
                Vizite Nou nan 3èm Seksyon Damé, Haïti
              </h2>

              <p className="text-xs sm:text-sm text-slate-300 leading-relaxed">
                Legliz la sitiye nan kè 3ème Section Damé, nan Komin Môle-Saint-Nicolas (Département du Nord-Ouest). Klike sou bouton anba a pou louvri pwen GPS egzak la dirèkteman sou telefòn ou nan Google Maps.
              </p>

              <div className="pt-2 flex flex-wrap items-center gap-3">
                <a
                  href="https://share.google/9kpd149ZpzHWNxOXI"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="px-6 py-3.5 rounded-xl text-xs font-bold bg-amber-500 text-slate-950 hover:bg-amber-400 transition flex items-center space-x-2 shadow-lg shadow-amber-500/20"
                >
                  <MapPin className="w-4 h-4" />
                  <span>Ouvri nan Google Maps (Itinerè GPS)</span>
                </a>

                <a
                  href="tel:+50948596089"
                  className="px-5 py-3.5 rounded-xl text-xs font-bold bg-slate-800 text-slate-200 hover:text-white hover:bg-slate-700 transition border border-slate-700 flex items-center space-x-2"
                >
                  <Phone className="w-4 h-4 text-amber-400" />
                  <span>Gid nan Telefòn : +509 48596089</span>
                </a>
              </div>
            </div>

            <div className="lg:col-span-5 bg-slate-950 p-6 rounded-2xl border border-slate-800 space-y-3">
              <span className="text-[11px] font-bold text-amber-400 uppercase tracking-wider block">
                Itinerè &amp; Aksè
              </span>
              <ul className="text-xs text-slate-300 space-y-2">
                <li>• <strong>Depi Mòl Sen Nikola :</strong> Pran wout prensipal ki mennen nan 3èm Seksyon Damé.</li>
                <li>• <strong>Depi Bonbadopolis :</strong> Wout nasyonal la pase pa kafou Damé.</li>
                <li>• <strong>Pòdpè / Jean-Rabel :</strong> Aksè pa wout Nòdwès la.</li>
              </ul>
              <div className="pt-2 border-t border-slate-800 text-[11px] text-slate-400 font-mono">
                Lyen pataj Google Maps : <br />
                <a href="https://share.google/9kpd149ZpzHWNxOXI" target="_blank" rel="noopener noreferrer" className="text-amber-400 hover:underline">
                  https://share.google/9kpd149ZpzHWNxOXI
                </a>
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};
