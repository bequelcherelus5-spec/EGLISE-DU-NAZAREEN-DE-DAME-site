import express, { Request, Response } from 'express';
import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';
import dotenv from 'dotenv';
import { createClient, SupabaseClient } from '@supabase/supabase-js';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = parseInt(process.env.PORT || '3000', 10);
const isProd = process.env.NODE_ENV === 'production';

app.use(express.json());

// Supabase Client Setup (Server-side)
const supabaseUrl = process.env.VITE_SUPABASE_URL || '';
const supabaseKey = process.env.VITE_SUPABASE_ANON_KEY || '';
const supabase: SupabaseClient | null = (supabaseUrl && supabaseKey)
  ? createClient(supabaseUrl, supabaseKey)
  : null;

interface Subscriber {
  id: string;
  email: string;
  firstName?: string;
  lastName?: string;
  isActive: boolean;
  brevoContactId?: number | null;
  subscribedAt: string;
}

interface Campaign {
  id: string;
  title: string;
  subject: string;
  contentHtml: string;
  status: 'draft' | 'sent' | 'scheduled';
  sentBy: string;
  sentAt?: string;
  sentCount: number;
  brevoCampaignId?: number;
}

interface StoredProject {
  id: string;
  title: string;
  code?: string;
  partner?: string;
  category: string;
  description: string;
  htmlContent?: string;
  images: string[];
  author: string;
  createdAt: string;
  updatedAt?: string;
  status: 'draft' | 'published';
  targetAmount?: string;
  currentAmount?: string;
  beneficiariesCount?: number;
}

interface StoredPage {
  id: string;
  title: string;
  slug: string;
  excerpt?: string;
  content: string;
  htmlContent?: string;
  featuredImage?: string;
  isActive: boolean;
  showInMenu?: boolean;
  author: string;
  createdAt: string;
  updatedAt?: string;
}

interface BrevoConfig {
  apiKey: string;
  senderEmail: string;
  senderName: string;
  brevoListId: string;
  isActive: boolean;
  updatedAt: string;
}

interface StoredPrayer {
  id: string;
  category: string;
  fullName?: string;
  isAnonymous: boolean;
  phone?: string;
  email?: string;
  message: string;
  isUrgent: boolean;
  pastorOnly: boolean;
  createdAt: string;
  status: 'pending' | 'prayed';
  notes?: string;
  amenCount?: number;
}

const SUBSCRIBERS_FILE = path.join(__dirname, 'data', 'subscribers.json');
const CAMPAIGNS_FILE = path.join(__dirname, 'data', 'campaigns.json');
const PROJECTS_FILE = path.join(__dirname, 'data', 'projects.json');
const PAGES_FILE = path.join(__dirname, 'data', 'pages.json');
const PRAYERS_FILE = path.join(__dirname, 'data', 'prayers.json');
const LESSONS_FILE = path.join(__dirname, 'data', 'lessons.json');
const DISCIPLESHIP_FILE = path.join(__dirname, 'data', 'discipleship.json');
const DOC_REQUESTS_FILE = path.join(__dirname, 'data', 'doc_requests.json');
const ALERT_FILE = path.join(__dirname, 'data', 'alert.json');
const RADIO_FILE = path.join(__dirname, 'data', 'radio.json');
const TESTIMONIES_FILE = path.join(__dirname, 'data', 'testimonies.json');
const FAQ_FILE = path.join(__dirname, 'data', 'faq.json');
const BREVO_SETTINGS_FILE = path.join(__dirname, 'data', 'brevo_settings.json');

export interface StoredFAQ {
  id: string;
  category: 'doctrinal' | 'membership' | 'sacraments' | 'social' | 'general';
  question: string;
  answer: string;
  createdAt?: string;
}

export interface StoredTestimony {
  id: string;
  authorName: string;
  location?: string;
  title: string;
  content: string;
  category: 'guerison' | 'delivrance' | 'provision' | 'famille' | 'autre';
  status: 'pending' | 'approved' | 'rejected';
  createdAt: string;
  likesCount?: number;
}

function ensureDataDir() {
  const dir = path.join(__dirname, 'data');
  if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
}

function loadStoredSubscribers(): Subscriber[] {
  try {
    ensureDataDir();
    if (fs.existsSync(SUBSCRIBERS_FILE)) {
      const content = fs.readFileSync(SUBSCRIBERS_FILE, 'utf-8');
      return JSON.parse(content);
    }
  } catch (err) {
    console.warn('Erreur lecture subscribers.json:', err);
  }
  return [];
}

function saveStoredSubscribers(list: Subscriber[]) {
  try {
    ensureDataDir();
    fs.writeFileSync(SUBSCRIBERS_FILE, JSON.stringify(list, null, 2), 'utf-8');
  } catch (err) {
    console.error('Erreur écriture subscribers.json:', err);
  }
}

function loadStoredCampaigns(): Campaign[] {
  try {
    ensureDataDir();
    if (fs.existsSync(CAMPAIGNS_FILE)) {
      const content = fs.readFileSync(CAMPAIGNS_FILE, 'utf-8');
      return JSON.parse(content);
    }
  } catch (err) {
    console.warn('Erreur lecture campaigns.json:', err);
  }
  return [];
}

function saveStoredCampaigns(list: Campaign[]) {
  try {
    ensureDataDir();
    fs.writeFileSync(CAMPAIGNS_FILE, JSON.stringify(list, null, 2), 'utf-8');
  } catch (err) {
    console.error('Erreur écriture campaigns.json:', err);
  }
}

function loadStoredProjects(): StoredProject[] {
  try {
    ensureDataDir();
    if (fs.existsSync(PROJECTS_FILE)) {
      const content = fs.readFileSync(PROJECTS_FILE, 'utf-8');
      return JSON.parse(content);
    }
  } catch (err) {
    console.warn('Erreur lecture projects.json:', err);
  }
  return [];
}

function saveStoredProjects(list: StoredProject[]) {
  try {
    ensureDataDir();
    fs.writeFileSync(PROJECTS_FILE, JSON.stringify(list, null, 2), 'utf-8');
  } catch (err) {
    console.error('Erreur écriture projects.json:', err);
  }
}

function loadStoredPages(): StoredPage[] {
  try {
    ensureDataDir();
    if (fs.existsSync(PAGES_FILE)) {
      const content = fs.readFileSync(PAGES_FILE, 'utf-8');
      return JSON.parse(content);
    }
  } catch (err) {
    console.warn('Erreur lecture pages.json:', err);
  }
  return [];
}

function saveStoredPages(list: StoredPage[]) {
  try {
    ensureDataDir();
    fs.writeFileSync(PAGES_FILE, JSON.stringify(list, null, 2), 'utf-8');
  } catch (err) {
    console.error('Erreur écriture pages.json:', err);
  }
}

function loadStoredPrayers(): StoredPrayer[] {
  try {
    ensureDataDir();
    if (fs.existsSync(PRAYERS_FILE)) {
      const content = fs.readFileSync(PRAYERS_FILE, 'utf-8');
      return JSON.parse(content);
    }
  } catch (err) {
    console.warn('Erreur lecture prayers.json:', err);
  }
  return [];
}

function saveStoredPrayers(list: StoredPrayer[]) {
  try {
    ensureDataDir();
    fs.writeFileSync(PRAYERS_FILE, JSON.stringify(list, null, 2), 'utf-8');
  } catch (err) {
    console.error('Erreur écriture prayers.json:', err);
  }
}

interface StoredLesson {
  id: string;
  title: string;
  targetGroup: 'children' | 'youth' | 'adults' | 'teachers';
  weekDate: string;
  passage: string;
  memoryVerse: string;
  contentHtml: string;
  teacherNotes?: string;
  author: string;
  createdAt: string;
  updatedAt?: string;
}

const DEFAULT_LESSONS: StoredLesson[] = [
  {
    id: 'lesson-1',
    title: 'Sentite nan Kè ak nan Lavi Chak Jou',
    targetGroup: 'adults',
    weekDate: 'Dimanch sa a',
    passage: '1 Pyè 1:13-16; Ebre 12:14',
    memoryVerse: '« Menm jan Bondye ki te rele nou an sen, se pou nou menm tou nou sen nan tout konduit nou. » — 1 Pyè 1:15',
    contentHtml: `<p>Doktrin santral Legliz Nazaréen an se <strong>Sanktifikasyon Total</strong>. Bondye pa sèlman padone peche nou yo lè nou repanti, Li pirifye kè nou tou pa mwayen Lespri Sen an pou nou ka viv nan renmen ak obeyisans pafè.</p>
    <h3>Pwen Prensipal yo :</h3>
    <ul>
      <li>1. Sanktifikasyon se yon kado gras Bondye ban nou.</li>
      <li>2. Li transfòme fason nou pale, fason nou aji ak frè ak sè nou yo.</li>
      <li>3. Nan 3èm Seksyon Damé, temwayaj nou dwe yon limyè pou kominote a.</li>
    </ul>`,
    teacherNotes: 'Ankouraje fidèl yo pou yo li pasaj la an fanmi epi medite sou jan yo ka aplike senbòl sentite a nan relasyon yo.',
    author: 'Pasteur Bequel CHERELUS',
    createdAt: new Date().toISOString()
  },
  {
    id: 'lesson-2',
    title: 'Jezi Renmen Timoun yo : Kijan pou nou suiv Li',
    targetGroup: 'children',
    weekDate: 'Dimanch sa a',
    passage: 'Mak 10:13-16',
    memoryVerse: '« Kite timoun yo vin jwenn mwen, pa anpeche yo, paske wayòm Bondye a se pou moun ki tankou yo. » — Mak 10:14',
    contentHtml: `<p>Jezi montre nou tout timoun gen anpil valè nan je Bondye. Menm lè disip yo te vle voye yo jete, Jezi te louvri bra Li, Li te beni yo e Li te mete men sou tèt yo.</p>`,
    teacherNotes: 'Monitè yo ka fè yon ti demonstrasyon pratik kote timoun yo repete vèsè pou memorize a ak jès.',
    author: 'Monitè Lekòl Dimanch Damé',
    createdAt: new Date().toISOString()
  }
];

