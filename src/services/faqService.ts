export interface FAQItem {
  id: string;
  category: 'doctrinal' | 'membership' | 'sacraments' | 'social' | 'general';
  question: string;
  answer: string;
  createdAt?: string;
}

const STORAGE_KEY = 'dame_faqs';

export const INITIAL_FAQS: FAQItem[] = [
  {
    id: 'faq-1',
    category: 'membership',
    question: 'Kijan pou yon moun vin manm ofisyèl nan Église du Nazaréen de Damé ?',
    answer: 'Pou vin manm ofisyèl, ou dwe : 1) Fè konfesyon pèsonèl lafwa w nan Jezi Kris kòm Mèt ak Sovè w; 2) Resevwa batèm biblik pa imèsyon nan dlo; 3) Suiv klas disipila ak manm kote ou aprann doktrin Nazaréen yo; 4) Resevwa vòt akeyi asanble a devan Pasteur Bequel CHERELUS ak konsèy legliz la.',
    createdAt: '2026-01-01T00:00:00Z'
  },
  {
    id: 'faq-2',
    category: 'doctrinal',
    question: 'Kisa deviz « Sainteté à l’Éternel » (Sentite pou Letènèl) la vle di ?',
    answer: 'Deviz sa a sòti nan Egzòd 28:36 ak 1 Tesalonisyen 5:23. Legliz Nazaréen an kwè fèm nan doktrin Sanktifikasyon Total (Entire Sanctification). Se aksyon Lespri Sen an ki pirifye kè kwayan an anba peche orijinal la, epi ki ranpli li ak yon lanmou pafè pou Bondye ak pou pwochen li, pou li viv yon lavi sen chak jou.',
    createdAt: '2026-01-01T00:00:00Z'
  },
  {
    id: 'faq-3',
    category: 'sacraments',
    question: 'Kijan pou m fè dedikas yon ti bebe oswa resevwa batèm ?',
    answer: 'Pou dedikas timoun : paran yo dwe kontakte sekretarya a oswa Pasteur Bequel CHERELUS pou planifye seremoni an pandan yon kil Dimanch (espesyalman 4èm Dimanch ki konsakre pou Timoun). Pou batèm pa imèsyon : kandida a dwe fin pase nan klas fòmasyon batèm pou konprann angajman lafwa li.',
    createdAt: '2026-01-01T00:00:00Z'
  },
  {
    id: 'faq-4',
    category: 'sacraments',
    question: 'Ki etap ak kondisyon pou yon maryaj kretyen fèt nan legliz la ?',
    answer: 'Fidèl yo dwe rankontre Pasteur Bequel CHERELUS omwen 3 a 6 mwa anvan dat maryaj la pou kòmanse seyans konsèy pre-matrimonyal. Tou de fiyanse yo dwe ranpli fòmilè eta sivil epi montre yon temwayaj kretyen ki onore Bondye.',
    createdAt: '2026-01-01T00:00:00Z'
  },
  {
    id: 'faq-5',
    category: 'social',
    question: 'Ki wòl pwojè CDEJ HA 0926 Compassion International jwe nan Damé ?',
    answer: 'CDEJ HA 0926 se branch sosyal ak devlopman holistik legliz la an patenarya avèk Compassion International. Li sipòte plizyè santèn timoun vilnerab nan kominote Damé a nan bay yo manje nourisan, swen sante medikal, fòmasyon biblik, kaye lekòl ak fòmasyon pwofesyonèl pou libere yo anba povrete.',
    createdAt: '2026-01-01T00:00:00Z'
  },
  {
    id: 'faq-6',
    category: 'general',
    question: 'Kijan pou m voye yon ofrann oswa yon demann priyè sekrè ?',
    answer: 'Pou demann priyè : ou ka itilize paj « Espas Priyè Sekrè » sou sit la. Lè w koche « Sekrè Pastoral », se sèlman Pasteur Bequel CHERELUS ki wè li. Pou ofrann ak donasyon : ou ka kontakte sekretarya a pa telefòn oswa WhatsApp sou +509 48596089 pou kowòdone Digicel MonCash oswa transfè dirèk.',
    createdAt: '2026-01-01T00:00:00Z'
  },
  {
    id: 'faq-7',
    category: 'general',
    question: 'Kijan pou m jwenn legliz la nan 3èm Seksyon Damé ?',
    answer: 'Legliz la sitiye nan 3èm Seksyon Damé, Komin Mòl Sen Nikola nan Depatman Nòdwès Haïti. Ou ka klike sou lyen ofisyèl Google Maps sou paj Kontak nou an (https://share.google/9kpd149ZpzHWNxOXI) pou jwenn kowòdone GPS egzat yo.',
    createdAt: '2026-01-01T00:00:00Z'
  }
];

