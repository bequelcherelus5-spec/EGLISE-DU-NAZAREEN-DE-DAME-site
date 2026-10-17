import React, { useState, useEffect } from 'react';
import { ManagedProject } from '../types';
import { projectService } from '../services/projectService';
import { SEOHead } from '../components/SEOHead';
import { 
  HeartHandshake, 
  ShieldCheck, 
  Users, 
  MapPin, 
  Send, 
  CheckCircle2, 
  Calendar,
  Image as ImageIcon,
  ArrowRight,
  X,
  User,
  Heart
} from 'lucide-react';

interface ProjectsProps {
  onNavigate: (path: string) => void;
}

export const Projects: React.FC<ProjectsProps> = ({ onNavigate }) => {
  const [projects, setProjects] = useState<ManagedProject[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedProject, setSelectedProject] = useState<ManagedProject | null>(null);

  // Support Modal
  const [supportModalOpen, setSupportModalOpen] = useState(false);
  const [supportProjectTitle, setSupportProjectTitle] = useState('');
  const [supportForm, setSupportForm] = useState({
    name: '',
    email: '',
    phone: '',
    type: 'parrainage',
    message: ''
  });
  const [sent, setSent] = useState(false);

  useEffect(() => {
    loadPublishedProjects();
  }, []);

  const loadPublishedProjects = async () => {
    setLoading(true);
    try {
      const data = await projectService.getProjects('published');
      setProjects(data);
    } catch {
      setProjects([]);
    } finally {
      setLoading(false);
    }
  };

  const openSupportModal = (projectTitle: string) => {
    setSupportProjectTitle(projectTitle);
    setSupportModalOpen(true);
  };

  const handleSupportSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setSent(true);
    setTimeout(() => {
      setSent(false);
      setSupportModalOpen(false);
      setSupportForm({ name: '', email: '', phone: '', type: 'parrainage', message: '' });
    }, 2500);
  };

  return (
    <div className="space-y-16 pb-20">
      <SEOHead 
        title="Projets & Initiatives Officielles | Église du Nazaréen de Damé"
        description="Découvrez les projets sociaux, éducatifs et missionnaires menés par l'Église du Nazaréen de Damé, Haïti."
        path="/projets"
        image="/images/eglise/sceau-officiel.svg"
      />

      {/* Hero Header */}
      <section className="relative bg-gradient-to-b from-slate-950 via-slate-900 to-indigo-950 text-white py-16 sm:py-24 px-4 overflow-hidden">
        <div className="max-w-5xl mx-auto text-center space-y-6 relative z-10">
          <div className="inline-flex items-center space-x-2 px-4 py-1.5 rounded-full bg-amber-500/20 text-amber-300 text-xs font-bold uppercase tracking-widest border border-amber-500/30">
            <HeartHandshake className="w-4 h-4" />
            <span>Chantiers & Action Sociale</span>
          </div>

          <h1 className="font-serif text-3xl sm:text-5xl lg:text-6xl font-extrabold text-white leading-tight">
            Projets &amp; Œuvres de l'Église
          </h1>

          <p className="text-slate-300 text-sm sm:text-base md:text-lg max-w-3xl mx-auto leading-relaxed">
            L'Église du Nazaréen de Damé s'engage activement pour la transformation spirituelle,
            éducative et sociale de notre communauté à travers des projets concrets, transparents et durables.
          </p>

          <div className="flex flex-wrap items-center justify-center gap-4 text-xs font-medium text-slate-300 pt-2">
            <span className="flex items-center space-x-1.5 bg-slate-800/80 px-3 py-1.5 rounded-xl border border-slate-700">
              <MapPin className="w-3.5 h-3.5 text-amber-400" />
              <span>3ème Section Damé, Môle-Saint-Nicolas</span>
            </span>
            <span className="flex items-center space-x-1.5 bg-slate-800/80 px-3 py-1.5 rounded-xl border border-slate-700">
              <ShieldCheck className="w-3.5 h-3.5 text-amber-400" />
              <span>Gestion Responsable & Transparente</span>
            </span>
          </div>
        </div>
      </section>

      {/* Published Projects List */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-10">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 border-b pb-4">
          <div>
            <h2 className="font-serif text-2xl sm:text-3xl font-bold text-slate-900">
              Projets Actuellement en Cours
            </h2>
            <p className="text-xs sm:text-sm text-slate-500 mt-1">
              Initiatives officielles validées et publiées par la direction de l'Église.
            </p>
          </div>
          <span className="px-3.5 py-1 rounded-full text-xs font-bold bg-amber-100 text-amber-900 font-mono">
            {projects.length} projet{projects.length > 1 ? 's' : ''} publié{projects.length > 1 ? 's' : ''}
          </span>
        </div>

        {loading ? (
          <div className="py-20 text-center space-y-3">
            <div className="w-10 h-10 border-4 border-amber-500 border-t-transparent rounded-full animate-spin mx-auto" />
            <p className="text-xs text-slate-500 font-medium">Chargement des projets...</p>
          </div>
        ) : projects.length === 0 ? (
          <div className="py-16 text-center border-2 border-dashed border-slate-200 rounded-3xl p-8 max-w-2xl mx-auto space-y-4">
            <HeartHandshake className="w-12 h-12 text-slate-300 mx-auto" />
            <h3 className="font-serif text-xl font-bold text-slate-800">
              Aucun projet public actif pour le moment
            </h3>
            <p className="text-xs sm:text-sm text-slate-500 leading-relaxed">
              La direction pastorale et le secrétariat mettent à jour les projets communautaires. 
              Les nouvelles initiatives en cours de planification paraîtront très prochainement sur cette page.
            </p>
            <div className="pt-2">
              <button
                onClick={() => onNavigate('/contact')}
                className="inline-flex items-center space-x-2 px-5 py-2.5 rounded-xl font-bold text-xs bg-slate-900 text-white hover:bg-slate-800 transition"
              >
                <span>Contacter l'Église pour proposer une initiative</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {projects.map((proj) => {
              const hasImages = proj.images && proj.images.length > 0;
              const banner = hasImages ? proj.images[0] : null;

              return (
                <div
                  key={proj.id}
                  className="bg-white rounded-3xl border border-slate-200 overflow-hidden shadow-sm hover:shadow-lg transition flex flex-col justify-between"
                >
                  <div className="space-y-4">
                    {/* Project Image */}
                    {banner ? (
                      <div className="h-48 overflow-hidden bg-slate-100 relative group">
                        <img 
                          src={banner} 
                          alt={proj.title}
                          className="w-full h-full object-cover group-hover:scale-105 transition duration-500"
                          onError={(e) => {
                            (e.target as HTMLElement).style.display = 'none';
                          }}
                        />
                        {proj.images.length > 1 && (
                          <div className="absolute bottom-2 right-2 px-2.5 py-1 rounded-full text-[10px] font-bold bg-slate-950/80 text-white backdrop-blur-sm flex items-center space-x-1">
                            <ImageIcon className="w-3 h-3 text-amber-400" />
                            <span>{proj.images.length} photos</span>
                          </div>
                        )}
                      </div>
                    ) : (
                      <div className="h-32 bg-gradient-to-br from-slate-900 to-indigo-950 p-6 flex items-center justify-center text-center">
                        <span className="font-serif font-bold text-amber-400 text-sm tracking-wide">
                          « SAINTETÉ À L’ÉTERNEL »
                        </span>
                      </div>
                    )}

                    <div className="p-6 space-y-3">
                      <div className="flex items-center justify-between gap-2">
                        <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-amber-50 text-amber-800 border border-amber-200">
                          {proj.category}
                        </span>
                        {proj.code && (
                          <span className="text-[10px] font-mono text-slate-400">
                            {proj.code}
                          </span>
                        )}
                      </div>

                      <h3 className="font-serif text-xl font-bold text-slate-900 leading-snug">
                        {proj.title}
                      </h3>

                      {proj.partner && (
                        <p className="text-xs font-semibold text-amber-600">
                          Partenaire : {proj.partner}
                        </p>
                      )}

                      <p className="text-xs text-slate-600 line-clamp-3 leading-relaxed">
                        {proj.description}
                      </p>

                      <div className="pt-3 border-t border-slate-100 flex items-center justify-between text-[11px] text-slate-400">
                        <span className="flex items-center space-x-1">
                          <User className="w-3 h-3" />
                          <span>{proj.author}</span>
                        </span>
                        <span className="flex items-center space-x-1">
                          <Calendar className="w-3 h-3" />
                          <span>{new Date(proj.createdAt).toLocaleDateString('fr-FR')}</span>
                        </span>
                      </div>
                    </div>
                  </div>

                  <div className="p-6 pt-0 flex items-center justify-between gap-3">
                    <button
                      onClick={() => setSelectedProject(proj)}
                      className="inline-flex items-center space-x-1.5 text-xs font-bold text-slate-700 hover:text-amber-600 transition"
                    >
                      <span>Voir le projet complet</span>
                      <ArrowRight className="w-3.5 h-3.5" />
                    </button>
                    <button
                      onClick={() => openSupportModal(proj.title)}
                      className="inline-flex items-center space-x-1.5 px-3.5 py-1.5 rounded-xl text-xs font-bold bg-amber-500 text-slate-950 hover:bg-amber-400 transition shadow-sm"
                    >
                      <Heart className="w-3 h-3 fill-slate-950" />
                      <span>Soutenir</span>
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </section>

      {/* DETAIL MODAL FOR SELECTED PROJECT */}
      {selectedProject && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/85 backdrop-blur-md">
          <div className="bg-white rounded-3xl max-w-3xl w-full p-6 sm:p-10 shadow-2xl border border-slate-200 space-y-6 max-h-[92vh] overflow-y-auto">
            <div className="flex items-center justify-between border-b pb-4">
              <div className="flex items-center space-x-2">
                <span className="px-3 py-1 rounded-full bg-amber-100 text-amber-800 text-xs font-bold">
                  {selectedProject.category}
                </span>
                {selectedProject.code && (
                  <span className="text-xs font-mono text-slate-400">
                    {selectedProject.code}
                  </span>
                )}
              </div>
              <button
                onClick={() => setSelectedProject(null)}
                className="p-2 rounded-xl text-slate-400 hover:text-slate-600 hover:bg-slate-100"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {selectedProject.images && selectedProject.images.length > 0 && (
              <div className="rounded-2xl overflow-hidden bg-slate-900 max-h-80">
                <img 
                  src={selectedProject.images[0]} 
                  alt={selectedProject.title} 
                  className="w-full h-full object-cover" 
                />
              </div>
            )}

            <div className="space-y-3">
              <h2 className="font-serif text-2xl sm:text-3xl font-bold text-slate-900">
                {selectedProject.title}
              </h2>

              {selectedProject.partner && (
                <p className="text-sm font-semibold text-amber-600">
                  Partenaire officiel : {selectedProject.partner}
                </p>
              )}

              <p className="text-xs text-slate-400">
                Publié par {selectedProject.author} • Créé le {new Date(selectedProject.createdAt).toLocaleDateString('fr-FR', { year: 'numeric', month: 'long', day: 'numeric' })}
              </p>
            </div>

            <div className="p-5 rounded-2xl bg-slate-50 border border-slate-200 text-sm text-slate-800 leading-relaxed whitespace-pre-line">
              {selectedProject.description}
            </div>

            {selectedProject.htmlContent && (
              <div 
                className="prose prose-sm max-w-none text-slate-700 pt-4 border-t border-slate-100"
                dangerouslySetInnerHTML={{ __html: selectedProject.htmlContent }}
              />
            )}

            {/* Additional Project Photos */}
            {selectedProject.images && selectedProject.images.length > 1 && (
              <div className="space-y-3 pt-4 border-t border-slate-100">
                <h4 className="text-xs font-bold text-slate-900 uppercase tracking-wider flex items-center space-x-1.5">
                  <ImageIcon className="w-3.5 h-3.5 text-amber-500" />
                  <span>Galerie Photo du Projet</span>
                </h4>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                  {selectedProject.images.map((img, i) => (
                    <div key={i} className="h-28 rounded-xl overflow-hidden border border-slate-200">
                      <img src={img} alt="" className="w-full h-full object-cover" />
                    </div>
                  ))}
                </div>
              </div>
            )}

            <div className="flex items-center justify-between pt-6 border-t">
              <button
                type="button"
                onClick={() => setSelectedProject(null)}
                className="px-4 py-2 rounded-xl text-xs font-bold text-slate-600 hover:bg-slate-100"
              >
                Fermer
              </button>
              <button
                type="button"
                onClick={() => {
                  const title = selectedProject.title;
                  setSelectedProject(null);
                  openSupportModal(title);
                }}
                className="inline-flex items-center space-x-2 px-6 py-2.5 rounded-xl text-xs font-bold bg-amber-500 text-slate-950 hover:bg-amber-400 transition shadow-lg shadow-amber-500/20"
              >
                <Heart className="w-3.5 h-3.5 fill-slate-950" />
                <span>Soutenir ce Projet</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* SUPPORT MODAL */}
      {supportModalOpen && (
        <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-lg w-full p-6 sm:p-8 shadow-2xl border border-amber-500/40 space-y-4">
            <div className="flex items-center justify-between border-b pb-3">
              <h3 className="font-serif font-bold text-slate-900 text-lg">
                Soutenir le Projet
              </h3>
              <button
                onClick={() => setSupportModalOpen(false)}
                className="text-slate-400 hover:text-slate-600"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {sent ? (
              <div className="py-8 text-center space-y-2">
                <CheckCircle2 className="w-12 h-12 text-emerald-500 mx-auto" />
                <h4 className="font-serif font-bold text-slate-900 text-lg">
                  Merci de votre engagement généreux !
                </h4>
                <p className="text-xs text-slate-600">
                  Votre message de soutien pour « {supportProjectTitle} » a été transmis à la direction pastorale de l'Église.
                </p>
              </div>
            ) : (
              <form onSubmit={handleSupportSubmit} className="space-y-3">
                <div className="p-2.5 rounded-xl bg-slate-50 border text-xs text-slate-700">
                  <strong>Projet concerné :</strong> {supportProjectTitle || 'Projet Général'}
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Type de soutien *</label>
                  <select
                    value={supportForm.type}
                    onChange={(e) => setSupportForm({ ...supportForm, type: e.target.value })}
                    className="w-full px-3 py-2 text-xs rounded-lg border border-slate-300 focus:outline-none focus:border-amber-500"
                  >
                    <option value="parrainage">Parrainage ou don financier</option>
                    <option value="don_materiel">Don de matériel, vivres ou kits</option>
                    <option value="benevolat">Bénévolat ou assistance technique</option>
                    <option value="priere">Engagement d'intercession pour ce projet</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Votre Nom &amp; Prénom *</label>
                  <input
                    type="text"
                    required
                    value={supportForm.name}
                    onChange={(e) => setSupportForm({ ...supportForm, name: e.target.value })}
                    className="w-full px-3 py-2 text-xs rounded-lg border border-slate-300 focus:outline-none focus:border-amber-500"
                  />
                </div>

                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">Email *</label>
                    <input
                      type="email"
                      required
                      value={supportForm.email}
                      onChange={(e) => setSupportForm({ ...supportForm, email: e.target.value })}
                      className="w-full px-3 py-2 text-xs rounded-lg border border-slate-300 focus:outline-none focus:border-amber-500"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">Téléphone *</label>
                    <input
                      type="tel"
                      required
                      value={supportForm.phone}
                      onChange={(e) => setSupportForm({ ...supportForm, phone: e.target.value })}
                      className="w-full px-3 py-2 text-xs rounded-lg border border-slate-300 focus:outline-none focus:border-amber-500"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Message d'accompagnement</label>
                  <textarea
                    rows={3}
                    value={supportForm.message}
                    onChange={(e) => setSupportForm({ ...supportForm, message: e.target.value })}
                    placeholder="Précisions sur votre contribution ou souhaits particuliers..."
                    className="w-full px-3 py-2 text-xs rounded-lg border border-slate-300 focus:outline-none focus:border-amber-500"
                  />
                </div>

                <div className="pt-2 flex justify-end space-x-2">
                  <button
                    type="button"
                    onClick={() => setSupportModalOpen(false)}
                    className="px-4 py-2 rounded-lg text-xs font-semibold text-slate-600 hover:bg-slate-100"
                  >
                    Annuler
                  </button>
                  <button
                    type="submit"
                    className="px-5 py-2 rounded-lg text-xs font-bold bg-amber-500 text-slate-950 hover:bg-amber-400"
                  >
                    Valider mon soutien
                  </button>
                </div>
              </form>
            )}
          </div>
        </div>
      )}
    </div>
  );
};