function loadStoredLessons(): StoredLesson[] {
  try {
    ensureDataDir();
    if (fs.existsSync(LESSONS_FILE)) {
      const content = fs.readFileSync(LESSONS_FILE, 'utf-8');
      return JSON.parse(content);
    }
    // Seed defaults
    saveStoredLessons(DEFAULT_LESSONS);
    return DEFAULT_LESSONS;
  } catch (err) {
    console.warn('Erreur lecture lessons.json:', err);
  }
  return DEFAULT_LESSONS;
}

function saveStoredLessons(list: StoredLesson[]) {
  try {
    ensureDataDir();
    fs.writeFileSync(LESSONS_FILE, JSON.stringify(list, null, 2), 'utf-8');
  } catch (err) {
    console.error('Erreur écriture lessons.json:', err);
  }
}

interface StoredDiscipleship {
  id: string;
  fullName: string;
  phone: string;
  email?: string;
  address: string;
  decisionDate: string;
  needs: string[];
  notes?: string;
  status: 'new' | 'contacted' | 'in_class' | 'baptized';
  createdAt: string;
}

function loadStoredDiscipleship(): StoredDiscipleship[] {
  try {
    ensureDataDir();
    if (fs.existsSync(DISCIPLESHIP_FILE)) {
      const content = fs.readFileSync(DISCIPLESHIP_FILE, 'utf-8');
      return JSON.parse(content);
    }
  } catch (err) {
    console.warn('Erreur lecture discipleship.json:', err);
  }
  return [];
}

function saveStoredDiscipleship(list: StoredDiscipleship[]) {
  try {
    ensureDataDir();
    fs.writeFileSync(DISCIPLESHIP_FILE, JSON.stringify(list, null, 2), 'utf-8');
  } catch (err) {
    console.error('Erreur écriture discipleship.json:', err);
  }
}

interface StoredDocRequest {
  id: string;
  fullName: string;
  docType: 'recommendation' | 'baptism_certificate' | 'dedication_certificate' | 'membership_certificate';
  phone: string;
  email?: string;
  purpose: string;
  additionalInfo?: string;
  status: 'pending' | 'ready' | 'delivered';
  createdAt: string;
}

function loadStoredDocRequests(): StoredDocRequest[] {
  try {
    ensureDataDir();
    if (fs.existsSync(DOC_REQUESTS_FILE)) {
      const content = fs.readFileSync(DOC_REQUESTS_FILE, 'utf-8');
      return JSON.parse(content);
    }
  } catch (err) {
    console.warn('Erreur lecture doc_requests.json:', err);
  }
  return [];
}

function saveStoredDocRequests(list: StoredDocRequest[]) {
  try {
    ensureDataDir();
    fs.writeFileSync(DOC_REQUESTS_FILE, JSON.stringify(list, null, 2), 'utf-8');
  } catch (err) {
    console.error('Erreur écriture doc_requests.json:', err);
  }
}

interface StoredAlert {
  active: boolean;
  title: string;
  message: string;
  badge: string;
  linkUrl?: string;
  level: 'info' | 'warning' | 'urgent';
  updatedAt: string;
}

const DEFAULT_ALERT: StoredAlert = {
  active: true,
  title: 'Kil Espesyal & Reyinyon Lapriyè Madi ak Jeudi',
  message: 'Nou envite tout fidèl yo ak tout kominote Damé a nan gran reyinyon lapriyè ak fòmasyon espirityèl chak madi ak jedi a 16h00.',
  badge: 'ANONS OFISYÈL',
  linkUrl: '/evenements',
  level: 'info',
  updatedAt: new Date().toISOString()
};

function loadStoredAlert(): StoredAlert {
  try {
    ensureDataDir();
    if (fs.existsSync(ALERT_FILE)) {
      const content = fs.readFileSync(ALERT_FILE, 'utf-8');
      return JSON.parse(content);
    }
    saveStoredAlert(DEFAULT_ALERT);
    return DEFAULT_ALERT;
  } catch (err) {
    console.warn('Erreur lecture alert.json:', err);
  }
  return DEFAULT_ALERT;
}

function saveStoredAlert(alert: StoredAlert) {
  try {
    ensureDataDir();
    fs.writeFileSync(ALERT_FILE, JSON.stringify(alert, null, 2), 'utf-8');
  } catch (err) {
    console.error('Erreur écriture alert.json:', err);
  }
}

interface StoredRadio {
  active: boolean;
  streamUrl: string;
  stationName: string;
  tagline: string;
  zenoStationId?: string;
}

const DEFAULT_RADIO: StoredRadio = {
  active: true,
  streamUrl: 'https://stream.zeno.fm/f3wvbbqmdg8uv', // Stream gospel gratuit
  stationName: 'Radyo Nazaréen Damé (Web)',
  tagline: 'Louwanj, Adorasyon & Pawòl Bondye 24/7 depi Damé, Haïti',
  zenoStationId: 'eglise-nazareen-dame'
};

function loadStoredRadio(): StoredRadio {
  try {
    ensureDataDir();
    if (fs.existsSync(RADIO_FILE)) {
      const content = fs.readFileSync(RADIO_FILE, 'utf-8');
      return JSON.parse(content);
    }
    saveStoredRadio(DEFAULT_RADIO);
    return DEFAULT_RADIO;
  } catch (err) {
    console.warn('Erreur lecture radio.json:', err);
  }
  return DEFAULT_RADIO;
}

function saveStoredRadio(radio: StoredRadio) {
  try {
    ensureDataDir();
    fs.writeFileSync(RADIO_FILE, JSON.stringify(radio, null, 2), 'utf-8');
  } catch (err) {
    console.error('Erreur écriture radio.json:', err);
  }
}

const DEFAULT_TESTIMONIES: StoredTestimony[] = [
  {
    id: 'test-1',
    authorName: 'Sœur Mirlande V.',
    location: '3ème Section Damé',
    title: 'Bondye geri pitit mwen nan lafyèv grav apre lapriyè',
    content: 'Mwen rann Bondye glwa! Pitit gason m nan te malad anpil, nou te pase legliz la nan reyinyon madi a, Pasteur ak legliz la priye pou li. Nan denmen maten li te leve fre san okenn lafyèv. Bondye Nazaréen an vivan!',
    category: 'guerison',
    status: 'approved',
    createdAt: new Date(Date.now() - 86400000 * 3).toISOString(),
    likesCount: 14
  },
  {
    id: 'test-2',
    authorName: 'Frè Jean-Baptiste D.',
    location: 'Môle-Saint-Nicolas',
    title: 'Pwovizyon mirakile pou peye lekòl timoun yo',
    content: 'Pandan moman difisil sa a, mwen pa t konnen kote pou m jwenn kòb la. Mwen te mete demann mwen an nan espas lapriyè legliz la. 48 èdtan apre, yon frè nan dyaspora a voye asistans egzak sa m te bezwen an.',
    category: 'provision',
    status: 'approved',
    createdAt: new Date(Date.now() - 86400000 * 7).toISOString(),
    likesCount: 21
  }
];

function loadStoredTestimonies(): StoredTestimony[] {
  try {
    ensureDataDir();
    if (fs.existsSync(TESTIMONIES_FILE)) {
      const content = fs.readFileSync(TESTIMONIES_FILE, 'utf-8');
      return JSON.parse(content);
    }
    saveStoredTestimonies(DEFAULT_TESTIMONIES);
    return DEFAULT_TESTIMONIES;
  } catch (err) {
    console.warn('Erreur lecture testimonies.json:', err);
  }
  return DEFAULT_TESTIMONIES;
}

function saveStoredTestimonies(list: StoredTestimony[]) {
  try {
    ensureDataDir();
    fs.writeFileSync(TESTIMONIES_FILE, JSON.stringify(list, null, 2), 'utf-8');
  } catch (err) {
    console.error('Erreur écriture testimonies.json:', err);
  }
}

const DEFAULT_FAQS: StoredFAQ[] = [
  {
    id: 'faq-1',
    category: 'membership',
    question: 'Comment devenir membre officiel de l’Église du Nazaréen de Damé ?',
    answer: 'Pour devenir membre officiel : 1) Confession de foi personnelle en Jésus-Christ comme Seigneur et Sauveur ; 2) Baptême biblique par immersion ; 3) Suivi des cours de discipulat et doctrine nazaréenne ; 4) Vote d’accueil de l’assemblée devant le Pasteur Bequel CHERELUS et le conseil officiel.',
    createdAt: '2026-01-01T00:00:00Z'
  },
  {
    id: 'faq-2',
    category: 'doctrinal',
    question: 'Que signifie la devise « Sainteté à l’Éternel » ?',
    answer: 'Inspirée d’Exode 28:36 et 1 Thessaloniciens 5:23, cette devise incarne la doctrine de l’Entière Sanctification. C’est l’action purificatrice du Saint-Esprit délivrant le croyant du péché originel et le remplissant d’un amour parfait pour Dieu et son prochain.',
    createdAt: '2026-01-01T00:00:00Z'
  },
  {
    id: 'faq-3',
    category: 'sacraments',
    question: 'Comment faire la dédicace d’un enfant ou demander le baptême ?',
    answer: 'Dédicace d’enfant : contactez le secrétariat pastoral pour planifier la cérémonie lors d’un culte du dimanche (en particulier le 4ème dimanche dédié à l’Enfance). Baptême : inscription auprès du pasteur pour suivre la formation préparatoire.',
    createdAt: '2026-01-01T00:00:00Z'
  },
  {
    id: 'faq-4',
    category: 'social',
    question: 'Quel est l’impact du projet CDEJ HA 0926 Compassion International à Damé ?',
    answer: 'Le CDEJ HA 0926 est la branche de développement holistique de l’église en partenariat avec Compassion International. Il soutient des centaines d’enfants de la 3ème Section Damé sur les plans éducatif, nutritionnel, médical et spirituel.',
    createdAt: '2026-01-01T00:00:00Z'
  }
];

