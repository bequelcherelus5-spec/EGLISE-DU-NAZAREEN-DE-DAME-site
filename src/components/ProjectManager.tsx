import React, { useState, useEffect } from 'react';
import { ManagedProject } from '../types';
import { projectService } from '../services/projectService';
import { 
  getSupabaseStatus, 
  testSupabaseConnection, 
  setRuntimeSupabaseCredentials 
} from '../services/supabaseClient';
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
  Globe,
  Upload,
  Camera,
  Database,
  RefreshCw,
  AlertCircle,
  Key,
  Copy,
  Check,
  FileCode
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

  // Supabase Status & Sync
  const [supabaseStatus, setSupabaseStatus] = useState(() => getSupabaseStatus());
  const [syncingSupabase, setSyncingSupabase] = useState(false);
  const [supabaseDiag, setSupabaseDiag] = useState<string | null>(null);
  const [rlsBlocked, setRlsBlocked] = useState(false);

  // Modals de configuration et diagnostic
  const [showConfigModal, setShowConfigModal] = useState(false);
  const [showSqlModal, setShowSqlModal] = useState(false);
  const [customUrl, setCustomUrl] = useState('');
  const [customKey, setCustomKey] = useState('');
  const [copySuccess, setCopySuccess] = useState(false);

  useEffect(() => {
    loadProjects();
    setSupabaseStatus(getSupabaseStatus());
  }, []);

  const loadProjects = async () => {
    setLoading(true);
    try {
      const data = await projectService.getProjects();
      setProjects(data);
      setSupabaseStatus(getSupabaseStatus());
      if (onProjectsUpdated) onProjectsUpdated();
    } catch {
      // Ignorer
    } finally {
      setLoading(false);
    }
  };

  const showNotice = (type: 'success' | 'error', message: string) => {
    setActionNotice({ type, message });
    setTimeout(() => setActionNotice(null), 5000);
  };

  const handleTestSupabase = async () => {
    setSyncingSupabase(true);
    try {
      const res = await testSupabaseConnection();
      setSupabaseDiag(res.message);
      setRlsBlocked(Boolean(res.rlsBlocked));
      if (res.success) {
        showNotice('success', res.message);
      } else {
        showNotice('error', res.message);
        if (res.rlsBlocked) {
          setShowSqlModal(true);
        }
      }
    } finally {
      setSyncingSupabase(false);
    }
  };

  const handleSyncSupabase = async () => {
    setSyncingSupabase(true);
    try {
      const res = await projectService.syncLocalProjectsToSupabase();
      setRlsBlocked(Boolean(res.rlsBlocked));
      showNotice(res.failed === 0 ? 'success' : 'error', res.message);
      if (res.rlsBlocked) {
        setShowSqlModal(true);
      }
      await loadProjects();
    } catch (err: any) {
      showNotice('error', 'Erè pandan senkronizasyon an: ' + (err?.message || 'Inconnue'));
    } finally {
      setSyncingSupabase(false);
    }
  };

  const handleSaveCustomCredentials = (e: React.FormEvent) => {
    e.preventDefault();
    if (!customUrl.trim() || !customKey.trim()) {
      showNotice('error', 'Tanpri mete URL ak ANON_KEY Supabase ou an.');
      return;
    }
    const ok = setRuntimeSupabaseCredentials(customUrl.trim(), customKey.trim());
    if (ok) {
      showNotice('success', 'Konfigirasyon Supabase anrejistre avèk siksè nan navigatè a !');
      setShowConfigModal(false);
      setSupabaseStatus(getSupabaseStatus());
      loadProjects();
    } else {
      showNotice('error', 'Enfòmasyon Supabase yo pa parèt kòrèk (verifye URL la ak kle a).');
    }
  };

  const handleCopySql = () => {
    const sql = `-- POLITIQUES DE SÉCURITÉ ROW LEVEL SECURITY (RLS) POUR LA TABLE PROJECTS
ALTER TABLE public.projects ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Gestion projets admin" ON public.projects;
DROP POLICY IF EXISTS "Gestion projets admin et secretariat" ON public.projects;
DROP POLICY IF EXISTS "Lecture publique des projets" ON public.projects;

-- 1. Lecture publique (permet à tout le monde de voir les projets sur le site)
CREATE POLICY "Lecture publique des projets" 
  ON public.projects FOR SELECT USING (true);

-- 2. Écriture / Modification autorisée pour le Secrétariat
CREATE POLICY "Gestion projets admin et secretariat" 
  ON public.projects FOR ALL TO anon, authenticated 
  USING (true) WITH CHECK (true);`;

    navigator.clipboard.writeText(sql);
    setCopySuccess(true);
    setTimeout(() => setCopySuccess(false), 3000);
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

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    Array.from(files).forEach((file) => {
      if (!file.type.startsWith('image/')) return;
      const reader = new FileReader();
      reader.onload = (event) => {
        const rawDataUrl = event.target?.result as string;
        if (!rawDataUrl) return;

        // Compression automatique pour mobile et web (max 960px, qualité 0.75)
        const img = new Image();
        img.onload = () => {
          const maxDim = 960;
          let width = img.width;
          let height = img.height;
          if (width > maxDim || height > maxDim) {
            if (width > height) {
              height = Math.round((height * maxDim) / width);
              width = maxDim;
            } else {
              width = Math.round((width * maxDim) / height);
              height = maxDim;
            }
          }
          const canvas = document.createElement('canvas');
          canvas.width = width;
          canvas.height = height;
          const ctx = canvas.getContext('2d');
          if (ctx) {
            ctx.drawImage(img, 0, 0, width, height);
            const compressedUrl = canvas.toDataURL('image/jpeg', 0.75);
            setFormImages((prev) => [...prev, compressedUrl]);
          } else {
            setFormImages((prev) => [...prev, rawDataUrl]);
          }
        };
        img.src = rawDataUrl;
      };
      reader.readAsDataURL(file);
    });
    e.target.value = '';
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
        if (updated._syncWarning) {
          showNotice('error', updated._syncWarning);
        } else {
          showNotice('success', `Pwojè « ${updated.title} » mete ajou ak siksè nan Supabase !`);
        }
      } else {
        showNotice('error', 'Échec de mise à jour du projet.');
      }
    } else {
      const created = await projectService.createProject(payload);
      if (created) {
        if (created._syncWarning) {
          showNotice('error', `Atansyon : ${created._syncWarning}`);
        } else {
          showNotice('success', `Nouveau projet « ${created.title} » créé et synchronisé sur Supabase !`);
        }
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

        {/* Supabase Cloud Connection & Sync Bar */}
        <div className="mt-6 pt-6 border-t border-slate-800/80 flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-slate-950/60 p-4 rounded-2xl border border-slate-800">
          <div className="flex items-center space-x-3">
            <div className={`p-2 rounded-xl ${supabaseStatus.isConfigured ? 'bg-emerald-500/20 text-emerald-400' : 'bg-amber-500/20 text-amber-300'}`}>
              <Database className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center space-x-2">
                <span className="text-xs font-bold text-white">Base de données Supabase Cloud :</span>
                {supabaseStatus.isConfigured ? (
                  <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 flex items-center gap-1">
                    <CheckCircle2 className="w-3 h-3" /> Connecté ({supabaseStatus.projectUrl})
                  </span>
                ) : (
                  <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-amber-500/20 text-amber-300 border border-amber-500/30 flex items-center gap-1">
                    <AlertCircle className="w-3 h-3" /> Mode Local / En attente
                  </span>
                )}
              </div>
              <p className="text-[11px] text-slate-400 mt-0.5">
                Les projets enregistrés ici montent en direct sur <span className="text-amber-300 font-medium">www.eglisedunazareendedame.org</span> via la table <code className="text-slate-300">projects</code>.
              </p>
              {supabaseDiag && (
                <p className="text-[11px] text-amber-300 mt-1 font-mono">
                  {supabaseDiag}
                </p>
              )}
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <button
              type="button"
              onClick={handleTestSupabase}
              disabled={syncingSupabase}
              className="px-3 py-1.5 rounded-xl text-xs font-bold bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 transition flex items-center space-x-1.5"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${syncingSupabase ? 'animate-spin' : ''}`} />
              <span>Tester Supabase</span>
            </button>
            <button
              type="button"
              onClick={handleSyncSupabase}
              disabled={syncingSupabase}
              className="px-3.5 py-1.5 rounded-xl text-xs font-bold bg-indigo-600 hover:bg-indigo-500 text-white transition shadow flex items-center space-x-1.5"
              title="Pousser les projets locaux vers la base Supabase"
            >
              <Upload className="w-3.5 h-3.5" />
              <span>Pousser vers Supabase</span>
            </button>
            <button
              type="button"
              onClick={() => {
                setCustomUrl(localStorage.getItem('dame_vite_supabase_url') || '');
                setCustomKey(localStorage.getItem('dame_vite_supabase_anon_key') || '');
                setShowConfigModal(true);
              }}
              className="px-3 py-1.5 rounded-xl text-xs font-bold bg-slate-800 hover:bg-slate-700 text-amber-300 border border-slate-700 transition flex items-center space-x-1.5"
              title="Configurer manuellement les clés Supabase si besoin"
            >
              <Key className="w-3.5 h-3.5" />
              <span>Kle Supabase</span>
            </button>
            <button
              type="button"
              onClick={() => setShowSqlModal(true)}
              className="px-3 py-1.5 rounded-xl text-xs font-bold bg-slate-800 hover:bg-slate-700 text-slate-300 border border-slate-700 transition flex items-center space-x-1.5"
              title="Voir et copier le script SQL RLS"
            >
              <FileCode className="w-3.5 h-3.5 text-amber-400" />
              <span>Kòd SQL RLS</span>
            </button>
          </div>
        </div>

        {/* Alerte urgente si RLS est bloqué */}
        {rlsBlocked && (
          <div className="mt-4 p-4 rounded-2xl bg-amber-500/10 border border-amber-500/30 text-amber-200 text-xs flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div className="flex items-center space-x-2">
              <AlertCircle className="w-5 h-5 text-amber-400 flex-shrink-0" />
              <div>
                <span className="font-bold text-white block">Supabase RLS Policy Bloke Pwojè yo :</span>
                <span>Baz done Supabase la bezwen politik RLS pou anon/authenticated gen dwa ekri nan tab 'projects'.</span>
              </div>
            </div>
            <button
              type="button"
              onClick={() => setShowSqlModal(true)}
              className="px-3.5 py-1.5 rounded-xl bg-amber-500 text-slate-950 font-bold hover:bg-amber-400 transition text-xs flex items-center justify-center space-x-1.5 flex-shrink-0"
            >
              <FileCode className="w-4 h-4" />
              <span>Kopi Kòd SQL la</span>
            </button>
          </div>
        )}
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
                        <div className="flex flex-wrap items-center gap-2 mb-1.5">
                          <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-slate-100 text-slate-700">
                            {p.category}
                          </span>
                          {p.code && (
                            <span className="text-[10px] font-mono text-slate-400">
                              {p.code}
                            </span>
                          )}
                          {p.id.startsWith('local-') || p._source === 'local' ? (
                            <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-amber-500/10 text-amber-600 border border-amber-500/30 flex items-center gap-1">
                              <AlertCircle className="w-3 h-3 text-amber-500" />
                              <span>Lokal sèlman</span>
                            </span>
                          ) : (
                            <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-emerald-500/10 text-emerald-700 border border-emerald-500/30 flex items-center gap-1">
                              <Database className="w-3 h-3 text-emerald-600" />
                              <span>Supabase Cloud</span>
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

                    {p._syncWarning && (
                      <div className="p-2 rounded-lg bg-amber-50 border border-amber-200 text-[11px] text-amber-800 flex items-start gap-1.5">
                        <AlertCircle className="w-3.5 h-3.5 text-amber-600 flex-shrink-0 mt-0.5" />
                        <span>{p._syncWarning}</span>
                      </div>
                    )}

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

                <div className="space-y-2">
                  <div className="flex flex-col sm:flex-row gap-2">
                    <label
                      htmlFor="project-phone-image-upload"
                      className="cursor-pointer px-4 py-2.5 rounded-xl text-xs font-bold bg-amber-500 text-slate-950 hover:bg-amber-400 transition flex items-center justify-center space-x-2 shadow-sm"
                    >
                      <Camera className="w-4 h-4" />
                      <span>📸 Chwazi Foto nan Telefòn / Òdinatè</span>
                    </label>
                    <input
                      id="project-phone-image-upload"
                      type="file"
                      accept="image/*"
                      multiple
                      onChange={handleFileUpload}
                      className="hidden"
                    />

                    <div className="flex-grow flex gap-2">
                      <input
                        type="url"
                        placeholder="Oswa kole yon lyen imaj (https://...)"
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
                        <span>Kole Lyen</span>
                      </button>
                    </div>
                  </div>
                  <p className="text-[11px] text-slate-500">
                    💡 Ou ka chwazi nenpòt foto ki nan galri telefòn ou oswa pran yon foto dirèk ak kamera w. Foto a konprese otomatikman pou l pa ralanti sit la.
                  </p>
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

      {/* MODAL CONFIGURATION MANUELLE SUPABASE */}
      {showConfigModal && (
        <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-white rounded-3xl max-w-lg w-full p-6 sm:p-8 space-y-6 shadow-2xl border border-slate-200">
            <div className="flex items-center justify-between border-b pb-4">
              <div className="flex items-center space-x-2">
                <div className="p-2 rounded-xl bg-amber-500/10 text-amber-600">
                  <Key className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-serif text-lg font-bold text-slate-900">
                    Konfigirasyon Kle Supabase
                  </h3>
                  <p className="text-xs text-slate-500">
                    Konekte sit la dirèkteman ak baz done Supabase ou a
                  </p>
                </div>
              </div>
              <button
                onClick={() => setShowConfigModal(false)}
                className="p-1 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-100"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-3.5 rounded-2xl bg-slate-50 border border-slate-200 text-xs text-slate-600 space-y-1.5">
              <p className="font-semibold text-slate-800">
                Eta aktyèl : {supabaseStatus.isConfigured ? (
                  <span className="text-emerald-600 font-bold">Konekte ({supabaseStatus.source})</span>
                ) : (
                  <span className="text-amber-600 font-bold">Poko konekte / Kle manke</span>
                )}
              </p>
              <p className="text-[11px] text-slate-500 leading-relaxed">
                Si varyab yo pa t pran pandan deplwaman Cloudflare la, ou ka kole yo isit la kounye a pou debloke piblikasyon an imedyatman nan navigatè w la.
              </p>
            </div>

            <form onSubmit={handleSaveCustomCredentials} className="space-y-4">
              <div className="space-y-1">
                <label className="text-xs font-bold text-slate-700">
                  VITE_SUPABASE_URL (URL Pwojè a) :
                </label>
                <input
                  type="text"
                  value={customUrl}
                  onChange={(e) => setCustomUrl(e.target.value)}
                  placeholder="https://xyzabcdefg.supabase.co"
                  className="w-full px-3 py-2 text-xs rounded-xl border border-slate-300 font-mono focus:outline-none focus:border-amber-500"
                  required
                />
              </div>

              <div className="space-y-1">
                <label className="text-xs font-bold text-slate-700">
                  VITE_SUPABASE_ANON_KEY (Kle Anonim lan) :
                </label>
                <textarea
                  rows={3}
                  value={customKey}
                  onChange={(e) => setCustomKey(e.target.value)}
                  placeholder="eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
                  className="w-full px-3 py-2 text-xs rounded-xl border border-slate-300 font-mono focus:outline-none focus:border-amber-500"
                  required
                />
              </div>

              <div className="p-3 rounded-xl bg-amber-50 border border-amber-200 text-[11px] text-amber-800">
                <strong>Konsèy Cloudflare Pages :</strong> Pou tout vizitè sou <em>www.eglisedunazareendedame.org</em> wè pwojè yo san w pa bezwen mete kle sa yo chak fwa, mete varyab sa yo nan <strong>Cloudflare Pages &gt; Settings &gt; Environment variables</strong> epi klike <strong>Retry deployment</strong>.
              </div>

              <div className="flex items-center justify-end space-x-3 pt-3 border-t">
                <button
                  type="button"
                  onClick={() => setShowConfigModal(false)}
                  className="px-4 py-2 rounded-xl text-xs font-bold text-slate-600 hover:bg-slate-100"
                >
                  Anile
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl text-xs font-bold bg-amber-500 text-slate-950 hover:bg-amber-400 shadow-md"
                >
                  Anrejistre &amp; Konekte Kounye a
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL SCRIPT SQL RLS POUR SUPABASE */}
      {showSqlModal && (
        <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-white rounded-3xl max-w-2xl w-full p-6 sm:p-8 space-y-6 shadow-2xl border border-slate-200">
            <div className="flex items-center justify-between border-b pb-4">
              <div className="flex items-center space-x-2">
                <div className="p-2 rounded-xl bg-indigo-50 text-indigo-600">
                  <FileCode className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-serif text-lg font-bold text-slate-900">
                    Kòd SQL pou Debloke Supabase (RLS Policy)
                  </h3>
                  <p className="text-xs text-slate-500">
                    Otorize piblikasyon ak lekti pwojè yo sou sit la
                  </p>
                </div>
              </div>
              <button
                onClick={() => setShowSqlModal(false)}
                className="p-1 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-100"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-3 text-xs text-slate-600">
              <p className="leading-relaxed">
                Lè yon pwojè pibliye nan Secrétariat a men li pa monte sou <strong className="text-slate-800">www.eglisedunazareendedame.org</strong>, se paske règleman sekirite (RLS) Supabase bloke ekriti pa kle anonim lan.
              </p>

              <div className="p-3.5 rounded-2xl bg-indigo-50/70 border border-indigo-200 space-y-2">
                <span className="font-bold text-indigo-950 block">Kijan pou w aplike kòd sa a nan 2 minit :</span>
                <ol className="list-decimal list-inside space-y-1 text-[11px] text-indigo-900">
                  <li>Ale sou panèl pwojè Supabase ou an : <strong>supabase.com/dashboard</strong></li>
                  <li>Klike sou meni <strong>SQL Editor</strong> ki sou bò goch la.</li>
                  <li>Klike sou bouton <strong>+ New Query</strong>.</li>
                  <li>Kole kòd ki anba a epi klike sou bouton vèt <strong>RUN</strong>.</li>
                </ol>
              </div>

              <div className="relative">
                <div className="flex items-center justify-between bg-slate-900 text-slate-300 px-4 py-2 rounded-t-xl text-[11px] font-mono border-b border-slate-800">
                  <span>supabase_projects_fix.sql</span>
                  <button
                    type="button"
                    onClick={handleCopySql}
                    className="inline-flex items-center space-x-1 px-2.5 py-1 rounded bg-amber-500 text-slate-950 text-xs font-bold hover:bg-amber-400 transition"
                  >
                    {copySuccess ? (
                      <>
                        <Check className="w-3.5 h-3.5" />
                        <span>Kopye !</span>
                      </>
                    ) : (
                      <>
                        <Copy className="w-3.5 h-3.5" />
                        <span>Kopye Kòd la</span>
                      </>
                    )}
                  </button>
                </div>
                <pre className="p-4 bg-slate-950 text-emerald-400 font-mono text-[11px] rounded-b-xl overflow-x-auto leading-relaxed border border-slate-900 select-all">
{`-- OUVRI PÈMISYON POU PROJÈ YO KAPAB PUBLIYE SOU SITE LA
ALTER TABLE public.projects ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Gestion projets admin" ON public.projects;
DROP POLICY IF EXISTS "Gestion projets admin et secretariat" ON public.projects;
DROP POLICY IF EXISTS "Lecture publique des projets" ON public.projects;

-- 1. Tout moun ka li pwojè ki sou sit la
CREATE POLICY "Lecture publique des projets" 
  ON public.projects FOR SELECT USING (true);

-- 2. Secrétariat ka ajoute, modifye, oswa efase pwojè
CREATE POLICY "Gestion projets admin et secretariat" 
  ON public.projects FOR ALL TO anon, authenticated 
  USING (true) WITH CHECK (true);`}
                </pre>
              </div>
            </div>

            <div className="flex items-center justify-end space-x-3 pt-3 border-t">
              <button
                type="button"
                onClick={() => setShowSqlModal(false)}
                className="px-4 py-2 rounded-xl text-xs font-bold text-slate-700 hover:bg-slate-100"
              >
                Fèmen
              </button>
              <button
                type="button"
                onClick={() => {
                  setShowSqlModal(false);
                  handleTestSupabase();
                }}
                className="px-5 py-2 rounded-xl text-xs font-bold bg-indigo-600 text-white hover:bg-indigo-500 shadow-md"
              >
                Mwen fin kouri l, fè yon tès kounye a
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
