import { ManagedProject } from '../types';
import { supabase, isSupabaseConfigured } from './supabaseClient';

const STORAGE_KEY = 'dame_managed_projects';

// Helper pou mapper une ligne Supabase vers ManagedProject
function mapSupabaseRowToProject(row: any): ManagedProject {
  const isDraft = row.status === 'planning' || row.status === 'draft';
  return {
    id: String(row.id),
    title: row.title || 'Projet sans titre',
    code: row.code || undefined,
    partner: row.partner || 'Église du Nazaréen de Damé',
    category: row.category || 'Construction & Temple',
    description: row.summary || row.description || '',
    htmlContent: row.full_description || row.html_content || undefined,
    images: row.banner_url ? [row.banner_url] : Array.isArray(row.images) ? row.images : ['/images/eglise/sound-system.jpg'],
    author: row.author || 'Secrétariat Général',
    createdAt: row.created_at || new Date().toISOString(),
    updatedAt: row.updated_at || undefined,
    status: isDraft ? 'draft' : 'published',
    targetAmount: String(row.target_amount || '0'),
    currentAmount: String(row.current_amount || '0'),
    beneficiariesCount: row.beneficiaries_reached || row.beneficiaries_target || 0,
    _source: 'supabase',
  };
}

export const projectService = {
  // Récupérer la liste des projets (Supabase direct en priorité absolue)
  async getProjects(status?: 'published' | 'draft'): Promise<ManagedProject[]> {
    const isConfigured = typeof isSupabaseConfigured === 'function' ? isSupabaseConfigured() : Boolean(isSupabaseConfigured);

    if (isConfigured && supabase) {
      try {
        let query = supabase
          .from('projects')
          .select('*')
          .order('created_at', { ascending: false });

        if (status === 'draft') {
          query = query.in('status', ['planning', 'draft']);
        }

        const { data, error } = await query;
        if (!error && Array.isArray(data)) {
          const mapped = data.map(mapSupabaseRowToProject);
          
          let filtered = mapped;
          if (status === 'published') {
            filtered = mapped.filter(p => p.status === 'published');
          }

          if (!status) {
            localStorage.setItem(STORAGE_KEY, JSON.stringify(mapped));
          }
          return filtered;
        } else if (error) {
          console.warn('[ProjectService] Erreur de lecture Supabase:', error.message);
        }
      } catch (err) {
        console.warn('[ProjectService] Exception requête Supabase:', err);
      }
    }

    // Fallback stockage local
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
    const isConfigured = typeof isSupabaseConfigured === 'function' ? isSupabaseConfigured() : Boolean(isSupabaseConfigured);
    const bannerUrl = project.images && project.images.length > 0 ? project.images[0] : '/images/eglise/sound-system.jpg';
    
    // Mèt statut 'published' oswa 'active' pou Supabase pa konsidere l kòm yon draft kache
    const dbStatus = project.status === 'draft' ? 'draft' : 'published';
    let projCode = project.code?.trim() || ('PRJ-' + Date.now().toString().slice(-6));

    if (isConfigured && supabase) {
      try {
        let row: any = {
          code: projCode,
          title: project.title.trim(),
          partner: project.partner?.trim() || 'Église du Nazaréen de Damé',
          category: project.category || 'Construction & Temple',
          summary: (project.description || project.title).trim(),
          full_description: (project.htmlContent || project.description || '').trim(),
          status: dbStatus,
          target_amount: parseFloat(project.targetAmount || '0') || 0,
          current_amount: parseFloat(project.currentAmount || '0') || 0,
          banner_url: bannerUrl,
        };

        let { data, error } = await supabase
          .from('projects')
          .insert([row])
          .select()
          .single();

        // Retry si banner_url oswa category pa nan schema cache
        if (error && (error.message.includes('category') || error.message.includes('banner_url') || error.message.includes('schema cache'))) {
          delete row.category;
          let retry = await supabase.from('projects').insert([row]).select().single();
          data = retry.data;
          error = retry.error;
        }

        if (!error && data) {
          const created = mapSupabaseRowToProject(data);
          created.status = 'published';
          created.images = [bannerUrl];

          const current = await this.getProjects();
          const filtered = current.filter(p => p.id !== created.id);
          localStorage.setItem(STORAGE_KEY, JSON.stringify([created, ...filtered]));
          return created;
        } else if (error) {
          console.error('[ProjectService] Erreur insertion Supabase:', error.message);
        }
      } catch (err: any) {
        console.error('[ProjectService] Exception insertion Supabase:', err);
      }
    }

    // Fallback Local Storage si Supabase pa reponn
    const localList = await this.getProjects();
    const newProj: ManagedProject = {
      ...project,
      id: 'local-' + Date.now(),
      createdAt: new Date().toISOString(),
      status: 'published',
      images: [bannerUrl],
      _source: 'local',
    };
    const updated = [newProj, ...localList];
    localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
    return newProj;
  },

  // Modifier un projet
  async updateProject(id: string, updates: Partial<ManagedProject>): Promise<ManagedProject | null> {
    const isConfigured = typeof isSupabaseConfigured === 'function' ? isSupabaseConfigured() : Boolean(isSupabaseConfigured);
    const isLocalId = id.startsWith('local-');

    if (!isLocalId && isConfigured && supabase) {
      try {
        const patch: Record<string, any> = {};
        if (updates.title !== undefined) patch.title = updates.title.trim();
        if (updates.code !== undefined) patch.code = updates.code.trim();
        if (updates.partner !== undefined) patch.partner = updates.partner.trim();
        if (updates.category !== undefined) patch.category = updates.category;
        if (updates.description !== undefined) patch.summary = updates.description.trim();
        if (updates.htmlContent !== undefined) patch.full_description = updates.htmlContent.trim();
        if (updates.status !== undefined) patch.status = updates.status;
        if (updates.targetAmount !== undefined) patch.target_amount = parseFloat(updates.targetAmount) || 0;
        if (updates.currentAmount !== undefined) patch.current_amount = parseFloat(updates.currentAmount) || 0;
        if (updates.images !== undefined && updates.images.length > 0) patch.banner_url = updates.images[0];

        let { data, error } = await supabase
          .from('projects')
          .update(patch)
          .eq('id', id)
          .select()
          .single();

        if (!error && data) {
          const updatedProj = mapSupabaseRowToProject(data);
          const current = await this.getProjects();
          const idx = current.findIndex(p => p.id === id);
          if (idx !== -1) current[idx] = updatedProj;
          localStorage.setItem(STORAGE_KEY, JSON.stringify(current));
          return updatedProj;
        }
      } catch (err) {
        console.error('[ProjectService] Exception update Supabase:', err);
      }
    }

    // Fallback Local
    const localList = await this.getProjects();
    const idx = localList.findIndex(p => p.id === id);
    if (idx !== -1) {
      localList[idx] = { ...localList[idx], ...updates, updatedAt: new Date().toISOString() };
      localStorage.setItem(STORAGE_KEY, JSON.stringify(localList));
      return localList[idx];
    }
    return null;
  },

  // Supprimer un projet
  async deleteProject(id: string): Promise<boolean> {
    const isConfigured = typeof isSupabaseConfigured === 'function' ? isSupabaseConfigured() : Boolean(isSupabaseConfigured);
    const isLocalId = id.startsWith('local-');

    if (!isLocalId && isConfigured && supabase) {
      try {
        await supabase.from('projects').delete().eq('id', id);
      } catch (err) {
        console.error('[ProjectService] Exception suppression Supabase:', err);
      }
    }

    const localList = await this.getProjects();
    const filtered = localList.filter(p => p.id !== id);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(filtered));
    return true;
  },

  // Basculer statut
  async toggleStatus(id: string): Promise<ManagedProject | null> {
    const list = await this.getProjects();
    const target = list.find(p => p.id === id);
    if (!target) return null;

    const nextStatus = target.status === 'published' ? 'draft' : 'published';
    return this.updateProject(id, { status: nextStatus });
  }
};