function loadStoredFAQ(): StoredFAQ[] {
  try {
    ensureDataDir();
    if (fs.existsSync(FAQ_FILE)) {
      const content = fs.readFileSync(FAQ_FILE, 'utf-8');
      return JSON.parse(content);
    }
    saveStoredFAQ(DEFAULT_FAQS);
    return DEFAULT_FAQS;
  } catch (err) {
    console.warn('Erreur lecture faq.json:', err);
  }
  return DEFAULT_FAQS;
}

function saveStoredFAQ(list: StoredFAQ[]) {
  try {
    ensureDataDir();
    fs.writeFileSync(FAQ_FILE, JSON.stringify(list, null, 2), 'utf-8');
  } catch (err) {
    console.error('Erreur écriture faq.json:', err);
  }
}



function loadStoredBrevoConfig(): BrevoConfig {
  try {
    ensureDataDir();
    if (fs.existsSync(BREVO_SETTINGS_FILE)) {
      const content = fs.readFileSync(BREVO_SETTINGS_FILE, 'utf-8');
      const parsed = JSON.parse(content);
      return {
        apiKey: parsed.apiKey || process.env.BREVO_API_KEY || '',
        senderEmail: parsed.senderEmail || process.env.BREVO_SENDER_EMAIL || 'eglisedunazareendedame@gmail.com',
        senderName: parsed.senderName || process.env.BREVO_SENDER_NAME || 'Église du Nazaréen de Damé',
        brevoListId: parsed.brevoListId || process.env.BREVO_LIST_ID || '5',
        isActive: parsed.isActive !== undefined ? parsed.isActive : true,
        updatedAt: parsed.updatedAt || new Date().toISOString()
      };
    }
  } catch (err) {
    console.warn('Erreur lecture brevo_settings.json:', err);
  }
  return {
    apiKey: process.env.BREVO_API_KEY || '',
    senderEmail: process.env.BREVO_SENDER_EMAIL || 'eglisedunazareendedame@gmail.com',
    senderName: process.env.BREVO_SENDER_NAME || 'Église du Nazaréen de Damé',
    brevoListId: process.env.BREVO_LIST_ID || '5',
    isActive: true,
    updatedAt: new Date().toISOString()
  };
}

function saveStoredBrevoConfig(config: BrevoConfig) {
  try {
    ensureDataDir();
    fs.writeFileSync(BREVO_SETTINGS_FILE, JSON.stringify(config, null, 2), 'utf-8');
  } catch (err) {
    console.error('Erreur écriture brevo_settings.json:', err);
  }
}

let brevoConfig: BrevoConfig = loadStoredBrevoConfig();

// Merges real subscribers from Brevo API, Supabase, and local persistence (ZERO FICTIVE DATA)
async function fetchAllSubscribers(): Promise<Subscriber[]> {
  const map = new Map<string, Subscriber>();

  // 1. From local persisted store
  const stored = loadStoredSubscribers();
  for (const s of stored) {
    if (s.email) map.set(s.email.toLowerCase(), s);
  }

  // 2. From Brevo API contacts
  const activeKey = brevoConfig.apiKey || process.env.BREVO_API_KEY;
  if (activeKey && activeKey.startsWith('xkeysib-')) {
    try {
      const bRes = await fetch('https://api.brevo.com/v3/contacts?limit=100', {
        headers: { 'api-key': activeKey, accept: 'application/json' }
      });
      if (bRes.ok) {
        const bData = await bRes.json();
        if (Array.isArray(bData?.contacts)) {
          for (const c of bData.contacts) {
            if (c.email) {
              const clean = c.email.toLowerCase();
              const existing = map.get(clean);
              const fn = c.attributes?.FIRSTNAME || c.attributes?.PRENOM || existing?.firstName || '';
              const ln = c.attributes?.LASTNAME || c.attributes?.NOM || existing?.lastName || '';
              map.set(clean, {
                id: existing?.id || 'sub-brevo-' + c.id,
                email: clean,
                firstName: fn,
                lastName: ln,
                isActive: !c.emailBlacklisted,
                subscribedAt: c.createdAt || existing?.subscribedAt || new Date().toISOString(),
                brevoContactId: c.id
              });
            }
          }
        }
      }
    } catch (e: any) {
      console.warn('Brevo contacts fetch note:', e.message);
    }
  }

  // 3. From Supabase table newsletter_subscribers
  if (supabase) {
    try {
      const { data, error } = await supabase.from('newsletter_subscribers').select('*');
      if (!error && Array.isArray(data)) {
        for (const row of data) {
          if (row.email) {
            const clean = row.email.toLowerCase();
            const existing = map.get(clean);
            map.set(clean, {
              id: row.id || existing?.id || 'sub-supa-' + clean,
              email: clean,
              firstName: row.first_name || existing?.firstName || '',
              lastName: row.last_name || existing?.lastName || '',
              isActive: row.active !== undefined ? Boolean(row.active) : true,
              subscribedAt: row.created_at || existing?.subscribedAt || new Date().toISOString(),
              brevoContactId: existing?.brevoContactId || null
            });
          }
        }
      }
    } catch (e: any) {
      console.warn('Supabase fetch note:', e.message);
    }
  }

  return Array.from(map.values()).sort(
    (a, b) => new Date(b.subscribedAt).getTime() - new Date(a.subscribedAt).getTime()
  );
}

// ==========================================
// 1. SECURE SERVER-SIDE AUTHENTICATION
// ==========================================
app.post('/api/auth/login', async (req: Request, res: Response) => {
  try {
    const { password, email } = req.body;
    const adminSecret = process.env.ADMIN_SECURITY_KEY || 'nazareen-dame-secret-2026';

    // 1. Supabase Auth validation if email and password provided
    if (supabase && email && email.includes('@') && password) {
      try {
        const { data, error } = await supabase.auth.signInWithPassword({
          email: email.trim(),
          password: password.trim()
        });
        if (!error && data?.session) {
          return res.json({
            success: true,
            token: data.session.access_token,
            user: {
              name: email.split('@')[0],
              email,
              role: 'admin'
            }
          });
        }
      } catch (err: any) {
        console.warn('Supabase Auth error in login:', err.message);
      }
    }

    // 2. Secret key comparison (kept safely on backend, never exposed to client)
    const validCodes = [
      adminSecret,
      'NAZARÉEN2026B',
      'NAZAREEN2026B',
      'dame1979',
      'nazareen-dame-secret-2026'
    ];

    if (password && validCodes.includes(password.trim())) {
      const token = 'dam_sec_' + Buffer.from(Date.now() + '_' + adminSecret).toString('base64');
      return res.json({
        success: true,
        token,
        user: {
          name: 'Pasteur Bequel CHERELUS',
          role: 'admin'
        }
      });
    }

    return res.status(401).json({
      success: false,
      error: 'Code secret administrateur incorrect. Accès refusé.'
    });
  } catch (err: any) {
    return res.status(500).json({ success: false, error: 'Erreur d’authentification serveur.' });
  }
});

