import { supabase, isSupabaseConfigured } from './supabaseClient';

export interface ChurchMedia {
  id: string;
  title: string;
  type: 'video' | 'audio' | 'image';
  url: string;
  thumbnail: string;
  description: string;
  category: string;
  speaker?: string;
  date: string;
  duration?: string;
  created_at?: string;
}

const LOCAL_STORAGE_KEY = 'dame_church_media_v1';

// Media initiaux officiels de l'Église du Nazaréen de Damé
export const INITIAL_CHURCH_MEDIA: ChurchMedia[] = [
  {
    id: 'media-vid-1',
    title: 'Culte d’Adoration & Célébration de la Moisson',
    type: 'video',
    url: 'https://www.youtube.com/watch?v=dQw4w9WgXcQ', // URL YouTube officielle
    thumbnail: 'https://img.youtube.com/vi/dQw4w9WgXcQ/hqdefault.jpg',
    description: 'Replay officiel du grand culte d’adoration avec la direction pastorale du Pasteur Bequel CHERELUS. Chants traditionnels en créole et français, prière et communion fraternelle.',
    category: 'Culte d’Adoration',
    speaker: 'Pasteur Bequel CHERELUS',
    date: 'Dimanche 18 Octobre 2026',
    duration: '1h 35 min',
    created_at: new Date('2026-10-18T10:00:00Z').toISOString()
  },
  {
    id: 'media-vid-2',
    title: 'Rassemblement de la Jeunesse Nazaréenne (JNI)',
    type: 'video',
    url: 'https://youtube.com/@eglisedunazareendame',
    thumbnail: '/images/evenements/evenement-badge.svg',
    description: 'Programme dynamique des jeunes de Damé : chorale de jeunesse, poèmes, chants d’ensemble et exhortation spirituelle.',
    category: 'Jeunesse (JNI)',
    speaker: 'Comité JNI & Pasteur Bequel CHERELUS',
    date: 'Samedi 10 Octobre 2026',
    duration: '45 min',
    created_at: new Date('2026-10-10T16:00:00Z').toISOString()
  },
  {
    id: 'media-aud-1',
    title: 'La Puissance de la Sanctification dans un Monde en Mutation',
    type: 'audio',
    url: 'https://archive.org/download/sample-audio-church/sermon_nazareen_dame_1.mp3',
    thumbnail: '/images/eglise/sceau-officiel.svg',
    description: 'Prédication pastorale puissante sur l’appel à la sainteté de vie selon Hébreux 12:14. Enseignement clair pour fortifier l’âme des croyants de Damé.',
    category: 'Prédication Pastorale',
    speaker: 'Pasteur Bequel CHERELUS',
    date: 'Dimanche 11 Octobre 2026',
    duration: '38 min',
    created_at: new Date('2026-10-11T09:30:00Z').toISOString()
  },
  {
    id: 'media-aud-2',
    title: 'Bâtir un Foyer et une Famille selon le Cœur de Dieu',
    type: 'audio',
    url: 'https://archive.org/download/sample-audio-church/sermon_nazareen_dame_2.mp3',
    thumbnail: '/images/ministeres/ministere-badge.svg',
    description: 'Étude biblique pratique sur la responsabilité des parents dans la transmission de la foi chrétienne aux générations montantes (Proverbes 22:6).',
    category: 'Famille & Foyer',
    speaker: 'Pasteur Bequel CHERELUS',
    date: 'Dimanche 4 Octobre 2026',
    duration: '42 min',
    created_at: new Date('2026-10-04T09:30:00Z').toISOString()
  },
  {
    id: 'media-img-1',
    title: 'Sceau Officiel et Devise de l’Église de Damé',
    type: 'image',
    url: '/images/eglise/sceau-officiel.svg',
    thumbnail: '/images/eglise/sceau-officiel.svg',
    description: 'L’emblème officiel de l’Église du Nazaréen de Damé proclamant la devise sainte : « Sainteté à l’Éternel » depuis sa fondation en 1979.',
    category: 'Archives & Emblèmes',
    speaker: 'Église du Nazaréen',
    date: 'Archives Historiques',
    created_at: new Date('2026-01-01T00:00:00Z').toISOString()
  },
  {
    id: 'media-img-2',
    title: 'Complexe du Centre CDEJ HA 0926 & École Nazareth',
    type: 'image',
    url: '/images/projets/cdej-compassion.svg',
    thumbnail: '/images/projets/cdej-compassion.svg',
    description: 'Bâtiment du Centre de Développement de l’Enfant et du Jeune (CDEJ HA 0926) en partenariat avec Compassion International à la 3ème Section Damé.',
    category: 'Projets Sociaux (CDEJ)',
    speaker: 'Compassion & Église de Damé',
    date: 'Octobre 2026',
    created_at: new Date('2026-10-01T08:00:00Z').toISOString()
  },
  {
    id: 'media-img-3',
    title: 'Pasteur Principal Bequel CHERELUS',
    type: 'image',
    url: '/images/pasteur/pasteur-cherelus.svg',
    thumbnail: '/images/pasteur/pasteur-cherelus.svg',
    description: 'Portrait pastoral du Pasteur Bequel CHERELUS, pasteur titulaire dirigeant la congrégation avec fidélité depuis 2003.',
    category: 'Direction Pastorale',
    speaker: 'Pasteur Bequel CHERELUS',
    date: 'Année 2026',
    created_at: new Date('2026-01-15T10:00:00Z').toISOString()
  }
];

