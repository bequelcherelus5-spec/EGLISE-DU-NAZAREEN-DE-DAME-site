import { ManagedProject } from '../types';
import { supabase, isSupabaseConfigured } from './supabaseClient';

const STORAGE_KEY = 'dame_managed_projects';

export const projectService = {
  // Récupérer la liste des projets
  async getProjects(status?: 'published' | 'draft'): Promise<ManagedProject[]> {
    // 1. Si Supabase konfigure, chèche nan baz done Supabase
    if (isSupabaseConfigured && supabase) {
      try {
        let query = supabase.from('projects').select('*').order('createdAt', { ascending: false });
        if (status) {
          query = query.eq('status', status);
        }
        const { data, error } = await query;
        if (!error && data) {
          // Konvèti fòma baz done a si sa nesesè
          const projects: ManagedProject[] = data.map((item: any) => ({
            id: item.id,
            title: item.title,
            description: item.description,
            content: item.content,
            image: item.image,
            status: item.status || 'draft',
            createdAt: item.created_at || item.createdAt || new Date().toISOString(),
            updatedAt: item.updated_at || item.updatedAt
          }));
          localStorage.setItem(STORAGE_KEY, JSON.stringify(projects));
          return projects;
        }
      } catch (err) {
        console.warn('Erreurs Supabase getProjects, bascule localStorage', err);
      }
    }

    // 2. Fallback local storage si Supabase pa disponib
    try {
      const cached = localStorage.getItem(STORAGE_KEY);
      if (cached) {
        const parsed: ManagedProject[] = JSON.parse(cached);
        if (status) {
          return parsed.filter(p => p.status === status);
        }
        return parsed;
      }
    } catch {
      // Ignorer
    }

    return [];
  },

  // Créer un projet
  async createProject(project: Omit<ManagedProject, 'id' | 'createdAt'>): Promise<ManagedProject | null> {
    const newProjData = {
      title: project.title,
      description: project.description,
      content: project.content,
      image: project.image,
      status: project.status || 'draft',
      created_at: new Date().toISOString()
    };

    if (isSupabaseConfigured && supabase) {
      try {
        const { data, error } = await supabase.from('projects').insert([newProjData]).select().single();
        if (!error && data) {
          const created: ManagedProject = {
            id: data.id,
            title: data.title,
            description: data.description,
            content: data.content,
            image: data.image,
            status: data.status,
            createdAt: data.created_at || data.createdAt
          };
          // Mete ajou kach lokal la tou
          const localList = await this.getProjects();
          localStorage.setItem(STORAGE_KEY, JSON.stringify([created, ...localList]));
          return created;
        } else if (error) {
          console.error('Erreur Supabase insert project:', error.message);
        }
      } catch (err) {
        console.warn('Echèk anrejistreman Supabase, anrejistre lokalman', err);
      }
    }

    // Fallback local
    const localList = await this.getProjects();
    const newProj: ManagedProject = {
      ...project,
      id: 'proj-' + Date.now(),
      createdAt: new Date().toISOString()
    };
    const updated = [newProj, ...localList];
    localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
    return newProj;
  },

  // Modifier un projet
  async updateProject(id: string, updates: Partial<ManagedProject>): Promise<ManagedProject | null> {
    if (isSupabaseConfigured && supabase) {
      try {
        const updatePayload: any = {};
        if (updates.title !== undefined) updatePayload.title = updates.title;
        if (updates.description !== undefined) updatePayload.description = updates.description;
        if (updates.content !== undefined) updatePayload.content = updates.content;
        if (updates.image !== undefined) updatePayload.image = updates.image;
        if (updates.status !== undefined) updatePayload.status = updates.status;
        updatePayload.updated_at = new Date().toISOString();

        const { data, error } = await supabase.from('projects').update(updatePayload).eq('id', id).select().single();
        if (!error && data) {
          return {
            id: data.id,
            title: data.title,
            description: data.description,
            content: data.content,
            image: data.image,
            status: data.status,
            createdAt: data.created_at || data.createdAt,
            updatedAt: data.updated_at
          };
        }
      } catch (err) {
        console.warn('Echèk mizajou Supabase', err);
      }
    }

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
    if (isSupabaseConfigured && supabase) {
      try {
        const { error } = await supabase.from('projects').delete().eq('id', id);
        if (!error) {
          const current = await this.getProjects();
          localStorage.setItem(STORAGE_KEY, JSON.stringify(current.filter(p => p.id !== id)));
          return true;
        }
      } catch (err) {
        console.warn('Echèk sipresyon Supabase', err);
      }
    }

    const localList = await this.getProjects();
    const filtered = localList.filter(p => p.id !== id);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(filtered));
    return true;
  },

  // Basculer statut publié / brouillon
  async toggleStatus(id: string): Promise<ManagedProject | null> {
    const localList = await this.getProjects();
    const target = localList.find(p => p.id === id);
    if (target) {
      const newStatus = target.status === 'published' ? 'draft' : 'published';
      return await this.updateProject(id, { status: newStatus });
    }
    return null;
  }
};