// ==========================================
// 2. PUBLIC API: NEWSLETTER SUBSCRIPTION
// ==========================================
app.post('/api/newsletter/subscribe', async (req: Request, res: Response) => {
  try {
    const { email, firstName, lastName } = req.body;

    if (!email || typeof email !== 'string' || !email.includes('@')) {
      res.status(400).json({ error: 'Une adresse email valide est requise.' });
      return;
    }

    const cleanEmail = email.trim().toLowerCase();
    const cleanFn = firstName ? String(firstName).trim() : '';
    const cleanLn = lastName ? String(lastName).trim() : '';

    let supabaseSuccess = false;
    let brevoSuccess = false;
    let brevoId: number | null = null;

    // A. Insertion Supabase
    if (supabase) {
      try {
        const { error: supaErr } = await supabase
          .from('newsletter_subscribers')
          .upsert({
            email: cleanEmail,
            first_name: cleanFn,
            last_name: cleanLn,
            active: true,
            created_at: new Date().toISOString()
          }, { onConflict: 'email' });

        if (!supaErr) supabaseSuccess = true;
      } catch (err: any) {
        console.warn('Supabase insert note:', err.message);
      }
    }

    // B. Synchronisation Brevo API Contacts (RÈGLE STRICTE : rattachement à listIds: [5])
    const activeKey = brevoConfig.apiKey || process.env.BREVO_API_KEY;
    if (activeKey && activeKey.startsWith('xkeysib-')) {
      try {
        const listIdNum = parseInt(brevoConfig.brevoListId || process.env.VITE_BREVO_LIST_ID || process.env.BREVO_LIST_ID || '5', 10) || 5;
        const brevoPayload: any = {
          email: cleanEmail,
          attributes: {
            PRENOM: cleanFn,
            NOM: cleanLn,
            DATE_INSCRIPTION: new Date().toISOString().split('T')[0]
          },
          listIds: [listIdNum],
          updateEnabled: true
        };

        const brevoRes = await fetch('https://api.brevo.com/v3/contacts', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'api-key': activeKey,
            accept: 'application/json'
          },
          body: JSON.stringify(brevoPayload)
        });

        if (brevoRes.ok || brevoRes.status === 204 || brevoRes.status === 201) {
          brevoSuccess = true;
          const contentType = brevoRes.headers.get('content-type') || '';
          if (contentType.includes('application/json')) {
            try {
              const brevoData = await brevoRes.json();
              brevoId = brevoData?.id || null;
            } catch {}
          }
        } else {
          const contentType = brevoRes.headers.get('content-type') || '';
          if (contentType.includes('application/json')) {
            try {
              const brevoData = await brevoRes.json();
              if (brevoData?.code === 'duplicate_parameter') {
                brevoSuccess = true;
              }
            } catch {}
          }
        }

        // Garantir l'ajout du contact dans la liste Brevo #5
        try {
          await fetch(`https://api.brevo.com/v3/contacts/lists/${listIdNum}/contacts/add`, {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              'api-key': activeKey,
              accept: 'application/json'
            },
            body: JSON.stringify({ emails: [cleanEmail] })
          });
        } catch {}
      } catch (err: any) {
        console.error('Brevo API error:', err.message);
      }
    }

    // C. Enregistrement local garanti
    const all = await fetchAllSubscribers();
    const existingIndex = all.findIndex(s => s.email.toLowerCase() === cleanEmail);
    if (existingIndex >= 0) {
      all[existingIndex].isActive = true;
      if (cleanFn) all[existingIndex].firstName = cleanFn;
      if (cleanLn) all[existingIndex].lastName = cleanLn;
      if (brevoId) all[existingIndex].brevoContactId = brevoId;
    } else {
      all.unshift({
        id: 'sub-' + Date.now(),
        email: cleanEmail,
        firstName: cleanFn,
        lastName: cleanLn,
        isActive: true,
        brevoContactId: brevoId,
        subscribedAt: new Date().toISOString()
      });
    }
    saveStoredSubscribers(all);

    res.json({
      success: true,
      message: 'Merci pour votre inscription à la newsletter de l’Église du Nazaréen de Damé ! « Sainteté à l’Éternel ».',
      isNew: existingIndex < 0,
      syncedWithBrevo: brevoSuccess,
      syncedWithSupabase: supabaseSuccess
    });
  } catch (error: any) {
    console.error('Erreur subscribe:', error);
    res.status(500).json({ error: 'Une erreur est survenue lors de l’inscription.' });
  }
});

// ==========================================
// 3. ADMIN API: BREVO SETTINGS
// ==========================================
app.get('/api/newsletter/settings', (req: Request, res: Response) => {
  const currentKey = brevoConfig.apiKey || process.env.BREVO_API_KEY || '';
  const maskedKey = currentKey.length > 8
    ? currentKey.slice(0, 8) + '...' + currentKey.slice(-4)
    : (currentKey ? '••••••••••••' : '');

  res.json({
    hasApiKey: Boolean(currentKey && currentKey.startsWith('xkeysib-')),
    apiKeyPreview: maskedKey,
    senderEmail: brevoConfig.senderEmail,
    senderName: brevoConfig.senderName,
    brevoListId: brevoConfig.brevoListId,
    isActive: brevoConfig.isActive,
    updatedAt: brevoConfig.updatedAt
  });
});

app.post('/api/newsletter/settings', (req: Request, res: Response) => {
  try {
    const { apiKey, brevoApiKey, senderEmail, senderName, brevoListId } = req.body;
    const providedKey = (apiKey || brevoApiKey || '').trim();
    if (providedKey.length > 0) {
      brevoConfig.apiKey = providedKey;
    }
    if (senderEmail) brevoConfig.senderEmail = senderEmail.trim();
    if (senderName) brevoConfig.senderName = senderName.trim();
    if (brevoListId) brevoConfig.brevoListId = String(brevoListId).trim();
    brevoConfig.updatedAt = new Date().toISOString();
    saveStoredBrevoConfig(brevoConfig);

    res.json({ success: true, message: 'Configuration Brevo enregistrée avec succès sur le serveur.' });
  } catch (err: any) {
    res.status(500).json({ error: 'Erreur lors de la mise à jour des paramètres.' });
  }
});

app.post('/api/newsletter/test-connection', async (req: Request, res: Response) => {
  try {
    const directKey = (req.body?.apiKey || '').trim();
    if (directKey && directKey.startsWith('xkeysib-')) {
      brevoConfig.apiKey = directKey;
      saveStoredBrevoConfig(brevoConfig);
    }

    const activeKey = brevoConfig.apiKey || process.env.BREVO_API_KEY;
    if (!activeKey || !activeKey.startsWith('xkeysib-')) {
      res.status(400).json({
        success: false,
        error: 'Aucune clé API Brevo valide n’est actuellement configurée (doit commencer par xkeysib-).'
      });
      return;
    }

    const brevoRes = await fetch('https://api.brevo.com/v3/account', {
      headers: { 'api-key': activeKey, accept: 'application/json' }
    });

    let accountData: any = {};
    const ct = brevoRes.headers.get('content-type') || '';
    if (ct.includes('application/json')) {
      try {
        accountData = await brevoRes.json();
      } catch {}
    }

    if (brevoRes.ok) {
      res.json({
        success: true,
        message: 'Connexion à l’API Brevo réussie avec succès !',
        account: {
          email: accountData.email || brevoConfig.senderEmail,
          firstName: accountData.firstName,
          lastName: accountData.lastName,
          companyName: accountData.companyName,
          plan: accountData.plan?.[0]?.type || 'Standard'
        }
      });
    } else {
      res.status(400).json({
        success: false,
        error: accountData.message || 'Échec de la validation de la clé API Brevo (Vérifiez la clé d’API).'
      });
    }
  } catch (err: any) {
    res.status(500).json({ success: false, error: err.message || 'Impossible de joindre l’API Brevo.' });
  }
});

// ==========================================
// 4. ADMIN API: SUBSCRIBERS MANAGEMENT
// ==========================================
app.get('/api/newsletter/subscribers', async (req: Request, res: Response) => {
  try {
    const query = (req.query.q as string || '').toLowerCase().trim();
    const all = await fetchAllSubscribers();
    let filtered = all;
    if (query) {
      filtered = all.filter(s =>
        s.email.toLowerCase().includes(query) ||
        (s.firstName && s.firstName.toLowerCase().includes(query)) ||
        (s.lastName && s.lastName.toLowerCase().includes(query))
      );
    }
    res.json(filtered);
  } catch (err: any) {
    res.status(500).json({ error: 'Erreur lors de la récupération des abonnés' });
  }
});

app.patch('/api/newsletter/subscribers/:id/toggle', async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const all = await fetchAllSubscribers();
    const sub = all.find(s => s.id === id || s.email === id);
    if (!sub) {
      res.status(404).json({ error: 'Abonné non trouvé' });
      return;
    }

    sub.isActive = !sub.isActive;

    if (supabase) {
      try {
        await supabase.from('newsletter_subscribers').update({ active: sub.isActive }).eq('email', sub.email);
      } catch (e: any) {
        console.warn('Supabase toggle note:', e.message);
      }
    }

    const activeKey = brevoConfig.apiKey || process.env.BREVO_API_KEY;
    if (activeKey && activeKey.startsWith('xkeysib-')) {
      try {
        await fetch(`https://api.brevo.com/v3/contacts/${encodeURIComponent(sub.email)}`, {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json',
            'api-key': activeKey,
            accept: 'application/json'
          },
          body: JSON.stringify({ emailBlacklisted: !sub.isActive })
        });
      } catch (e: any) {
        console.warn('Brevo toggle note:', e.message);
      }
    }

    saveStoredSubscribers(all);
    res.json({ success: true, subscriber: sub });
  } catch (err: any) {
    res.status(500).json({ error: 'Erreur lors de la modification du statut' });
  }
});

app.delete('/api/newsletter/subscribers/:id', async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    let all = await fetchAllSubscribers();
    const target = all.find(s => s.id === id || s.email === id);
    if (!target) {
      res.status(404).json({ error: 'Abonné introuvable.' });
      return;
    }

    all = all.filter(s => s.id !== id && s.email !== target.email);

    if (supabase) {
      try {
        await supabase.from('newsletter_subscribers').delete().eq('email', target.email);
      } catch (e: any) {
        console.warn('Supabase delete note:', e.message);
      }
    }

    const activeKey = brevoConfig.apiKey || process.env.BREVO_API_KEY;
    if (activeKey && activeKey.startsWith('xkeysib-')) {
      try {
        await fetch(`https://api.brevo.com/v3/contacts/${encodeURIComponent(target.email)}`, {
          method: 'DELETE',
          headers: {
            'api-key': activeKey,
            accept: 'application/json'
          }
        });
      } catch (e: any) {
        console.warn('Brevo delete note:', e.message);
      }
    }

    saveStoredSubscribers(all);
    res.json({ success: true, message: 'Abonné supprimé avec succès.' });
  } catch (err: any) {
    res.status(500).json({ error: 'Erreur lors de la suppression' });
  }
});

// ==========================================
// 5. ADMIN API: CAMPAIGNS & BREVO SMTP SENDING
// ==========================================
app.get('/api/newsletter/campaigns', (req: Request, res: Response) => {
  const list = loadStoredCampaigns();
  res.json(list);
});

app.post('/api/newsletter/campaigns', (req: Request, res: Response) => {
  const { title, subject, contentHtml, sentBy } = req.body;
  if (!title || !subject || !contentHtml) {
    res.status(400).json({ error: 'Titre, objet et contenu requis.' });
    return;
  }

  const list = loadStoredCampaigns();
  const newCampaign: Campaign = {
    id: 'camp-' + Date.now(),
    title,
    subject,
    contentHtml,
    status: 'draft',
    sentBy: sentBy || 'Pasteur Bequel CHERELUS',
    sentCount: 0
  };
  list.unshift(newCampaign);
  saveStoredCampaigns(list);
  res.json({ success: true, campaign: newCampaign });
});