/**
 * Détection et extraction des liens vidéo YouTube, Facebook et directs
 */
export function parseVideoUrl(url: string): { 
  embedUrl: string; 
  thumbnailUrl: string; 
  isYouTube: boolean; 
  isFacebook: boolean;
  isDirectAudio: boolean;
  isDirectVideo: boolean;
} {
  const trimmed = (url || '').trim();

  // YouTube detection (youtube.com, youtu.be, shorts, live, embed)
  const ytMatch = trimmed.match(
    /(?:youtube\.com\/(?:[^\/]+\/.+\/|(?:v|e(?:mbed)?|shorts|live)\/|.*[?&]v=)|youtu\.be\/)([^"&?\/\s]{11})/i
  );

  if (ytMatch && ytMatch[1]) {
    const videoId = ytMatch[1];
    return {
      embedUrl: `https://www.youtube-nocookie.com/embed/${videoId}`,
      thumbnailUrl: `https://img.youtube.com/vi/${videoId}/hqdefault.jpg`,
      isYouTube: true,
      isFacebook: false,
      isDirectAudio: false,
      isDirectVideo: false
    };
  }

  // Facebook video detection
  if (trimmed.includes('facebook.com') || trimmed.includes('fb.watch')) {
    const encoded = encodeURIComponent(trimmed);
    return {
      embedUrl: `https://www.facebook.com/plugins/video.php?href=${encoded}&show_text=0`,
      thumbnailUrl: '/images/evenements/evenement-badge.svg',
      isYouTube: false,
      isFacebook: true,
      isDirectAudio: false,
      isDirectVideo: false
    };
  }

  // Direct Audio files (.mp3, .wav, .aac, .m4a, .ogg)
  const isDirectAudio = /\.(mp3|wav|ogg|m4a|aac)(\?.*)?$/i.test(trimmed);
  // Direct Video files (.mp4, .webm)
  const isDirectVideo = /\.(mp4|webm|mov)(\?.*)?$/i.test(trimmed);

  return {
    embedUrl: trimmed,
    thumbnailUrl: isDirectAudio ? '/images/eglise/sceau-officiel.svg' : '/images/evenements/evenement-badge.svg',
    isYouTube: false,
    isFacebook: false,
    isDirectAudio,
    isDirectVideo
  };
}

/**
 * Convertit un fichier local (image ou audio) en Data URL pour aperçu et stockage immédiat
 */
export function readFileAsDataUrl(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result as string);
    reader.onerror = (err) => reject(err);
    reader.readAsDataURL(file);
  });
}

