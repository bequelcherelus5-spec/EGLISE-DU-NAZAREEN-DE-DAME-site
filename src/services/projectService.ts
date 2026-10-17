import { ManagedProject } from '../types';

const STORAGE_KEY = 'dame_managed_projects';

export const projectService = {
  // Récupérer la liste des projets
  async getProjects(status?: 'published' | 'draft'): Promise<ManagedProject[]> {
    try {
      const url = status ? `/api/projects?status=${status}` : '/api/projects';
      const res = await fetch(url);
      if (res.ok) {
        const data = await res.json();
        if (Array.isArray(data)) {
          localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
          return data;
        }
      }
    } catch (err) {
      console.warn('API non disponible, lecture depuis le stockage local');
    }

    // Fallback local storage
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
    try {
      const res = await fetch('/api/projects', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(project)
      });
      if (res.ok) {
        const data = await res.json();
        return data.project;
      }
    } catch {
      // Fallback local
    }

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
    try {
      const res = await fetch(`/api/projects/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(updates)
      });
      if (res.ok) {
        const data = await res.json();
        return data.project;
      }
    } catch {
      // Fallback
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
    try {
      const res = await fetch(`/api/projects/${id}`, { method: 'DELETE' });
      if (res.ok) {
        const current = await this.getProjects();
        localStorage.setItem(STORAGE_KEY, JSON.stringify(current.filter(p => p.id !== id)));
        return true;
      }
    } catch {
      // Fallback
    }

    const localList = await this.getProjects();
    const filtered = localList.filter(p => p.id !== id);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(filtered));
    return true;
  },

  // Basculer statut publié / brouillon
  async toggleStatus(id: string): Promise<ManagedProject | null> {
    try {
      const res = await fetch(`/api/projects/${id}/status`, { method: 'PATCH' });
      if (res.ok) {
        const data = await res.json();
        return data.project;
      }
    } catch {
      // Fallback
    }

    const localList = await this.getProjects();
    const target = localList.find(p => p.id === id);
    if (target) {
      target.status = target.status === 'published' ? 'draft' : 'published';
      target.updatedAt = new Date().toISOString();
      localStorage.setItem(STORAGE_KEY, JSON.stringify(localList));
      return target;
    }
    return null;
  }
};