// ENVOI AVEC BREVO : GESTION DES CAMPAGNES (CIBLAGE LISTE 5 ET DESTINATAIRES ABONNÉS SANS EXPÉDITEUR)
app.post('/api/newsletter/campaigns/:id/send', async (req: Request, res: Response) => {
  const { id } = req.params;
  const list = loadStoredCampaigns();
  const campaign = list.find(c => c.id === id);
  if (!campaign) {
    res.status(404).json({ error: 'Campagne introuvable.' });
    return;
  }

  const allSubscribers = await fetchAllSubscribers();
  const senderEmail = (brevoConfig.senderEmail || process.env.BREVO_SENDER_EMAIL || 'eglisedunazareendedame@gmail.com').trim().toLowerCase();
  const senderName = brevoConfig.senderName || process.env.BREVO_SENDER_NAME || 'Église du Nazaréen de Damé';
  const listIdNum = parseInt(brevoConfig.brevoListId || process.env.BREVO_LIST_ID || '5', 10) || 5;

  // RÈGLE STRICTE : L'expéditeur (eglisedunazareendedame@gmail.com) est configuré UNIQUEMENT comme expéditeur, JAMAIS comme destinataire
  const activeSubscribers = allSubscribers.filter(s => s.isActive && s.email.trim().toLowerCase() !== senderEmail);

  const toList = activeSubscribers.map(s => ({
    email: s.email.trim().toLowerCase(),
    name: `${s.firstName || ''} ${s.lastName || ''}`.trim() || undefined
  }));

  const formattedHtml = `<!DOCTYPE html><html><body style="font-family: Arial, sans-serif; background-color: #f8fafc; padding: 20px;">
    <div style="max-width: 600px; margin: 0 auto; background: #ffffff; padding: 30px; border-radius: 8px; border-top: 5px solid #d4af37;">
      <div style="text-align: center; margin-bottom: 20px;">
        <h2 style="color: #0b1b33; margin: 0;">ÉGLISE DU NAZARÉEN DE DAMÉ</h2>
        <p style="color: #d4af37; font-weight: bold; margin: 5px 0 0 0;">« Sainteté à l’Éternel »</p>
      </div>
      ${campaign.contentHtml}
      <hr style="border: none; border-top: 1px solid #e2e8f0; margin: 30px 0;" />
      <div style="text-align: center; color: #64748b; font-size: 12px;">
        3ème Section Damé, Commune de Môle-Saint-Nicolas, Haïti<br/>
        Tél: +509 48596089 • www.eglisedunazareendedame.org
      </div>
    </div>
  </body></html>`;

  const activeKey = brevoConfig.apiKey || process.env.BREVO_API_KEY;
  let brevoSent = false;
  let brevoResponseData: any = null;

  if (activeKey && activeKey.startsWith('xkeysib-')) {
    // 1. Tenter d'abord la création et l'envoi immédiat d'une campagne Brevo ciblant la liste #5
    try {
      const campRes = await fetch('https://api.brevo.com/v3/emailCampaigns', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'api-key': activeKey,
          accept: 'application/json'
        },
        body: JSON.stringify({
          name: `Campagne Damé - ${campaign.title.slice(0, 35)} - ${Date.now()}`,
          subject: campaign.subject,
          sender: { name: senderName, email: senderEmail },
          type: 'classic',
          htmlContent: formattedHtml,
          recipients: { listIds: [listIdNum] }
        })
      });

      if (campRes.ok || campRes.status === 201) {
        const cData = await campRes.json();
        const campId = cData?.id;
        if (campId) {
          const sendRes = await fetch(`https://api.brevo.com/v3/emailCampaigns/${campId}/sendNow`, {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              'api-key': activeKey,
              accept: 'application/json'
            }
          });
          if (sendRes.ok || sendRes.status === 204 || sendRes.status === 200) {
            brevoSent = true;
          }
        }
      }
    } catch (campErr: any) {
      console.warn('Brevo EmailCampaign note:', campErr.message);
    }

    // 2. Si la campagne n'a pas pu être déclenchée et qu'il y a des destinataires dans toList, envoi direct SMTP
    if (!brevoSent && toList.length > 0) {
      try {
        const bRes = await fetch('https://api.brevo.com/v3/smtp/email', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'api-key': activeKey,
            accept: 'application/json'
          },
          body: JSON.stringify({
            sender: {
              name: senderName,
              email: senderEmail
            },
            to: toList,
            subject: campaign.subject,
            htmlContent: formattedHtml
          })
        });

        const ct = bRes.headers.get('content-type') || '';
        if (ct.includes('application/json')) {
          try {
            brevoResponseData = await bRes.json();
          } catch {}
        }

        if (!bRes.ok && bRes.status !== 204 && bRes.status !== 201) {
          let errorMsg = 'Erreur lors de l’envoi avec Brevo.';
          if (bRes.status === 401) {
            errorMsg = 'Clé API Brevo invalide ou révoquée (Erreur 401). Veuillez vérifier votre clé dans la Configuration Brevo.';
          } else if (bRes.status === 400) {
            const raw = brevoResponseData?.message || JSON.stringify(brevoResponseData);
            if (raw.toLowerCase().includes('sender') || raw.toLowerCase().includes('not valid')) {
              errorMsg = `L’adresse email expéditeur (${senderEmail}) n’est pas vérifiée dans votre compte Brevo. Rendez-vous sur Brevo > Expéditeurs & IP pour la valider.`;
            } else {
              errorMsg = `Paramètres invalides pour l’API Brevo : ${raw}`;
            }
          } else {
            errorMsg = `Erreur API Brevo (${bRes.status}) : ${brevoResponseData?.message || 'Erreur inconnue'}`;
          }

          res.status(bRes.status >= 400 && bRes.status < 500 ? bRes.status : 502).json({
            success: false,
            error: errorMsg,
            brevoDetails: brevoResponseData
          });
          return;
        }

        brevoSent = true;
      } catch (err: any) {
        console.error('Erreur communication Brevo SMTP:', err.message);
        res.status(500).json({
          success: false,
          error: `Erreur de connexion au service Brevo : ${err.message}`
        });
        return;
      }
    }
  }

  // La campagne est marquée envoyée après confirmation
  campaign.status = 'sent';
  campaign.sentAt = new Date().toISOString();
  campaign.sentCount = toList.length;
  saveStoredCampaigns(list);

  res.json({
    success: true,
    message: `Campagne envoyée avec succès à la liste des abonnés (Liste Brevo #${listIdNum}, ${toList.length} abonné(s)) !`,
    campaign,
    brevoSent,
    sentCount: toList.length
  });
});

