import { ManagedProject } from '../types';
import { supabase, isSupabaseConfigured } from './supabaseClient';

const STORAGE_KEY = 'dame_managed_projects';

// Helper pour mapper une ligne Supabase vers ManagedProject
function mapSupabaseRowToProject(row: any): ManagedProject {
  const isDraft = row.status === 'planning' || row.status === 'draft';
  return {
    id: String(row.id),
    title: row.title || 'Projet sans titre',
    code: row.code || undefined,
    partner: row.partner || 'Église du Nazaréen de Damé',
    category: row.category || 'Enfance & Éducation',
    description: row.summary || row.description || '',
    htmlContent: row.full_description || row.html_content || undefined,
    images: row.banner_url ? [row.banner_url] : Array.isArray(row.images) ? row.images : [],
    author: row.author || 'Direction Pastorale',
    createdAt: row.created_at || new Date().toISOString(),
    updatedAt: row.updated_at || undefined,
    status: isDraft ? 'draft' : 'published',
    beneficiariesCount: row.beneficiaries_reached || row.beneficiaries_target || 0,
    _source: 'supabase',
  };
}

export const projectService = {
  // Récupérer la liste des projets (Supabase direct en priorité absolue)
  async getProjects(status?: 'published' | 'draft'): Promise<ManagedProject[]> {
    // 1. Priorité Supabase en direct
    if (isSupabaseConfigured && supabase) {
      try {
        let query = supabase
          .from('projects')
          .select('*')
          .order('created_at', { ascending: false });

        if (status === 'published') {
          // Un projet est publié si son statut est 'active', 'completed' ou 'published' (pas 'planning' ni 'draft')
          query = query.neq('status', 'planning');
        } else if (status === 'draft') {
          query = query.in('status', ['planning', 'draft']);
        }

        const { data, error } = await query;
        if (!error && Array.isArray(data)) {
          const mapped = data.map(mapSupabaseRowToProject);
          // Mettre en cache pour consultation hors-ligne
          if (!status) {
            localStorage.setItem(STORAGE_KEY, JSON.stringify(mapped));
          }
          return mapped;
        } else if (error) {
          console.warn('[ProjectService] Erreur de lecture Supabase:', error.message, error.hint);
        }
      } catch (err) {
        console.warn('[ProjectService] Exception requête Supabase:', err);
      }
    }

    // 2. Fallback API serveur (/api/projects) si exécuté avec backend Node.js
    try {
      const url = status ? `/api/projects?status=${status}` : '/api/projects';
      const res = await fetch(url);
      if (res.ok) {
        const data = await res.json();
        if (Array.isArray(data)) {
          if (!status) {
            localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
          }
          return data;
        }
      }
    } catch {
      // Ignorer
    }

    // 3. Fallback stockage local (marqué avec _source: 'local')
    try {
      const cached = localStorage.getItem(STORAGE_KEY);
      if (cached) {
        const parsed: ManagedProject[] = JSON.parse(cached);
        const marked = parsed.map(p => ({
          ...p,
          _source: p.id.startsWith('local-') ? ('local' as const) : (p._source || 'supabase'),
        }));
        if (status) {
          return marked.filter(p => p.status === status);
        }
        return marked;
      }
    } catch {
      // Ignorer
    }

    return [];
  },

  // Créer un projet (Directement dans Supabase table 'projects')
  async createProject(project: Omit<ManagedProject, 'id' | 'createdAt'>): Promise<ManagedProject | null> {
    const bannerUrl = project.images && project.images.length > 0 ? project.images[0] : null;
    const dbStatus = project.status === 'draft' ? 'planning' : 'active';
    let projCode = project.code?.trim() || ('HA-0926-' + Date.now().toString().slice(-6));

    // 1. Insertion directe dans Supabase table 'projects'
    if (isSupabaseConfigured && supabase) {
      try {
        let row: any = {
          code: projCode,
          title: project.title.trim(),
          partner: project.partner?.trim() || 'Église du Nazaréen de Damé',
          category: project.category || 'Enfance & Éducation',
          summary: project.description.trim(),
          full_description: (project.htmlContent || project.description).trim(),
          status: dbStatus,
          beneficiaries_target: project.beneficiariesCount || 0,
          beneficiaries_reached: project.beneficiariesCount || 0,
          banner_url: bannerUrl,
        };

        let { data, error } = await supabase
          .from('projects')
          .insert([row])
          .select()
          .single();

        // 1. Fallback automatique si la colonne 'category' n'existe pas dans la table Supabase (schema cache error)
        if (error && (error.message.includes('category') || (error.message.includes('schema cache') && error.message.includes('category')))) {
          console.warn('[ProjectService] Colonne category non trouvée dans le cache Supabase, réessai en retirant category...');
          delete row.category;
          const retryCat = await supabase.from('projects').insert([row]).select().single();
          data = retryCat.data;
          error = retryCat.error;
        }

        // 2. Fallback automatique si la colonne 'banner_url' n'existe pas dans la table Supabase
        if (error && (error.message.includes('banner_url') || error.message.includes('schema cache'))) {
          console.warn('[ProjectService] Colonne banner_url non trouvée dans le cache Supabase, réessai sans banner_url...');
          delete row.banner_url;
          const retryBanner = await supabase.from('projects').insert([row]).select().single();
          data = retryBanner.data;
          error = retryBanner.error;
        }

        // 3. Si le code existe déjà ou si les deux colonnes posaient problème
        if (error && (error.message.includes('unique') || error.message.includes('code'))) {
          projCode = 'PROJ-' + Date.now();
          row.code = projCode;
          delete row.banner_url;
          delete row.category;
          const retry = await supabase.from('projects').insert([row]).select().single();
          data = retry.data;
          error = retry.error;
        }

        if (!error && data) {
          const created = mapSupabaseRowToProject(data);
          // Préserver category et banner_url localement si la DB ne stocke pas encore ces colonnes
          if (project.category && (!created.category || created.category === 'Enfance & Éducation')) {
            created.category = project.category;
          }
          if (bannerUrl && (!created.images || created.images.length === 0)) {
            created.images = [bannerUrl];
          }
          // Mettre à jour le cache local immédiatement
          const current = await this.getProjects();
          const filtered = current.filter(p => p.id !== created.id);
          localStorage.setItem(STORAGE_KEY, JSON.stringify([created, ...filtered]));
          return created;
        } else if (error) {
          console.error('[ProjectService] Erreur insertion Supabase:', error.message, error.details, error.hint);
          // Enregistrer en local avec un avertissement explicite de synchronisation
          const localList = await this.getProjects();
          const newProj: ManagedProject = {
            ...project,
            id: 'local-' + Date.now(),
            createdAt: new Date().toISOString(),
            _source: 'local',
            _syncWarning: `Erè Supabase: ${error.message}. Pwojè a anrejistre lokalman sèlman.`,
          };
          const updated = [newProj, ...localList];
          localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
          return newProj;
        }
      } catch (err: any) {
        console.error('[ProjectService] Exception insertion Supabase:', err);
      }
    }

    // 2. Fallback API serveur local
    try {
      const res = await fetch('/api/projects', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(project),
      });
      if (res.ok) {
        const data = await res.json();
        if (data && data.project) return data.project;
      }
    } catch {
      // Ignorer
    }

    // 3. Fallback Local Storage
    const localList = await this.getProjects();
    const newProj: ManagedProject = {
      ...project,
      id: 'local-' + Date.now(),
      createdAt: new Date().toISOString(),
      _source: 'local',
      _syncWarning: isSupabaseConfigured
        ? 'Pa rive konekte ak Supabase. Anrejistre lokalman sèlman.'
        : 'Supabase pa konfigire. Pwojè a sove nan navigatè a sèlman.',
    };
    const updated = [newProj, ...localList];
    localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
    return newProj;
  },

  // Modifier un projet (Directement dans Supabase table 'projects')
  async updateProject(id: string, updates: Partial<ManagedProject>): Promise<ManagedProject | null> {
    const isLocalId = id.startsWith('local-');

    // 1. Si le projet était uniquement en local, tenter de le migrer vers Supabase lors de la modification
    if (isLocalId && isSupabaseConfigured && supabase) {
      const localList = await this.getProjects();
      const existing = localList.find(p => p.id === id);
      if (existing) {
        const merged = { ...existing, ...updates };
        const createdOnSupabase = await this.createProject({
          title: merged.title,
          code: merged.code,
          partner: merged.partner,
          category: merged.category,
          description: merged.description,
          htmlContent: merged.htmlContent,
          images: merged.images,
          author: merged.author,
          status: merged.status,
          targetAmount: merged.targetAmount,
          currentAmount: merged.currentAmount,
          beneficiariesCount: merged.beneficiariesCount,
        });

        if (createdOnSupabase && !createdOnSupabase.id.startsWith('local-')) {
          // Supprimer l'ancienne version locale
          const filtered = localList.filter(p => p.id !== id);
          localStorage.setItem(STORAGE_KEY, JSON.stringify([createdOnSupabase, ...filtered]));
          return createdOnSupabase;
        }
      }
    }

    // 2. Mise à jour Supabase directe pour les IDs valides
    if (!isLocalId && isSupabaseConfigured && supabase) {
      try {
        const patch: Record<string, any> = {};
        if (updates.title !== undefined) patch.title = updates.title.trim();
        if (updates.code !== undefined) patch.code = updates.code.trim();
        if (updates.partner !== undefined) patch.partner = updates.partner.trim();
        if (updates.category !== undefined) patch.category = updates.category;
        if (updates.description !== undefined) patch.summary = updates.description.trim();
        if (updates.htmlContent !== undefined) patch.full_description = updates.htmlContent.trim();
        if (updates.status !== undefined) {
          patch.status = updates.status === 'draft' ? 'planning' : 'active';
        }
        if (updates.beneficiariesCount !== undefined) {
          patch.beneficiaries_reached = updates.beneficiariesCount;
          patch.beneficiaries_target = updates.beneficiariesCount;
        }
        if (updates.images !== undefined) {
          patch.banner_url = updates.images.length > 0 ? updates.images[0] : null;
        }

        let { data, error } = await supabase
          .from('projects')
          .update(patch)
          .eq('id', id)
          .select()
          .single();

        // Fallback si la colonne 'category' n'existe pas dans la table Supabase
        if (error && (error.message.includes('category') || (error.message.includes('schema cache') && error.message.includes('category')))) {
          console.warn('[ProjectService] Colonne category non supportée lors de update, réessai sans category...');
          delete patch.category;
          const retryCat = await supabase
            .from('projects')
            .update(patch)
            .eq('id', id)
            .select()
            .single();
          data = retryCat.data;
          error = retryCat.error;
        }

        if (error && (error.message.includes('banner_url') || error.message.includes('schema cache'))) {
          console.warn('[ProjectService] Colonne banner_url non supportée lors de update, réessai sans banner_url...');
          const patchWithoutBanner = { ...patch };
          delete patchWithoutBanner.banner_url;
          delete patchWithoutBanner.category;
          const retry = await supabase
            .from('projects')
            .update(patchWithoutBanner)
            .eq('id', id)
            .select()
            .single();
          data = retry.data;
          error = retry.error;
        }

        if (!error && data) {
          const updatedProj = mapSupabaseRowToProject(data);
          if (updates.images && (!updatedProj.images || updatedProj.images.length === 0)) {
            updatedProj.images = updates.images;
          }
          const current = await this.getProjects();
          const idx = current.findIndex(p => p.id === id);
          if (idx !== -1) current[idx] = updatedProj;
          localStorage.setItem(STORAGE_KEY, JSON.stringify(current));
          return updatedProj;
        } else if (error) {
          console.error('[ProjectService] Erreur mise à jour Supabase:', error.message, error.hint);
        }
      } catch (err) {
        console.error('[ProjectService] Exception update Supabase:', err);
      }
    }

    // 3. Fallback Local
    const localList = await this.getProjects();
    const idx = localList.findIndex(p => p.id === id);
    if (idx !== -1) {
      localList[idx] = { ...localList[idx], ...updates, updatedAt: new Date().toISOString() };
      localStorage.setItem(STORAGE_KEY, JSON.stringify(localList));
      return localList[idx];
    }
    return null;
  },

  // Supprimer un projet (Directement dans Supabase table 'projects')
  async deleteProject(id: string): Promise<boolean> {
    const isLocalId = id.startsWith('local-');

    // 1. Suppression Supabase (si l'ID est un UUID Supabase)
    if (!isLocalId && isSupabaseConfigured && supabase) {
      try {
        const { error } = await supabase.from('projects').delete().eq('id', id);
        if (!error) {
          const current = await this.getProjects();
          localStorage.setItem(STORAGE_KEY, JSON.stringify(current.filter(p => p.id !== id)));
          return true;
        } else {
          console.error('[ProjectService] Erreur suppression Supabase:', error.message);
        }
      } catch (err) {
        console.error('[ProjectService] Exception suppression Supabase:', err);
      }
    }

    // 2. Fallback Local
    const localList = await this.getProjects();
    const filtered = localList.filter(p => p.id !== id);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(filtered));
    return true;
  },

  // Basculer statut publié / brouillon
  async toggleStatus(id: string): Promise<ManagedProject | null> {
    const list = await this.getProjects();
    const target = list.find(p => p.id === id);
    if (!target) return null;

    const nextStatus = target.status === 'published' ? 'draft' : 'published';
    return this.updateProject(id, { status: nextStatus });
  },

  // Migration / Synchronisation des projets locaux vers Supabase
  // Permet de pousser vers Supabase les projets créés en local ou sur environnement de test
  async syncLocalProjectsToSupabase(): Promise<{ 
    uploaded: number; 
    failed: number; 
    message: string;
    rlsBlocked?: boolean;
  }> {
    if (!isSupabaseConfigured || !supabase) {
      return { 
        uploaded: 0, 
        failed: 0, 
        message: 'Supabase pa konfigire. Verifye VITE_SUPABASE_URL ak VITE_SUPABASE_ANON_KEY.',
        rlsBlocked: false,
      };
    }

    let localProjects: ManagedProject[] = [];
    try {
      const cached = localStorage.getItem(STORAGE_KEY);
      if (cached) localProjects = JSON.parse(cached);
    } catch {
      return { uploaded: 0, failed: 0, message: 'Pa gen pwojè lokal pou senkronize.' };
    }

    if (!localProjects || localProjects.length === 0) {
      return { uploaded: 0, failed: 0, message: 'Pa gen okenn pwojè nan memwa lokal la.' };
    }

    // Récupérer les projets déjà présents sur Supabase pour éviter les doublons
    const { data: remoteData, error: fetchErr } = await supabase.from('projects').select('id, code, title');
    if (fetchErr) {
      const isRls = fetchErr.code === '42501' || fetchErr.message.toLowerCase().includes('policy');
      return {
        uploaded: 0,
        failed: localProjects.length,
        message: `Erè Supabase: ${fetchErr.message}`,
        rlsBlocked: isRls,
      };
    }

    const existingTitles = new Set((remoteData || []).map((r: any) => (r.title || '').trim().toLowerCase()));
    const existingCodes = new Set((remoteData || []).map((r: any) => (r.code || '').trim()));

    let uploaded = 0;
    let failed = 0;
    let rlsDetected = false;

    for (const proj of localProjects) {
      const titleLower = proj.title.trim().toLowerCase();
      // Si déjà sur Supabase avec un vrai UUID, ignorer
      if (!proj.id.startsWith('local-') && (existingTitles.has(titleLower) || (proj.code && existingCodes.has(proj.code)))) {
        continue;
      }

      try {
        const uniqueCode = proj.code?.trim() || ('HA-0926-' + Date.now().toString().slice(-6));
        let row: any = {
          code: uniqueCode,
          title: proj.title.trim(),
          partner: proj.partner?.trim() || 'Église du Nazaréen de Damé',
          category: proj.category || 'Enfance & Éducation',
          summary: proj.description.trim(),
          full_description: (proj.htmlContent || proj.description).trim(),
          status: proj.status === 'draft' ? 'planning' : 'active',
          beneficiaries_target: proj.beneficiariesCount || 0,
          beneficiaries_reached: proj.beneficiariesCount || 0,
          banner_url: proj.images && proj.images.length > 0 ? proj.images[0] : null,
        };

        let { error: insertErr } = await supabase.from('projects').insert([row]);
        if (insertErr && (insertErr.message.includes('banner_url') || insertErr.message.includes('schema cache'))) {
          delete row.banner_url;
          const retry = await supabase.from('projects').insert([row]);
          insertErr = retry.error;
        }

        if (!insertErr) {
          uploaded++;
        } else {
          failed++;
          if (insertErr.code === '42501' || insertErr.message.toLowerCase().includes('policy')) {
            rlsDetected = true;
          }
        }
      } catch {
        failed++;
      }
    }

    // Rafraîchir le cache avec la liste officielle Supabase
    await this.getProjects();

    return {
      uploaded,
      failed,
      message: uploaded > 0
        ? `${uploaded} pwojè transfere avèk siksè nan Supabase ! (${failed} echèk)`
        : failed > 0
          ? `Echèk senkronizasyon : ${failed} pwojè pa rive monte sou Supabase.${rlsDetected ? ' (RLS Policy bloke l)' : ''}`
          : 'Tout pwojè yo te deja sou Supabase !',
      rlsBlocked: rlsDetected,
    };
  },
};


