export interface DailyVerseData {
  date: string;
  generatedAt: string;
  source: string;
  reference: string;
  verse_ht: string;
  verse_fr: string;
  reflection_ht: string;
  reflection_fr: string;
  prayer_ht: string;
  prayer_fr: string;
}

const LOCAL_STORAGE_VERSE_KEY = 'dame_church_daily_verse_cache_v1';

const DEFAULT_FALLBACK_VERSE: DailyVerseData = {
  date: new Date().toISOString().split('T')[0],
  generatedAt: new Date().toISOString(),
  source: 'holiness_heritage',
  reference: 'Ebre 12:14 / Hébreux 12:14',
  verse_ht: "Chèche viv anpè ak tout moun, epi mennen yon lavi ki apa nèt pou Bondye; paske san sa, pèsonn p'ap wè Granmèt la.",
  verse_fr: 'Recherchez la paix avec tous, et la sanctification, sans laquelle personne ne verra le Seigneur.',
  reflection_ht: 'Lapè ak sentete se de fondasyon lafwa nazaréèn nou an. Lè nou mache nan renmen ak obeyisans, Prezans Bondye briye nan tout kominote Damé a.',
  reflection_fr: 'La paix et la sainteté sont au cœur de notre foi. En marchant dans l’amour et l’obéissance, la lumière du Christ rayonne dans notre communauté.',
  prayer_ht: 'Senyè, mete lapè ou nan kè m jodi a epi ede m viv yon vi ki fè w plezi. Amèn.',
  prayer_fr: 'Seigneur, remplis mon cœur de Ta paix et sanctifie ma vie pour Ta seule gloire. Amen.'
};

class DailyVerseService {
  async getDailyVerse(): Promise<DailyVerseData> {
    try {
      const res = await fetch('/api/daily-verse');
      if (res.ok) {
        const data = await res.json();
        if (data && data.verse) {
          if (typeof window !== 'undefined') {
            try {
              localStorage.setItem(LOCAL_STORAGE_VERSE_KEY, JSON.stringify(data.verse));
            } catch {
              // ignore
            }
          }
          return data.verse;
        }
      }
    } catch (err) {
      console.warn('DailyVerseService: Appel API non joignable, utilisation du cache local:', err);
    }

    // Fallback to local storage if available
    if (typeof window !== 'undefined') {
      try {
        const saved = localStorage.getItem(LOCAL_STORAGE_VERSE_KEY);
        if (saved) {
          const parsed = JSON.parse(saved);
          if (parsed && parsed.reference) {
            return parsed;
          }
        }
      } catch {
        // ignore
      }
    }

    return DEFAULT_FALLBACK_VERSE;
  }

  async refreshDailyVerse(): Promise<DailyVerseData> {
    try {
      const res = await fetch('/api/daily-verse/refresh', { method: 'POST' });
      if (res.ok) {
        const data = await res.json();
        if (data && data.verse) {
          if (typeof window !== 'undefined') {
            try {
              localStorage.setItem(LOCAL_STORAGE_VERSE_KEY, JSON.stringify(data.verse));
            } catch {
              // ignore
            }
          }
          return data.verse;
        }
      }
    } catch (err) {
      console.warn('Erreur rafraîchissement IA vèsè:', err);
    }
    return this.getDailyVerse();
  }
}

export const dailyVerseService = new DailyVerseService();