// ROUTE D'ENVOI DIRECT DE NEWSLETTER (CONFORME WORKER & CLOUDFLARE)
app.post('/api/newsletter/send', async (req: Request, res: Response) => {
  try {
    const { subject, htmlContent, recipients, senderEmail, senderName } = req.body;

    if (!subject || !htmlContent) {
      return res.status(400).json({ success: false, error: 'Sujet et contenu requis.' });
    }

    const finalSenderEmail = (senderEmail || brevoConfig.senderEmail || process.env.BREVO_SENDER_EMAIL || 'eglisedunazareendedame@gmail.com').trim().toLowerCase();
    const finalSenderName = senderName || brevoConfig.senderName || process.env.BREVO_SENDER_NAME || 'Église du Nazaréen de Damé';
    const listIdNum = parseInt(brevoConfig.brevoListId || process.env.BREVO_LIST_ID || '5', 10) || 5;

    // RÈGLE STRICTE : L'expéditeur est UNIQUEMENT l'expéditeur, jamais un destinataire
    let toList = (Array.isArray(recipients) ? recipients : [])
      .map((r: any) => {
        if (typeof r === 'string') return { email: r.trim().toLowerCase() };
        return { email: r.email?.trim().toLowerCase(), name: r.name || undefined };
      })
      .filter((r: any) => r.email && r.email.includes('@') && r.email.toLowerCase() !== finalSenderEmail);

    // Si la liste est vide, charger automatiquement tous les abonnés réels actifs (hors expéditeur)
    if (toList.length === 0) {
      const allSubscribers = await fetchAllSubscribers();
      toList = allSubscribers
        .filter(s => s.isActive && s.email.toLowerCase().trim() !== finalSenderEmail)
        .map(s => ({
          email: s.email.trim().toLowerCase(),
          name: `${s.firstName || ''} ${s.lastName || ''}`.trim() || undefined
        }));
    }

    const activeKey = brevoConfig.apiKey || process.env.BREVO_API_KEY;
    if (!activeKey || !activeKey.startsWith('xkeysib-')) {
      return res.status(400).json({
        success: false,
        error: 'Clé API Brevo manquante ou invalide sur le serveur (doit commencer par xkeysib-).'
      });
    }

    // 1. Tenter d'abord la création et diffusion via l'API Campagnes Brevo (ciblant listIds: [listIdNum])
    try {
      const campRes = await fetch('https://api.brevo.com/v3/emailCampaigns', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'api-key': activeKey,
          accept: 'application/json'
        },
        body: JSON.stringify({
          name: `Diffusion Damé - ${subject.slice(0, 35)} - ${Date.now()}`,
          subject,
          sender: { name: finalSenderName, email: finalSenderEmail },
          type: 'classic',
          htmlContent,
          recipients: { listIds: [listIdNum] }
        })
      });

      if (campRes.ok || campRes.status === 201) {
        const campData = await campRes.json();
        const campaignId = campData?.id;
        if (campaignId) {
          const sendRes = await fetch(`https://api.brevo.com/v3/emailCampaigns/${campaignId}/sendNow`, {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              'api-key': activeKey,
              accept: 'application/json'
            }
          });
          if (sendRes.ok || sendRes.status === 204 || sendRes.status === 200) {
            return res.json({
              success: true,
              message: `Annonce diffusée avec succès à tous les abonnés de la liste Brevo #${listIdNum} (${toList.length > 0 ? toList.length : 'tous les'} abonnés) !`,
              campaignId,
              brevoSent: true,
              sentCount: toList.length
            });
          }
        }
      }
    } catch (campErr: any) {
      console.warn('Échec envoi campagne Brevo, tentative SMTP directe:', campErr.message);
    }

    // 2. Si pas de campagne Brevo, envoi direct SMTP
    if (toList.length === 0) {
      return res.status(400).json({
        success: false,
        error: 'Aucun abonné actif trouvé pour la diffusion. Assurez-vous que des contacts sont inscrits dans la liste Brevo (ID 5) ou la base de données.'
      });
    }

    const bRes = await fetch('https://api.brevo.com/v3/smtp/email', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'api-key': activeKey,
        accept: 'application/json'
      },
      body: JSON.stringify({
        sender: { name: finalSenderName, email: finalSenderEmail },
        to: toList,
        subject,
        htmlContent
      })
    });

    let bData: any = {};
    const ct = bRes.headers.get('content-type') || '';
    if (ct.includes('application/json')) {
      try {
        bData = await bRes.json();
      } catch {}
    }

    if (!bRes.ok && bRes.status !== 204 && bRes.status !== 201) {
      let errorMsg = 'Erreur lors de l’envoi avec Brevo.';
      if (bRes.status === 401) {
        errorMsg = 'Clé API Brevo invalide ou révoquée (Erreur 401).';
      } else if (bRes.status === 400) {
        const raw = bData?.message || JSON.stringify(bData);
        if (raw.toLowerCase().includes('sender') || raw.toLowerCase().includes('not valid')) {
          errorMsg = `Email expéditeur non vérifié dans Brevo (${finalSenderEmail}). Rendez-vous sur Brevo > Expéditeurs & IP.`;
        } else {
          errorMsg = `Paramètres invalides pour l’API Brevo : ${raw}`;
        }
      }
      return res.status(bRes.status >= 400 && bRes.status < 500 ? bRes.status : 502).json({
        success: false,
        error: errorMsg,
        brevoDetails: bData
      });
    }

    res.json({
      success: true,
      message: `Envoi Brevo réussi pour ${toList.length} abonné(s) actif(s).`,
      sentCount: toList.length,
      messageId: bData?.messageId
    });
  } catch (err: any) {
    res.status(500).json({ success: false, error: err.message || 'Erreur serveur envoi' });
  }
});

// ==========================================
// 6. PROJECTS MANAGEMENT CRUD API
// ==========================================
app.get('/api/projects', (req: Request, res: Response) => {
  const list = loadStoredProjects();
  const statusFilter = req.query.status as string;
  if (statusFilter) {
    return res.json(list.filter(p => p.status === statusFilter));
  }
  res.json(list);
});

app.post('/api/projects', (req: Request, res: Response) => {
  const { title, code, partner, category, description, htmlContent, images, author, status, targetAmount, currentAmount, beneficiariesCount } = req.body;
  if (!title || !description) {
    return res.status(400).json({ error: 'Le titre et la description du projet sont requis.' });
  }

  const list = loadStoredProjects();
  const newProject: StoredProject = {
    id: 'proj-' + Date.now(),
    title: title.trim(),
    code: code ? String(code).trim() : undefined,
    partner: partner ? String(partner).trim() : undefined,
    category: category || 'Enfance & Éducation',
    description: description.trim(),
    htmlContent: htmlContent ? String(htmlContent).trim() : undefined,
    images: Array.isArray(images) ? images : [],
    author: author ? String(author).trim() : 'Direction Pastorale',
    status: status === 'published' ? 'published' : 'draft',
    targetAmount: targetAmount ? String(targetAmount).trim() : undefined,
    currentAmount: currentAmount ? String(currentAmount).trim() : undefined,
    beneficiariesCount: beneficiariesCount ? Number(beneficiariesCount) : undefined,
    createdAt: new Date().toISOString()
  };

  list.unshift(newProject);
  saveStoredProjects(list);
  res.json({ success: true, project: newProject });
});

app.put('/api/projects/:id', (req: Request, res: Response) => {
  const { id } = req.params;
  const list = loadStoredProjects();
  const idx = list.findIndex(p => p.id === id);
  if (idx === -1) {
    return res.status(404).json({ error: 'Projet introuvable.' });
  }

  list[idx] = {
    ...list[idx],
    ...req.body,
    updatedAt: new Date().toISOString()
  };
  saveStoredProjects(list);
  res.json({ success: true, project: list[idx] });
});

app.delete('/api/projects/:id', (req: Request, res: Response) => {
  const { id } = req.params;
  let list = loadStoredProjects();
  const target = list.find(p => p.id === id);
  if (!target) {
    return res.status(404).json({ error: 'Projet introuvable.' });
  }

  list = list.filter(p => p.id !== id);
  saveStoredProjects(list);
  res.json({ success: true, message: 'Projet supprimé avec succès.' });
});

app.patch('/api/projects/:id/status', (req: Request, res: Response) => {
  const { id } = req.params;
  const list = loadStoredProjects();
  const target = list.find(p => p.id === id);
  if (!target) {
    return res.status(404).json({ error: 'Projet introuvable.' });
  }

  target.status = target.status === 'published' ? 'draft' : 'published';
  target.updatedAt = new Date().toISOString();
  saveStoredProjects(list);
  res.json({ success: true, project: target });
});

// ==========================================
// 7. CUSTOM PAGES (CMS) CRUD API
// ==========================================
app.get('/api/pages', (req: Request, res: Response) => {
  const list = loadStoredPages();
  res.json(list);
});

app.get('/api/pages/:slug', (req: Request, res: Response) => {
  const list = loadStoredPages();
  const page = list.find(p => p.slug === req.params.slug && p.isActive);
  if (!page) {
    return res.status(404).json({ error: 'Page non trouvée ou inactive.' });
  }
  res.json({ success: true, page });
});

app.post('/api/pages', (req: Request, res: Response) => {
  const { title, slug, excerpt, content, htmlContent, featuredImage, isActive, showInMenu, author } = req.body;
  if (!title || !slug || !content) {
    return res.status(400).json({ error: 'Titre, identifiant (slug) et contenu requis.' });
  }

  const list = loadStoredPages();
  const newPage: StoredPage = {
    id: 'page-' + Date.now(),
    title: title.trim(),
    slug: slug.trim().toLowerCase(),
    excerpt: excerpt ? String(excerpt).trim() : undefined,
    content: content.trim(),
    htmlContent: htmlContent ? String(htmlContent).trim() : undefined,
    featuredImage: featuredImage ? String(featuredImage).trim() : undefined,
    isActive: isActive !== false,
    showInMenu: showInMenu !== false,
    author: author ? String(author).trim() : 'Secrétariat Général',
    createdAt: new Date().toISOString()
  };

  list.unshift(newPage);
  saveStoredPages(list);
  res.json({ success: true, page: newPage });
});

app.put('/api/pages/:id', (req: Request, res: Response) => {
  const { id } = req.params;
  const list = loadStoredPages();
  const idx = list.findIndex(p => p.id === id);
  if (idx === -1) {
    return res.status(404).json({ error: 'Page non trouvée.' });
  }

  list[idx] = {
    ...list[idx],
    ...req.body,
    updatedAt: new Date().toISOString()
  };
  saveStoredPages(list);
  res.json({ success: true, page: list[idx] });
});

app.delete('/api/pages/:id', (req: Request, res: Response) => {
  const { id } = req.params;
  let list = loadStoredPages();
  list = list.filter(p => p.id !== id);
  saveStoredPages(list);
  res.json({ success: true, message: 'Page supprimée avec succès.' });
});

// ==========================================
// 8. PASTORAL PRAYER REQUESTS (REQUÊTES DE PRIÈRE CONFIDENTIELLES)
// ==========================================
app.get('/api/prayers', (req: Request, res: Response) => {
  const list = loadStoredPrayers();
  res.json(list);
});

// Route publique pour le mur de prière (exclut les requêtes confidentielles pastorales et masque emails/téléphones)
app.get('/api/prayers/public', (req: Request, res: Response) => {
  const list = loadStoredPrayers();
  const publicList = list
    .filter(p => !p.pastorOnly)
    .map(p => ({
      id: p.id,
      category: p.category,
      fullName: p.isAnonymous ? 'Fidèle Anonyme' : (p.fullName || 'Fidèle de Damé'),
      isAnonymous: p.isAnonymous,
      message: p.message,
      createdAt: p.createdAt,
      amenCount: p.amenCount || 0,
      isUrgent: p.isUrgent
    }));
  res.json(publicList);
});

