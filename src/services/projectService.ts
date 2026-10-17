import { ManagedProject } from '../types';
import { supabase, isSupabaseConfigured } from './supabaseClient';

const STORAGE_KEY = 'dame_managed_projects';

// Initial default projects to show when database/storage is empty
const DEFAULT_INITIAL_PROJECTS: ManagedProject[] = [
  {
    id: 'proj-cdej-0926',
    code: 'HA-0926',
    title: 'Centre de Développement de l’Enfant et du Jeune (CDEJ HA 0926)',
    partner: 'Compassion International Haïti',
    category: 'Enfance & Éducation',
    description: 'Programme holistique de parrainage et de prise en charge pour plus de 250 enfants et jeunes de Damé : scolarisation, nutrition, soins médicaux et formation spirituelle.',
    htmlContent: '<p>Le CDEJ HA 0926 est une œuvre majeure de compassion en partenariat avec Compassion International Haïti, implanté au cœur de la 3ème section Damé.</p><p>Les enfants bénéficient d’un suivi régulier sur les plans cognitif, physique, socio-émotionnel et spirituel.</p>',
    images: ['/images/eglise/sceau-officiel.svg'],
    author: 'Direction Pastorale & Comité CDEJ',
    status: 'published',
    targetAmount: '250 enfants parrainés',
    currentAmount: '265 bénéficiaires actifs',
    beneficiariesCount: 265,
    createdAt: new Date().toISOString()
  },
  {
    id: 'proj-ecole-epnd',
    code: 'EPND-PRO',
    title: 'École Professionnelle du Nazaréen de Damé (EPND)',
    partner: 'Ministère de l’Éducation & Partenaires Locaux',
    category: 'Formation Professionnelle',
    description: 'Ateliers et formations techniques pour les jeunes et adultes : informatique, couture, électricité de base et entrepreneuriat communautaire.',
    htmlContent: '<p>Offrir des compétences pratiques et certifiées pour permettre aux jeunes de Damé et des environs de trouver un emploi ou de créer leur propre activité économique.</p>',
    images: ['/images/eglise/sceau-officiel.svg'],
    author: 'Direction EPND',
    status: 'published',
    beneficiariesCount: 120,
    createdAt: new Date().toISOString()
  }
];

export const projectService = {
  // Récupérer la liste des projets
  async getProjects(status?: 'published' | 'draft'): Promise<ManagedProject[]> {
    // 1. Si Supabase konfigure, chèche nan baz done Supabase
    if (isSupabaseConfigured && supabase) {
      try {
        let query = supabase.from('projects').select('*').order('created_at', { ascending: false });
        if (status) {
          query = query.eq('status', status);
        }
        const { data, error } = await query;
        if (!error && data && data.length > 0) {
          const projects: ManagedProject[] = data.map((item: any) => ({
            id: String(item.id),
            title: item.title || '',
            code: item.code || undefined,
            partner: item.partner || undefined,
            category: item.category || 'Communautaire',
            description: item.description || '',
            htmlContent: item.html_content || item.htmlContent || undefined,
            images: Array.isArray(item.images) ? item.images : (item.image ? [item.image] : []),
            author: item.author || 'Direction Pastorale',
            status: (item.status === 'published' ? 'published' : 'draft') as 'published' | 'draft',
            targetAmount: item.target_amount || item.targetAmount || undefined,
            currentAmount: item.current_amount || item.currentAmount || undefined,
            beneficiariesCount: item.beneficiaries_count !== undefined ? Number(item.beneficiaries_count) : undefined,
            createdAt: item.created_at || item.createdAt || new Date().toISOString(),
            updatedAt: item.updated_at || item.updatedAt || undefined
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
      } else {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(DEFAULT_INITIAL_PROJECTS));
        if (status) {
          return DEFAULT_INITIAL_PROJECTS.filter(p => p.status === status);
        }
        return DEFAULT_INITIAL_PROJECTS;
      }
    } catch {
      // Ignorer
    }

    return status ? DEFAULT_INITIAL_PROJECTS.filter(p => p.status === status) : DEFAULT_INITIAL_PROJECTS;
  },

  // Créer un projet
  async createProject(project: Omit<ManagedProject, 'id' | 'createdAt'>): Promise<ManagedProject | null> {
    const newProjData = {
      title: project.title,
      code: project.code,
      partner: project.partner,
      category: project.category || 'Communautaire',
      description: project.description,
      html_content: project.htmlContent,
      images: project.images || [],
      author: project.author || 'Direction Pastorale',
      target_amount: project.targetAmount,
      current_amount: project.currentAmount,
      beneficiaries_count: project.beneficiariesCount,
      status: project.status || 'draft',
      created_at: new Date().toISOString()
    };

    if (isSupabaseConfigured && supabase) {
      try {
        const { data, error } = await supabase.from('projects').insert([newProjData]).select().single();
        if (!error && data) {
          const created: ManagedProject = {
            id: String(data.id),
            title: data.title,
            code: data.code,
            partner: data.partner,
            category: data.category || project.category || 'Communautaire',
            description: data.description,
            htmlContent: data.html_content || data.htmlContent || project.htmlContent,
            images: Array.isArray(data.images) ? data.images : (project.images || []),
            author: data.author || project.author || 'Direction Pastorale',
            status: data.status,
            targetAmount: data.target_amount || data.targetAmount || project.targetAmount,
            currentAmount: data.current_amount || data.currentAmount,
            beneficiariesCount: data.beneficiaries_count || project.beneficiariesCount,
            createdAt: data.created_at || data.createdAt,
            updatedAt: data.updated_at
          };
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
        if (updates.code !== undefined) updatePayload.code = updates.code;
        if (updates.partner !== undefined) updatePayload.partner = updates.partner;
        if (updates.category !== undefined) updatePayload.category = updates.category;
        if (updates.description !== undefined) updatePayload.description = updates.description;
        if (updates.htmlContent !== undefined) updatePayload.html_content = updates.htmlContent;
        if (updates.images !== undefined) updatePayload.images = updates.images;
        if (updates.author !== undefined) updatePayload.author = updates.author;
        if (updates.status !== undefined) updatePayload.status = updates.status;
        if (updates.targetAmount !== undefined) updatePayload.target_amount = updates.targetAmount;
        if (updates.currentAmount !== undefined) updatePayload.current_amount = updates.currentAmount;
        if (updates.beneficiariesCount !== undefined) updatePayload.beneficiaries_count = updates.beneficiariesCount;
        updatePayload.updated_at = new Date().toISOString();

        const { data, error } = await supabase.from('projects').update(updatePayload).eq('id', id).select().single();
        if (!error && data) {
          const updated: ManagedProject = {
            id: String(data.id),
            title: data.title,
            code: data.code,
            partner: data.partner,
            category: data.category || updates.category || 'Communautaire',
            description: data.description,
            htmlContent: data.html_content || data.htmlContent || updates.htmlContent,
            images: Array.isArray(data.images) ? data.images : (updates.images || []),
            author: data.author || updates.author || 'Direction Pastorale',
            status: data.status,
            targetAmount: data.target_amount || data.targetAmount || updates.targetAmount,
            currentAmount: data.current_amount || data.currentAmount || updates.currentAmount,
            beneficiariesCount: data.beneficiaries_count || updates.beneficiariesCount,
            createdAt: data.created_at || data.createdAt,
            updatedAt: data.updated_at
          };
          const localList = await this.getProjects();
          const idx = localList.findIndex(p => p.id === id);
          if (idx !== -1) {
            localList[idx] = updated;
            localStorage.setItem(STORAGE_KEY, JSON.stringify(localList));
          }
          return updated;
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
