import React, { useState, useEffect } from 'react';
import { ManagedProject } from '../types';
import { projectService } from '../services/projectService';
import { 
  FolderPlus, 
  Edit3, 
  Trash2, 
  Eye, 
  CheckCircle2, 
  Clock, 
  Image as ImageIcon, 
  Plus, 
  ArrowUp, 
  ArrowDown, 
  X, 
  HeartHandshake, 
  Sparkles,
  Search,
  Globe
} from 'lucide-react';

interface ProjectManagerProps {
  onProjectsUpdated?: () => void;
}

export const ProjectManager: React.FC<ProjectManagerProps> = ({ onProjectsUpdated }) => {
  const [projects, setProjects] = useState<ManagedProject[]>([]);
  const [loading, setLoading] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<'all' | 'published' | 'draft'>('all');

  // Modal form states
  const [modalOpen, setModalOpen] = useState(false);
  const [editingProject, setEditingProject] = useState<ManagedProject | null>(null);

  // Form Fields
  const [formTitle, setFormTitle] = useState('');
  const [formCode, setFormCode] = useState('');
  const [formPartner, setFormPartner] = useState('');
  const [formCategory, setFormCategory] = useState('Enfance & Éducation');
  const [formDescription, setFormDescription] = useState('');
  const [formHtmlContent, setFormHtmlContent] = useState('');
  const [formImages, setFormImages] = useState<string[]>([]);
  const [newImageUrl, setNewImageUrl] = useState('');
  const [formAuthor, setFormAuthor] = useState('Pasteur Bequel CHERELUS');
  const [formStatus, setFormStatus] = useState<'draft' | 'published'>('draft');
  const [formTargetAmount, setFormTargetAmount] = useState('');
  const [formBeneficiaries, setFormBeneficiaries] = useState<number | ''>('');

  // Preview Modal
  const [previewProject, setPreviewProject] = useState<ManagedProject | null>(null);

  // Notifications
  const [actionNotice, setActionNotice] = useState<{ type: 'success' | 'error'; message: string } | null>(null);

  useEffect(() => {
    loadProjects();
  }, []);

  const loadProjects = async () => {
    setLoading(true);
    try {
      const data = await projectService.getProjects();
      setProjects(data);
      if (onProjectsUpdated) onProjectsUpdated();
    } catch {
      // Ignorer
    } finally {
      setLoading(false);
    }
  };

  const showNotice = (type: 'success' | 'error', message: string) => {
    setActionNotice({ type, message });
    setTimeout(() => setActionNotice(null), 4000);
  };

  const openCreateModal = () => {
    setEditingProject(null);
    setFormTitle('');
    setFormCode('PROJ-' + Math.floor(100 + Math.random() * 900));
    setFormPartner('Église du Nazaréen de Damé');
    setFormCategory('Enfance & Éducation');
    setFormDescription('');
    setFormHtmlContent('');
    setFormImages([]);
    setNewImageUrl('');
    setFormAuthor('Pasteur Bequel CHERELUS');
    setFormStatus('draft');
    setFormTargetAmount('');
    setFormBeneficiaries('');
    setModalOpen(true);
  };

  const openEditModal = (proj: ManagedProject) => {
    setEditingProject(proj);
    setFormTitle(proj.title);
    setFormCode(proj.code || '');
    setFormPartner(proj.partner || '');
    setFormCategory(proj.category);
    setFormDescription(proj.description);
    setFormHtmlContent(proj.htmlContent || '');
    setFormImages(proj.images || []);
    setNewImageUrl('');
    setFormAuthor(proj.author);
    setFormStatus(proj.status);
    setFormTargetAmount(proj.targetAmount || '');
    setFormBeneficiaries(proj.beneficiariesCount || '');
    setModalOpen(true);
  };

  const handleAddImage = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newImageUrl.trim()) return;
    setFormImages([...formImages, newImageUrl.trim()]);
    setNewImageUrl('');
  };

  const handleRemoveImage = (index: number) => {
    const updated = formImages.filter((_, idx) => idx !== index);
    setFormImages(updated);
  };

  const handleMoveImage = (index: number, direction: 'up' | 'down') => {
    const targetIdx = direction === 'up' ? index - 1 : index + 1;
    if (targetIdx < 0 || targetIdx >= formImages.length) return;
    const updated = [...formImages];
    const temp = updated[index];
    updated[index] = updated[targetIdx];
    updated[targetIdx] = temp;
    setFormImages(updated);
  };

  const handleSaveProject = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formTitle.trim() || !formDescription.trim()) {
      showNotice('error', 'Le titre et la description du projet sont obligatoires.');
      return;
    }

    const payload = {
      title: formTitle.trim(),
      code: formCode.trim() || undefined,
      partner: formPartner.trim() || undefined,
      category: formCategory,
      description: formDescription.trim(),
      htmlContent: formHtmlContent.trim() || undefined,
      images: formImages,
      author: formAuthor.trim() || 'Direction Pastorale',
      status: formStatus,
      targetAmount: formTargetAmount.trim() || undefined,
      beneficiariesCount: formBeneficiaries ? Number(formBeneficiaries) : undefined
    };

    if (editingProject) {
      const updated = await projectService.updateProject(editingProject.id, payload);
      if (updated) {
        showNotice('success', `Projet « ${updated.title} » mis à jour avec succès !`);
      } else {
        showNotice('error', 'Échec de mise à jour du projet.');
      }
    } else {
      const created = await projectService.createProject(payload);
      if (created) {
        showNotice('success', `Nouveau projet « ${created.title} » créé avec succès !`);
      } else {
        showNotice('error', 'Échec de création du projet.');
      }
    }

    setModalOpen(false);
    loadProjects();
  };

  const handleDeleteProject = async (id: string, title: string) => {
    if (!window.confirm(`Confirmez-vous la suppression définitive du projet « ${title} » ?`)) {
      return;
    }
    const ok = await projectService.deleteProject(id);
    if (ok) {
      showNotice('success', `Projet « ${title} » supprimé.`);
      loadProjects();
    } else {
      showNotice('error', 'Erreur lors de la suppression.');
    }
  };

  const handleTogglePublish = async (id: string) => {
    const updated = await projectService.toggleStatus(id);
    if (updated) {
      const isPub = updated.status === 'published';
      showNotice(
        'success',
        isPub 
          ? `Le projet « ${updated.title} » est maintenant publié sur le site officiel !` 
          : `Le projet « ${updated.title} » a été retiré de la publication (Brouillon).`
      );
      loadProjects();
    }
  };

  // Filtrage
  const filteredProjects = projects.filter(p => {
    if (statusFilter !== 'all' && p.status !== statusFilter) return false;
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      return (
        p.title.toLowerCase().includes(q) ||
        p.category.toLowerCase().includes(q) ||
        (p.partner && p.partner.toLowerCase().includes(q)) ||
        p.description.toLowerCase().includes(q)
      );
    }
    return true;
  });

  const publishedCount = projects.filter(p => p.status === 'published').length;
  const draftCount = projects.filter(p => p.status === 'draft').length;

  return (
    <div className="space-y-8">
      {/* Top Banner */}
      <div className="bg-gradient-to-r from-slate-900 to-indigo-950 rounded-3xl p-6 sm:p-8 text-white border border-slate-800 shadow-xl">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="space-y-2">
            <div className="inline-flex items-center space-x-2 px-3 py-1 rounded-full bg-amber-500/20 text-amber-300 text-xs font-bold uppercase tracking-wider">
              <HeartHandshake className="w-3.5 h-3.5" />
              <span>Module Officiel d'Initiatives & Projets</span>
            </div>
            <h2 className="font-serif text-2xl sm:text-3xl font-bold text-white">
              Gestion des Projets
            </h2>
            <p className="text-slate-300 text-xs sm:text-sm max-w-2xl leading-relaxed">
              Ajoutez, modifiez, illustrez et publiez les projets de l'Église. Les projets marqués « Publié »
              apparaissent automatiquement sur la page publique du site web.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            <button
              onClick={openCreateModal}
              className="inline-flex items-center space-x-2 px-5 py-2.5 rounded-xl font-bold text-xs bg-amber-500 text-slate-950 hover:bg-amber-400 transition shadow-lg shadow-amber-500/20"
            >
              <FolderPlus className="w-4 h-4" />
              <span>Nouveau Projet</span>
            </button>
            <button
              onClick={loadProjects}
              className="px-3.5 py-2.5 rounded-xl text-xs font-bold bg-slate-800 text-slate-200 hover:bg-slate-700 transition border border-slate-700"
              title="Rafraîchir"
            >
              Actualiser
            </button>
          </div>
        </div>

        {/* Counters */}
        <div className="grid grid-cols-3 gap-4 mt-6 pt-6 border-t border-slate-800/80 max-w-xl">
          <div className="p-3 rounded-2xl bg-slate-800/50 border border-slate-700/50">
            <span className="text-[11px] text-slate-400 uppercase tracking-wider block font-medium">Total Projets</span>
            <span className="text-2xl font-bold text-amber-400 font-mono">{projects.length}</span>
          </div>
          <div className="p-3 rounded-2xl bg-slate-800/50 border border-slate-700/50">
            <span className="text-[11px] text-slate-400 uppercase tracking-wider block font-medium">Publiés (Site)</span>
            <span className="text-2xl font-bold text-emerald-400 font-mono">{publishedCount}</span>
          </div>
          <div className="p-3 rounded-2xl bg-slate-800/50 border border-slate-700/50">
            <span className="text-[11px] text-slate-400 uppercase tracking-wider block font-medium">Brouillons</span>
            <span className="text-2xl font-bold text-slate-300 font-mono">{draftCount}</span>
          </div>
        </div>
      </div>

      {/* Notice Message */}
      {actionNotice && (
        <div className={`p-4 rounded-2xl border text-xs flex items-center space-x-2 ${
          actionNotice.type === 'success'
            ? 'bg-emerald-50 border-emerald-200 text-emerald-800'
            : 'bg-rose-50 border-rose-200 text-rose-800'
        }`}>
          {actionNotice.type === 'success' ? (
            <CheckCircle2 className="w-4 h-4 text-emerald-600 flex-shrink-0" />
          ) : (
            <X className="w-4 h-4 text-rose-600 flex-shrink-0" />
          )}
          <span className="font-medium">{actionNotice.message}</span>
        </div>
      )}

      {/* Projects List Card */}
      <div className="bg-white rounded-3xl p-6 sm:p-8 shadow-sm border border-slate-200 space-y-6">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 border-b pb-4">
          <div className="flex items-center gap-2">
            <button
              onClick={() => setStatusFilter('all')}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition ${
                statusFilter === 'all' ? 'bg-slate-900 text-white' : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
              }`}
            >
              Tous ({projects.length})
            </button>
            <button
              onClick={() => setStatusFilter('published')}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition ${
                statusFilter === 'published' ? 'bg-emerald-600 text-white' : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
              }`}
            >
              Publiés ({publishedCount})
            </button>
            <button
              onClick={() => setStatusFilter('draft')}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition ${
                statusFilter === 'draft' ? 'bg-amber-500 text-slate-950' : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
              }`}
            >
              Brouillons ({draftCount})
            </button>
          </div>

          <div className="relative w-full sm:w-64">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Rechercher un projet..."
              className="w-full pl-9 pr-3 py-1.5 text-xs rounded-xl border border-slate-200 bg-slate-50 focus:outline-none focus:border-amber-400 focus:bg-white transition"
            />
          </div>
        </div>

        {loading ? (
          <div className="py-12 text-center text-xs text-slate-400">Chargement des projets...</div>
        ) : filteredProjects.length === 0 ? (
          <div className="py-12 text-center border-2 border-dashed border-slate-200 rounded-2xl space-y-3">
            <HeartHandshake className="w-10 h-10 text-slate-300 mx-auto" />
            <p className="text-xs font-bold text-slate-700">Aucun projet dans cette liste.</p>
            <p className="text-[11px] text-slate-400 max-w-md mx-auto">
              Cliquez sur « Nouveau Projet » pour créer et documenter les actions sociales, éducatives et spirituelles de l'Église.
            </p>
            <button
              onClick={openCreateModal}
              className="px-4 py-2 rounded-xl text-xs font-bold bg-amber-500 text-slate-950 hover:bg-amber-400 transition"
            >
              Ajouter un premier projet
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {filteredProjects.map((p) => {
              const hasImages = p.images && p.images.length > 0;
              const mainImage = hasImages ? p.images[0] : null;

              return (
                <div 
                  key={p.id}
                  className="rounded-2xl border border-slate-200 bg-white p-5 hover:shadow-md transition space-y-4 flex flex-col justify-between"
                >
                  <div className="space-y-3">
                    {/* Image header if available */}
                    {mainImage ? (
                      <div className="h-40 rounded-xl overflow-hidden bg-slate-100 relative group">
                        <img 
                          src={mainImage} 
                          alt={p.title} 
                          className="w-full h-full object-cover"
                          onError={(e) => {
                            (e.target as HTMLElement).style.display = 'none';
                          }}
                        />
                        <div className="absolute top-2 right-2 px-2 py-0.5 rounded-full text-[10px] font-bold bg-slate-950/80 text-white backdrop-blur-sm flex items-center space-x-1">
                          <ImageIcon className="w-3 h-3 text-amber-400" />
                          <span>{p.images.length} photo{p.images.length > 1 ? 's' : ''}</span>
                        </div>
                      </div>
                    ) : (
                      <div className="h-24 rounded-xl bg-slate-50 border border-slate-100 flex items-center justify-center text-slate-400 text-xs">
                        <ImageIcon className="w-4 h-4 mr-1 text-slate-300" />
                        <span>Aucune image ajoutée</span>
                      </div>
                    )}

                    <div className="flex items-start justify-between gap-2">
                      <div>
                        <div className="flex items-center gap-2 mb-1">
                          <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-slate-100 text-slate-700">
                            {p.category}
                          </span>
                          {p.code && (
                            <span className="text-[10px] font-mono text-slate-400">
                              {p.code}
                            </span>
                          )}
                        </div>
                        <h4 className="font-serif text-lg font-bold text-slate-900 leading-snug">
                          {p.title}
                        </h4>
                        {p.partner && (
                          <p className="text-[11px] font-medium text-amber-600 mt-0.5">
                            Partenaire : {p.partner}
                          </p>
                        )}
                      </div>

                      <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold flex-shrink-0 flex items-center space-x-1 ${
                        p.status === 'published'
                          ? 'bg-emerald-100 text-emerald-800'
                          : 'bg-amber-100 text-amber-800'
                      }`}>
                        {p.status === 'published' ? (
                          <>
                            <Globe className="w-3 h-3 text-emerald-600" />
                            <span>Publié</span>
                          </>
                        ) : (
                          <>
                            <Clock className="w-3 h-3 text-amber-600" />
                            <span>Brouillon</span>
                          </>
                        )}
                      </span>
                    </div>

                    <p className="text-xs text-slate-600 line-clamp-3 leading-relaxed">
                      {p.description}
                    </p>

                    <div className="pt-2 text-[11px] text-slate-400 flex items-center justify-between border-t border-slate-100">
                      <span>Auteur : {p.author}</span>
                      <span>{new Date(p.createdAt).toLocaleDateString('fr-FR')}</span>
                    </div>
                  </div>

                  {/* Actions Bar */}
                  <div className="flex items-center justify-between pt-3 border-t border-slate-100 gap-2">
                    <button
                      onClick={() => setPreviewProject(p)}
                      className="inline-flex items-center space-x-1 px-3 py-1.5 rounded-lg text-xs font-medium text-slate-600 hover:text-slate-950 hover:bg-slate-100 transition"
                      title="Aperçu avant publication"
                    >
                      <Eye className="w-3.5 h-3.5" />
                      <span>Aperçu</span>
                    </button>

                    <div className="flex items-center space-x-1.5">
                      <button
                        onClick={() => handleTogglePublish(p.id)}
                        className={`px-3 py-1.5 rounded-lg text-xs font-bold transition ${
                          p.status === 'published'
                            ? 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                            : 'bg-emerald-600 text-white hover:bg-emerald-500'
                        }`}
                      >
                        {p.status === 'published' ? 'Dépublier' : 'Publier'}
                      </button>
                      <button
                        onClick={() => openEditModal(p)}
                        className="p-1.5 rounded-lg text-slate-500 hover:text-amber-600 hover:bg-amber-50 transition"
                        title="Modifier le projet"
                      >
                        <Edit3 className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => handleDeleteProject(p.id, p.title)}
                        className="p-1.5 rounded-lg text-slate-400 hover:text-rose-600 hover:bg-rose-50 transition"
                        title="Supprimer définitivement"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* MODAL : Ajouter ou Modifier un Projet */}
      {modalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm">
          <div className="bg-white rounded-3xl max-w-3xl w-full p-6 sm:p-8 shadow-2xl border border-slate-200 space-y-6 max-h-[92vh] overflow-y-auto">
            <div className="flex items-center justify-between border-b pb-4">
              <div>
                <h3 className="font-serif text-xl font-bold text-slate-900">
                  {editingProject ? 'Modifier le Projet' : 'Créer un Nouveau Projet'}
                </h3>
                <p className="text-xs text-slate-500">
                  Renseignez les détails du projet et gérez les visuels officiels.
                </p>
              </div>
              <button
                onClick={() => setModalOpen(false)}
                className="p-2 rounded-xl text-slate-400 hover:text-slate-600 hover:bg-slate-100"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveProject} className="space-y-5">
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div className="sm:col-span-2">
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Titre du Projet *
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="Ex : Centre de Développement de l'Enfant"
                    value={formTitle}
                    onChange={(e) => setFormTitle(e.target.value)}
                    className="w-full px-3.5 py-2 text-xs rounded-xl border border-slate-300 focus:outline-none focus:border-amber-400"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Code / Référence
                  </label>
                  <input
                    type="text"
                    placeholder="Ex : CDEJ HA 0926"
                    value={formCode}
                    onChange={(e) => setFormCode(e.target.value)}
                    className="w-full px-3.5 py-2 text-xs rounded-xl border border-slate-300 focus:outline-none focus:border-amber-400"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Partenaire / Organisation
                  </label>
                  <input
                    type="text"
                    placeholder="Ex : Compassion International"
                    value={formPartner}
                    onChange={(e) => setFormPartner(e.target.value)}
                    className="w-full px-3.5 py-2 text-xs rounded-xl border border-slate-300 focus:outline-none focus:border-amber-400"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Catégorie
                  </label>
                  <select
                    value={formCategory}
                    onChange={(e) => setFormCategory(e.target.value)}
                    className="w-full px-3.5 py-2 text-xs rounded-xl border border-slate-300 focus:outline-none focus:border-amber-400 bg-white"
                  >
                    <option value="Enfance & Éducation">Enfance & Éducation</option>
                    <option value="Santé & Nutrition">Santé & Nutrition</option>
                    <option value="Infrastructure & Bâtiment">Infrastructure & Bâtiment</option>
                    <option value="Évangélisation & Mission">Évangélisation & Mission</option>
                    <option value="Action Sociale & Solidarité">Action Sociale & Solidarité</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Description résumée en texte *
                </label>
                <textarea
                  rows={3}
                  required
                  placeholder="Présentation des objectifs, du public bénéficiaire et de l’impact spirituel et social..."
                  value={formDescription}
                  onChange={(e) => setFormDescription(e.target.value)}
                  className="w-full p-3 text-xs rounded-xl border border-slate-300 focus:outline-none focus:border-amber-400"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Contenu HTML détaillé (Optionnel)
                </label>
                <textarea
                  rows={4}
                  placeholder="<p>Détails complémentaires, axes d’intervention, étapes franchies...</p>"
                  value={formHtmlContent}
                  onChange={(e) => setFormHtmlContent(e.target.value)}
                  className="w-full p-3 font-mono text-xs rounded-xl border border-slate-300 focus:outline-none focus:border-amber-400"
                />
              </div>

              {/* Gestion des Images */}
              <div className="space-y-3 pt-3 border-t">
                <div className="flex items-center justify-between">
                  <label className="text-xs font-bold text-slate-800 flex items-center space-x-1.5">
                    <ImageIcon className="w-4 h-4 text-amber-500" />
                    <span>Images du Projet ({formImages.length})</span>
                  </label>
                  <span className="text-[11px] text-slate-400">
                    Ajoutez l'URL d'une photo pour illustrer ce projet
                  </span>
                </div>

                <div className="flex gap-2">
                  <input
                    type="url"
                    placeholder="https://... ou /images/projets/photo.jpg"
                    value={newImageUrl}
                    onChange={(e) => setNewImageUrl(e.target.value)}
                    className="flex-grow px-3.5 py-2 text-xs rounded-xl border border-slate-300 focus:outline-none focus:border-amber-400"
                  />
                  <button
                    type="button"
                    onClick={handleAddImage}
                    className="px-4 py-2 rounded-xl text-xs font-bold bg-slate-900 text-white hover:bg-slate-800 transition flex items-center space-x-1"
                  >
                    <Plus className="w-3.5 h-3.5" />
                    <span>Ajouter image</span>
                  </button>
                </div>

                {formImages.length > 0 && (
                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 pt-2">
                    {formImages.map((img, idx) => (
                      <div key={idx} className="relative rounded-xl border border-slate-200 overflow-hidden bg-slate-100 group">
                        <img 
                          src={img} 
                          alt={`Photo ${idx + 1}`} 
                          className="w-full h-24 object-cover" 
                          onError={(e) => {
                            (e.target as HTMLElement).setAttribute('src', '/images/eglise/sceau-officiel.svg');
                          }}
                        />
                        <div className="absolute inset-0 bg-slate-950/60 opacity-0 group-hover:opacity-100 transition flex items-center justify-center gap-1.5">
                          <button
                            type="button"
                            onClick={() => handleMoveImage(idx, 'up')}
                            disabled={idx === 0}
                            className="p-1 rounded bg-white/80 text-slate-900 hover:bg-white disabled:opacity-30"
                            title="Déplacer vers la gauche / haut"
                          >
                            <ArrowUp className="w-3 h-3" />
                          </button>
                          <button
                            type="button"
                            onClick={() => handleMoveImage(idx, 'down')}
                            disabled={idx === formImages.length - 1}
                            className="p-1 rounded bg-white/80 text-slate-900 hover:bg-white disabled:opacity-30"
                            title="Déplacer vers la droite / bas"
                          >
                            <ArrowDown className="w-3 h-3" />
                          </button>
                          <button
                            type="button"
                            onClick={() => handleRemoveImage(idx)}
                            className="p-1 rounded bg-rose-600 text-white hover:bg-rose-500"
                            title="Supprimer cette image"
                          >
                            <Trash2 className="w-3 h-3" />
                          </button>
                        </div>
                        <span className="absolute bottom-1 left-1 px-1.5 py-0.5 rounded text-[9px] bg-slate-900/80 text-white font-mono">
                          {idx === 0 ? 'Image principale' : `#${idx + 1}`}
                        </span>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Status and Author */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-3 border-t">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Auteur / Responsable
                  </label>
                  <input
                    type="text"
                    value={formAuthor}
                    onChange={(e) => setFormAuthor(e.target.value)}
                    className="w-full px-3.5 py-2 text-xs rounded-xl border border-slate-300 focus:outline-none focus:border-amber-400"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Statut de publication
                  </label>
                  <select
                    value={formStatus}
                    onChange={(e) => setFormStatus(e.target.value as 'draft' | 'published')}
                    className="w-full px-3.5 py-2 text-xs rounded-xl border border-slate-300 focus:outline-none focus:border-amber-400 bg-white font-bold"
                  >
                    <option value="draft">Brouillon (Non visible au public)</option>
                    <option value="published">Publié (Visible sur le site public)</option>
                  </select>
                </div>
              </div>

              <div className="flex items-center justify-end space-x-3 pt-4 border-t">
                <button
                  type="button"
                  onClick={() => setModalOpen(false)}
                  className="px-4 py-2.5 rounded-xl text-xs font-bold text-slate-600 hover:bg-slate-100 transition"
                >
                  Annuler
                </button>
                <button
                  type="submit"
                  className="px-5 py-2.5 rounded-xl text-xs font-bold bg-amber-500 text-slate-950 hover:bg-amber-400 transition shadow-lg shadow-amber-500/20"
                >
                  {editingProject ? 'Enregistrer les modifications' : 'Créer le projet'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* APERÇU MODAL AVANT PUBLICATION */}
      {previewProject && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/85 backdrop-blur-md">
          <div className="bg-white rounded-3xl max-w-3xl w-full p-6 sm:p-10 shadow-2xl border border-slate-200 space-y-6 max-h-[92vh] overflow-y-auto">
            <div className="flex items-center justify-between border-b pb-4">
              <div className="flex items-center space-x-2">
                <span className="px-3 py-1 rounded-full bg-amber-500/10 text-amber-600 text-xs font-bold">
                  Aperçu Public
                </span>
                <span className="text-xs text-slate-400">
                  {previewProject.status === 'published' ? 'Actuellement en ligne' : 'Actuellement en brouillon'}
                </span>
              </div>
              <button
                onClick={() => setPreviewProject(null)}
                className="p-2 rounded-xl text-slate-400 hover:text-slate-600 hover:bg-slate-100"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Simulated Public Project Card / Detail */}
            <div className="space-y-6">
              {previewProject.images && previewProject.images.length > 0 && (
                <div className="rounded-2xl overflow-hidden bg-slate-900 max-h-80">
                  <img 
                    src={previewProject.images[0]} 
                    alt={previewProject.title} 
                    className="w-full h-full object-cover" 
                  />
                </div>
              )}

              <div className="space-y-2">
                <div className="flex items-center gap-2">
                  <span className="px-2.5 py-0.5 rounded text-[11px] font-bold bg-slate-100 text-slate-800">
                    {previewProject.category}
                  </span>
                  {previewProject.partner && (
                    <span className="text-xs font-medium text-amber-600">
                      En partenariat avec {previewProject.partner}
                    </span>
                  )}
                </div>
                <h2 className="font-serif text-2xl sm:text-3xl font-bold text-slate-900">
                  {previewProject.title}
                </h2>
                <p className="text-xs text-slate-400">
                  Publié par {previewProject.author} • Créé le {new Date(previewProject.createdAt).toLocaleDateString('fr-FR')}
                </p>
              </div>

              <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 text-sm text-slate-700 leading-relaxed whitespace-pre-line">
                {previewProject.description}
              </div>

              {previewProject.htmlContent && (
                <div 
                  className="prose prose-sm max-w-none text-slate-700"
                  dangerouslySetInnerHTML={{ __html: previewProject.htmlContent }}
                />
              )}

              {/* Gallery thumbnails if multiple */}
              {previewProject.images && previewProject.images.length > 1 && (
                <div className="space-y-2">
                  <h4 className="text-xs font-bold text-slate-700">Galerie photo du projet :</h4>
                  <div className="grid grid-cols-3 gap-3">
                    {previewProject.images.map((img, i) => (
                      <img key={i} src={img} alt="" className="w-full h-20 rounded-xl object-cover border" />
                    ))}
                  </div>
                </div>
              )}
            </div>

            <div className="flex items-center justify-end space-x-3 pt-4 border-t">
              <button
                type="button"
                onClick={() => setPreviewProject(null)}
                className="px-4 py-2 rounded-xl text-xs font-bold text-slate-700 hover:bg-slate-100"
              >
                Fermer l'aperçu
              </button>
              {previewProject.status === 'draft' && (
                <button
                  type="button"
                  onClick={() => {
                    handleTogglePublish(previewProject.id);
                    setPreviewProject(null);
                  }}
                  className="px-5 py-2 rounded-xl text-xs font-bold bg-emerald-600 text-white hover:bg-emerald-500 shadow-md"
                >
                  Publier sur le site maintenant
                </button>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