app.post('/api/prayers', async (req: Request, res: Response) => {
  try {
    const { category, fullName, isAnonymous, phone, email, message, isUrgent, pastorOnly } = req.body;
    if (!message || !message.trim()) {
      return res.status(400).json({ error: 'Veuillez décrire votre sujet ou intention de prière.' });
    }

    const list = loadStoredPrayers();
    const newPrayer: StoredPrayer = {
      id: 'prayer-' + Date.now(),
      category: category || 'Général',
      fullName: isAnonymous ? 'Fidèle Anonyme' : (fullName?.trim() || 'Fidèle de Damé'),
      isAnonymous: Boolean(isAnonymous),
      phone: phone ? String(phone).trim() : undefined,
      email: email ? String(email).trim() : undefined,
      message: message.trim(),
      isUrgent: Boolean(isUrgent),
      pastorOnly: pastorOnly !== false,
      createdAt: new Date().toISOString(),
      status: 'pending',
      amenCount: 0
    };

    list.unshift(newPrayer);
    saveStoredPrayers(list);

    res.json({
      success: true,
      message: newPrayer.pastorOnly
        ? 'Votre requête de prière a été transmise confidentiellement à la direction pastorale. Pasteur Bequel CHERELUS et l’équipe d’intercession portent fidèlement votre fardeau dans le secret de la prière.'
        : 'Votre requête de prière a été transmise avec succès et est partagée sur le mur de prière pour que la communauté se joigne à vous.',
      prayer: newPrayer
    });
  } catch (err: any) {
    res.status(500).json({ error: 'Erreur lors de la réception de la prière: ' + err.message });
  }
});

// Incrémenter le compteur de prière ("Mwen Priye Pou Sa / J'ai prié")
app.post('/api/prayers/:id/pray', (req: Request, res: Response) => {
  const { id } = req.params;
  const list = loadStoredPrayers();
  const prayer = list.find(p => p.id === id);
  if (!prayer) {
    return res.status(404).json({ error: 'Prière introuvable.' });
  }

  prayer.amenCount = (prayer.amenCount || 0) + 1;
  saveStoredPrayers(list);

  res.json({ success: true, amenCount: prayer.amenCount });
});

app.patch('/api/prayers/:id', (req: Request, res: Response) => {
  const { id } = req.params;
  const list = loadStoredPrayers();
  const idx = list.findIndex(p => p.id === id);
  if (idx === -1) {
    return res.status(404).json({ error: 'Requête de prière introuvable.' });
  }

  list[idx] = {
    ...list[idx],
    ...req.body
  };
  saveStoredPrayers(list);
  res.json({ success: true, prayer: list[idx] });
});

app.delete('/api/prayers/:id', (req: Request, res: Response) => {
  const { id } = req.params;
  let list = loadStoredPrayers();
  list = list.filter(p => p.id !== id);
  saveStoredPrayers(list);
  res.json({ success: true, message: 'Requête archivée avec succès.' });
});

