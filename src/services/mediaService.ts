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

const LOCAL_STORAGE_KEY = 'dame_church_media_v2';

// Liste initiale vide : seuls les contenus explicitement publiés par l'utilisateur sont affichés
export const INITIAL_CHURCH_MEDIA: ChurchMedia[] = [];

// Fonction utilitaire pour éliminer tout média de test ou d'exemple antérieur
export const isSampleOrDummyMedia = (item: { id?: string; url?: string; title?: string }): boolean => {
  if (!item) return false;
  const id = item.id || '';
  const url = item.url || '';
  const title = item.title || '';
  return (
    id === 'media-vid-1' ||
    id === 'media-vid-2' ||
    id === 'media-aud-1' ||
    id === 'media-aud-2' ||
    id === 'media-img-1' ||
    id === 'media-img-2' ||
    id === 'media-img-3' ||
    url.includes('dQw4w9WgXcQ') ||
    url.includes('sample-audio-church') ||
    title.includes('Célébration de la Moisson') ||
    title.includes('Puissance de la Sanctification dans un Monde en Mutation')
  );
};

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
          loadedItems = data
            .map((d: any) => ({
              id: d.id,
              title: d.title || 'Média sans titre',
              type: (d.type || 'video') as 'video' | 'audio' | 'image',
              url: d.url || '',
              thumbnail: d.thumbnail || '/images/eglise/sceau-officiel.png',
              description: d.description || '',
              category: d.category || 'Culte d’Adoration',
              speaker: d.speaker || 'Pasteur Bequel CHERELUS',
              date: d.date || new Date().toLocaleDateString('fr-FR'),
              duration: d.duration || '',
              created_at: d.created_at || new Date().toISOString()
            }))
            .filter((item: ChurchMedia) => !isSampleOrDummyMedia(item));
        }
      } catch (err) {
        console.warn('MediaService: Erreur de lecture Supabase, bascule sur le cache local:', err);
      }
    }

    // 2. Si rien dans Supabase, lire depuis localStorage (en purgeant la clé v1 obsolète)
    if (typeof window !== 'undefined') {
      try {
        // Nettoyage de l'ancien cache contenant des données de test
        localStorage.removeItem('dame_church_media_v1');
        
        if (loadedItems.length === 0) {
          const local = localStorage.getItem(LOCAL_STORAGE_KEY);
          if (local) {
            const parsed = JSON.parse(local);
            if (Array.isArray(parsed)) {
              loadedItems = parsed.filter(item => !isSampleOrDummyMedia(item));
            }
          }
        }
      } catch {
        // Ignorer
      }
    }

    // 3. Ne réinjecter AUCUN faux média : si vide, la médiathèque reste propre à 100%
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

  /**
   * Efface l'ensemble des médias stockés pour repartir d'une base totalement vierge
   */
  async clearAllMedia(): Promise<{ success: boolean }> {
    if (typeof window !== 'undefined') {
      try {
        localStorage.removeItem('dame_church_media_v1');
        localStorage.removeItem(LOCAL_STORAGE_KEY);
        localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify([]));
        window.dispatchEvent(new CustomEvent('church-media-updated', { detail: { media: [] } }));
      } catch (err) {
        console.warn('Erreur purge locale:', err);
      }
    }

    if (isSupabaseConfigured && supabase) {
      try {
        await supabase.from('media_items').delete().neq('id', '___keep_none___');
      } catch (err) {
        console.warn('Supabase clear items:', err);
      }
    }

    return { success: true };
  }
}

export const mediaService = new MediaService();