export const faqService = {
  // Récupérer la liste des questions FAQ
  async getFAQs(): Promise<FAQItem[]> {
    try {
      const res = await fetch('/api/faq');
      if (res.ok) {
        const data = await res.json();
        if (Array.isArray(data) && data.length > 0) {
          localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
          return data;
        }
      }
    } catch {
      // API fallback
    }

    try {
      const cached = localStorage.getItem(STORAGE_KEY);
      if (cached) {
        const parsed = JSON.parse(cached);
        if (Array.isArray(parsed) && parsed.length > 0) return parsed;
      }
    } catch {
      // Ignorer
    }

    localStorage.setItem(STORAGE_KEY, JSON.stringify(INITIAL_FAQS));
    return INITIAL_FAQS;
  },

  // Ajouter une question
  async createFAQ(item: Omit<FAQItem, 'id' | 'createdAt'>): Promise<FAQItem> {
    const newItem: FAQItem = {
      ...item,
      id: 'faq-' + Date.now(),
      createdAt: new Date().toISOString()
    };

    try {
      const res = await fetch('/api/faq', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newItem)
      });
      if (res.ok) {
        const data = await res.json();
        if (data && data.item) {
          this.triggerUpdate();
          return data.item;
        }
      }
    } catch {
      // Fallback
    }

    const current = await this.getFAQs();
    const updated = [...current, newItem];
    localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
    this.triggerUpdate();
    return newItem;
  },

  // Mettre à jour une question
  async updateFAQ(id: string, updates: Partial<FAQItem>): Promise<FAQItem | null> {
    try {
      const res = await fetch(`/api/faq/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(updates)
      });
      if (res.ok) {
        const data = await res.json();
        if (data && data.item) {
          this.triggerUpdate();
          return data.item;
        }
      }
    } catch {
      // Fallback
    }

    const current = await this.getFAQs();
    const idx = current.findIndex(f => f.id === id);
    if (idx !== -1) {
      current[idx] = { ...current[idx], ...updates };
      localStorage.setItem(STORAGE_KEY, JSON.stringify(current));
      this.triggerUpdate();
      return current[idx];
    }
    return null;
  },

  // Supprimer une question
  async deleteFAQ(id: string): Promise<boolean> {
    try {
      const res = await fetch(`/api/faq/${id}`, { method: 'DELETE' });
      if (res.ok) {
        const current = await this.getFAQs();
        const filtered = current.filter(f => f.id !== id);
        localStorage.setItem(STORAGE_KEY, JSON.stringify(filtered));
        this.triggerUpdate();
        return true;
      }
    } catch {
      // Fallback
    }

    const current = await this.getFAQs();
    const filtered = current.filter(f => f.id !== id);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(filtered));
    this.triggerUpdate();
    return true;
  },

  // Ajouter plusieurs questions d'un coup (Batch)
  async batchCreateFAQs(items: Array<Omit<FAQItem, 'id' | 'createdAt'>>): Promise<number> {
    if (!items || items.length === 0) return 0;
    const current = await this.getFAQs();
    const newItems: FAQItem[] = items.map((item, idx) => ({
      ...item,
      id: 'faq-' + Date.now() + '-' + idx,
      createdAt: new Date().toISOString()
    }));

    const combined = [...current, ...newItems];
    localStorage.setItem(STORAGE_KEY, JSON.stringify(combined));
    this.triggerUpdate();
    return newItems.length;
  },

  // Gestion du Bloc HTML personnalisé pour la FAQ
  getCustomHtml(): string {
    try {
      return localStorage.getItem('dame_custom_faq_html') || '';
    } catch {
      return '';
    }
  },

  saveCustomHtml(html: string): void {
    try {
      localStorage.setItem('dame_custom_faq_html', html);
      this.triggerUpdate();
    } catch {
      // Ignorer
    }
  },

  // Parser intelligent de code HTML pour en extraire des questions/réponses FAQ
  extractFaqsFromHtml(rawHtml: string, category: FAQItem['category'] = 'general'): Array<Omit<FAQItem, 'id' | 'createdAt'>> {
    const list: Array<Omit<FAQItem, 'id' | 'createdAt'>> = [];
    if (!rawHtml || !rawHtml.trim()) return list;

    try {
      const parser = new DOMParser();
      const doc = parser.parseFromString(rawHtml, 'text/html');

      // 1. Détecter balises <details><summary>
      const detailsList = doc.querySelectorAll('details');
      if (detailsList.length > 0) {
        detailsList.forEach(det => {
          const summary = det.querySelector('summary');
          if (summary) {
            const q = summary.textContent?.trim() || '';
            summary.remove(); // Retire pour ne garder que le contenu de la réponse
            const ans = det.innerHTML.trim();
            if (q && ans) {
              list.push({ question: q, answer: ans, category });
            }
          }
        });
        if (list.length > 0) return list;
      }

      // 2. Détecter balises <dl><dt><dd>
      const dtList = doc.querySelectorAll('dt');
      if (dtList.length > 0) {
        dtList.forEach(dt => {
          const q = dt.textContent?.trim() || '';
          const dd = dt.nextElementSibling;
          if (dd && dd.tagName.toLowerCase() === 'dd') {
            const ans = dd.innerHTML.trim();
            if (q && ans) {
              list.push({ question: q, answer: ans, category });
            }
          }
        });
        if (list.length > 0) return list;
      }

      // 3. Détecter titres H2, H3, H4 suivis de paragraphes ou divs
      const headings = doc.querySelectorAll('h2, h3, h4, h5');
      if (headings.length > 0) {
        headings.forEach(h => {
          const q = h.textContent?.trim() || '';
          let next = h.nextElementSibling;
          let ansHtml = '';
          while (next && !['h2', 'h3', 'h4', 'h5'].includes(next.tagName.toLowerCase())) {
            ansHtml += next.outerHTML;
            next = next.nextElementSibling;
          }
          if (q && ansHtml) {
            list.push({ question: q, answer: ansHtml.trim(), category });
          }
        });
        if (list.length > 0) return list;
      }

      // 4. Détecter éléments avec classes ou tags .faq-item, .question, .answer
      const faqItems = doc.querySelectorAll('.faq-item, .faq-card, .faq-entry');
      if (faqItems.length > 0) {
        faqItems.forEach(item => {
          const qEl = item.querySelector('.question, .faq-q, strong, b, h4');
          const aEl = item.querySelector('.answer, .faq-a, p, div');
          if (qEl && aEl) {
            const q = qEl.textContent?.trim() || '';
            const ans = aEl.innerHTML.trim();
            if (q && ans) {
              list.push({ question: q, answer: ans, category });
            }
          }
        });
        if (list.length > 0) return list;
      }
    } catch (e) {
      console.warn('Erreur DOMParser FAQ HTML:', e);
    }

    return list;
  },

  triggerUpdate() {
    if (typeof window !== 'undefined') {
      window.dispatchEvent(new CustomEvent('faq-updated'));
    }
  }
};