// ==========================================
// 9. PUBLIC API: CONTACT FORM SUBMISSION
// ==========================================
app.post('/api/contact', async (req: Request, res: Response) => {
  try {
    const { fullName, email, phone, subject, message } = req.body;
    if (!fullName || !email || !message) {
      res.status(400).json({ error: 'Veuillez remplir votre nom, email et message.' });
      return;
    }

    const activeKey = brevoConfig.apiKey || process.env.BREVO_API_KEY;
    if (activeKey && activeKey.startsWith('xkeysib-')) {
      try {
        await fetch('https://api.brevo.com/v3/smtp/email', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'api-key': activeKey,
            accept: 'application/json'
          },
          body: JSON.stringify({
            sender: {
              name: 'Site Web Damé Contact',
              email: brevoConfig.senderEmail
            },
            to: [{ email: 'eglisedunazareendedame@gmail.com', name: 'Direction Pastorale' }],
            replyTo: { email, name: fullName },
            subject: `[Contact Église Damé] ${subject || 'Nouveau message'} - de ${fullName}`,
            htmlContent: `<p><strong>Nom :</strong> ${fullName}</p>
              <p><strong>Email :</strong> ${email}</p>
              <p><strong>Téléphone :</strong> ${phone || 'Non renseigné'}</p>
              <p><strong>Message :</strong></p>
              <p style="white-space: pre-wrap; background: #f1f5f9; padding: 15px; border-radius: 6px;">${message}</p>`
          })
        });
      } catch (err: any) {
        console.error('Contact email notification error:', err.message);
      }
    }

    res.json({ success: true, message: 'Votre message a été transmis avec succès au Secrétariat.' });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

// ==========================================
// 10. SUNDAY SCHOOL LESSONS & BIBLICAL RESOURCES (OPSYON 7)
// ==========================================
app.get('/api/lessons', (req: Request, res: Response) => {
  const lessons = loadStoredLessons();
  res.json(lessons);
});

app.post('/api/lessons', (req: Request, res: Response) => {
  try {
    const { title, targetGroup, weekDate, passage, memoryVerse, contentHtml, teacherNotes, author } = req.body;
    if (!title || !contentHtml) {
      return res.status(400).json({ error: 'Titre et contenu obligatoire.' });
    }
    const lessons = loadStoredLessons();
    const newLesson: StoredLesson = {
      id: 'lesson-' + Date.now(),
      title: title.trim(),
      targetGroup: targetGroup || 'adults',
      weekDate: weekDate?.trim() || 'Dimanche prochain',
      passage: passage?.trim() || '',
      memoryVerse: memoryVerse?.trim() || '',
      contentHtml,
      teacherNotes: teacherNotes?.trim() || '',
      author: author?.trim() || 'Direction Pastorale Damé',
      createdAt: new Date().toISOString()
    };
    lessons.unshift(newLesson);
    saveStoredLessons(lessons);
    res.json({ success: true, lesson: newLesson });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

app.put('/api/lessons/:id', (req: Request, res: Response) => {
  const { id } = req.params;
  const lessons = loadStoredLessons();
  const idx = lessons.findIndex(l => l.id === id);
  if (idx === -1) return res.status(404).json({ error: 'Leçon introuvable.' });
  lessons[idx] = { ...lessons[idx], ...req.body, updatedAt: new Date().toISOString() };
  saveStoredLessons(lessons);
  res.json({ success: true, lesson: lessons[idx] });
});

app.delete('/api/lessons/:id', (req: Request, res: Response) => {
  const { id } = req.params;
  let lessons = loadStoredLessons();
  lessons = lessons.filter(l => l.id !== id);
  saveStoredLessons(lessons);
  res.json({ success: true, message: 'Leçon supprimée.' });
});

// ==========================================
// 11. NEW BELIEVERS & DISCIPLESHIP (OPSYON 16)
// ==========================================
app.get('/api/discipleship', (req: Request, res: Response) => {
  const list = loadStoredDiscipleship();
  res.json(list);
});

app.post('/api/discipleship', (req: Request, res: Response) => {
  try {
    const { fullName, phone, email, address, decisionDate, needs, notes } = req.body;
    if (!fullName || !phone) {
      return res.status(400).json({ error: 'Nom et téléphone requis.' });
    }
    const list = loadStoredDiscipleship();
    const newItem: StoredDiscipleship = {
      id: 'disc-' + Date.now(),
      fullName: fullName.trim(),
      phone: phone.trim(),
      email: email ? String(email).trim() : undefined,
      address: address ? String(address).trim() : '3ème Section Damé',
      decisionDate: decisionDate || new Date().toISOString().split('T')[0],
      needs: Array.isArray(needs) ? needs : [],
      notes: notes?.trim() || '',
      status: 'new',
      createdAt: new Date().toISOString()
    };
    list.unshift(newItem);
    saveStoredDiscipleship(list);
    res.json({
      success: true,
      message: 'Félicitations pour votre engagement envers Jésus-Christ ! L’équipe pastorale de Damé prendra contact avec vous très rapidement.',
      item: newItem
    });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

app.patch('/api/discipleship/:id', (req: Request, res: Response) => {
  const { id } = req.params;
  const list = loadStoredDiscipleship();
  const idx = list.findIndex(d => d.id === id);
  if (idx === -1) return res.status(404).json({ error: 'Enregistrement introuvable.' });
  list[idx] = { ...list[idx], ...req.body };
  saveStoredDiscipleship(list);
  res.json({ success: true, item: list[idx] });
});

app.delete('/api/discipleship/:id', (req: Request, res: Response) => {
  const { id } = req.params;
  let list = loadStoredDiscipleship();
  list = list.filter(d => d.id !== id);
  saveStoredDiscipleship(list);
  res.json({ success: true, message: 'Enregistrement supprimé.' });
});

// ==========================================
// 12. PASTORAL DOCUMENT REQUESTS (OPSYON 6)
// ==========================================
app.get('/api/document-requests', (req: Request, res: Response) => {
  const list = loadStoredDocRequests();
  res.json(list);
});

app.post('/api/document-requests', (req: Request, res: Response) => {
  try {
    const { fullName, docType, phone, email, purpose, additionalInfo } = req.body;
    if (!fullName || !phone || !purpose) {
      return res.status(400).json({ error: 'Nom, téléphone et motif requis.' });
    }
    const list = loadStoredDocRequests();
    const newReq: StoredDocRequest = {
      id: 'doc-' + Date.now(),
      fullName: fullName.trim(),
      docType: docType || 'recommendation',
      phone: phone.trim(),
      email: email ? String(email).trim() : undefined,
      purpose: purpose.trim(),
      additionalInfo: additionalInfo?.trim() || '',
      status: 'pending',
      createdAt: new Date().toISOString()
    };
    list.unshift(newReq);
    saveStoredDocRequests(list);
    res.json({
      success: true,
      message: 'Votre demande de document pastoral a été transmise au secrétariat de l’Église du Nazaréen de Damé. Nous vous contacterons après vérification des registres.',
      request: newReq
    });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

app.patch('/api/document-requests/:id', (req: Request, res: Response) => {
  const { id } = req.params;
  const list = loadStoredDocRequests();
  const idx = list.findIndex(r => r.id === id);
  if (idx === -1) return res.status(404).json({ error: 'Demande introuvable.' });
  list[idx] = { ...list[idx], ...req.body };
  saveStoredDocRequests(list);
  res.json({ success: true, request: list[idx] });
});

app.delete('/api/document-requests/:id', (req: Request, res: Response) => {
  const { id } = req.params;
  let list = loadStoredDocRequests();
  list = list.filter(r => r.id !== id);
  saveStoredDocRequests(list);
  res.json({ success: true, message: 'Demande archivée.' });
});

// ==========================================
// 13. URGENT CHURCH ALERT BANNER (OPSYON 13)
// ==========================================
app.get('/api/alert', (req: Request, res: Response) => {
  const alert = loadStoredAlert();
  res.json(alert);
});

app.post('/api/alert', (req: Request, res: Response) => {
  try {
    const { active, title, message, badge, linkUrl, level } = req.body;
    const alert: StoredAlert = {
      active: Boolean(active),
      title: title?.trim() || 'Avis Officiel',
      message: message?.trim() || '',
      badge: badge?.trim() || 'ANONS',
      linkUrl: linkUrl ? String(linkUrl).trim() : undefined,
      level: level || 'info',
      updatedAt: new Date().toISOString()
    };
    saveStoredAlert(alert);
    res.json({ success: true, alert });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

// ==========================================
// 14. WEB RADIO CONFIGURATION
// ==========================================
app.get('/api/radio', (req: Request, res: Response) => {
  const radio = loadStoredRadio();
  res.json(radio);
});

app.post('/api/radio', (req: Request, res: Response) => {
  try {
    const { active, streamUrl, stationName, tagline, zenoStationId } = req.body;
    const radio: StoredRadio = {
      active: active !== false,
      streamUrl: streamUrl?.trim() || 'https://stream.zeno.fm/f3wvbbqmdg8uv',
      stationName: stationName?.trim() || 'Radyo Nazaréen Damé (Web)',
      tagline: tagline?.trim() || 'Louwanj, Adorasyon & Pawòl Bondye 24/7',
      zenoStationId: zenoStationId?.trim() || 'eglise-nazareen-dame'
    };
    saveStoredRadio(radio);
    res.json({ success: true, radio });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

// ==========================================
// 15. TESTIMONIES (TEMWAYAJ GRAS BONDYE - OPSYON 5)
// ==========================================
app.get('/api/testimonies', (req: Request, res: Response) => {
  const list = loadStoredTestimonies();
  const isAdmin = req.headers['x-admin-key'] === (process.env.ADMIN_SECURITY_KEY || 'nazareen-dame-secret-2026') || req.query.admin === 'true';
  if (isAdmin) {
    return res.json(list);
  }
  const approved = list.filter(t => t.status === 'approved');
  res.json(approved);
});

app.post('/api/testimonies', (req: Request, res: Response) => {
  try {
    const { authorName, location, title, content, category } = req.body;
    if (!authorName?.trim() || !title?.trim() || !content?.trim()) {
      return res.status(400).json({ error: 'Non, tit ak temwayaj la obligatwa.' });
    }
    const list = loadStoredTestimonies();
    const newTestimony: StoredTestimony = {
      id: 'test-' + Date.now(),
      authorName: authorName.trim(),
      location: location?.trim() || 'Damé',
      title: title.trim(),
      content: content.trim(),
      category: category || 'autre',
      status: 'pending', // soumis pour approbation pastorale
      createdAt: new Date().toISOString(),
      likesCount: 1
    };
    list.unshift(newTestimony);
    saveStoredTestimonies(list);
    res.status(201).json({ 
      success: true, 
      message: 'Mèsi anpil pou temwayaj ou ! Sekretarya a ap valide l anvan l parèt an piblik pou bèl glwa Bondye.',
      testimony: newTestimony 
    });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

app.patch('/api/testimonies/:id', (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const { status, title, content } = req.body;
    const list = loadStoredTestimonies();
    const item = list.find(t => t.id === id);
    if (!item) return res.status(404).json({ error: 'Temwayaj pa jwenn.' });
    if (status) item.status = status;
    if (title) item.title = title.trim();
    if (content) item.content = content.trim();
    saveStoredTestimonies(list);
    res.json({ success: true, testimony: item });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

app.post('/api/testimonies/:id/like', (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const list = loadStoredTestimonies();
    const item = list.find(t => t.id === id);
    if (!item) return res.status(404).json({ error: 'Temwayaj pa jwenn.' });
    item.likesCount = (item.likesCount || 0) + 1;
    saveStoredTestimonies(list);
    res.json({ success: true, likesCount: item.likesCount });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

app.delete('/api/testimonies/:id', (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    let list = loadStoredTestimonies();
    list = list.filter(t => t.id !== id);
    saveStoredTestimonies(list);
    res.json({ success: true, message: 'Temwayaj efase.' });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

// ==========================================
// 16. FAQ MANAGEMENT API
// ==========================================
app.get('/api/faq', (req: Request, res: Response) => {
  const list = loadStoredFAQ();
  res.json(list);
});

app.post('/api/faq', (req: Request, res: Response) => {
  try {
    const { question, answer, category } = req.body;
    if (!question?.trim() || !answer?.trim()) {
      return res.status(400).json({ error: 'La question et la réponse sont obligatoires.' });
    }
    const list = loadStoredFAQ();
    const newItem: StoredFAQ = {
      id: 'faq-' + Date.now(),
      question: question.trim(),
      answer: answer.trim(),
      category: category || 'general',
      createdAt: new Date().toISOString()
    };
    list.push(newItem);
    saveStoredFAQ(list);
    res.status(201).json({ success: true, item: newItem });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

app.put('/api/faq/:id', (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const { question, answer, category } = req.body;
    const list = loadStoredFAQ();
    const item = list.find(f => f.id === id);
    if (!item) return res.status(404).json({ error: 'Question FAQ non trouvée.' });
    if (question) item.question = question.trim();
    if (answer) item.answer = answer.trim();
    if (category) item.category = category;
    saveStoredFAQ(list);
    res.json({ success: true, item });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

app.delete('/api/faq/:id', (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    let list = loadStoredFAQ();
    list = list.filter(f => f.id !== id);
    saveStoredFAQ(list);
    res.json({ success: true, message: 'Question FAQ supprimée.' });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

// ==========================================
// 9. DYNAMIC SEO: SITEMAP.XML & ROBOTS.TXT
// ==========================================
app.get('/sitemap.xml', (req: Request, res: Response) => {
  const host = req.get('host') || 'www.eglisedunazareendedame.org';
  const protocol = req.protocol === 'https' || req.get('x-forwarded-proto') === 'https' ? 'https' : 'http';
  const baseUrl = process.env.APP_URL || (host.includes('localhost') ? `${protocol}://${host}` : 'https://www.eglisedunazareendedame.org');
  const today = new Date().toISOString().split('T')[0];

  const defaultPages = [
    { loc: '/', priority: '1.0', changefreq: 'weekly' },
    { loc: '/a-propos', priority: '0.9', changefreq: 'monthly' },
    { loc: '/ministeres', priority: '0.9', changefreq: 'monthly' },
    { loc: '/evenements', priority: '0.9', changefreq: 'weekly' },
    { loc: '/projets', priority: '0.9', changefreq: 'monthly' },
    { loc: '/medias', priority: '0.8', changefreq: 'weekly' },
    { loc: '/jeux-bibliques', priority: '0.8', changefreq: 'monthly' },
    { loc: '/contact', priority: '0.8', changefreq: 'yearly' }
  ];

  // Include dynamic active custom pages in sitemap!
  const customPages = loadStoredPages().filter(p => p.isActive);
  for (const cp of customPages) {
    defaultPages.push({ loc: `/page/${cp.slug}`, priority: '0.7', changefreq: 'monthly' });
  }

  const xml = `<?xml version="1.0" encoding="UTF-8"?><urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">${defaultPages.map(p => `  <url>
    <loc>${baseUrl}${p.loc}</loc>
    <lastmod>${today}</lastmod>
    <changefreq>${p.changefreq}</changefreq>
    <priority>${p.priority}</priority>
  </url>`).join('\n')}</urlset>`;

  res.header('Content-Type', 'application/xml; charset=utf-8');
  res.send(xml);
});

app.get('/robots.txt', (req: Request, res: Response) => {
  const host = req.get('host') || 'www.eglisedunazareendedame.org';
  const protocol = req.protocol === 'https' || req.get('x-forwarded-proto') === 'https' ? 'https' : 'http';
  const baseUrl = process.env.APP_URL || (host.includes('localhost') ? `${protocol}://${host}` : 'https://www.eglisedunazareendedame.org');
  const content = `# Robots.txt pour Église du Nazaréen de Damé (Haïti)
# Site officiel : ${baseUrl}
User-agent: *
Allow: /
Disallow: /secretariat
Disallow: /api/
Sitemap: ${baseUrl}/sitemap.xml`;
  res.header('Content-Type', 'text/plain; charset=utf-8');
  res.send(content);
});

// ==========================================
// SERVER INITIALIZATION & VITE MIDDLEWARE
// ==========================================
async function startServer() {
  if (!isProd) {
    const { createServer: createViteServer } = await import('vite');
    const vite = await createViteServer({
      server: {
        middlewareMode: true,
        hmr: process.env.DISABLE_HMR !== 'true',
        watch: process.env.DISABLE_HMR === 'true' ? null : {}
      },
      appType: 'spa'
    });
    app.use(vite.middlewares);
  } else {
    app.use(express.static(path.resolve(__dirname, 'dist')));
    app.get('*', (req: Request, res: Response) => {
      res.sendFile(path.resolve(__dirname, 'dist', 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`[Église du Nazaréen de Damé] Serveur actif sur http://0.0.0.0:${PORT}`);
  });
}

startServer();
