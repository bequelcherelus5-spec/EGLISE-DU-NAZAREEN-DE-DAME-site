import { CustomPage } from '../types';

const STORAGE_KEY = 'dame_custom_pages';

function notifyChange() {
  if (typeof window !== 'undefined') {
    window.dispatchEvent(new CustomEvent('custom-pages-updated'));
  }
}

export const pageService = {
  // Récupérer toutes les pages
  async getPages(): Promise<CustomPage[]> {
    try {
      const res = await fetch('/api/pages');
      if (res.ok) {
        const data = await res.json();
        if (Array.isArray(data)) {
          localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
          return data;
        }
      }
    } catch {
      // Fallback
    }

    try {
      const cached = localStorage.getItem(STORAGE_KEY);
      if (cached) return JSON.parse(cached);
    } catch {
      // Ignorer
    }

    return [];
  },

  // Récupérer une page par son slug
  async getPageBySlug(slug: string): Promise<CustomPage | null> {
    try {
      const res = await fetch(`/api/pages/${encodeURIComponent(slug)}`);
      if (res.ok) {
        const data = await res.json();
        return data.page || null;
      }
    } catch {
      // Fallback
    }

    const pages = await this.getPages();
    return pages.find(p => p.slug === slug && p.isActive) || null;
  },

  // Créer une nouvelle page
  async createPage(page: Omit<CustomPage, 'id' | 'createdAt'>): Promise<CustomPage | null> {
    try {
      const res = await fetch('/api/pages', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...page,
          showInMenu: page.showInMenu !== false
        })
      });
      if (res.ok) {
        const data = await res.json();
        notifyChange();
        return data.page;
      }
    } catch {
      // Fallback
    }

    const pages = await this.getPages();
    const newPage: CustomPage = {
      ...page,
      showInMenu: page.showInMenu !== false,
      id: 'page-' + Date.now(),
      createdAt: new Date().toISOString()
    };
    const updated = [newPage, ...pages];
    localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
    notifyChange();
    return newPage;
  },

  // Mettre à jour une page
  async updatePage(id: string, updates: Partial<CustomPage>): Promise<CustomPage | null> {
    try {
      const res = await fetch(`/api/pages/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(updates)
      });
      if (res.ok) {
        const data = await res.json();
        notifyChange();
        return data.page;
      }
    } catch {
      // Fallback
    }

    const pages = await this.getPages();
    const idx = pages.findIndex(p => p.id === id);
    if (idx !== -1) {
      pages[idx] = { ...pages[idx], ...updates, updatedAt: new Date().toISOString() };
      localStorage.setItem(STORAGE_KEY, JSON.stringify(pages));
      notifyChange();
      return pages[idx];
    }
    return null;
  },

  // Supprimer une page
  async deletePage(id: string): Promise<boolean> {
    try {
      const res = await fetch(`/api/pages/${id}`, { method: 'DELETE' });
      if (res.ok) {
        const pages = await this.getPages();
        localStorage.setItem(STORAGE_KEY, JSON.stringify(pages.filter(p => p.id !== id)));
        notifyChange();
        return true;
      }
    } catch {
      // Fallback
    }

    const pages = await this.getPages();
    localStorage.setItem(STORAGE_KEY, JSON.stringify(pages.filter(p => p.id !== id)));
    notifyChange();
    return true;
  },

  // Basculer l'état actif/inactif
  async togglePageStatus(id: string): Promise<CustomPage | null> {
    const pages = await this.getPages();
    const target = pages.find(p => p.id === id);
    if (target) {
      const res = await this.updatePage(id, { isActive: !target.isActive });
      notifyChange();
      return res;
    }
    return null;
  }
};