class MediaService {
  /**
   * Récupère tous les médias depuis Supabase avec fallback localStorage
   */
  async getAllMedia(): Promise<ChurchMedia[]> {
    let loadedItems: ChurchMedia[] = [];

    // 1. Tenter la lecture Supabase si configuré
    if (isSupabaseConfigured && supabase) {
      try {
        const { data, error } = await supabase
          .from('media_items')
          .select('*')
          .order('created_at', { ascending: false });

        if (!error && Array.isArray(data) && data.length > 0) {
          loadedItems = data.map((d: any) => ({
            id: d.id,
            title: d.title || 'Média sans titre',
            type: (d.type || 'video') as 'video' | 'audio' | 'image',
            url: d.url || '',
            thumbnail: d.thumbnail || '/images/eglise/sceau-officiel.svg',
            description: d.description || '',
            category: d.category || 'Culte d’Adoration',
            speaker: d.speaker || 'Pasteur Bequel CHERELUS',
            date: d.date || new Date().toLocaleDateString('fr-FR'),
            duration: d.duration || '',
            created_at: d.created_at || new Date().toISOString()
          }));
        }
      } catch (err) {
        console.warn('MediaService: Erreur de lecture Supabase, bascule sur le cache local:', err);
      }
    }

    // 2. Si rien dans Supabase, lire depuis localStorage
    if (loadedItems.length === 0 && typeof window !== 'undefined') {
      try {
        const local = localStorage.getItem(LOCAL_STORAGE_KEY);
        if (local) {
          const parsed = JSON.parse(local);
          if (Array.isArray(parsed) && parsed.length > 0) {
            loadedItems = parsed;
          }
        }
      } catch {
        // Ignorer
      }
    }

    // 3. Si toujours vide, initialiser avec la médiathèque officielle
    if (loadedItems.length === 0) {
      loadedItems = [...INITIAL_CHURCH_MEDIA];
      if (typeof window !== 'undefined') {
        try {
          localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(loadedItems));
        } catch {
          // Ignorer
        }
      }
    }

    return loadedItems;
  }

  /**
   * Ajoute ou met à jour un élément multimédia
   */
  async saveMedia(item: Omit<ChurchMedia, 'id'> & { id?: string }): Promise<{ success: boolean; item?: ChurchMedia; error?: string }> {
    const id = item.id || `media-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`;
    const fullItem: ChurchMedia = {
      ...item,
      id,
      created_at: item.created_at || new Date().toISOString(),
      date: item.date || new Date().toLocaleDateString('fr-FR')
    };

    // 1. Sauvegarde dans localStorage d'abord pour garantir la disponibilité immédiate
    if (typeof window !== 'undefined') {
      try {
        const current = await this.getAllMedia();
        const existingIdx = current.findIndex(m => m.id === id);
        let updated: ChurchMedia[];
        if (existingIdx >= 0) {
          updated = [...current];
          updated[existingIdx] = fullItem;
        } else {
          updated = [fullItem, ...current];
        }
        localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(updated));
        window.dispatchEvent(new CustomEvent('church-media-updated', { detail: { media: updated } }));
      } catch (err) {
        console.warn('MediaService: Erreur enregistrement localStorage:', err);
      }
    }

    // 2. Tenter l'écriture Supabase
    if (isSupabaseConfigured && supabase) {
      try {
        const { error } = await supabase.from('media_items').upsert([
          {
            id: fullItem.id,
            title: fullItem.title,
            type: fullItem.type,
            url: fullItem.url,
            thumbnail: fullItem.thumbnail,
            description: fullItem.description,
            category: fullItem.category,
            speaker: fullItem.speaker,
            duration: fullItem.duration,
            date: fullItem.date,
            created_at: fullItem.created_at
          }
        ]);

        if (error) {
          console.warn('MediaService: Erreur lors de l’écriture Supabase (fallback local conservé):', error.message);
        }
      } catch (err) {
        console.warn('MediaService: Exception Supabase:', err);
      }
    }

    return { success: true, item: fullItem };
  }

  /**
   * Supprime un média par son identifiant
   */
  async deleteMedia(id: string): Promise<{ success: boolean; error?: string }> {
    // 1. Supprimer du localStorage
    if (typeof window !== 'undefined') {
      try {
        const current = await this.getAllMedia();
        const filtered = current.filter(m => m.id !== id);
        localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(filtered));
        window.dispatchEvent(new CustomEvent('church-media-updated', { detail: { media: filtered } }));
      } catch (err) {
        console.warn('MediaService: Erreur suppression locale:', err);
      }
    }

    // 2. Supprimer de Supabase
    if (isSupabaseConfigured && supabase) {
      try {
        const { error } = await supabase.from('media_items').delete().eq('id', id);
        if (error) {
          console.warn('MediaService: Erreur suppression Supabase:', error.message);
        }
      } catch (err) {
        console.warn('MediaService: Exception suppression Supabase:', err);
      }
    }

    return { success: true };
  }
}

export const mediaService = new MediaService();
